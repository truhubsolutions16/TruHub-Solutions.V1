"use client";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Aurora, Grid, Particles } from "./aurora";
const truhubLogo = { url: "/truhub-logo.png" };


export function Hero({
  headline,
  subtitle,
  ctaPrimary,
  ctaSecondary,
}: {
  headline: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const tx = useTransform(sx, (v) => v * 20);
  const ty = useTransform(sy, (v) => v * 20);
  const tx2 = useTransform(sx, (v) => v * -30);
  const ty2 = useTransform(sy, (v) => v * -30);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }

  return (
    <section
      id="home"
      ref={ref}
      onMouseMove={onMove}
      className="relative flex min-h-screen items-center overflow-hidden pt-32"
    >
      <Aurora />
      <Grid />
      <Particles count={50} />
      <motion.div
        style={{ x: tx2, y: ty2 }}
        className="pointer-events-none absolute right-[6%] top-[18%] hidden h-72 w-72 rounded-full lg:block"
      >
        <div className="h-full w-full rounded-full anim-spin-slow"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(30,167,255,0.4), rgba(37,99,235,0.1), rgba(56,189,248,0.5), rgba(30,167,255,0.4))",
            filter: "blur(40px)",
          }} />
      </motion.div>

      <div className="container-x relative z-10">
        <motion.div style={{ x: tx, y: ty }} className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.6, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <motion.div
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(30,167,255,0.55), rgba(56,189,248,0.15) 60%, transparent 75%)",
                  filter: "blur(30px)",
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden
                className="absolute -inset-4 rounded-full border border-[#38BDF8]/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                style={{
                  maskImage:
                    "conic-gradient(from 0deg, transparent 0deg, #000 90deg, transparent 180deg)",
                }}
              />
              <motion.img
                src={truhubLogo.url}
                alt="TruHub Solutions"
                className="relative h-28 w-28 rounded-[2rem] border border-white/10 bg-white/[0.03] p-2 object-contain backdrop-blur-xl sm:h-36 sm:w-36"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 10px 40px rgba(30,167,255,0.55))" }}
              />
            </div>
          </motion.div>



          <motion.h1
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
            initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="text-gradient">{headline}</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-base text-white/70 sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
          >
            {subtitle}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7 }}
          >
            <a href="#contact" className="btn-primary btn-primary-hover group">
              {ctaPrimary}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#portfolio" className="btn-ghost btn-ghost-hover">
              {ctaSecondary}
            </a>
          </motion.div>
        </motion.div>

        {/* Abstract tech visual */}
        <motion.div
          className="relative mx-auto mt-16 max-w-4xl"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.9, duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div
            className="glass mx-auto aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-3xl border-white/10 p-2"
            style={{ boxShadow: "0 40px 120px -30px rgba(30,167,255,0.45)" }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#0B1220]">
              <div className="absolute inset-0 opacity-40 aurora-bg" />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(56,189,248,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.15) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="absolute left-4 top-3 flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
              <div className="absolute inset-0 grid place-items-center">
                <div className="font-display text-4xl font-bold text-gradient-primary sm:text-6xl">
                  TruHub<span className="text-white">.</span>
                </div>
              </div>
              <TypewriterBar />
            </div>
          </div>
        </motion.div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-xs text-white/50 transition hover:text-white"
        aria-label="Scroll to about"
      >
        Scroll
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={18} />
        </motion.span>
      </a>
    </section>
  );
}

function TypewriterBar() {
  const [text, setText] = useState("");
  const full = "> deploy premium.experience --with luxury,speed,intelligence";
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setText(full.slice(0, i));
      i = (i + 1) % (full.length + 20);
    }, 90);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-x-6 bottom-5 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 font-mono text-xs text-[#38BDF8] backdrop-blur-md">
      {text}<span className="ml-0.5 inline-block h-3.5 w-[2px] bg-[#38BDF8] align-middle" style={{ animation: "cursor-blink 1s infinite" }} />
    </div>
  );
}
