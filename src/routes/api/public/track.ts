import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";
import { createHash } from "crypto";

const eventSchema = z.object({
  event_type: z.string().min(1).max(64),
  path: z.string().max(2048).optional().nullable(),
  session_id: z.string().max(128).optional().nullable(),
  visitor_id: z.string().max(128).optional().nullable(),
  referrer: z.string().max(2048).optional().nullable(),
  source: z.string().max(128).optional().nullable(),
  device: z.string().max(32).optional().nullable(),
  browser: z.string().max(64).optional().nullable(),
  os: z.string().max(64).optional().nullable(),
  screen_w: z.number().int().optional().nullable(),
  screen_h: z.number().int().optional().nullable(),
  duration_ms: z.number().int().optional().nullable(),
  scroll_depth: z.number().int().optional().nullable(),
  meta: z.record(z.unknown()).optional().nullable(),
  user_agent: z.string().max(512).optional().nullable(),
  is_returning: z.boolean().optional(),
  session_started: z.boolean().optional(),
});

// naive in-memory bucket per-worker (best effort — Cloudflare Workers are per-isolate)
const buckets = new Map<string, { count: number; ts: number }>();
function rateOk(key: string) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.ts > 60_000) { buckets.set(key, { count: 1, ts: now }); return true; }
  b.count += 1;
  if (b.count > 120) return false; // 120/min per ip
  return true;
}

function admin() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const ip =
            request.headers.get("cf-connecting-ip") ||
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            "0.0.0.0";
          if (!rateOk(ip)) return new Response("rate limit", { status: 429 });
          const raw = await request.json().catch(() => null);
          const parsed = eventSchema.safeParse(raw);
          if (!parsed.success) return new Response("bad payload", { status: 400 });
          const p = parsed.data;
          const country = request.headers.get("cf-ipcountry") || null;
          const ipHash = createHash("sha256").update(ip + (process.env.SUPABASE_URL ?? "")).digest("hex").slice(0, 32);
          const sb = admin();

          // insert event row
          await sb.from("analytics_events").insert({
            event_type: p.event_type,
            path: p.path ?? null,
            session_id: p.session_id ?? null,
            visitor_id: p.visitor_id ?? null,
            referrer: p.referrer ?? null,
            source: p.source ?? null,
            device: p.device ?? null,
            browser: p.browser ?? null,
            os: p.os ?? null,
            screen_w: p.screen_w ?? null,
            screen_h: p.screen_h ?? null,
            duration_ms: p.duration_ms ?? null,
            scroll_depth: p.scroll_depth ?? null,
            meta: (p.meta ?? {}) as never,
            country,
            ip_hash: ipHash,
            user_agent: p.user_agent ?? null,
          });

          // maintain session row
          if (p.session_id && p.visitor_id) {
            if (p.session_started) {
              await sb.from("analytics_sessions").upsert({
                session_id: p.session_id,
                visitor_id: p.visitor_id,
                entry_path: p.path ?? null,
                exit_path: p.path ?? null,
                referrer: p.referrer ?? null,
                source: p.source ?? null,
                device: p.device ?? null,
                browser: p.browser ?? null,
                os: p.os ?? null,
                country,
                is_returning: !!p.is_returning,
                page_count: 1,
                is_bounce: true,
              });
            } else if (p.event_type === "page_view") {
              // increment page count / mark not bounced
              const { data: cur } = await sb.from("analytics_sessions")
                .select("page_count").eq("session_id", p.session_id).maybeSingle();
              await sb.from("analytics_sessions").update({
                last_seen_at: new Date().toISOString(),
                exit_path: p.path ?? null,
                page_count: (cur?.page_count ?? 0) + 1,
                is_bounce: false,
              }).eq("session_id", p.session_id);
            } else {
              await sb.from("analytics_sessions").update({
                last_seen_at: new Date().toISOString(),
                exit_path: p.path ?? null,
              }).eq("session_id", p.session_id);
            }
          }
          return new Response("ok");
        } catch (err) {
          console.error("track error", err);
          return new Response("err", { status: 500 });
        }
      },
      OPTIONS: async () => new Response(null, { status: 204 }),
    },
  },
});
