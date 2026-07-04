import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getSiteSettings } from "@/lib/cms.functions";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const settings = useQuery({ queryKey: ["site-settings"], queryFn: () => getSiteSettings() });
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm **TruBot** — ask me anything about our services, pricing, or process." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  if (!settings.data?.chatbot_enabled) return null;

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!r.ok) throw new Error(await r.text());
      const j = (await r.json()) as { content: string };
      setMessages((m) => [...m, { role: "assistant", content: j.content }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't reach the server. Please email truhub.solutions@gmail.com." }]);
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="group fixed bottom-6 right-24 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_40px_-10px_rgba(30,167,255,0.7)] transition-transform hover:scale-110"
          style={{ background: "linear-gradient(135deg,#1EA7FF 0%,#2563EB 100%)" }}
        >
          <span className="pointer-events-none absolute inset-0 rounded-full opacity-70 anim-glow-pulse" />
          <MessageSquare className="relative" size={24} />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220]/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg,#1EA7FF,#2563EB)" }}>
                <Bot size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold">TruBot</div>
                <div className="text-[10px] text-white/50">Ask anything about TruHub</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 text-white/60 hover:bg-white/5"><X size={16} /></button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${m.role === "user" ? "bg-gradient-to-br from-[#1EA7FF] to-[#2563EB] text-white" : "bg-white/[0.05] text-white/90"}`}>
                  <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white/[0.05] px-3.5 py-2 text-sm text-white/60"><Loader2 size={14} className="inline animate-spin" /> thinking…</div>
              </div>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-white/10 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[#38BDF8]"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()} className="flex h-9 w-9 items-center justify-center rounded-xl text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg,#1EA7FF,#2563EB)" }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
