"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
const logoAsset = { url: "/truhub-logo.png" };

export function SiteLoader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => setShow(false), 1600);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <img
              src={logoAsset.url}
              alt="TruHub Solutions"
              className="h-24 w-24 anim-glow-pulse rounded-2xl object-contain"
            />
            <div className="h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
