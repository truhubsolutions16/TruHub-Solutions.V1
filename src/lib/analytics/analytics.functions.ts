import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const rangeSchema = z.object({ from: z.string(), to: z.string() });

async function assertAdmin(sb: { from: (t: "user_roles") => { select: (c: "role") => { eq: (col: "user_id", v: string) => { eq: (col: "role", v: "admin") => { maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }> } } } } }, userId: string) {
  const { data, error } = await sb.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const getAnalyticsOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { from: string; to: string }) => rangeSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const sb = context.supabase;
    const from = new Date(data.from).toISOString();
    const to = new Date(data.to).toISOString();

    const [
      pageViews, sessionsCount, returningSessions, live, subs, ctaClicks, sessRows,
      topPages, exitPages, sources, devices, browsers, oses, countries, screens, dailyRows, uniqRows,
    ] = await Promise.all([
      sb.from("analytics_events").select("*", { count: "exact", head: true })
        .gte("created_at", from).lte("created_at", to).eq("event_type", "page_view"),
      sb.from("analytics_sessions").select("*", { count: "exact", head: true })
        .gte("started_at", from).lte("started_at", to),
      sb.from("analytics_sessions").select("*", { count: "exact", head: true })
        .gte("started_at", from).lte("started_at", to).eq("is_returning", true),
      sb.from("analytics_sessions").select("*", { count: "exact", head: true })
        .gte("last_seen_at", new Date(Date.now() - 5 * 60_000).toISOString()),
      sb.from("contact_submissions").select("*", { count: "exact", head: true })
        .gte("created_at", from).lte("created_at", to),
      sb.from("analytics_events").select("*", { count: "exact", head: true })
        .gte("created_at", from).lte("created_at", to).eq("event_type", "cta_click"),
      sb.from("analytics_sessions").select("started_at,last_seen_at,is_bounce")
        .gte("started_at", from).lte("started_at", to).limit(10000),
      sb.from("analytics_events").select("path")
        .gte("created_at", from).lte("created_at", to).eq("event_type", "page_view").limit(5000),
      sb.from("analytics_sessions").select("exit_path").gte("started_at", from).lte("started_at", to).limit(5000),
      sb.from("analytics_sessions").select("source").gte("started_at", from).lte("started_at", to).limit(5000),
      sb.from("analytics_sessions").select("device").gte("started_at", from).lte("started_at", to).limit(5000),
      sb.from("analytics_sessions").select("browser").gte("started_at", from).lte("started_at", to).limit(5000),
      sb.from("analytics_sessions").select("os").gte("started_at", from).lte("started_at", to).limit(5000),
      sb.from("analytics_sessions").select("country").gte("started_at", from).lte("started_at", to).limit(5000),
      sb.from("analytics_events").select("screen_w,screen_h")
        .gte("created_at", from).lte("created_at", to).eq("event_type", "page_view").limit(5000),
      sb.from("analytics_events").select("created_at")
        .gte("created_at", from).lte("created_at", to).eq("event_type", "page_view").limit(20000),
      sb.from("analytics_sessions").select("visitor_id")
        .gte("started_at", from).lte("started_at", to).limit(20000),
    ]);

    const tally = (rows: Array<Record<string, unknown>> | null, key: string) => {
      const m = new Map<string, number>();
      for (const r of rows ?? []) {
        const v = (r?.[key] as string) || "unknown";
        m.set(v, (m.get(v) ?? 0) + 1);
      }
      return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    };

    const sessList = (sessRows.data as Array<{ started_at: string; last_seen_at: string; is_bounce: boolean }>) ?? [];
    const durations = sessList.map(s => Math.max(0, new Date(s.last_seen_at).getTime() - new Date(s.started_at).getTime()));
    const avgDurationMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const bounceRate = sessList.length ? (sessList.filter(s => s.is_bounce).length / sessList.length) * 100 : 0;

    const daily = new Map<string, number>();
    for (const r of (dailyRows.data as Array<{ created_at: string }>) ?? []) {
      const d = r.created_at.slice(0, 10);
      daily.set(d, (daily.get(d) ?? 0) + 1);
    }
    const dailySeries = [...daily.entries()].sort().map(([date, views]) => ({ date, views }));

    const uniqueSet = new Set<string>();
    for (const r of (uniqRows.data as Array<{ visitor_id: string }>) ?? []) uniqueSet.add(r.visitor_id);

    const screenTally = new Map<string, number>();
    for (const r of (screens.data as Array<{ screen_w: number | null }>) ?? []) {
      if (!r.screen_w) continue;
      const bucket = r.screen_w < 640 ? "<640" : r.screen_w < 1024 ? "640–1023" : r.screen_w < 1440 ? "1024–1439" : r.screen_w < 1920 ? "1440–1919" : "≥1920";
      screenTally.set(bucket, (screenTally.get(bucket) ?? 0) + 1);
    }

    const totalSessions = sessionsCount.count ?? 0;
    const submissions = subs.count ?? 0;

    return {
      kpis: {
        pageViews: pageViews.count ?? 0,
        sessions: totalSessions,
        uniqueVisitors: uniqueSet.size,
        returningSessions: returningSessions.count ?? 0,
        live: live.count ?? 0,
        submissions,
        ctaClicks: ctaClicks.count ?? 0,
        avgDurationMs,
        bounceRate,
        conversionRate: totalSessions ? (submissions / totalSessions) * 100 : 0,
      },
      dailyViews: dailySeries,
      topPages: tally(topPages.data as never, "path").slice(0, 10),
      exitPages: tally(exitPages.data as never, "exit_path").slice(0, 10),
      sources: tally(sources.data as never, "source").slice(0, 10),
      devices: tally(devices.data as never, "device"),
      browsers: tally(browsers.data as never, "browser"),
      oses: tally(oses.data as never, "os"),
      countries: tally(countries.data as never, "country").slice(0, 15),
      screens: [...screenTally.entries()].map(([label, value]) => ({ label, value })),
    };
  });

export const getLiveVisitors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const cutoff = new Date(Date.now() - 5 * 60_000).toISOString();
    const { count } = await context.supabase.from("analytics_sessions")
      .select("*", { count: "exact", head: true }).gte("last_seen_at", cutoff);
    return { live: count ?? 0 };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const sb = context.supabase;
    const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
    const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
    const [visitorsToday, viewsToday, subsMonth, subsTotal, blogs, portfolio, services, testimonials, recentSubs] =
      await Promise.all([
        sb.from("analytics_sessions").select("*", { count: "exact", head: true }).gte("started_at", todayStart.toISOString()),
        sb.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_type", "page_view").gte("created_at", todayStart.toISOString()),
        sb.from("contact_submissions").select("*", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()),
        sb.from("contact_submissions").select("*", { count: "exact", head: true }),
        sb.from("blog_posts").select("*", { count: "exact", head: true }),
        sb.from("portfolio_items").select("*", { count: "exact", head: true }),
        sb.from("services").select("*", { count: "exact", head: true }),
        sb.from("testimonials").select("*", { count: "exact", head: true }),
        sb.from("contact_submissions").select("id,name,email,business_name,created_at").order("created_at", { ascending: false }).limit(6),
      ]);
    return {
      visitorsToday: visitorsToday.count ?? 0,
      viewsToday: viewsToday.count ?? 0,
      leadsThisMonth: subsMonth.count ?? 0,
      leadsTotal: subsTotal.count ?? 0,
      blogs: blogs.count ?? 0,
      portfolio: portfolio.count ?? 0,
      services: services.count ?? 0,
      testimonials: testimonials.count ?? 0,
      recentSubmissions: recentSubs.data ?? [],
    };
  });
