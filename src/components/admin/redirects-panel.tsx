import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { listRedirects, upsertRedirect, deleteRedirect } from "@/lib/settings/settings.functions";

type R = { id?: string; from_path: string; to_path: string; status_code?: number; enabled?: boolean };

export function RedirectsPanel() {
  const list = useServerFn(listRedirects);
  const upsert = useServerFn(upsertRedirect);
  const remove = useServerFn(deleteRedirect);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<R | null>(null);
  const q = useQuery({ queryKey: ["redirects"], queryFn: () => list() });

  async function save() {
    if (!editing) return;
    try {
      await upsert({ data: { ...editing, status_code: editing.status_code ?? 301, enabled: editing.enabled ?? true } });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["redirects"] });
    } catch (e) { toast.error((e as Error).message); }
  }
  async function del(id: string) {
    if (!confirm("Delete redirect?")) return;
    await remove({ data: { id } });
    qc.invalidateQueries({ queryKey: ["redirects"] });
    toast.success("Deleted");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">Redirects</h2>
          <p className="mt-1 text-xs text-white/50">Forward old URLs to new destinations.</p>
        </div>
        <button onClick={() => setEditing({ from_path: "/old", to_path: "/new", status_code: 301, enabled: true })} className="btn-primary btn-primary-hover !py-2 !text-xs">
          <Plus size={14} className="mr-1 inline" /> New
        </button>
      </div>

      {q.isLoading ? <Loader2 className="mx-auto mt-6 animate-spin text-white/40" /> : (
        <div className="mt-4 divide-y divide-white/10">
          {(q.data ?? []).map((r: R) => (
            <div key={r.id} className="flex items-center justify-between py-3">
              <div className="min-w-0 text-sm">
                <span className="font-mono text-white">{r.from_path}</span>
                <span className="mx-2 text-white/30">→</span>
                <span className="font-mono text-[#38BDF8]">{r.to_path}</span>
                <span className="ml-3 text-xs text-white/40">{r.status_code} · {r.enabled ? "on" : "off"}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(r)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:border-[#38BDF8]/40">Edit</button>
                <button onClick={() => del(r.id!)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-red-400 hover:border-red-500/40"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          {(q.data ?? []).length === 0 && <p className="py-6 text-center text-xs text-white/40">No redirects yet.</p>}
        </div>
      )}

      {editing && (
        <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-[#111827] p-4">
          <label className="block">
            <div className="mb-1 text-xs uppercase tracking-wide text-white/50">From path</div>
            <input value={editing.from_path} onChange={e => setEditing({ ...editing, from_path: e.target.value })} className="input" />
          </label>
          <label className="block">
            <div className="mb-1 text-xs uppercase tracking-wide text-white/50">To path (or URL)</div>
            <input value={editing.to_path} onChange={e => setEditing({ ...editing, to_path: e.target.value })} className="input" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-wide text-white/50">Status</div>
              <select value={editing.status_code ?? 301} onChange={e => setEditing({ ...editing, status_code: Number(e.target.value) })} className="input">
                <option value={301}>301 Permanent</option>
                <option value={302}>302 Temporary</option>
                <option value={307}>307 Temporary (preserve method)</option>
                <option value={308}>308 Permanent (preserve method)</option>
              </select>
            </label>
            <label className="flex items-end gap-2 text-xs text-white/70">
              <input type="checkbox" checked={editing.enabled ?? true} onChange={e => setEditing({ ...editing, enabled: e.target.checked })} /> Enabled
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary btn-primary-hover !py-2 !text-xs">Save</button>
            <button onClick={() => setEditing(null)} className="text-xs text-white/50 hover:text-white">Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}
