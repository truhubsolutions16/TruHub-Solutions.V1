import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function buildSystemPrompt(): Promise<{ prompt: string; enabled: boolean }> {
  const sb = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
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
    ...(plans.data ?? []).map((p) => `• ${p.name} — ${p.price}${p.tagline ? ` (${p.tagline})` : ""}\n  Features: ${(p.features ?? []).join(", ")}`),
    "",
    "=== ADD-ON SERVICES ===",
    ...(addons.data ?? []).map((a) => `• ${a.name} — ${a.price}`),
    "",
    "=== FAQs ===",
    ...(faqs.data ?? []).map((f) => `Q: ${f.question}\nA: ${f.answer}`),
    "",
    "=== CONTACT ===",
    contact.data ? `Email: ${contact.data.email} | Phone: ${contact.data.phone} | WhatsApp: https://wa.me/${contact.data.whatsapp}` : "",
    "",
    settings.data?.chatbot_kb_extra ? `=== EXTRA KNOWLEDGE ===\n${settings.data.chatbot_kb_extra}` : "",
  ];
  return { prompt: parts.join("\n"), enabled };
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const body = (await request.json()) as { messages?: Msg[] };
        if (!Array.isArray(body.messages)) return new Response("messages required", { status: 400 });
        const { prompt, enabled } = await buildSystemPrompt();
        if (!enabled) {
          return Response.json({
            content: "The chatbot is currently off. Please reach us at truhub.solutions@gmail.com or on WhatsApp.",
          });
        }
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "system", content: prompt }, ...body.messages.slice(-20)],
          }),
        });
        if (!resp.ok) {
          const text = await resp.text();
          return new Response(text, { status: resp.status });
        }
        const json = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = json.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a reply.";
        return Response.json({ content });
      },
    },
  },
});
