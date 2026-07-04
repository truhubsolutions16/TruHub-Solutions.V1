"use client";
import { Reveal } from "./reveal";
import { SectionHeader, type SectionMeta } from "./section-header";

export function About({
  heading,
  body,
  meta,
}: {
  heading: string;
  body: string;
  meta?: SectionMeta;
}) {
  const finalHeading = meta?.heading ?? heading;
  const finalSub = meta?.subheading ?? body;
  return (
    <section id="about" className="section relative">
      <div className="container-x relative">
        <SectionHeader meta={meta} eyebrow="About TruHub" heading={finalHeading} maxWidth="max-w-3xl" />
        <Reveal>
          <p className="mx-auto max-w-3xl text-center text-white/70">{finalSub}</p>
        </Reveal>
      </div>
    </section>
  );
}
