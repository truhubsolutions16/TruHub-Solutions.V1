"use client";
import { motion, type Variants } from "framer-motion";
import { useMemo, type ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] },
  }),
};

// Cache motion(As) per element type. Calling motion() inside the component
// body creates a brand-new component identity on every render, which makes
// React unmount + remount the entire subtree — resetting form input focus
// and replaying the reveal animation on every keystroke.
const motionCache = new Map<React.ElementType, React.ElementType>();
function getMotion(as: React.ElementType): React.ElementType {
  let m = motionCache.get(as);
  if (!m) {
    m = motion.create(as) as unknown as React.ElementType;
    motionCache.set(as, m);
  }
  return m;
}

export function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: React.ElementType;
  className?: string;
}) {
  const MotionAs = useMemo(() => getMotion(as), [as]);
  return (
    <MotionAs
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      custom={delay}
    >
      {children}
    </MotionAs>
  );
}

