"use client";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeader, type SectionMeta } from "./section-header";

export function Portfolio({
  items,
  meta,
}: {
  items: Array<{
    id: string;
    name: string;
    category: string;
    technology: string;
    description: string;
    image_url: string | null;
    live_url: string | null;
  }>;
  meta?: SectionMeta;
}) {
  return (
    <section id="portfolio" className="section relative">
      <div className="container-x">
        <SectionHeader meta={meta} eyebrow="Portfolio" heading="Selected work" />

        {items.length === 0 ? (
          <Reveal>
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/50">
              Portfolio is being curated. New projects launching soon.
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
              <Reveal key={it.id} delay={i % 3}>
                <a
                  href={it.live_url || "#"}
                  target={it.live_url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] transition-all duration-500 hover:-translate-y-1 hover:border-[#38BDF8]/40"
                  style={{ boxShadow: "0 20px 60px -30px rgba(0,0,0,0.8)" }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#0B1220] to-[#111827]">
                    {it.image_url ? (
                      <img
                        src={it.image_url}
                        alt={it.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-4xl font-display text-white/20">
                        {it.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur transition group-hover:bg-[#1EA7FF]">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/50">
                      <span>{it.category}</span>
                      <span>·</span>
                      <span className="text-[#38BDF8]">{it.technology}</span>
                    </div>
                    <div className="mt-1.5 font-display text-lg font-semibold">{it.name}</div>
                    <p className="mt-1 line-clamp-2 text-sm text-white/60">{it.description}</p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
