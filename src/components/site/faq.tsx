"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeader, type SectionMeta } from "./section-header";

export function FAQ({ items, meta }: { items: Array<{ id: string; question: string; answer: string }>; meta?: SectionMeta }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  if (items.length === 0) return null;
  return (
    <section id="faq" className="section relative">
      <div className="container-x">
        <SectionHeader meta={meta} eyebrow="FAQ" heading="Frequently asked questions" />
        <div className="mx-auto max-w-3xl space-y-3">
          {items.map((f, i) => {
            const isOpen = open === f.id;
            return (
              <Reveal key={f.id} delay={i}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-all ${
                    isOpen ? "border-[#38BDF8]/40 bg-white/[0.05]" : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : f.id)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-display text-base font-medium">{f.question}</span>
                    <Plus
                      size={18}
                      className={`shrink-0 text-[#38BDF8] transition-transform duration-500 ${isOpen ? "rotate-45" : ""}`}
                    />
                  </button>
                  <div
                    className="grid overflow-hidden transition-[grid-template-rows] duration-500"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="min-h-0">
                      <div className="px-6 pb-5 text-sm text-white/70">{f.answer}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
