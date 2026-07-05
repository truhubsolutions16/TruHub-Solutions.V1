"use client";
import { Check } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeader, type SectionMeta } from "./section-header";

const DEFAULT_PHOTO = "/image.png";

export function CEO({
  name = "Bharani Kumar G.",
  title = "Chief Executive Officer",
  vision = "Great brands aren't built by chance — they're engineered. At TruHub, we turn every client's ambition into a digital experience that performs, scales and lasts.",
  skills = ["Client Success", "Operations", "Growth Strategy"],
  photoUrl,
  meta,
}: {
  name?: string;
  title?: string;
  vision?: string;
  skills?: string[];
  photoUrl?: string | null;
  meta?: SectionMeta;
}) {
  const src = photoUrl || DEFAULT_PHOTO;
  return (
    <section id="ceo" className="section relative">
      <div className="container-x">
        <SectionHeader meta={meta} eyebrow="Meet the CEO" heading="Leadership that drives every project" />

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1.05fr] lg:items-center">
          <Reveal>
            <div>
              <div className="text-sm uppercase tracking-widest text-white/50">Chief Executive Officer</div>
              <h3 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{name}</h3>
              <p className="mt-6 text-lg leading-relaxed text-white/75">"{vision}"</p>
              <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {skills.map((s) => (
                  <li
                    key={s}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-[#38BDF8]/40 hover:bg-white/[0.06]"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#1EA7FF] to-[#2563EB]">
                      <Check size={14} />
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="relative mx-auto max-w-md">
              <div
                className="absolute -inset-4 rounded-[2rem] opacity-70 blur-2xl"
                style={{ background: "linear-gradient(135deg,#2563EB,#1EA7FF)" }}
              />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0B1220]">
                <img
                  src={src}
                  alt={`${name}, ${title}`}
                  width={640}
                  height={800}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#030712] to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl glass p-3">
                  <div className="font-display text-lg font-semibold">{name}</div>
                  <div className="text-xs text-[#38BDF8]">{title}</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
