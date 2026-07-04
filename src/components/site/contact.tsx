"use client";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "./reveal";
import { submitContactForm } from "@/lib/cms.functions";
import type { SectionMeta } from "./section-header";

export function Contact({ email, phone, meta }: { email: string; phone: string; meta?: SectionMeta }) {
  const submit = useServerFn(submitContactForm);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    business_name: "",
    project_details: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await submit({ data: form });
      toast.success("Thanks! We'll be in touch within 24 hours.");
      setForm({ name: "", email: "", phone: "", business_name: "", project_details: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/30 focus:border-[#38BDF8] focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(56,189,248,0.1)]";

  return (
    <section id="contact" className="section relative">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          <Reveal>
            <div>
              <div className="mb-3 inline-block rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-[#38BDF8]">
                {meta?.eyebrow ?? "Contact"}
              </div>
              <h2 className="font-display text-4xl font-bold sm:text-5xl">
                <span className="text-gradient">{meta?.heading ?? "Let's build something premium."}</span>
              </h2>
              <p className="mt-4 text-white/70">
                {meta?.subheading ?? "Tell us about your project. We reply within 24 hours with a plan and a quote."}
              </p>
              <div className="mt-8 space-y-3">
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-[#38BDF8]/40 hover:bg-white/[0.06]"
                >
                  <Mail size={16} className="text-[#38BDF8]" />
                  {email}
                </a>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-[#38BDF8]/40 hover:bg-white/[0.06]"
                >
                  <Phone size={16} className="text-[#38BDF8]" />
                  {phone}
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <form onSubmit={onSubmit} className="glass-strong space-y-4 rounded-3xl p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="Your name" className={field} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input required type="email" placeholder="Email" className={field} value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input placeholder="Phone" className={field} value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input placeholder="Business name" className={field} value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
              </div>
              <textarea required rows={5} placeholder="Project details" className={field}
                value={form.project_details}
                onChange={(e) => setForm({ ...form, project_details: e.target.value })} />
              <button disabled={pending} type="submit" className="btn-primary btn-primary-hover w-full disabled:opacity-60">
                {pending ? "Sending…" : (<><Send size={16} /> Start Your Project</>)}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
