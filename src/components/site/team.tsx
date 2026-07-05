"use client";
import { Reveal } from "./reveal";
import { SectionHeader, type SectionMeta } from "./section-header";

export type TeamMember = {
  id: string;
  name: string;
  title: string;
  tagline: string | null;
  description: string | null;
  photo_url: string | null;
};

export function Team({ members, meta }: { members: TeamMember[]; meta?: SectionMeta }) {
  if (!members || members.length === 0) return null;
  return (
    <section id="team" className="section relative">
      <div className="container-x">
        <SectionHeader meta={meta} eyebrow="Our Team" heading="The people behind the craft" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m, i) => (
            <Reveal key={m.id} delay={i % 3}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] transition hover:border-[#38BDF8]/40">
                <div className="aspect-[4/5] w-full overflow-hidden bg-white/[0.03]">
                  {m.photo_url ? (
                    <img
                      src={m.photo_url}
                      alt={`${m.name}, ${m.title}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center font-display text-4xl text-white/20">
                      {m.name?.[0] ?? "?"}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="font-display text-lg font-semibold">{m.name}</div>
                  <div className="text-xs text-[#38BDF8]">{m.title}</div>
                  {m.tagline && <div className="mt-1 text-xs italic text-white/50">"{m.tagline}"</div>}
                  {m.description && (
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{m.description}</p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
