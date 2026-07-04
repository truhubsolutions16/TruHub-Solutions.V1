import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, Search, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listMediaFiles, upsertMediaFile, deleteMediaFile } from "@/lib/settings/settings.functions";
import { adminUploadMedia } from "@/lib/cms.functions";

type Media = {
  id: string; url: string; storage_path?: string | null; folder: string;
  tags: string[]; mime_type?: string | null; size_bytes?: number | null;
  alt_text?: string | null; created_at: string;
};

export function MediaLibraryPanel() {
  const list = useServerFn(listMediaFiles);
  const upsert = useServerFn(upsertMediaFile);
  const remove = useServerFn(deleteMediaFile);
  const upload = useServerFn(adminUploadMedia);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("all");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Media | null>(null);

  const q = useQuery({ queryKey: ["media_files"], queryFn: () => list() as Promise<Media[]> });

  const folders = useMemo(() => {
    const set = new Set<string>((q.data ?? []).map(m => m.folder));
    return ["all", ...Array.from(set)];
  }, [q.data]);

  const filtered = useMemo(() => {
    return (q.data ?? []).filter(m => {
      if (folder !== "all" && m.folder !== folder) return false;
      if (search) {
        const s = search.toLowerCase();
        return (m.alt_text ?? "").toLowerCase().includes(s)
          || m.url.toLowerCase().includes(s)
          || m.tags.some(t => t.toLowerCase().includes(s));
      }
      return true;
    });
  }, [q.data, folder, search]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const up = await upload({ data: { name: file.name, type: file.type, dataBase64: b64 } });
      await upsert({ data: {
        url: up.url,
        storage_path: up.path ?? null,
        folder: "uploads",
        tags: [],
        mime_type: file.type,
        size_bytes: file.size,
        alt_text: file.name,
      } });
      toast.success("Uploaded");
      qc.invalidateQueries({ queryKey: ["media_files"] });
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); e.target.value = ""; }
  }

  async function saveMeta() {
    if (!selected) return;
    await upsert({ data: {
      id: selected.id, url: selected.url,
      storage_path: selected.storage_path ?? null,
      folder: selected.folder, tags: selected.tags,
      mime_type: selected.mime_type ?? null,
      size_bytes: selected.size_bytes ?? null,
      alt_text: selected.alt_text ?? null,
    } });
    toast.success("Saved");
    setSelected(null);
    qc.invalidateQueries({ queryKey: ["media_files"] });
  }

  async function del(m: Media) {
    if (!confirm("Delete file?")) return;
    if (m.storage_path) {
      await supabase.storage.from("public-media").remove([m.storage_path]).catch(() => {});
    }
    await remove({ data: { id: m.id } });
    setSelected(null);
    qc.invalidateQueries({ queryKey: ["media_files"] });
    toast.success("Deleted");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">Media Library</h2>
          <p className="mt-1 text-xs text-white/50">Manage uploaded assets with folders, tags, and alt text.</p>
        </div>
        <label className="btn-primary btn-primary-hover !py-2 !text-xs cursor-pointer">
          {busy ? <Loader2 size={14} className="mr-1 inline animate-spin" /> : <Upload size={14} className="mr-1 inline" />}
          Upload
          <input type="file" hidden onChange={onFile} accept="image/*,video/*,application/pdf" />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files, tags, alt..." className="input pl-9" />
        </div>
        <select value={folder} onChange={e => setFolder(e.target.value)} className="input max-w-[160px]">
          {folders.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {q.isLoading ? <Loader2 className="mx-auto mt-8 animate-spin text-white/40" /> : (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map(m => (
            <button key={m.id} onClick={() => setSelected(m)} className="group overflow-hidden rounded-xl border border-white/10 bg-[#111827] text-left transition hover:border-[#38BDF8]/40">
              {m.mime_type?.startsWith("image/") ? (
                <img src={m.url} alt={m.alt_text ?? ""} className="aspect-square w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-[#0B1220] text-xs text-white/40">{m.mime_type ?? "file"}</div>
              )}
              <div className="p-2 text-[10px] text-white/50">
                <div className="truncate">{m.alt_text || m.url.split("/").pop()}</div>
                <div className="mt-0.5 text-white/30">{m.folder}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="col-span-full py-8 text-center text-xs text-white/40">No files.</p>}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0B1220] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex gap-4">
              {selected.mime_type?.startsWith("image/") && (
                <img src={selected.url} alt={selected.alt_text ?? ""} className="h-40 w-40 rounded-lg object-cover" />
              )}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <input readOnly value={selected.url} className="input flex-1 !text-[11px]" />
                  <button onClick={() => { navigator.clipboard.writeText(selected.url); toast.success("Copied"); }} className="rounded-lg border border-white/10 px-3 py-1.5 hover:border-[#38BDF8]/40"><Copy size={12} /></button>
                </div>
                <label className="block">
                  <div className="mb-1 uppercase tracking-wide text-white/50">Alt text</div>
                  <input value={selected.alt_text ?? ""} onChange={e => setSelected({ ...selected, alt_text: e.target.value })} className="input" />
                </label>
                <label className="block">
                  <div className="mb-1 uppercase tracking-wide text-white/50">Folder</div>
                  <input value={selected.folder} onChange={e => setSelected({ ...selected, folder: e.target.value })} className="input" />
                </label>
                <label className="block">
                  <div className="mb-1 uppercase tracking-wide text-white/50">Tags (comma-separated)</div>
                  <input value={selected.tags.join(", ")} onChange={e => setSelected({ ...selected, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} className="input" />
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={saveMeta} className="btn-primary btn-primary-hover !py-2 !text-xs">Save</button>
              <button onClick={() => del(selected)} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"><Trash2 size={12} className="mr-1 inline" /> Delete</button>
              <button onClick={() => setSelected(null)} className="ml-auto text-xs text-white/50 hover:text-white">Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
