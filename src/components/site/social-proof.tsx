"use client";
import { motion } from "framer-motion";
import {
  Award,
  Rocket,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Star,
} from "lucide-react";

/**
 * Slim "trusted by" band — sits directly under the hero to establish
 * credibility before the visitor scrolls into the deep content.
 * No real client logos to avoid unauthorized use; uses trust badges instead.
 */
export function SocialProof() {
  const badges = [
    { icon: Award, label: "Award-worthy craft" },
    { icon: Shield, label: "SSL & GDPR ready" },
    { icon: Rocket, label: "< 2s load times" },
    { icon: Sparkles, label: "AI-integrated" },
    { icon: TrendingUp, label: "SEO first" },
    { icon: Users, label: "80+ happy clients" },
    { icon: Zap, label: "24-hour response" },
    { icon: Star, label: "5.0 average rating" },
  ];
  // Duplicate for seamless marquee
  const track = [...badges, ...badges];

  return (
    <section
      aria-label="What clients trust us for"
      className="relative border-y border-white/5 bg-[#0B1220]/40 py-8 backdrop-blur-sm"
    >
      <div className="container-x">
        <div className="mb-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
            Trusted by ambitious founders across India & beyond
          </p>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#030712] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#030712] to-transparent"
        />
        <motion.div
          className="flex w-max items-center gap-3"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
        >
          {track.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-md transition-colors hover:border-[#1EA7FF]/40 hover:bg-[#1EA7FF]/5"
              >
                <Icon size={14} className="text-[#38BDF8]" aria-hidden />
                <span className="whitespace-nowrap text-xs font-semibold tracking-wide text-white/80">
                  {b.label}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
