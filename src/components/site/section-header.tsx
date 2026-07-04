"use client";
import { Reveal } from "./reveal";

export type SectionMeta = {
  eyebrow?: string | null;
  heading?: string | null;
  subheading?: string | null;
  extra?: string | null;
};

export function SectionHeader({
  meta,
  eyebrow,
  heading,
  subheading,
  maxWidth = "max-w-2xl",
}: {
  meta?: SectionMeta;
  eyebrow?: string | null;
  heading?: string | null;
  subheading?: string | null;
  maxWidth?: string;
}) {
  const e = meta?.eyebrow ?? eyebrow;
  const h = meta?.heading ?? heading;
  const s = meta?.subheading ?? subheading;
  return (
    <Reveal>
      <div className={`mx-auto mb-14 ${maxWidth} text-center`}>
        {e && (
          <div className="mb-3 inline-block rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-[#38BDF8]">
            {e}
          </div>
        )}
        {h && (
          <h2 className="font-display text-4xl font-bold sm:text-5xl">
            <span className="text-gradient">{h}</span>
          </h2>
        )}
        {s && <p className="mt-4 text-white/60">{s}</p>}
      </div>
    </Reveal>
  );
}
