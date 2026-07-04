export function Aurora({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full anim-drift-1"
        style={{ background: "radial-gradient(circle, rgba(30,167,255,0.35) 0%, transparent 60%)", filter: "blur(60px)" }} />
      <div className="absolute -bottom-40 -right-40 h-[42rem] w-[42rem] rounded-full anim-drift-2"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 60%)", filter: "blur(70px)" }} />
      <div className="absolute top-1/3 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full anim-drift-1"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.22) 0%, transparent 60%)", filter: "blur(50px)" }} />
    </div>
  );
}

import { useMemo, useEffect, useState } from "react";

type Dot = {
  top: string;
  left: string;
  size: number;
  bg: string;
  dur: number;
  delay: number;
};

export function Particles({ count = 40 }: { count?: number }) {
  // Only generate on the client, after mount — avoids SSR/client hydration
  // mismatches (Math.random differs between server and client) that would
  // otherwise cause React to discard and re-render the tree on every parent
  // state change (e.g. typing in the contact form).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dots = useMemo<Dot[]>(() => {
    if (!mounted) return [];
    return Array.from({ length: count }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 2.5,
      bg: `rgba(${Math.random() > 0.5 ? "56,189,248" : "255,255,255"},${0.3 + Math.random() * 0.5})`,
      dur: 8 + Math.random() * 10,
      delay: Math.random() * 8,
    }));
  }, [count, mounted]);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            background: d.bg,
            boxShadow: "0 0 8px rgba(56,189,248,0.6)",
            animation: `float-y ${d.dur}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function Grid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.15]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(circle at center, black 30%, transparent 75%)",
      }}
    />
  );
}
