import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Trash2, Upload, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  getMyRole,
  adminUpsert, adminDelete, adminUploadMedia,
  adminListSubmissions, adminDeleteSubmission, adminListMedia,
  getSiteContent, getSiteSettings, listBlogPosts,
} from "@/lib/cms.functions";
import { broadcastCmsUpdate } from "@/lib/cms-broadcast";
import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { LeadsPanel } from "@/components/admin/leads-panel";
import { ActivityPanel } from "@/components/admin/activity-panel";
import { SecurityPanel } from "@/components/admin/security-panel";
import { SeoPanel } from "@/components/admin/seo-panel";
import { RedirectsPanel } from "@/components/admin/redirects-panel";
import { MediaLibraryPanel } from "@/components/admin/media-library-panel";
import { UsersRolesPanel } from "@/components/admin/users-roles-panel";
import { ProjectsPanel } from "@/components/admin/projects-panel";
import { BackupsPanel } from "@/components/admin/backups-panel";
import { MessagesPanel } from "@/components/admin/messages-panel";
import { CommandPalette } from "@/components/admin/command-palette";
import { recordLoginAttempt } from "@/lib/security/security.functions";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve((r.result as string).split(",")[1] ?? "");
    r.onerror = () => reject(r.error ?? new Error("Read failed"));
    r.readAsDataURL(file);
  });
}




export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — TruHub" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminPage,
});

type Stage = "auth" | "loading" | "denied" | "ready";

function AdminPage() {
  const [stage, setStage] = useState<Stage>("loading");
  const [session, setSession] = useState<{ user: { email?: string | null; id: string } } | null>(null);
  const role = useServerFn(getMyRole);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession({ user: data.session.user });
        checkRole();
      } else {
        setStage("auth");
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ? { user: s.user } : null);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line
  }, []);

  async function checkRole() {
    setStage("loading");
    try {
      const r = await role();
      setStage(r.isAdmin ? "ready" : "denied");
    } catch {
      setStage("denied");
    }
  }

  async function onSignOut() {
    await supabase.auth.signOut();
    setSession(null);
    setStage("auth");
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container-x py-10">
        {stage === "auth" && <AuthCard onDone={checkRole} />}
        {stage === "loading" && <Center><Loader2 className="animate-spin text-[#38BDF8]" /></Center>}
        {stage === "denied" && (
          <CenterCard title="Access denied" subtitle="Your account isn't an admin. Ask an existing admin to grant you the admin role, or sign in with an admin account.">
            <button onClick={onSignOut} className="btn-ghost btn-ghost-hover w-full">Sign out</button>
          </CenterCard>
        )}
        {stage === "ready" && <Dashboard email={session?.user.email ?? ""} onSignOut={onSignOut} />}
      </div>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[60vh] place-items-center">{children}</div>;
}
function CenterCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md">
      <div className="glass-strong rounded-3xl p-8">
        <h1 className="font-display text-2xl font-bold text-gradient">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-white/60">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function AuthCard({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const logAttempt = useServerFn(recordLoginAttempt);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        logAttempt({ data: { email, success: false, failure_reason: error.message, user_agent: navigator.userAgent } }).catch(() => {});
        throw error;
      }
      logAttempt({ data: { email, success: true, user_agent: navigator.userAgent } }).catch(() => {});
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally { setBusy(false); }
  }

  const field = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[#38BDF8]";
  return (
    <CenterCard title="Admin Sign In" subtitle="Sign in with your admin account.">
      <form onSubmit={onSubmit} className="space-y-3">
        <input required type="email" placeholder="Email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" placeholder="Password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={busy} type="submit" className="btn-primary btn-primary-hover w-full">
          {busy ? "…" : "Sign in"}
        </button>
      </form>
    </CenterCard>
  );
}

