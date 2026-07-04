import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, FileText, CreditCard, Upload } from "lucide-react";
import {
  listAllProjects, upsertProject, deleteProject,
  listProjectFiles, addProjectFile, deleteProjectFile,
  listAllInvoices, upsertInvoice, deleteInvoice, listUsers,
} from "@/lib/portal/portal.functions";
import { adminUploadMedia } from "@/lib/cms.functions";

const STAGES = ["kickoff", "discovery", "design", "build", "qa", "launch", "post_launch"] as const;
const STATUSES = ["active", "on_hold", "completed", "cancelled"] as const;
const INV_STATUS = ["draft", "unpaid", "paid", "overdue", "cancelled"] as const;

type Project = { id?: string; client_id: string; name: string; stage?: typeof STAGES[number]; progress?: number; status?: typeof STATUSES[number]; summary?: string | null; notes?: string | null; client_email?: string };

export function ProjectsPanel() {
  const list = useServerFn(listAllProjects);
  const upsert = useServerFn(upsertProject);
  const remove = useServerFn(deleteProject);
  const users = useServerFn(listUsers);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Project | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const projects = useQuery({ queryKey: ["admin-projects"], queryFn: () => list() });
  const usersQ = useQuery({ queryKey: ["admin-users"], queryFn: () => users() });

  async function save() {
    if (!editing) return;
    try {
      await upsert({ data: editing });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
    } catch (e) { toast.error((e as Error).message); }
  }
  async function del(id: string) {
    if (!confirm("Delete project + all its files/messages?")) return;
    await remove({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
    toast.success("Deleted");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Client Projects</h2>
            <p className="mt-1 text-xs text-white/50">Manage projects visible on each client's portal.</p>
          </div>
          <button onClick={() => setEditing({ client_id: "", name: "", stage: "kickoff", progress: 0, status: "active" })} className="btn-primary btn-primary-hover !py-2 !text-xs">
            <Plus size={14} className="mr-1 inline" /> New
          </button>
        </div>

        {projects.isLoading ? <Loader2 className="mx-auto mt-6 animate-spin text-white/40" /> : (
          <div className="mt-4 space-y-2">
            {(projects.data ?? []).map((p: any) => (
              <div key={p.id} className="rounded-xl border border-white/10 bg-[#111827] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-white/50">{p.client_email} · {p.stage} · {p.progress}% · <span className="capitalize">{p.status}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setOpenId(openId === p.id ? null : p.id)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:border-[#38BDF8]/40">
                      Files & Invoices
                    </button>
                    <button onClick={() => setEditing(p)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:border-[#38BDF8]/40">Edit</button>
                    <button onClick={() => del(p.id)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-red-400 hover:border-red-500/40"><Trash2 size={12} /></button>
                  </div>
                </div>
                {openId === p.id && <ProjectSubpanel projectId={p.id} clientId={p.client_id} />}
              </div>
            ))}
            {(projects.data ?? []).length === 0 && <p className="py-8 text-center text-xs text-white/40">No projects yet.</p>}
          </div>
        )}

        {editing && (
          <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-[#111827] p-4">
            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-wide text-white/50">Client</div>
              <select value={editing.client_id} onChange={e => setEditing({ ...editing, client_id: e.target.value })} className="input">
                <option value="">— Select client —</option>
                {(usersQ.data ?? []).filter(u => u.roles.includes("member")).map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
              </select>
              <p className="mt-1 text-[10px] text-white/40">Only users with the "member" role appear. Assign the role first in Users & Roles.</p>
            </label>
            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-wide text-white/50">Project name</div>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="input" />
            </label>
            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-wide text-white/50">Summary (shown to client)</div>
              <input value={editing.summary ?? ""} onChange={e => setEditing({ ...editing, summary: e.target.value })} className="input" />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="block">
                <div className="mb-1 text-xs uppercase tracking-wide text-white/50">Stage</div>
                <select value={editing.stage ?? "kickoff"} onChange={e => setEditing({ ...editing, stage: e.target.value as typeof STAGES[number] })} className="input">
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="block">
                <div className="mb-1 text-xs uppercase tracking-wide text-white/50">Progress %</div>
                <input type="number" min={0} max={100} value={editing.progress ?? 0} onChange={e => setEditing({ ...editing, progress: Number(e.target.value) })} className="input" />
              </label>
              <label className="block">
                <div className="mb-1 text-xs uppercase tracking-wide text-white/50">Status</div>
                <select value={editing.status ?? "active"} onChange={e => setEditing({ ...editing, status: e.target.value as typeof STATUSES[number] })} className="input">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="btn-primary btn-primary-hover !py-2 !text-xs">Save</button>
              <button onClick={() => setEditing(null)} className="text-xs text-white/50 hover:text-white">Cancel</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ProjectSubpanel({ projectId, clientId }: { projectId: string; clientId: string }) {
  const listFiles = useServerFn(listProjectFiles);
  const addFile = useServerFn(addProjectFile);
  const delFile = useServerFn(deleteProjectFile);
  const upload = useServerFn(adminUploadMedia);
  const listInv = useServerFn(listAllInvoices);
  const upsertInv = useServerFn(upsertInvoice);
  const delInv = useServerFn(deleteInvoice);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [newInv, setNewInv] = useState<{ amount: string; number: string; due: string; status: typeof INV_STATUS[number] }>({ amount: "", number: "", due: "", status: "unpaid" });

  const files = useQuery({ queryKey: ["proj-files", projectId], queryFn: () => listFiles({ data: { project_id: projectId } }) });
  const invoices = useQuery({ queryKey: ["proj-invoices", projectId], queryFn: async () => {
    const all = await listInv();
    return all.filter((i: any) => i.project_id === projectId);
  } });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const up = await upload({ data: { name: file.name, type: file.type, dataBase64: b64 } });
      await addFile({ data: {
        project_id: projectId, name: file.name, url: up.url,
        storage_path: up.path ?? null, size_bytes: file.size, mime_type: file.type,
      } });
      qc.invalidateQueries({ queryKey: ["proj-files", projectId] });
      toast.success("File added");
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); e.target.value = ""; }
  }

  async function createInvoice() {
    const cents = Math.round(Number(newInv.amount) * 100);
    if (!cents) { toast.error("Enter amount"); return; }
    try {
      await upsertInv({ data: {
        project_id: projectId, client_id: clientId,
        number: newInv.number || null, amount_cents: cents,
        status: newInv.status, due_date: newInv.due || null,
      } });
      setNewInv({ amount: "", number: "", due: "", status: "unpaid" });
      qc.invalidateQueries({ queryKey: ["proj-invoices", projectId] });
      toast.success("Invoice added");
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 md:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-white/60 flex items-center gap-1.5"><FileText size={12} /> Files</h4>
          <label className="cursor-pointer rounded-lg border border-white/10 px-2 py-1 text-[10px] hover:border-[#38BDF8]/40">
            {busy ? <Loader2 size={10} className="inline animate-spin" /> : <Upload size={10} className="inline" />} Upload
            <input type="file" hidden onChange={onFile} />
          </label>
        </div>
        <ul className="space-y-1">
          {(files.data ?? []).map((f: { id: string; name: string; url: string }) => (
            <li key={f.id} className="flex items-center justify-between rounded-lg border border-white/10 px-2 py-1.5 text-xs">
              <a href={f.url} target="_blank" rel="noreferrer" className="truncate text-[#38BDF8] hover:underline">{f.name}</a>
              <button onClick={async () => { await delFile({ data: { id: f.id } }); qc.invalidateQueries({ queryKey: ["proj-files", projectId] }); }} className="text-red-400"><Trash2 size={10} /></button>
            </li>
          ))}
          {(files.data ?? []).length === 0 && <li className="text-[10px] text-white/40">No files.</li>}
        </ul>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60 flex items-center gap-1.5"><CreditCard size={12} /> Invoices</h4>
        <ul className="space-y-1">
          {(invoices.data ?? []).map((i: any) => (
            <li key={i.id} className="flex items-center justify-between rounded-lg border border-white/10 px-2 py-1.5 text-xs">
              <div>
                <span className="font-mono">{i.number || i.id.slice(0, 6)}</span>
                <span className="mx-2 text-white/40">·</span>
                <span>{i.currency} {(i.amount_cents / 100).toFixed(2)}</span>
                <span className="ml-2 text-white/50">{i.status}</span>
              </div>
              <button onClick={async () => { await delInv({ data: { id: i.id } }); qc.invalidateQueries({ queryKey: ["proj-invoices", projectId] }); }} className="text-red-400"><Trash2 size={10} /></button>
            </li>
          ))}
          {(invoices.data ?? []).length === 0 && <li className="text-[10px] text-white/40">No invoices.</li>}
        </ul>
        <div className="mt-2 grid grid-cols-4 gap-1">
          <input placeholder="#" value={newInv.number} onChange={e => setNewInv({ ...newInv, number: e.target.value })} className="input !text-[11px] !py-1" />
          <input placeholder="Amount" type="number" value={newInv.amount} onChange={e => setNewInv({ ...newInv, amount: e.target.value })} className="input !text-[11px] !py-1" />
          <input type="date" value={newInv.due} onChange={e => setNewInv({ ...newInv, due: e.target.value })} className="input !text-[11px] !py-1" />
          <select value={newInv.status} onChange={e => setNewInv({ ...newInv, status: e.target.value as typeof INV_STATUS[number] })} className="input !text-[11px] !py-1">
            {INV_STATUS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={createInvoice} className="btn-primary btn-primary-hover mt-1.5 w-full !py-1 !text-[11px]">Add invoice</button>
      </div>
    </div>
  );
}
