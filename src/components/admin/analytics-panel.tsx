import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
} from "recharts";
import { Users, Eye, MousePointerClick, TrendingUp, Timer, ArrowDownRight, Activity, Send } from "lucide-react";
import { getAnalyticsOverview } from "@/lib/analytics/analytics.functions";

const RANGES: Array<{ id: "7d" | "30d" | "90d" | "365d"; label: string; days: number }> = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
  { id: "365d", label: "Last 365 days", days: 365 },
];

const PIE_COLORS = ["#1EA7FF", "#2563EB", "#38BDF8", "#60A5FA", "#8B5CF6", "#A78BFA", "#F472B6", "#F59E0B"];

function fmt(n: number) { return new Intl.NumberFormat().format(Math.round(n)); }
function fmtPct(n: number) { return `${n.toFixed(1)}%`; }
function fmtDuration(ms: number) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60); const rem = s % 60;
  return `${m}m ${rem}s`;
}

function Kpi({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-white/50">{label}</div>
        <Icon size={16} className="text-[#38BDF8]" />
      </div>
      <div className="mt-2 font-display text-2xl font-semibold text-white">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-white/40">{hint}</div>}
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 ${className}`}>
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-white/50">{title}</div>
      {children}
    </div>
  );
}

function TopList({ items, unit = "" }: { items: Array<{ label: string; value: number }>; unit?: string }) {
  const max = Math.max(1, ...items.map(i => i.value));
  if (!items.length) return <div className="py-6 text-center text-xs text-white/40">No data yet</div>;
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.label} className="text-xs">
          <div className="flex justify-between text-white/70">
            <span className="truncate pr-2">{i.label}</span>
            <span className="tabular-nums text-white">{fmt(i.value)}{unit}</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-gradient-to-r from-[#1EA7FF] to-[#2563EB]" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsPanel() {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("30d");
  const days = RANGES.find(r => r.id === range)!.days;
  const { from, to } = useMemo(() => {
    const t = new Date();
    const f = new Date(t.getTime() - days * 24 * 60 * 60 * 1000);
    return { from: f.toISOString(), to: t.toISOString() };
  }, [days]);

  const fetchOverview = useServerFn(getAnalyticsOverview);
  const q = useQuery({
    queryKey: ["analytics-overview", from, to],
    queryFn: () => fetchOverview({ data: { from, to } }),
    refetchInterval: 30_000,
  });

  const d = q.data;
  const kpis = d?.kpis;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">Analytics</h2>
          <p className="text-xs text-white/50">Live first-party analytics for the public site.</p>
        </div>
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {RANGES.map(r => (
            <button key={r.id} onClick={() => setRange(r.id)}
              className={`rounded-lg px-3 py-1 text-xs ${range === r.id ? "bg-gradient-to-r from-[#1EA7FF] to-[#2563EB] text-white" : "text-white/60 hover:text-white"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {q.isLoading && <div className="py-10 text-center text-sm text-white/50">Loading…</div>}
      {q.isError && <div className="py-10 text-center text-sm text-red-400">Failed to load analytics.</div>}
      {kpis && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
            <Kpi icon={Activity} label="Live" value={fmt(kpis.live)} hint="active in last 5 min" />
            <Kpi icon={Users} label="Unique Visitors" value={fmt(kpis.uniqueVisitors)} />
            <Kpi icon={Eye} label="Page Views" value={fmt(kpis.pageViews)} />
            <Kpi icon={TrendingUp} label="Sessions" value={fmt(kpis.sessions)} hint={`${fmt(kpis.returningSessions)} returning`} />
            <Kpi icon={Timer} label="Avg Duration" value={fmtDuration(kpis.avgDurationMs)} />
            <Kpi icon={ArrowDownRight} label="Bounce Rate" value={fmtPct(kpis.bounceRate)} />
            <Kpi icon={MousePointerClick} label="CTA Clicks" value={fmt(kpis.ctaClicks)} />
            <Kpi icon={Send} label="Leads" value={fmt(kpis.submissions)} hint={`${fmtPct(kpis.conversionRate)} conv.`} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Card title="Daily page views" className="lg:col-span-2">
              <div className="h-64">
                <ResponsiveContainer>
                  <AreaChart data={d.dailyViews}>
                    <defs>
                      <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1EA7FF" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#1EA7FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="views" stroke="#38BDF8" fill="url(#pv)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Devices">
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={d.devices} dataKey="value" nameKey="label" innerRadius={45} outerRadius={80} paddingAngle={3}>
                      {d.devices.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                {d.devices.map((it, i) => (
                  <span key={it.label} className="inline-flex items-center gap-1 text-white/60">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {it.label} ({it.value})
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Card title="Top pages"><TopList items={d.topPages} /></Card>
            <Card title="Traffic sources"><TopList items={d.sources} /></Card>
            <Card title="Exit pages"><TopList items={d.exitPages} /></Card>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Card title="Browsers">
              <div className="h-52">
                <ResponsiveContainer>
                  <BarChart data={d.browsers.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="value" fill="#1EA7FF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Operating systems">
              <div className="h-52">
                <ResponsiveContainer>
                  <BarChart data={d.oses.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Card title="Countries"><TopList items={d.countries} /></Card>
            <Card title="Screen sizes"><TopList items={d.screens} /></Card>
            <Card title="Conversion trend">
              <div className="h-52">
                <ResponsiveContainer>
                  <LineChart data={d.dailyViews}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                    <Line type="monotone" dataKey="views" stroke="#38BDF8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
