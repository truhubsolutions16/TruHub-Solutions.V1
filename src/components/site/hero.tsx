"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Cpu, ShieldCheck } from "lucide-react";
import { Aurora, Grid, Particles } from "./aurora";

export function Hero({
  headline,
  subtitle,
  ctaPrimary,
  ctaSecondary,
}: {
  headline: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}) {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-16"
    >
      <Aurora />
      <Grid />
      <Particles count={40} />

      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/3 h-[500px] w-[500px] rounded-full"
        style={{ background: "rgba(30,167,255,0.10)", filter: "blur(120px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-1/4 h-[400px] w-[400px] rounded-full"
        style={{ background: "rgba(56,189,248,0.10)", filter: "blur(100px)" }}
      />

      <div className="container-x relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* LEFT: Copy + CTAs + Stats */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative z-10 space-y-7"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1EA7FF]/25 bg-[#1EA7FF]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#38BDF8]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1EA7FF] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1EA7FF]" />
              </span>
              Premium digital studio · Est. 2024
            </div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.15, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
              className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              <HeadlineWithGradient text={headline} />
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
            >
              {subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              <a href="#contact" className="btn-primary btn-primary-hover group">
                {ctaPrimary}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#portfolio" className="btn-ghost btn-ghost-hover">
                {ctaSecondary}
              </a>
            </motion.div>

          </motion.div>

          {/* RIGHT: Bento Studio Grid */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative grid h-[520px] w-full grid-cols-6 grid-rows-6 gap-3 sm:gap-4 lg:h-[600px]"
          >
            {/* Card 1: Portfolio Highlight */}
            <BentoCard className="col-span-6 row-span-3 overflow-hidden p-0" delay={0.25}>
              <div className="relative h-full w-full">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgba(30,167,255,0.35), rgba(56,189,248,0.15) 40%, rgba(11,18,32,0.9) 90%)",
                  }}
                />
                {/* Decorative grid */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(56,189,248,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.25) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="font-display text-3xl font-bold text-white sm:text-5xl">
                    TruHub<span className="text-[#38BDF8]">.</span>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#030712] via-[#030712]/70 to-transparent p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#38BDF8]">
                    Recent Launch
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-white">
                    Quantum Analytics SaaS
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Card 3: Terminal / Currently Building */}
            <BentoCard className="col-span-3 row-span-3 overflow-hidden p-5" delay={0.45}>
              <div className="mb-3 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500/60" />
                <span className="h-2 w-2 rounded-full bg-amber-500/60" />
                <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
              </div>
              <div className="space-y-1 font-mono text-[10.5px] leading-relaxed text-white/55">
                <p className="text-[#38BDF8]">$ building project_alpha</p>
                <p>&gt; compiling components...</p>
                <p>&gt; optimizing assets...</p>
                <TerminalCursor />
              </div>
            </BentoCard>

            {/* Card 4: Tech Stack */}
            <BentoCard className="col-span-3 row-span-3 flex flex-col justify-center gap-3 p-5" delay={0.55}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Stack
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <StackChip icon={<Sparkles size={12} />} label="Design" />
                <StackChip icon={<Cpu size={12} />} label="AI" highlight />
                <StackChip label="React" />
                <StackChip label="TS" />
                <StackChip label="Node" />
                <StackChip icon={<ShieldCheck size={12} />} label="Secure" />
              </div>
            </BentoCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* --- Sub-components --- */

function HeadlineWithGradient({ text }: { text: string }) {
  // Highlight a middle keyword with the gradient. Pick "Digital", "Experiences",
  // "Grow", "Business", or fall back to the middle word.
  const words = text.split(" ");
  const keywords = ["Experiences", "Digital", "Grow", "Growth", "Businesses.", "Business."];
  let idx = words.findIndex((w) => keywords.includes(w));
  if (idx === -1) idx = Math.floor(words.length / 2);
  return (
    <>
      {words.map((w, i) =>
        i === idx ? (
          <span key={i} className="text-gradient">
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ) : (
          <span key={i}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ),
      )}
    </>
  );
}

function Stat({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return (
    <div ref={ref} className="space-y-1">
      <div className="text-2xl font-bold tracking-tighter text-white tabular-nums">
        {n}
        {suffix}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</div>
    </div>
  );
}

function BentoCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B1220]/60 backdrop-blur-xl transition-colors hover:border-[#1EA7FF]/50 ${className}`}
      style={{ boxShadow: "0 20px 60px -20px rgba(0,0,0,0.6)" }}
    >
      {children}
    </motion.div>
  );
}

function StackChip({
  icon,
  label,
  highlight = false,
}: {
  icon?: React.ReactNode;
  label: string;
  highlight?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
        highlight
          ? "border-[#1EA7FF]/40 bg-[#1EA7FF]/10 text-[#38BDF8]"
          : "border-white/10 bg-white/5 text-white/80 hover:border-white/25"
      }`}
    >
      {icon}
      {label}
    </span>
  );
}

function TerminalCursor() {
  return (
    <p>
      &gt; deploying to edge
      <span
        className="ml-0.5 inline-block h-3 w-[2px] align-middle bg-[#38BDF8]"
        style={{ animation: "cursor-blink 1s infinite" }}
      />
    </p>
  );
}
