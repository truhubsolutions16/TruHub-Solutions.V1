import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2, Download, Search, MessageSquarePlus, X } from "lucide-react";
import {
  listLeads, updateLead, addLeadNote, deleteLead, getLeadTimeline, exportLeadsCsv,
} from "@/lib/leads/leads.functions";

type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  project_details: string;
  is_read: boolean;
  status: string;
  priority: string;
  lead_score: number;
  source: string | null;
  notes: string | null;
  follow_up_at: string | null;
};

const STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost", "archived"] as const;
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

const statusColor: Record<string, string> = {
  new: "bg-[#1EA7FF]/15 text-[#38BDF8] border-[#1EA7FF]/30",
  contacted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  qualified: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  proposal: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  won: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  lost: "bg-red-500/15 text-red-300 border-red-500/30",
  archived: "bg-white/5 text-white/40 border-white/10",
};
const priorityColor: Record<string, string> = {
  low: "text-white/50",
  medium: "text-[#38BDF8]",
  high: "text-amber-400",
  urgent: "text-red-400",
};

export function LeadsPanel() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin-leads"], queryFn: () => listLeads() });
  const update = useServerFn(updateLead);
  const del = useServerFn(deleteLead);
  const exportCsv = useServerFn(exportLeadsCsv);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    const rows = (list.data ?? []) as Lead[];
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      if (!q) return true;
      return [r.name, r.email, r.business_name, r.project_details].some((v) => v?.toLowerCase().includes(q));
    });
  }, [list.data, query, statusFilter, priorityFilter]);

  async function patch(id: string, patch: Partial<Lead>) {
    try {
      await update({ data: { id, ...patch } as never });
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      if (selected?.id === id) setSelected({ ...selected, ...patch } as Lead);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Update failed"); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this lead permanently?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); }
  }

  async function onExport() {
    try {
      const { csv, count } = await exportCsv();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${count} leads`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Export failed"); }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Lead Management</h2>
          <p className="mt-1 text-xs text-white/50">{filtered.length} of {list.data?.length ?? 0} leads</p>
        </div>
        <button onClick={onExport} className="btn-ghost btn-ghost-hover !py-2 !text-xs">
          <Download size={12} /> Export CSV
        </button>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, business, message…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 py-2 text-sm outline-none focus:border-[#38BDF8]"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs outline-none focus:border-[#38BDF8]">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs outline-none focus:border-[#38BDF8]">
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((r) => (
          <button key={r.id} onClick={() => setSelected(r)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left transition hover:border-[#38BDF8]/40">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm">{r.name}</span>
              <span className={`rounded-md border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${statusColor[r.status] ?? statusColor.new}`}>{r.status}</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${priorityColor[r.priority] ?? ""}`}>{r.priority}</span>
              {r.lead_score > 0 && <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60">score {r.lead_score}</span>}
              <span className="ml-auto text-[10px] text-white/40">{new Date(r.created_at).toLocaleString()}</span>
            </div>
            <div className="mt-1 text-xs text-white/60">{r.email} · {r.business_name ?? "—"}</div>
            <p className="mt-2 line-clamp-1 text-xs text-white/70">{r.project_details}</p>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">No leads match.</div>
        )}
      </div>

      {selected && (
        <LeadDrawer
          lead={selected}
          onClose={() => setSelected(null)}
          onPatch={(p) => patch(selected.id, p)}
          onDelete={() => remove(selected.id)}
        />
      )}
    </div>
  );
}

function LeadDrawer({ lead, onClose, onPatch, onDelete }: {
  lead: Lead; onClose: () => void; onPatch: (p: Partial<Lead>) => void; onDelete: () => void;
}) {
  const qc = useQueryClient();
  const timeline = useQuery({ queryKey: ["lead-timeline", lead.id], queryFn: () => getLeadTimeline({ data: { leadId: lead.id } }) });
  const addNote = useServerFn(addLeadNote);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState(lead.notes ?? "");

  async function saveNote() {
    if (!note.trim()) return;
    try {
      await addNote({ data: { leadId: lead.id, message: note.trim() } });
      setNote("");
      qc.invalidateQueries({ queryKey: ["lead-timeline", lead.id] });
      toast.success("Note added");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#0B1220] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">{lead.name}</h3>
            <p className="text-xs text-white/50">{new Date(lead.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-white/10 p-1.5 hover:border-[#38BDF8]/40"><X size={14} /></button>
        </div>

        <div className="mb-4 space-y-1 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
          <div><span className="text-white/40">Email:</span> {lead.email}</div>
          <div><span className="text-white/40">Phone:</span> {lead.phone ?? "—"}</div>
          <div><span className="text-white/40">Business:</span> {lead.business_name ?? "—"}</div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <label className="text-xs">
            <div className="mb-1 text-white/50">Status</div>
            <select value={lead.status} onChange={(e) => onPatch({ status: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 outline-none focus:border-[#38BDF8]">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs">
            <div className="mb-1 text-white/50">Priority</div>
            <select value={lead.priority} onChange={(e) => onPatch({ priority: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 outline-none focus:border-[#38BDF8]">
              {PRIORITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs">
            <div className="mb-1 text-white/50">Lead Score (0–100)</div>
            <input type="number" min={0} max={100} value={lead.lead_score}
              onChange={(e) => onPatch({ lead_score: Number(e.target.value) || 0 })}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 outline-none focus:border-[#38BDF8]" />
          </label>
          <label className="text-xs">
            <div className="mb-1 text-white/50">Follow-up</div>
            <input type="datetime-local" value={lead.follow_up_at ? lead.follow_up_at.slice(0, 16) : ""}
              onChange={(e) => onPatch({ follow_up_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 outline-none focus:border-[#38BDF8]" />
          </label>
        </div>

        <div className="mb-4">
          <div className="mb-2 text-xs font-medium text-white/60">Message</div>
          <p className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs whitespace-pre-wrap text-white/80">{lead.project_details}</p>
        </div>

        <div className="mb-4">
          <div className="mb-2 text-xs font-medium text-white/60">Internal notes</div>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== (lead.notes ?? "") && onPatch({ notes })}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[#38BDF8]" />
        </div>

        <div className="mb-4">
          <div className="mb-2 text-xs font-medium text-white/60">Add timeline note</div>
          <div className="flex gap-2">
            <input value={note} onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveNote()}
              placeholder="Called client, scheduled demo…"
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[#38BDF8]" />
            <button onClick={saveNote} className="btn-primary btn-primary-hover !py-2 !text-xs"><MessageSquarePlus size={12} /> Add</button>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 text-xs font-medium text-white/60">Timeline</div>
          <div className="space-y-2">
            {timeline.data?.map((t) => (
              <div key={t.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize text-[#38BDF8]">{t.event_type.replace(/_/g, " ")}</span>
                  <span className="text-white/40">{new Date(t.created_at).toLocaleString()}</span>
                </div>
                {t.message && <div className="mt-1 text-white/70">{t.message}</div>}
                {t.meta && Object.keys(t.meta as object).length > 0 && (
                  <pre className="mt-1 overflow-x-auto text-[10px] text-white/40">{JSON.stringify(t.meta)}</pre>
                )}
              </div>
            ))}
            {timeline.data?.length === 0 && <div className="text-xs text-white/40">No timeline events yet.</div>}
          </div>
        </div>

        <button onClick={onDelete} className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20">
          <Trash2 size={12} className="mr-1 inline" /> Delete lead
        </button>
      </div>
    </div>
  );
}
