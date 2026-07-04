"use client";
import { Check, Sparkles } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeader, type SectionMeta } from "./section-header";

export function Pricing({
  plans,
  addons,
  meta,
  addonsMeta,
}: {
  plans: Array<{ id: string; name: string; price: string; tagline: string | null; features: string[]; cta_label: string; highlighted: boolean }>;
  addons: Array<{ id: string; name: string; price: string }>;
  meta?: SectionMeta;
  addonsMeta?: SectionMeta;
}) {
  const addonsHeading = addonsMeta?.heading ?? "Additional Services";
  return (
    <section id="pricing" className="section relative">
      <div className="container-x">
        <SectionHeader
          meta={meta}
          eyebrow="Pricing"
          heading="Transparent pricing. Premium value."
          subheading="Choose a plan, or ask us for a custom quote."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.id} delay={i}>
              <div
                className={`relative flex h-full flex-col rounded-3xl border p-8 transition-all duration-500 hover:-translate-y-1 ${
                  p.highlighted
                    ? "border-[#38BDF8]/50 bg-gradient-to-b from-[rgba(30,167,255,0.12)] to-[rgba(11,18,32,0.9)] anim-glow-pulse"
                    : "border-white/10 bg-gradient-to-b from-[rgba(17,24,39,0.9)] to-[rgba(11,18,32,0.8)] hover:border-[#38BDF8]/30"
                }`}
              >
                {p.tagline && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-gradient-to-r from-[#1EA7FF] to-[#2563EB] px-3 py-1 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles size={12} />
                      {p.tagline}
                    </span>
                  </div>
                )}
                <div className="text-sm uppercase tracking-widest text-white/50">{p.name}</div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold text-gradient-primary">{p.price}</span>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-white/80">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1EA7FF]/15 text-[#38BDF8]">
                        <Check size={12} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`mt-8 ${p.highlighted ? "btn-primary btn-primary-hover" : "btn-ghost btn-ghost-hover"}`}
                >
                  {p.cta_label}
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        {addons.length > 0 && (
          <Reveal>
            <div className="mt-16">
              <h3 className="mb-6 text-center font-display text-2xl font-semibold text-white/80">{addonsHeading}</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                {addons.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center transition hover:border-[#38BDF8]/40 hover:bg-white/[0.06]"
                  >
                    <div className="text-xs text-white/60">{a.name}</div>
                    <div className="mt-1 font-display font-semibold text-[#38BDF8]">{a.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
