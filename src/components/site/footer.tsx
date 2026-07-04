import { Globe, Mail as MailIcon, MessageCircle } from "lucide-react";
const Instagram = Globe;
const Linkedin = MailIcon;
const Twitter = MessageCircle;
const logoAsset = { url: "/truhub-logo.png" };

export function Footer({ email, phone }: { email: string; phone: string }) {
  return (
    <footer className="relative border-t border-white/5 pt-16 pb-8">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img src={logoAsset.url} alt="TruHub" className="h-10 w-10 rounded-lg object-contain" />
              <span className="font-display text-lg font-semibold">
                TruHub<span className="text-[#38BDF8]"> Solutions</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-white/60">
              Premium websites, branding and AI-powered digital solutions for ambitious businesses.
              Build. Grow. Succeed.
            </p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition hover:border-[#38BDF8]/40 hover:text-[#38BDF8]"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 text-sm font-semibold text-white/80">Quick Links</div>
            <ul className="space-y-2 text-sm text-white/60">
              {[
                ["Home", "#home"],
                ["About", "#about"],
                ["Services", "#services"],
                ["Pricing", "#pricing"],
                ["Portfolio", "#portfolio"],
                ["Contact", "#contact"],
              ].map(([label, href]) => (
                <li key={href}><a href={href} className="hover:text-[#38BDF8]">{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-4 text-sm font-semibold text-white/80">Contact</div>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href={`mailto:${email}`} className="hover:text-[#38BDF8]">{email}</a></li>
              <li><a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-[#38BDF8]">{phone}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-white/40 sm:flex-row">
          <div>© 2026 TruHub Solutions. All rights reserved.</div>
          <div>Build. Grow. Succeed.</div>
        </div>
      </div>
    </footer>
  );
}
