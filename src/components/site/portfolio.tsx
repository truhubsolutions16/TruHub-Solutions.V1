"use client";
import { ArrowUpRight, Crown, UtensilsCrossed, ClipboardCheck, ExternalLink, Star, Cpu, type LucideIcon } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeader, type SectionMeta } from "./section-header";

type FeaturedProject = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  tags: string[];
  prestigious?: boolean;
  premium?: boolean;
  accent: string;
  icon: LucideIcon;
  eyebrow: string;
};

const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: "srilalitha",
    title: "Srilalitha Enterprises",
    subtitle: "ERP System & GST Calculator",
    description:
      "Enterprise-grade ERP with inventory, billing, and a built-in GST calculator — engineered to run the day-to-day of a real business.",
    url: "https://srilalithaenterprise.truhubsolutions.in",
    tags: ["ERP", "GST Calculator", "Billing", "Inventory"],
    prestigious: true,
    accent: "from-[#38BDF8]/40 via-indigo-500/20 to-fuchsia-500/10",
    icon: Crown,
    eyebrow: "Prestigious Case Study",
  },
  {
    id: "khaleel-bhai",
    title: "Khaleel Bhai Family Restaurant",
    subtitle: "Restaurant Dine-in System",
    description:
      "A full digital dine-in experience — interactive menus, table ordering, and a modern storefront that brings the restaurant online.",
    url: "https://khaleelbhairestraunt.truhubsolutions.in",
    tags: ["Dine-in Menu", "Ordering", "Storefront"],
    premium: true,
    accent: "from-amber-400/30 via-orange-500/20 to-rose-500/10",
    icon: UtensilsCrossed,
    eyebrow: "Featured Case Study",
  },
  {
  id: "truforms",
  title: "TruForms",
  subtitle: "Smart Online Form Builder",
  description:
    "A modern online form builder by TruHub Solutions that lets businesses, educational institutions, and organizations create beautiful forms, collect responses, and automate workflows with ease.",
  url: "https://truhubforms.truhubsolutions.in", // Change to your actual URL
  tags: [
    "Form Builder",
    "Surveys",
    "Analytics",
    "Automation",
    "No-Code",
  ],
  prestigious: true,
  accent: "from-cyan-400/40 via-sky-500/20 to-blue-600/10",
  icon: Crown,
  eyebrow: "Flagship Product",
},
  {
  id: "truhub-lab",
  title: "TruHub Lababoratory Simulation Studio",
  subtitle: "Engineering Simulation & Modeling Platform",
  description:
    "A web-based engineering simulation environment inspired by modern modeling tools. Build, simulate, and analyze electrical, electronics, and mathematical systems using an interactive block-based workspace.",
  url: "https://truhublabb.truhubsolutions.in",
  tags: [
    "Simulation",
    "Block Modeling",
    "Electrical Engineering",
    "Signal Analysis",
    "Engineering Tools",
  ],
  prestigious: true,
  accent: "from-cyan-400/40 via-blue-500/20 to-violet-600/10",
  icon: Cpu,
  eyebrow: "TruHub Labs Product",
},
];

function FeaturedBanner({ project, index }: { project: FeaturedProject; index: number }) {
  const Icon = project.icon;
  return (
    <Reveal delay={index % 3}>
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group relative block overflow-hidden rounded-3xl border ${
          project.prestigious ? "border-amber-300/40" : "border-white/10"
        } bg-[#0B1220] transition-all duration-500 hover:-translate-y-1 hover:border-[#38BDF8]/60`}
        style={{
          boxShadow: project.prestigious
            ? "0 30px 80px -30px rgba(251,191,36,0.45), 0 0 0 1px rgba(251,191,36,0.20) inset"
            : "0 20px 60px -30px rgba(0,0,0,0.8)",
        }}
      >
        {/* Shine sweep */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] overflow-hidden rounded-3xl"
        >
          <span className="absolute -inset-y-10 -left-1/2 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-xl portfolio-shine" />
        </span>

        {/* Prestigious ribbon */}
        {project.prestigious && (
          <div className="absolute left-0 top-0 z-10 flex items-center gap-1.5 rounded-br-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#0B1220] shadow-lg sm:px-4 sm:py-2 sm:text-[11px]">
            <Crown size={13} />
            Prestigious Project
          </div>
        )}

        {/* Premium ribbon */}
        {project.premium && (
          <div className="absolute right-0 top-0 z-10 flex items-center gap-1.5 rounded-bl-2xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-lg sm:px-4 sm:py-2 sm:text-[11px]">
            <Star size={13} className="animate-pulse" />
            Contains Premium Features
          </div>
        )}

        {/* Ambient gradient */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${project.accent} opacity-60 transition-opacity duration-500 group-hover:opacity-90`}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_50%)]" />

        <div className="relative z-[6] flex flex-col gap-5 p-5 pt-14 sm:gap-6 sm:p-8 sm:pt-16 md:p-10 md:pt-14">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/60 sm:text-[11px]">
            <Icon size={14} className={project.prestigious ? "text-amber-300" : "text-[#38BDF8]"} />
            {project.eyebrow}
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold leading-tight text-white sm:text-2xl md:text-4xl">
              {project.title}
            </h3>
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-[#38BDF8] sm:text-sm md:text-base">
              {project.subtitle}
            </p>
          </div>
          <p className="max-w-2xl text-sm text-white/70 md:text-base">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition group-hover:bg-[#38BDF8] group-hover:text-[#0B1220]">
              Visit live site
              <ExternalLink size={14} />
            </div>
            <span className="max-w-full truncate text-xs text-white/40">
              {project.url.replace("https://", "")}
            </span>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-[6] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition group-hover:bg-[#38BDF8] sm:top-14 sm:h-11 sm:w-11">
          <ArrowUpRight size={18} />
        </div>
      </a>
    </Reveal>
  );
}

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
        <SectionHeader meta={meta} eyebrow="Portfolio" heading="Products & Engineering Innovations" />

        {/* Featured banners */}
        <div className="mb-12 grid gap-6">
          {FEATURED_PROJECTS.map((p, i) => (
            <FeaturedBanner key={p.id} project={p} index={i} />
          ))}
        </div>

        {items.length === 0 ? null : (
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
