"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";

/**
 * Mid-page repeatable CTA band. Drop between sections to keep the primary
 * conversion action always within reach as the user scrolls.
 */
export function CtaBanner({
  eyebrow = "Ready when you are",
  heading = "Let's turn your idea into a launch.",
  subheading = "Book a free 20-minute strategy call — no commitment, just clarity.",
  primaryLabel = "Start Your Project",
  primaryHref = "#contact",
  secondaryLabel = "Message on WhatsApp",
  secondaryHref = "#contact",
}: {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section aria-labelledby="cta-banner-heading" className="relative py-16 sm:py-20">
      <div className="container-x">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B1220]/70 p-8 backdrop-blur-xl sm:p-12"
          style={{ boxShadow: "0 40px 120px -30px rgba(30,167,255,0.35)" }}
        >
          {/* Ambient glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full"
            style={{ background: "rgba(30,167,255,0.28)", filter: "blur(90px)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full"
            style={{ background: "rgba(56,189,248,0.20)", filter: "blur(90px)" }}
          />
          {/* Faint grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage:
                "radial-gradient(ellipse at center, black, transparent 70%)",
            }}
          />

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1EA7FF]/25 bg-[#1EA7FF]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#38BDF8]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1EA7FF]" />
                {eyebrow}
              </div>
              <h2
                id="cta-banner-heading"
                className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl"
              >
                {heading}
              </h2>
              <p className="mt-3 max-w-xl text-sm text-white/60 sm:text-base">
                {subheading}
              </p>
            </div>

            <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
              <a
                href={primaryHref}
                className="btn-primary btn-primary-hover group"
                aria-label={primaryLabel}
              >
                {primaryLabel}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
              <a
                href={secondaryHref}
                className="btn-ghost btn-ghost-hover"
                aria-label={secondaryLabel}
              >
                <MessageCircle size={16} />
                {secondaryLabel}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
