import { useQuery } from "@tanstack/react-query";
import { listActivityLogs } from "@/lib/security/security.functions";
import { Activity } from "lucide-react";

export function ActivityPanel() {
  const q = useQuery({ queryKey: ["activity-logs"], queryFn: () => listActivityLogs({ data: { limit: 200 } }) });
  const rows = q.data ?? [];

  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-semibold">Activity Logs</h2>
      <p className="mb-5 text-xs text-white/50">Every admin mutation is recorded with actor, entity, and before/after data.</p>

      <div className="space-y-2">
        {rows.map((r) => (
          <details key={r.id} className="group rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
            <summary className="flex cursor-pointer items-center gap-2">
              <Activity size={12} className="text-[#38BDF8]" />
              <span className="font-medium text-white">{r.action}</span>
              <span className="text-white/50">on {r.entity_type}</span>
              <span className="text-white/40">· {r.actor_email ?? r.actor_id ?? "system"}</span>
              <span className="ml-auto text-white/40">{new Date(r.created_at).toLocaleString()}</span>
            </summary>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div>
                <div className="mb-1 text-[10px] uppercase text-white/40">Before</div>
                <pre className="max-h-48 overflow-auto rounded-lg bg-black/30 p-2 text-[10px] text-white/60">{r.old_data ? JSON.stringify(r.old_data, null, 2) : "—"}</pre>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase text-white/40">After</div>
                <pre className="max-h-48 overflow-auto rounded-lg bg-black/30 p-2 text-[10px] text-white/60">{r.new_data ? JSON.stringify(r.new_data, null, 2) : "—"}</pre>
              </div>
            </div>
          </details>
        ))}
        {rows.length === 0 && <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">No activity yet.</div>}
      </div>
    </div>
  );
}
