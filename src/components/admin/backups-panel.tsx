import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Download, Trash2, Database, Play } from "lucide-react";
import { createBackup, listBackups, getBackupDownloadUrl, deleteBackup } from "@/lib/portal/portal.functions";

export function BackupsPanel() {
  const create = useServerFn(createBackup);
  const list = useServerFn(listBackups);
  const getUrl = useServerFn(getBackupDownloadUrl);
  const del = useServerFn(deleteBackup);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const q = useQuery({ queryKey: ["backups"], queryFn: () => list() });

  async function run() {
    setBusy(true);
    try {
      await create();
      toast.success("Backup created");
      qc.invalidateQueries({ queryKey: ["backups"] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }
  async function download(id: string) {
    try {
      const { url } = await getUrl({ data: { id } });
      window.open(url, "_blank");
    } catch (e) { toast.error((e as Error).message); }
  }
  async function remove(id: string) {
    if (!confirm("Delete backup?")) return;
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["backups"] });
    toast.success("Deleted");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold flex items-center gap-2"><Database size={18} /> Backups</h2>
          <p className="mt-1 text-xs text-white/50">JSON snapshots of all CMS content, portal data, SEO, media metadata. Stored in Cloud storage.</p>
        </div>
        <button onClick={run} disabled={busy} className="btn-primary btn-primary-hover !py-2 !text-xs">
          {busy ? <Loader2 size={14} className="mr-1 inline animate-spin" /> : <Play size={14} className="mr-1 inline" />}
          Create backup now
        </button>
      </div>

      {q.isLoading ? <Loader2 className="mx-auto mt-6 animate-spin text-white/40" /> : (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-white/50">
              <tr>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Kind</th>
                <th className="px-4 py-3">Tables</th>
                <th className="px-4 py-3">Rows</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(q.data ?? []).map((b: any) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 text-xs text-white/70">{new Date(b.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs capitalize">{b.kind}</td>
                  <td className="px-4 py-3 text-xs">{b.tables_count}</td>
                  <td className="px-4 py-3 text-xs">{b.rows_count}</td>
                  <td className="px-4 py-3 text-xs">{(b.size_bytes / 1024).toFixed(1)} KB</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => download(b.id)} className="mr-2 rounded-lg border border-white/10 px-2 py-1 text-xs hover:border-[#38BDF8]/40"><Download size={12} /></button>
                    <button onClick={() => remove(b.id)} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-red-400 hover:border-red-500/40"><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
              {(q.data ?? []).length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-white/40">No backups yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
