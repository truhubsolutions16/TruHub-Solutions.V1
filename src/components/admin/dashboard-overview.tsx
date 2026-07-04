import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, Eye, Inbox, FileText, Briefcase, Wrench, Star, Activity, ArrowRight } from "lucide-react";
import { getDashboardStats } from "@/lib/analytics/analytics.functions";
import { formatDistanceToNow } from "date-fns";

function Stat({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-white/50">{label}</div>
        <Icon size={16} className="text-[#38BDF8]" />
      </div>
      <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-white/40">{hint}</div>}
    </div>
  );
}

export function DashboardOverview({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const fetchStats = useServerFn(getDashboardStats);
  const q = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => fetchStats(), refetchInterval: 60_000 });

  const s = q.data;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-white">Overview</h2>
        <p className="text-xs text-white/50">Snapshot of your agency — updates every minute.</p>
      </div>

      {q.isLoading && <div className="py-8 text-center text-sm text-white/50">Loading…</div>}
      {s && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon={Users} label="Visitors today" value={s.visitorsToday} />
            <Stat icon={Eye} label="Page views today" value={s.viewsToday} />
            <Stat icon={Inbox} label="Leads this month" value={s.leadsThisMonth} hint={`${s.leadsTotal} all-time`} />
            <Stat icon={Activity} label="System" value="Healthy" hint="DB reachable" />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon={FileText} label="Blog posts" value={s.blogs} />
            <Stat icon={Briefcase} label="Portfolio" value={s.portfolio} />
            <Stat icon={Wrench} label="Services" value={s.services} />
            <Stat icon={Star} label="Testimonials" value={s.testimonials} />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-medium uppercase tracking-wide text-white/50">Recent inquiries</div>
                <button onClick={() => onNavigate("submissions")} className="inline-flex items-center gap-1 text-xs text-[#38BDF8] hover:text-white">
                  View all <ArrowRight size={12} />
                </button>
              </div>
              {s.recentSubmissions.length === 0 ? (
                <div className="py-6 text-center text-xs text-white/40">No inquiries yet.</div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {s.recentSubmissions.map((r) => (
                    <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                      <div className="min-w-0">
                        <div className="truncate text-white">{r.name}</div>
                        <div className="truncate text-xs text-white/50">{r.email}{r.business_name ? ` • ${r.business_name}` : ""}</div>
                      </div>
                      <div className="shrink-0 text-xs text-white/40">{formatDistanceToNow(new Date(r.created_at as string), { addSuffix: true })}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-3 text-xs font-medium uppercase tracking-wide text-white/50">Quick actions</div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { tab: "blog", label: "New blog post" },
                  { tab: "portfolio", label: "Add portfolio item" },
                  { tab: "services", label: "Manage services" },
                  { tab: "media", label: "Upload media" },
                  { tab: "settings", label: "Site settings" },
                  { tab: "analytics", label: "Open analytics" },
                ].map(a => (
                  <button key={a.tab} onClick={() => onNavigate(a.tab)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80 hover:border-[#38BDF8]/40 hover:text-white">
                    {a.label} <ArrowRight size={14} className="text-[#38BDF8]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
