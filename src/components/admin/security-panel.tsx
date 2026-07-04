import { useQuery } from "@tanstack/react-query";
import { getSecurityOverview, listLoginHistory } from "@/lib/security/security.functions";
import { Shield, CheckCircle2, AlertTriangle, Users } from "lucide-react";

export function SecurityPanel() {
  const overview = useQuery({ queryKey: ["security-overview"], queryFn: () => getSecurityOverview() });
  const history = useQuery({ queryKey: ["login-history"], queryFn: () => listLoginHistory({ data: { limit: 100 } }) });

  const stats = [
    { icon: CheckCircle2, label: "Successful logins (24h)", value: overview.data?.successCount24h ?? 0, color: "text-emerald-400" },
    { icon: AlertTriangle, label: "Failed attempts (24h)", value: overview.data?.failureCount24h ?? 0, color: "text-red-400" },
    { icon: Users, label: "Admin accounts", value: overview.data?.adminCount ?? 0, color: "text-[#38BDF8]" },
    { icon: Shield, label: "2FA enabled", value: "Coming soon", color: "text-white/40" },
  ];

  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-semibold">Security Center</h2>
      <p className="mb-5 text-xs text-white/50">Sign-in activity, failed attempts, and admin account health.</p>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <s.icon className={`${s.color} mb-2`} size={18} />
            <div className="text-2xl font-bold">{String(s.value)}</div>
            <div className="text-[11px] text-white/50">{s.label}</div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 font-display text-sm font-semibold text-white/80">Recent sign-in activity</h3>
      <div className="space-y-1.5">
        {history.data?.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs">
            {r.success
              ? <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
              : <AlertTriangle size={12} className="text-red-400 shrink-0" />}
            <span className="font-medium">{r.email ?? "—"}</span>
            <span className="text-white/40">{r.success ? "Success" : r.failure_reason ?? "Failed"}</span>
            <span className="ml-auto text-white/40">{new Date(r.created_at).toLocaleString()}</span>
          </div>
        ))}
        {history.data?.length === 0 && <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">No sign-ins recorded yet.</div>}
      </div>
    </div>
  );
}
