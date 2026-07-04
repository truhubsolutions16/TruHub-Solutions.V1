"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Reveal } from "./reveal";

export function Testimonials({
  items,
}: {
  items: Array<{ id: string; name: string; role: string | null; quote: string; rating: number; avatar_url: string | null }>;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section id="testimonials" className="section relative">
      <div className="container-x">
        <Reveal>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="mb-3 inline-block rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-[#38BDF8]">
              Testimonials
            </div>
            <h2 className="font-display text-4xl font-bold sm:text-5xl">
              <span className="text-gradient">Loved by ambitious teams</span>
            </h2>
          </div>
        </Reveal>

        <div className="relative mx-auto max-w-3xl overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {items.map((t) => (
              <div key={t.id} className="w-full shrink-0 px-2">
                <div className="glass-strong rounded-3xl p-10 text-center">
                  <div className="mb-4 flex justify-center gap-1 text-[#38BDF8]">
                    {Array.from({ length: t.rating }).map((_, k) => (
                      <Star key={k} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-lg text-white/85">"{t.quote}"</p>
                  <div className="mt-6 font-display font-semibold">{t.name}</div>
                  {t.role && <div className="text-xs text-white/50">{t.role}</div>}
                </div>
              </div>
            ))}
          </div>
          {items.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {items.map((_, k) => (
                <button
                  key={k}
                  aria-label={`Go to testimonial ${k + 1}`}
                  onClick={() => setI(k)}
                  className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-[#38BDF8]" : "w-4 bg-white/20"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
