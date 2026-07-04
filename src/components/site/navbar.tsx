"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
const logoAsset = { url: "/truhub-logo.webp" };

const LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
  { href: "/portal", label: "Client Portal" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="container-x">
        <nav
          className={`flex items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 ${
            scrolled ? "glass-strong shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]" : ""
          }`}
        >
          <a href="#home" className="flex items-center gap-2.5">
            <img src={logoAsset.url} alt="TruHub" width={36} height={36} decoding="async" className="h-9 w-9 rounded-lg object-contain" />
            <span className="hidden font-display text-lg font-semibold tracking-tight sm:inline">
              TruHub<span className="text-[#38BDF8]"> Solutions</span>
            </span>
          </a>
          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-full px-4 py-2 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a href="#contact" className="btn-primary btn-primary-hover hidden sm:inline-flex">
              Start Your Project
            </a>
            <button
              className="btn-ghost btn-ghost-hover lg:hidden !px-3 !py-2"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
        {open && (
          <div className="glass-strong mt-2 rounded-2xl p-4 lg:hidden">
            <ul className="grid gap-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a href="#contact" className="btn-primary btn-primary-hover w-full" onClick={() => setOpen(false)}>
                  Start Your Project
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
