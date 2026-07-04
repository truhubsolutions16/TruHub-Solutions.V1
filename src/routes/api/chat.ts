import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function buildSystemPrompt(): Promise<{ prompt: string; enabled: boolean }> {
  const fallback = {
    prompt:
      "You are TruBot, the friendly AI assistant for TruHub Solutions — a luxury tech agency (Build. Grow. Succeed.). Be concise, warm, on-brand. If you don't know something, ask the visitor to email truhub.solutions@gmail.com or WhatsApp us.",
    enabled: true,
  };
  try {
    const url = process.env.SUPABASE_URL;
    const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !anon) {
      console.warn("[api/chat] Supabase env missing, using fallback prompt.");
      return fallback;
    }
    const sb = createClient<Database>(url, anon, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const [services, plans, addons, faqs, about, founder, contact, settings] = await Promise.all([
      sb.from("services").select("title,description").order("sort_order"),
      sb.from("pricing_plans").select("name,price,tagline,features").order("sort_order"),
      sb.from("additional_services").select("name,price").order("sort_order"),
      sb.from("faqs").select("question,answer").order("sort_order"),
      sb.from("about_content").select("heading,body").maybeSingle(),
      sb.from("founder").select("name,title,vision").maybeSingle(),
      sb.from("contact_info").select("email,phone,whatsapp").maybeSingle(),
      sb.from("site_settings").select("chatbot_enabled,chatbot_kb_extra").eq("id", true).maybeSingle(),
    ]);
    const enabled = settings.data?.chatbot_enabled ?? true;
    const parts: string[] = [
      "You are TruBot, the friendly AI assistant for TruHub Solutions — a luxury tech agency (Build. Grow. Succeed.).",
      "Be concise, warm, on-brand. Recommend booking a call for anything you cannot answer.",
      "Only answer from the knowledge below. If unsure, say so and point to email/WhatsApp.",
      "",
      "=== ABOUT ===",
      about.data ? `${about.data.heading}\n${about.data.body}` : "",
      "",
      "=== FOUNDER ===",
      founder.data ? `${founder.data.name} (${founder.data.title}). Vision: ${founder.data.vision}` : "",
      "",
      "=== SERVICES ===",
      ...(services.data ?? []).map((s) => `• ${s.title}: ${s.description}`),
      "",
      "=== PRICING PLANS ===",
      ...(plans.data ?? []).map(
        (p) =>
          `• ${p.name} — ${p.price}${p.tagline ? ` (${p.tagline})` : ""}\n  Features: ${(p.features ?? []).join(", ")}`,
      ),
      "",
      "=== ADD-ON SERVICES ===",
      ...(addons.data ?? []).map((a) => `• ${a.name} — ${a.price}`),
      "",
      "=== FAQs ===",
      ...(faqs.data ?? []).map((f) => `Q: ${f.question}\nA: ${f.answer}`),
      "",
      "=== CONTACT ===",
      contact.data
        ? `Email: ${contact.data.email} | Phone: ${contact.data.phone} | WhatsApp: https://wa.me/${contact.data.whatsapp}`
        : "",
      "",
      settings.data?.chatbot_kb_extra ? `=== EXTRA KNOWLEDGE ===\n${settings.data.chatbot_kb_extra}` : "",
    ];
    return { prompt: parts.join("\n"), enabled };
  } catch (err) {
    console.error("[api/chat] buildSystemPrompt failed, using fallback:", err);
    return fallback;
  }
}

// Free OpenRouter models (rotate on 429). All have :free tier — no paid plan needed.
// Order: highest-quality/most-reliable first.
const OPENROUTER_FREE_MODELS = [
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nvidia/nemotron-nano-9b-v2:free",
];

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const key = process.env.OPENROUTER_API_KEY;
          if (!key) {
            console.error("[api/chat] Missing OPENROUTER_API_KEY env var");
            return Response.json(
              {
                error: "chat_not_configured",
                content:
                  "The chatbot isn't configured yet. Please set OPENROUTER_API_KEY (free at openrouter.ai) in the deployment environment.",
              },
              { status: 200 },
            );
          }
          const body = (await request.json().catch(() => ({}))) as { messages?: Msg[] };
          if (!Array.isArray(body.messages)) {
            return Response.json({ error: "messages_required" }, { status: 400 });
          }
          const { prompt, enabled } = await buildSystemPrompt();
          if (!enabled) {
            return Response.json({
              content:
                "The chatbot is currently off. Please reach us at truhub.solutions@gmail.com or on WhatsApp.",
            });
          }
          const history = body.messages.slice(-20);
          const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
            { role: "system", content: prompt },
            ...history.map((m) => ({ role: m.role, content: m.content })),
          ];

          // Try each free model in order — fall back if one is rate-limited.
          let lastError: { status: number; body: string } | null = null;
          for (const model of OPENROUTER_FREE_MODELS) {
            const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`,
                "HTTP-Referer": "https://truhub.lovable.app",
                "X-Title": "TruHub Solutions Chatbot",
              },
              body: JSON.stringify({ model, messages, stream: false }),
            });
            if (resp.ok) {
              const json = (await resp.json()) as {
                choices?: Array<{ message?: { content?: string } }>;
              };
              const content =
                json.choices?.[0]?.message?.content?.trim() ||
                "Sorry, I couldn't generate a reply.";
              return Response.json({ content, model });
            }
            const text = await resp.text();
            console.warn(`[api/chat] OpenRouter model ${model} failed:`, resp.status, text.slice(0, 200));
            lastError = { status: resp.status, body: text };
            // Only fall back on 429/503; surface other errors immediately.
            if (resp.status !== 429 && resp.status !== 503 && resp.status !== 502) {
              break;
            }
          }

          console.error("[api/chat] OpenRouter error", lastError?.status, lastError?.body?.slice(0, 300));
          const isRateLimited = lastError?.status === 429;
          const msg = isRateLimited
            ? "We're getting a lot of requests right now. Please try again in a moment."
            : "Sorry, the assistant is temporarily unavailable. Please email truhub.solutions@gmail.com.";
          return Response.json({
            content: msg,
            error: "openrouter_error",
            status: lastError?.status,
          });
        } catch (err) {
          console.error("[api/chat] unhandled error", err);
          return Response.json(
            {
              content:
                "Sorry, something went wrong reaching the assistant. Please email truhub.solutions@gmail.com.",
              error: "server_error",
            },
            { status: 200 },
          );
        }
      },
    },
  },
});
