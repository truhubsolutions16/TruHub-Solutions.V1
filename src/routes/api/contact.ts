import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email address").max(200),
  phone: z.string().trim().max(40).optional().nullable(),
  business_name: z.string().trim().max(160).optional().nullable(),
  project_details: z.string().trim().min(5, "Please share a few details").max(4000),
  source: z.string().trim().max(120).optional().nullable(),
});

// CORS: allow same-origin (no Origin header), localhost in dev, and any https in prod.
// Tighten ALLOWED_ORIGINS for stricter scoping on a specific deployment.
const ALLOWED_ORIGINS = new Set<string>([
  // Add explicit production origins here if you want to lock CORS down:
  // "https://truhubsolutions.vercel.app",
]);

function isAllowedOrigin(o: string | null): boolean {
  if (!o) return true; // same-origin / no Origin header
  if (ALLOWED_ORIGINS.has(o)) return true;
  if (o.startsWith("http://localhost:")) return true;
  if (o.startsWith("http://127.0.0.1:")) return true;
  if (o === "https://lovable.app" || o.endsWith(".lovable.app")) return true;
  if (o.startsWith("https://") && !o.includes("localhost")) return true;
  return false;
}

function corsHeaders(origin: string | null) {
  const allowed = isAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? (origin ?? "*") : "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

// Naive in-memory rate limit per worker isolate.
// Cloudflare Workers are per-isolate so this is best-effort; for stricter limits
// use a shared store (KV, Upstash Redis, etc.).
const buckets = new Map<string, { count: number; ts: number }>();
function rateOk(key: string) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.ts > 60_000) {
    buckets.set(key, { count: 1, ts: now });
    return true;
  }
  b.count += 1;
  // 10 submissions per minute per IP — generous for legitimate retries, blocks spam bursts.
  return b.count <= 10;
}

function publicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase env not configured (SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY)");
  }
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function clientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        const cors = corsHeaders(origin);

        // Cheap bot trap: require a real Content-Type.
        const ct = request.headers.get("content-type") ?? "";
        if (!ct.toLowerCase().includes("application/json")) {
          return Response.json(
            { ok: false, error: "Content-Type must be application/json" },
            { status: 415, headers: cors },
          );
        }

        const ip = clientIp(request);
        if (!rateOk(ip)) {
          return Response.json(
            { ok: false, error: "Too many requests. Please try again in a minute." },
            { status: 429, headers: cors },
          );
        }

        const raw = await request.json().catch(() => null);
        const parsed = contactSchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: "Invalid payload", details: parsed.error.flatten() },
            { status: 400, headers: cors },
          );
        }
        const p = parsed.data;

        try {
          const sb = publicClient();
          const { data: inserted, error } = await sb
            .from("contact_submissions")
            .insert({
              name: p.name,
              email: p.email,
              phone: p.phone ?? null,
              business_name: p.business_name ?? null,
              project_details: p.project_details,
              source: p.source ?? null,
              status: "new",
              priority: "medium",
              lead_score: 0,
              is_read: false,
            })
            .select("id, created_at")
            .maybeSingle();

          if (error) {
            console.error("[api/contact] insert error", error.message);
            return Response.json(
              { ok: false, error: "Could not save your message. Please try again." },
              { status: 500, headers: cors },
            );
          }

          // Fire-and-forget admin notification via Resend (if configured).
          // Failures here must not block the user-facing response.
          void (async () => {
            try {
              const [{ data: settings }, resendKey, lovableKey] = await Promise.all([
                sb.from("site_settings").select("notification_email").eq("id", true).maybeSingle(),
                Promise.resolve(process.env.RESEND_API_KEY),
                Promise.resolve(process.env.LOVABLE_API_KEY),
              ]);
              const to = settings?.notification_email;
              if (!to || !resendKey || !lovableKey) return;
              await fetch("https://connector-gateway.lovable.dev/resend/emails", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${lovableKey}`,
                  "X-Connection-Api-Key": resendKey,
                },
                body: JSON.stringify({
                  from: "TruHub <onboarding@resend.dev>",
                  to: [to],
                  subject: `New inquiry from ${p.name}`,
                  html: `<h2 style="font-family:system-ui;margin:0 0 12px">New contact submission</h2>
                    <p style="margin:0 0 6px"><b>Name:</b> ${escapeHtml(p.name)}</p>
                    <p style="margin:0 0 6px"><b>Email:</b> ${escapeHtml(p.email)}</p>
                    <p style="margin:0 0 6px"><b>Phone:</b> ${escapeHtml(p.phone ?? "—")}</p>
                    <p style="margin:0 0 6px"><b>Business:</b> ${escapeHtml(p.business_name ?? "—")}</p>
                    ${p.source ? `<p style="margin:0 0 6px"><b>Source:</b> ${escapeHtml(p.source)}</p>` : ""}
                    <p style="margin:12px 0 6px"><b>Message:</b></p>
                    <pre style="font-family:inherit;white-space:pre-wrap;margin:0">${escapeHtml(p.project_details)}</pre>`,
                }),
              });
            } catch (e) {
              console.warn("[api/contact] notify failed", e);
            }
          })();

          return Response.json(
            { ok: true, id: inserted?.id ?? null, created_at: inserted?.created_at ?? null },
            { status: 200, headers: cors },
          );
        } catch (err) {
          console.error("[api/contact] error", err);
          return Response.json(
            { ok: false, error: "Server error" },
            { status: 500, headers: cors },
          );
        }
      },
      OPTIONS: async ({ request }) => {
        const origin = request.headers.get("origin");
        return new Response(null, { status: 204, headers: corsHeaders(origin) });
      },
    },
  },
});
