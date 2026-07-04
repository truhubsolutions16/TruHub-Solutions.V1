
UPDATE public.faqs SET question='How long does it take to build my website?', answer='Most premium websites launch in 7–21 days depending on scope. Landing pages ship in under a week; full multi-page sites with custom design typically take 2–3 weeks. You get a clear timeline before we start.' WHERE id='2baef557-b0e9-4302-9cf7-b16b58cb4fbc';

UPDATE public.faqs SET question='Do you offer ongoing maintenance and support?', answer='Yes. Every plan includes post-launch support, and we offer monthly care packages that cover updates, backups, security patches, performance monitoring and small design tweaks.' WHERE id='5f6738eb-3841-4c86-a76e-bd954cf9c1c5';

UPDATE public.faqs SET question='Can you redesign or migrate my existing website?', answer='Absolutely. We regularly rebuild WordPress, Wix, Shopify and custom sites into faster, more premium experiences — while preserving your SEO, content and brand equity.' WHERE id='24b5416c-aec0-4e30-a770-64635422bf84';

UPDATE public.faqs SET question='Do you build AI features and automations?', answer='Yes. We integrate AI chatbots, content generation, smart search, workflow automation and custom AI agents into your website or product — powered by leading models.' WHERE id='935db869-2a50-4d0e-9fc6-c7f9bfceeb72';

UPDATE public.faqs SET question='What does your SEO service include?', answer='Technical SEO (Core Web Vitals, schema, sitemap, indexing), on-page SEO (keywords, meta, content structure) and off-page basics. Advanced monthly SEO retainers are available for content, link-building and rank tracking.' WHERE id='7820355f-08be-4492-a1a6-dc9c6a857585';

UPDATE public.faqs SET question='Do you provide GST invoices?', answer='Yes. TruHub Solutions issues proper GST-compliant invoices for every project and retainer, suitable for Indian and international clients.' WHERE id='61bb4966-33cf-4aef-9d42-c282912d4f0e';

INSERT INTO public.faqs (question, answer, sort_order) VALUES
('How much does a project cost?', 'Pricing depends on scope. Starter websites begin at a fixed package price, while custom design + development, branding and AI builds are quoted after a short discovery call. You always get a transparent, itemised proposal upfront.', 100),
('What are your payment terms?', 'We work on a simple milestone model — 50% to kick off, 25% at design approval and 25% before launch. UPI, bank transfer, Stripe and international cards are all accepted.', 110),
('Who owns the website and the code?', '100% you. Once the final invoice is settled, all source code, design files, content and brand assets are transferred and yours forever. No lock-in.', 120),
('How many revisions do I get?', 'Every project includes generous revision rounds at design and development stages. We refine until it feels premium — not until an arbitrary counter runs out.', 130),
('How will we communicate during the project?', 'You get a dedicated point of contact, a private WhatsApp/email channel, weekly progress updates and a shared board with milestones so you always know where things stand.', 140),
('What technology do you build with?', 'Modern, production-grade stack: React, Next.js / TanStack, Tailwind, TypeScript, Supabase, Node.js, Framer Motion, and best-in-class hosting on Vercel, Cloudflare or your preferred cloud.', 150);
