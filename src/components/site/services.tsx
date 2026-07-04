"use client";
import { useRef, type MouseEvent } from "react";
import {
  Bot, Briefcase, Code, Globe, Image as ImageIcon, MessageCircle,
  Palette, Rocket, Search, Sparkles, Wrench, Zap, type LucideIcon,
} from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeader, type SectionMeta } from "./section-header";

const ICONS: Record<string, LucideIcon> = {
  code: Code, rocket: Rocket, briefcase: Briefcase, image: ImageIcon,
  palette: Palette, search: Search, sparkles: Sparkles, "message-circle": MessageCircle,
  bot: Bot, wrench: Wrench, globe: Globe, zap: Zap,
};

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(e: MouseEvent<HTMLDivElement>) {
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current!.style.transform = `perspective(900px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) translateY(-4px)`;
    ref.current!.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
    ref.current!.style.setProperty("--my", `${(py + 0.5) * 100}%`);
  }
  function onLeave() {
    ref.current!.style.transform = "";
  }
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-[rgba(17,24,39,0.9)] to-[rgba(11,18,32,0.8)] p-6 transition-[transform,border-color,box-shadow] duration-500 hover:border-[#38BDF8]/40"
      style={{ transformStyle: "preserve-3d" }}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(56,189,248,0.18), transparent 40%)",
        }}
      />
      {children}
    </div>
  );
}

export function Services({ items, meta }: { items: Array<{ id: string; title: string; description: string; icon: string }>; meta?: SectionMeta }) {
  return (
    <section id="services" className="section relative">
      <div className="container-x">
        <SectionHeader
          meta={meta}
          eyebrow="Services"
          heading="Everything you need to grow online"
          subheading="Twelve services. One partner. Built for founders who want it done right."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Sparkles;
            return (
              <Reveal key={s.id} delay={i % 4}>
                <TiltCard>
                  <div
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg,#1EA7FF,#2563EB)", boxShadow: "0 10px 30px -12px rgba(30,167,255,0.6)" }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{s.description}</p>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUs({ items, meta }: { items: Array<{ title: string; desc: string }>; meta?: SectionMeta }) {
  return (
    <section id="why" className="section relative">
      <div className="container-x">
        <SectionHeader
          meta={meta}
          eyebrow="Why Choose Us"
          heading="Crafted for teams that ship"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((f, i) => (
            <Reveal key={f.title} delay={i % 4}>
              <div className="card-premium card-premium-hover p-6">
                <div className="mb-3 h-1 w-8 rounded-full bg-gradient-to-r from-[#1EA7FF] to-[#38BDF8]" />
                <div className="font-display font-semibold">{f.title}</div>
                <div className="mt-2 text-sm text-white/60">{f.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
