"use client";
import { motion } from "framer-motion";
import {
  Compass,
  ClipboardList,
  Palette,
  Code2,
  ShieldCheck,
  Rocket,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeader, type SectionMeta } from "./section-header";

const ICONS: LucideIcon[] = [Compass, ClipboardList, Palette, Code2, ShieldCheck, Rocket];
const DEFAULT_DURATIONS = ["1–3 days", "2–4 days", "4–7 days", "5–10 days", "2–3 days", "1 day"];

export function Process({ steps, meta }: { steps: Array<{ title: string; desc: string; duration?: string }>; meta?: SectionMeta }) {
  return (
    <section id="process" className="section relative">
      <div className="container-x">
        <SectionHeader
          meta={meta}
          eyebrow="How we work"
          heading="A simple, transparent journey"
          subheading="Six friendly steps from your first idea to a launched, growing product — no jargon, no surprises."
        />

        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = ICONS[i] ?? Rocket;
            const isLast = i === steps.length - 1;
            return (
              <Reveal key={s.title} delay={i}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="group relative h-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl transition hover:border-[#38BDF8]/40"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "radial-gradient(circle, rgba(30,167,255,0.55), transparent 70%)" }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1EA7FF] to-[#2563EB] text-white shadow-[0_10px_30px_-10px_rgba(30,167,255,0.7)]">
                        <Icon size={24} />
                      </div>
                    </div>
                    <span className="font-display text-5xl font-bold leading-none text-white/10 transition group-hover:text-[#38BDF8]/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="mt-6 font-display text-xl font-semibold text-white">
                    {s.title}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{s.desc}</p>

                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                    <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-white/60">
                      {s.duration ?? DEFAULT_DURATIONS[i] ?? "Flexible"}
                    </span>
                    {!isLast ? (
                      <span className="flex items-center gap-1 text-[#38BDF8]/70">
                        Next step <ArrowRight size={12} />
                      </span>
                    ) : (
                      <span className="text-[#38BDF8]">You're live </span>
                    )}
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={2}>
          <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:flex-row">
            <div>
              <div className="font-display text-lg font-semibold text-white">Ready when you are.</div>
              <div className="text-sm text-white/60">Book a free discovery call — we'll map your journey in 20 minutes.</div>
            </div>
            <a href="#contact" className="btn-primary btn-primary-hover">
              Start your project <ArrowRight size={16} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