// ==================== DASHBOARD ====================
type Tab =
  | "dashboard" | "analytics" | "leads" | "activity" | "security"
  | "users" | "projects" | "messages" | "backups"
  | "sections" | "portfolio" | "services" | "why" | "pricing" | "addons" | "testimonials" | "faqs"
  | "hero" | "about" | "founder" | "team" | "process" | "contact" | "submissions" | "media"
  | "blog" | "settings" | "seo" | "redirects" | "media-library";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analytics", label: "Analytics" },
  { id: "leads", label: "Leads" },
  { id: "projects", label: "Projects" },
  { id: "messages", label: "Messages" },
  { id: "users", label: "Users & Roles" },
  { id: "activity", label: "Activity" },
  { id: "security", label: "Security" },
  { id: "backups", label: "Backups" },
  { id: "sections", label: "Section Text" },
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "why", label: "Why Choose Us" },
  { id: "pricing", label: "Pricing" },
  { id: "addons", label: "Add-ons" },
  { id: "portfolio", label: "Portfolio" },
  { id: "founder", label: "Founder" },
  { id: "team", label: "Team" },
  { id: "process", label: "Process Steps" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faqs", label: "FAQs" },
  { id: "contact", label: "Contact Info" },
  { id: "blog", label: "Blog" },
  { id: "seo", label: "SEO" },
  { id: "redirects", label: "Redirects" },
  { id: "media-library", label: "Media Library" },
  { id: "settings", label: "Settings" },
  { id: "submissions", label: "Submissions (legacy)" },
  { id: "media", label: "Media (legacy)" },
];

const NEW_TABS = ["dashboard","analytics","leads","activity","security","seo","redirects","media-library","users","projects","messages","backups"];



