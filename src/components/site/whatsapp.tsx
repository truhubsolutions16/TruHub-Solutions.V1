import { MessageCircle } from "lucide-react";

export function FloatingWhatsApp({ number = "917989367882" }: { number?: string }) {
  const href = `https://wa.me/${number}?text=${encodeURIComponent("Hi TruHub, I'd like to discuss a project.")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_40px_-10px_rgba(37,211,102,0.6)] transition-transform hover:scale-110"
      style={{ background: "linear-gradient(135deg,#25D366 0%,#128C7E 100%)" }}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full opacity-70 anim-glow-pulse" />
      <MessageCircle className="relative" size={26} />
    </a>
  );
}
