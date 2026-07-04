import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type Action = { id: string; label: string; hint?: string; run: () => void };

export function CommandPalette({ actions }: { actions: Action[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return (
    <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-[#0B1220]/90 px-4 py-2 text-xs text-white/60 shadow-xl backdrop-blur hover:border-[#38BDF8]/40 hover:text-white">
      <Search size={12} /> Search <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
    </button>
  );

  const q = query.toLowerCase();
  const filtered = actions.filter(a => !q || a.label.toLowerCase().includes(q) || a.hint?.toLowerCase().includes(q));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-24" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <Search size={16} className="text-white/40" />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Jump to..." className="flex-1 bg-transparent text-sm text-white outline-none" />
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">ESC</kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {filtered.map(a => (
            <button key={a.id} onClick={() => { a.run(); setOpen(false); setQuery(""); }} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-white/5">
              <span>{a.label}</span>
              {a.hint && <span className="text-xs text-white/40">{a.hint}</span>}
            </button>
          ))}
          {filtered.length === 0 && <p className="px-4 py-6 text-center text-xs text-white/40">No matches.</p>}
        </div>
      </div>
    </div>
  );
}