function Dashboard({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const qc = useQueryClient();
  const content = useQuery({ queryKey: ["admin-content"], queryFn: () => getSiteContent(), staleTime: 0 });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient">Admin Dashboard</h1>
          <p className="text-xs text-white/50">{email}</p>
        </div>
        <button onClick={onSignOut} className="btn-ghost btn-ghost-hover !py-2 !text-xs">
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              tab === t.id ? "bg-gradient-to-r from-[#1EA7FF] to-[#2563EB] text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
        {tab === "dashboard" && <DashboardOverview onNavigate={(t) => setTab(t as Tab)} />}
        {tab === "analytics" && <AnalyticsPanel />}
        {tab === "leads" && <LeadsPanel />}
        {tab === "activity" && <ActivityPanel />}
        {tab === "security" && <SecurityPanel />}
        {tab === "seo" && <SeoPanel />}
        {tab === "redirects" && <RedirectsPanel />}
        {tab === "media-library" && <MediaLibraryPanel />}
        {tab === "users" && <UsersRolesPanel />}
        {tab === "projects" && <ProjectsPanel />}
        {tab === "backups" && <BackupsPanel />}
        {tab === "messages" && <MessagesPanel />}
        {content.isLoading && !NEW_TABS.includes(tab) && <Loader2 className="animate-spin text-[#38BDF8]" />}
        {content.data && !NEW_TABS.includes(tab) && (


          <>
            {tab === "portfolio" && (
              <ListEditor table="portfolio_items" title="Portfolio" rows={content.data.portfolio}
                fields={[
                  { key: "name", label: "Name", type: "text", required: true },
                  { key: "category", label: "Category", type: "text", required: true },
                  { key: "technology", label: "Technology", type: "text", required: true },
                  { key: "description", label: "Description", type: "textarea", required: true },
                  { key: "image_url", label: "Image URL", type: "image" },
                  { key: "live_url", label: "Live URL", type: "text" },
                  { key: "sort_order", label: "Order", type: "number" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "services" && (
              <ListEditor table="services" title="Services" rows={content.data.services}
                fields={[
                  { key: "title", label: "Title", type: "text", required: true },
                  { key: "description", label: "Description", type: "textarea", required: true },
                  { key: "icon", label: "Icon (code, rocket, briefcase, image, palette, search, sparkles, message-circle, bot, wrench, globe, zap)", type: "text" },
                  { key: "sort_order", label: "Order", type: "number" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "pricing" && (
              <ListEditor table="pricing_plans" title="Pricing Plans" rows={content.data.plans}
                fields={[
                  { key: "name", label: "Name", type: "text", required: true },
                  { key: "price", label: "Price", type: "text", required: true },
                  { key: "tagline", label: "Tagline (e.g. Most Popular)", type: "text" },
                  { key: "features", label: "Features (one per line)", type: "list" },
                  { key: "cta_label", label: "CTA Label", type: "text" },
                  { key: "highlighted", label: "Highlighted", type: "bool" },
                  { key: "sort_order", label: "Order", type: "number" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "addons" && (
              <ListEditor table="additional_services" title="Additional Services" rows={content.data.addons}
                fields={[
                  { key: "name", label: "Name", type: "text", required: true },
                  { key: "price", label: "Price", type: "text", required: true },
                  { key: "sort_order", label: "Order", type: "number" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "testimonials" && (
              <ListEditor table="testimonials" title="Testimonials" rows={content.data.testimonials}
                fields={[
                  { key: "name", label: "Name", type: "text", required: true },
                  { key: "role", label: "Role", type: "text" },
                  { key: "quote", label: "Quote", type: "textarea", required: true },
                  { key: "rating", label: "Rating (1-5)", type: "number" },
                  { key: "avatar_url", label: "Avatar URL", type: "image" },
                  { key: "sort_order", label: "Order", type: "number" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "faqs" && (
              <ListEditor table="faqs" title="FAQs" rows={content.data.faqs}
                fields={[
                  { key: "question", label: "Question", type: "text", required: true },
                  { key: "answer", label: "Answer", type: "textarea", required: true },
                  { key: "sort_order", label: "Order", type: "number" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "hero" && (
              <SingleEditor table="hero_content" title="Hero" row={content.data.hero}
                fields={[
                  { key: "headline", label: "Headline", type: "textarea", required: true },
                  { key: "subtitle", label: "Subtitle", type: "textarea", required: true },
                  { key: "cta_primary_label", label: "Primary CTA", type: "text" },
                  { key: "cta_secondary_label", label: "Secondary CTA", type: "text" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "about" && (
              <SingleEditor table="about_content" title="About" row={content.data.about}
                fields={[
                  { key: "heading", label: "Heading", type: "text", required: true },
                  { key: "body", label: "Body", type: "textarea", required: true },
                  { key: "stat_projects", label: "Projects", type: "number" },
                  { key: "stat_clients", label: "Clients", type: "number" },
                  { key: "stat_satisfaction", label: "Satisfaction %", type: "number" },
                  { key: "stat_support", label: "Support (e.g. 24/7)", type: "text" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "founder" && (
              <SingleEditor table="founder" title="Founder" row={content.data.founder}
                fields={[
                  { key: "name", label: "Name", type: "text", required: true },
                  { key: "title", label: "Title", type: "text", required: true },
                  { key: "vision", label: "Vision", type: "textarea", required: true },
                  { key: "skills", label: "Skills (one per line)", type: "list" },
                  { key: "photo_url", label: "Photo URL", type: "image" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "team" && (
              <ListEditor table="team_members" title="Team Members" rows={(content.data as unknown as { team?: Array<Record<string, unknown>> }).team ?? []}
                fields={[
                  { key: "name", label: "Name", type: "text", required: true },
                  { key: "title", label: "Designation / Title", type: "text", required: true },
                  { key: "tagline", label: "Tagline (short one-liner)", type: "text" },
                  { key: "description", label: "Description / Bio", type: "textarea" },
                  { key: "photo_url", label: "Photo", type: "image" },
                  { key: "email", label: "Email", type: "text" },
                  { key: "phone", label: "Phone", type: "text" },
                  { key: "linkedin_url", label: "LinkedIn URL", type: "text" },
                  { key: "is_active", label: "Active (show on site)", type: "bool" },
                  { key: "sort_order", label: "Order", type: "number" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "contact" && (
              <SingleEditor table="contact_info" title="Contact Info" row={content.data.contact}
                fields={[
                  { key: "email", label: "Email", type: "text", required: true },
                  { key: "phone", label: "Phone", type: "text", required: true },
                  { key: "whatsapp", label: "WhatsApp (digits only, incl. country code)", type: "text", required: true },
                  { key: "address", label: "Address", type: "text" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "sections" && (
              <SectionMetaPanel meta={content.data.meta} onChanged={() => { qc.invalidateQueries(); content.refetch(); }} />
            )}
            {tab === "why" && (
              <ListEditor table="why_choose_us" title="Why Choose Us Items" rows={content.data.whyChooseUs}
                fields={[
                  { key: "title", label: "Title", type: "text", required: true },
                  { key: "description", label: "Description", type: "textarea", required: true },
                  { key: "sort_order", label: "Order", type: "number" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "process" && (
              <ListEditor table="process_steps" title="Process Steps" rows={content.data.processSteps}
                fields={[
                  { key: "title", label: "Step Title", type: "text", required: true },
                  { key: "description", label: "Description", type: "textarea", required: true },
                  { key: "duration", label: "Duration (e.g. 2–4 days)", type: "text" },
                  { key: "sort_order", label: "Order", type: "number" },
                ]}
                onChanged={() => { qc.invalidateQueries(); content.refetch(); }}
              />
            )}
            {tab === "submissions" && <SubmissionsPanel />}
            {tab === "media" && <MediaPanel />}
            {tab === "blog" && <BlogPanel />}
            {tab === "settings" && <SettingsPanel />}
          </>
        )}
      </div>
      <CommandPalette actions={TABS.map(t => ({ id: t.id, label: t.label, hint: "tab", run: () => setTab(t.id) }))} />
    </div>
  );
}


// ==================== FIELDS ====================
type Field = { key: string; label: string; required?: boolean;
  type: "text" | "textarea" | "number" | "bool" | "list" | "image" };

function FieldInput({ f, value, onChange }: { f: Field; value: unknown; onChange: (v: unknown) => void }) {
  const base = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[#38BDF8]";
  if (f.type === "textarea") return <textarea rows={3} className={base} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} required={f.required} />;
  if (f.type === "number") return <input type="number" className={base} value={value == null ? "" : String(value)} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />;
  if (f.type === "bool") return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> Enabled</label>;
  if (f.type === "list") return <textarea rows={4} className={base} value={Array.isArray(value) ? value.join("\n") : String(value ?? "")}
    onChange={(e) => onChange(e.target.value.split("\n").filter(Boolean))} />;
  if (f.type === "image") return <ImageField value={value as string | null} onChange={onChange} />;
  return <input className={base} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} required={f.required} />;
}

function ImageField({ value, onChange }: { value: string | null | undefined; onChange: (v: string) => void }) {
  const upload = useServerFn(adminUploadMedia);
  const [busy, setBusy] = useState(false);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      const { url } = await upload({ data: { filename: file.name, contentType: file.type, base64 } });
      onChange(url);
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally { setBusy(false); e.target.value = ""; }
  }
  return (
    <div className="space-y-2">
      <input className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[#38BDF8]"
        value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="https://…" />
      <div className="flex items-center gap-3">
        <label className="btn-ghost btn-ghost-hover cursor-pointer !py-1.5 !text-xs">
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          Upload
          <input type="file" accept="image/*" hidden onChange={onFile} disabled={busy} />
        </label>
        {value && <img src={value} alt="" className="h-12 w-12 rounded-lg object-cover border border-white/10" />}
      </div>
    </div>
  );
}

function ListEditor({ table, title, rows, fields, onChanged }: {
  table: string; title: string; rows: Array<Record<string, unknown>>; fields: Field[]; onChanged: () => void;
}) {
  const upsert = useServerFn(adminUpsert);
  const del = useServerFn(adminDelete);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const emptyRow = () => Object.fromEntries(fields.map((f) => [f.key, f.type === "bool" ? false : f.type === "list" ? [] : f.type === "number" ? 0 : ""]));

  async function save() {
    if (!editing) return;
    try {
      await upsert({ data: { table: table as never, row: editing as never } });
      toast.success("Saved");
      setEditing(null);
      onChanged();
      broadcastCmsUpdate();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    try { await del({ data: { table: table as never, id } }); toast.success("Deleted"); onChanged(); broadcastCmsUpdate(); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Delete failed"); }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <button onClick={() => setEditing(emptyRow())} className="btn-primary btn-primary-hover !py-2 !text-xs">
          <Plus size={14} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {rows.map((r) => {
          const primary = (r.name ?? r.title ?? r.question ?? r.headline ?? r.id) as string;
          const secondary = r.price ? ` — ${r.price}` : r.category ? ` — ${r.category}` : "";
          return (
            <div key={r.id as string} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex-1 truncate text-sm"><span className="font-medium">{primary}</span><span className="text-white/50">{secondary}</span></div>
              <button onClick={() => setEditing(r)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:border-[#38BDF8]/40">Edit</button>
              <button onClick={() => remove(r.id as string)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-red-400 hover:border-red-500/40"><Trash2 size={12} /></button>
            </div>
          );
        })}
        {rows.length === 0 && <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-white/40">No items yet.</div>}
      </div>
      {editing && (
        <div className="mt-6 rounded-2xl border border-[#38BDF8]/30 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-display font-semibold">{editing.id ? "Edit" : "Create"}</div>
            <button onClick={() => setEditing(null)} className="text-xs text-white/50 hover:text-white">Cancel</button>
          </div>
          <div className="grid gap-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-medium text-white/60">{f.label}</label>
                <FieldInput f={f} value={editing[f.key]} onChange={(v) => setEditing({ ...editing, [f.key]: v })} />
              </div>
            ))}
          </div>
          <button onClick={save} className="btn-primary btn-primary-hover mt-5">Save</button>
        </div>
      )}
    </div>
  );
}

function SingleEditor({ table, title, row, fields, onChanged }: {
  table: string; title: string; row: Record<string, unknown> | null; fields: Field[]; onChanged: () => void;
}) {
  const upsert = useServerFn(adminUpsert);
  const [state, setState] = useState<Record<string, unknown>>(row ?? {});
  useEffect(() => { setState(row ?? {}); }, [row]);
  async function save() {
    try { await upsert({ data: { table: table as never, row: state as never } }); toast.success("Saved"); onChanged(); broadcastCmsUpdate(); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); }
  }
  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-semibold">{title}</h2>
      <div className="grid gap-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-xs font-medium text-white/60">{f.label}</label>
            <FieldInput f={f} value={state[f.key]} onChange={(v) => setState({ ...state, [f.key]: v })} />
          </div>
        ))}
      </div>
      <button onClick={save} className="btn-primary btn-primary-hover mt-5">Save</button>
    </div>
  );
}

function SubmissionsPanel() {
  const list = useQuery({ queryKey: ["admin-subs"], queryFn: () => adminListSubmissions() });
  const del = useServerFn(adminDeleteSubmission);
  async function remove(id: string) {
    if (!confirm("Delete this submission?")) return;
    await del({ data: { id } });
    list.refetch();
  }
  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-semibold">Contact Submissions</h2>
      <div className="space-y-3">
        {list.data?.map((s) => (
          <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{s.name} <span className="text-xs text-white/50">· {new Date(s.created_at).toLocaleString()}</span></div>
                <div className="text-xs text-white/60">{s.email} · {s.phone ?? "—"} · {s.business_name ?? "—"}</div>
              </div>
              <button onClick={() => remove(s.id)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-red-400"><Trash2 size={12} /></button>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-white/80">{s.project_details}</p>
          </div>
        ))}
        {list.data?.length === 0 && <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">No submissions yet.</div>}
      </div>
    </div>
  );
}

function MediaPanel() {
  const list = useQuery({ queryKey: ["admin-media"], queryFn: () => adminListMedia() });
  const upload = useServerFn(adminUploadMedia);
  const [busy, setBusy] = useState(false);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      await upload({ data: { filename: file.name, contentType: file.type, base64 } });
      toast.success("Uploaded");
      list.refetch();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Upload failed"); }
    finally { setBusy(false); e.target.value = ""; }
  }
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Media Library</h2>
        <label className="btn-primary btn-primary-hover cursor-pointer !py-2 !text-xs">
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          Upload file
          <input type="file" accept="image/*" hidden onChange={onFile} disabled={busy} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {list.data?.map((m) => (
          <div key={m.name} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <img src={m.url} alt={m.name} className="aspect-square w-full object-cover" />
            <button
              onClick={() => { navigator.clipboard.writeText(m.url); toast.success("URL copied"); }}
              className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1.5 text-[10px] opacity-0 backdrop-blur transition group-hover:opacity-100"
            >Copy URL</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== SECTION META PANEL ====================
const SECTION_LIST: { key: string; label: string; hasSub?: boolean }[] = [
  { key: "about", label: "About", hasSub: false },
  { key: "services", label: "Services", hasSub: true },
  { key: "why", label: "Why Choose Us", hasSub: false },
  { key: "pricing", label: "Pricing", hasSub: true },
  { key: "addons", label: "Add-ons Heading", hasSub: false },
  { key: "portfolio", label: "Portfolio", hasSub: false },
  { key: "founder", label: "Founder", hasSub: false },
  { key: "process", label: "Process", hasSub: true },
  { key: "faq", label: "FAQ", hasSub: false },
  { key: "contact", label: "Contact", hasSub: true },
];

function SectionMetaPanel({
  meta,
  onChanged,
}: {
  meta: Record<string, { eyebrow: string | null; heading: string | null; subheading: string | null; extra: string | null }>;
  onChanged: () => void;
}) {
  const upsert = useServerFn(adminUpsert);
  const [rows, setRows] = useState(() =>
    Object.fromEntries(SECTION_LIST.map((s) => [s.key, meta[s.key] ?? { eyebrow: "", heading: "", subheading: "", extra: "" }])),
  );
  useEffect(() => {
    setRows(Object.fromEntries(SECTION_LIST.map((s) => [s.key, meta[s.key] ?? { eyebrow: "", heading: "", subheading: "", extra: "" }])));
  }, [meta]);

  async function save(key: string) {
    try {
      const r = rows[key];
      await upsert({
        data: {
          table: "section_meta" as never,
          row: { section: key, eyebrow: r.eyebrow || null, heading: r.heading || null, subheading: r.subheading || null } as never,
        },
      });
      toast.success(`Saved "${key}"`);
      onChanged();
      broadcastCmsUpdate();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); }
  }

  const input = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[#38BDF8]";

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-xl font-semibold">Section Text</h2>
        <p className="mt-1 text-xs text-white/50">Edit the eyebrow tag, main heading, and subheading shown at the top of each site section.</p>
      </div>
      <div className="space-y-4">
        {SECTION_LIST.map((s) => {
          const r = rows[s.key];
          return (
            <div key={s.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-display font-semibold">{s.label}</div>
                <button onClick={() => save(s.key)} className="btn-primary btn-primary-hover !py-1.5 !text-xs">Save</button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/50">Eyebrow tag</label>
                  <input className={input} value={r.eyebrow ?? ""} onChange={(e) => setRows({ ...rows, [s.key]: { ...r, eyebrow: e.target.value } })} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/50">Heading</label>
                  <input className={input} value={r.heading ?? ""} onChange={(e) => setRows({ ...rows, [s.key]: { ...r, heading: e.target.value } })} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/50">Subheading</label>
                  <input className={input} value={r.subheading ?? ""} onChange={(e) => setRows({ ...rows, [s.key]: { ...r, subheading: e.target.value } })} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== BLOG PANEL ====================
function BlogPanel() {
  const list = useQuery({ queryKey: ["admin-blog"], queryFn: () => listBlogPosts() });
  const upsert = useServerFn(adminUpsert);
  const del = useServerFn(adminDelete);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  }
  async function save() {
    if (!editing) return;
    try {
      const row = { ...editing };
      if (!row.slug && row.title) row.slug = slugify(String(row.title));
      if (row.published && !row.published_at) row.published_at = new Date().toISOString();
      await upsert({ data: { table: "blog_posts" as never, row: row as never } });
      toast.success("Saved");
      setEditing(null);
      list.refetch();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    try { await del({ data: { table: "blog_posts" as never, id } }); toast.success("Deleted"); list.refetch(); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Delete failed"); }
  }

  const input = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[#38BDF8]";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Blog Posts</h2>
          <p className="mt-1 text-xs text-white/50">Write in Markdown. Only published posts appear on /blog and in the sitemap.</p>
        </div>
        <button onClick={() => setEditing({ title: "", slug: "", excerpt: "", cover_url: "", body_md: "", tags: [], published: false, seo_title: "", seo_description: "" })} className="btn-primary btn-primary-hover !py-2 !text-xs">
          <Plus size={14} /> New post
        </button>
      </div>
      <div className="space-y-2">
        {list.data?.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="flex-1 truncate text-sm">
              <span className="font-medium">{p.title}</span>
              <span className="text-white/50"> — /{p.slug}</span>
            </div>
            <button onClick={() => setEditing(p as unknown as Record<string, unknown>)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:border-[#38BDF8]/40">Edit</button>
            <button onClick={() => remove(p.id)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-red-400 hover:border-red-500/40"><Trash2 size={12} /></button>
          </div>
        ))}
        {list.data?.length === 0 && <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-white/40">No posts yet.</div>}
      </div>
      {editing && (
        <div className="mt-6 rounded-2xl border border-[#38BDF8]/30 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-display font-semibold">{editing.id ? "Edit post" : "New post"}</div>
            <button onClick={() => setEditing(null)} className="text-xs text-white/50 hover:text-white">Cancel</button>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Title</label>
              <input className={input} value={String(editing.title ?? "")}
                onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Slug</label>
              <input className={input} value={String(editing.slug ?? "")} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Excerpt (short summary)</label>
              <textarea rows={2} className={input} value={String(editing.excerpt ?? "")} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Cover image</label>
              <ImageField value={editing.cover_url as string | null} onChange={(v) => setEditing({ ...editing, cover_url: v })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Body (Markdown)</label>
              <textarea rows={14} className={`${input} font-mono text-xs`} value={String(editing.body_md ?? "")} onChange={(e) => setEditing({ ...editing, body_md: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Tags (one per line)</label>
              <textarea rows={3} className={input} value={Array.isArray(editing.tags) ? (editing.tags as string[]).join("\n") : ""}
                onChange={(e) => setEditing({ ...editing, tags: e.target.value.split("\n").map((t) => t.trim()).filter(Boolean) })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">SEO title (optional)</label>
                <input className={input} value={String(editing.seo_title ?? "")} onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">SEO description (optional)</label>
                <input className={input} value={String(editing.seo_description ?? "")} onChange={(e) => setEditing({ ...editing, seo_description: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
              Published (visible on /blog)
            </label>
          </div>
          <button onClick={save} className="btn-primary btn-primary-hover mt-5">Save post</button>
        </div>
      )}
    </div>
  );
}

// ==================== SETTINGS PANEL ====================
function SettingsPanel() {
  const q = useQuery({ queryKey: ["admin-site-settings"], queryFn: () => getSiteSettings() });
  const upsert = useServerFn(adminUpsert);
  const [state, setState] = useState<Record<string, unknown>>({});
  useEffect(() => {
    if (q.data) setState({ ...q.data, id: true });
  }, [q.data]);
  async function save() {
    try {
      await upsert({ data: { table: "site_settings" as never, row: { ...state, id: true } as never } });
      toast.success("Settings saved");
      q.refetch();
      broadcastCmsUpdate();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); }
  }
  const input = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[#38BDF8]";
  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-semibold">Site Settings</h2>
      <p className="mb-6 text-xs text-white/50">Controls chatbot, WhatsApp button and admin email notifications.</p>
      <div className="grid gap-5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!state.chatbot_enabled} onChange={(e) => setState({ ...state, chatbot_enabled: e.target.checked })} />
          Enable AI chatbot (TruBot) on the public site
        </label>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/60">Extra knowledge for the chatbot (optional)</label>
          <textarea rows={6} className={input} placeholder="Anything else you want TruBot to know — hours, refund policy, current promotions…"
            value={String(state.chatbot_kb_extra ?? "")} onChange={(e) => setState({ ...state, chatbot_kb_extra: e.target.value })} />
          <p className="mt-1 text-[11px] text-white/40">Your services, pricing, FAQs and contact info are already included automatically.</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!state.whatsapp_enabled} onChange={(e) => setState({ ...state, whatsapp_enabled: e.target.checked })} />
          Show floating WhatsApp button
        </label>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/60">Notification email (receives new contact inquiries)</label>
          <input type="email" className={input} placeholder="you@yourdomain.com" value={String(state.notification_email ?? "")} onChange={(e) => setState({ ...state, notification_email: e.target.value })} />
          <p className="mt-1 text-[11px] text-white/40">Requires the Resend connector. Connect it via Cloud → Connectors, then inquiries auto-forward here.</p>
        </div>
      </div>
      <button onClick={save} className="btn-primary btn-primary-hover mt-6">Save settings</button>
    </div>
  );
}


