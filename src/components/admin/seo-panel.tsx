import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { listPageSeo, upsertPageSeo, deletePageSeo, listNotFoundLog, clearNotFoundLog } from "@/lib/settings/settings.functions";

type SeoRow = { id?: string; path: string; title?: string | null; description?: string | null; og_image?: string | null; canonical?: string | null; noindex?: boolean };

export function SeoPanel() {
  const list = useServerFn(listPageSeo);
  const upsert = useServerFn(upsertPageSeo);
  const remove = useServerFn(deletePageSeo);
  const listNF = useServerFn(listNotFoundLog);
  const clearNF = useServerFn(clearNotFoundLog);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<SeoRow | null>(null);

  const seo = useQuery({ queryKey: ["page_seo"], queryFn: () => list() });
  const nf = useQuery({ queryKey: ["not_found_log"], queryFn: () => listNF() });

  async function save() {
    if (!editing) return;
    try {
      await upsert({ data: editing });
      toast.success("SEO saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["page_seo"] });
    } catch (e) { toast.error((e as Error).message); }
  }

  async function del(id: string) {
    if (!confirm("Delete SEO entry?")) return;
    await remove({ data: { id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["page_seo"] });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">Page SEO</h2>
            <p className="mt-1 text-xs text-white/50">Per-page meta title, description, canonical URL, and social share image.</p>
          </div>
          <button onClick={() => setEditing({ path: "/", title: "", description: "", og_image: "", canonical: "", noindex: false })} className="btn-primary btn-primary-hover !py-2 !text-xs">
            <Plus size={14} className="mr-1 inline" /> New
          </button>
        </div>

        {seo.isLoading ? <Loader2 className="mx-auto mt-6 animate-spin text-white/40" /> : (
          <div className="mt-4 divide-y divide-white/10">
            {(seo.data ?? []).map((r: SeoRow) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <div className="truncate font-mono text-sm text-white">{r.path}</div>
                  <div className="truncate text-xs text-white/50">{r.title || "—"}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(r)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:border-[#38BDF8]/40">Edit</button>
                  <button onClick={() => del(r.id!)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-red-400 hover:border-red-500/40"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
            {(seo.data ?? []).length === 0 && <p className="py-6 text-center text-xs text-white/40">No SEO overrides yet.</p>}
          </div>
        )}

        {editing && (
          <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-[#111827] p-4">
            <Field label="Path (e.g. /, /blog, /about)"><input value={editing.path} onChange={e => setEditing({ ...editing, path: e.target.value })} className="input" /></Field>
            <Field label="Title"><input value={editing.title ?? ""} onChange={e => setEditing({ ...editing, title: e.target.value })} className="input" /></Field>
            <Field label="Description"><textarea value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} className="input min-h-[80px]" /></Field>
            <Field label="OG Image URL"><input value={editing.og_image ?? ""} onChange={e => setEditing({ ...editing, og_image: e.target.value })} className="input" /></Field>
            <Field label="Canonical URL"><input value={editing.canonical ?? ""} onChange={e => setEditing({ ...editing, canonical: e.target.value })} className="input" /></Field>
            <label className="flex items-center gap-2 text-xs text-white/70">
              <input type="checkbox" checked={!!editing.noindex} onChange={e => setEditing({ ...editing, noindex: e.target.checked })} /> noindex
            </label>
            <div className="flex gap-2">
              <button onClick={save} className="btn-primary btn-primary-hover !py-2 !text-xs">Save</button>
              <button onClick={() => setEditing(null)} className="text-xs text-white/50 hover:text-white">Cancel</button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">Broken Links (404s)</h2>
            <p className="mt-1 text-xs text-white/50">URLs visitors hit that don't exist. Create a redirect to fix.</p>
          </div>
          <button onClick={async () => { if (confirm("Clear log?")) { await clearNF(); qc.invalidateQueries({ queryKey: ["not_found_log"] }); toast.success("Cleared"); } }} className="btn-ghost btn-ghost-hover !py-2 !text-xs">Clear log</button>
        </div>
        {nf.isLoading ? <Loader2 className="mx-auto mt-6 animate-spin text-white/40" /> : (
          <div className="mt-4 divide-y divide-white/10">
            {(nf.data ?? []).map((r: { id: string; path: string; hit_count: number; last_seen_at: string; referrer?: string | null }) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <div className="truncate font-mono text-sm text-white">{r.path}</div>
                  <div className="truncate text-xs text-white/40">{r.referrer || "direct"}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-[#38BDF8]">{r.hit_count} hits</div>
                  <div className="text-white/40">{new Date(r.last_seen_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {(nf.data ?? []).length === 0 && <p className="py-6 text-center text-xs text-white/40">No 404s recorded.</p>}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs uppercase tracking-wide text-white/50">{label}</div>
      {children}
    </label>
  );
}
