import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LogOut, Send, FileText, CreditCard, MessageSquare, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  listMyProjects, listMyInvoices, listProjectFiles,
  listProjectMessages, sendProjectMessage,
} from "@/lib/portal/portal.functions";

export const Route = createFileRoute("/portal")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Client Portal — TruHub Solutions" },
    { name: "description", content: "TruHub Solutions client portal — track your project, deliverables, invoices and messages." },
    { property: "og:title", content: "Client Portal — TruHub Solutions" },
    { property: "og:description", content: "Track your project status, deliverables, invoices and messages with TruHub Solutions." },
  ]}),
  component: PortalPage,
});

type Session = { user: { id: string; email?: string | null } } | null;

function PortalPage() {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? { user: data.session.user } : null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s ? { user: s.user } : null));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#030712]"><Loader2 className="animate-spin text-[#38BDF8]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Client Portal</h1>
            <p className="mt-1 text-sm text-white/60">Your projects with TruHub Solutions</p>
          </div>
          {session && (
            <button onClick={() => supabase.auth.signOut()} className="btn-ghost btn-ghost-hover !py-2 !text-xs">
              <LogOut size={14} /> Sign out
            </button>
          )}
        </header>
        {!session ? <PortalAuth /> : <PortalDashboard email={session.user.email ?? ""} />}
      </div>
    </div>
  );
}

function PortalAuth() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/portal", data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created — check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-[#0B1220] p-8">
      <h2 className="font-display text-2xl font-semibold">{mode === "in" ? "Sign in" : "Create account"}</h2>
      <p className="mt-1 text-xs text-white/50">Access your project, deliverables and invoices.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        {mode === "up" && (
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="input" required />
        )}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="input" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="input" required minLength={8} />
        <button disabled={busy} className="btn-primary btn-primary-hover w-full">
          {busy && <Loader2 size={14} className="mr-2 inline animate-spin" />}
          {mode === "in" ? "Sign in" : "Create account"}
        </button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-xs text-white/50 hover:text-white">
          {mode === "in" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}

function PortalDashboard({ email }: { email: string }) {
  const myProjects = useServerFn(listMyProjects);
  const myInvoices = useServerFn(listMyInvoices);
  const p = useQuery({ queryKey: ["my-projects"], queryFn: () => myProjects() });
  const inv = useQuery({ queryKey: ["my-invoices"], queryFn: () => myInvoices() });
  const [openProject, setOpenProject] = useState<string | null>(null);

  const projects = p.data ?? [];
  const invoices = inv.data ?? [];

  if (p.isLoading) return <Loader2 className="mx-auto animate-spin text-[#38BDF8]" />;

  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0B1220] p-10 text-center">
        <LayoutDashboard size={40} className="mx-auto text-white/30" />
        <h2 className="mt-4 font-display text-xl font-semibold">Welcome, {email}</h2>
        <p className="mt-2 text-sm text-white/60">No projects yet. Once our team sets up your project you'll see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">Your projects</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map(pr => (
            <button key={pr.id} onClick={() => setOpenProject(pr.id)} className="rounded-2xl border border-white/10 bg-[#0B1220] p-5 text-left transition hover:border-[#38BDF8]/40">
              <div className="flex items-start justify-between">
                <h3 className="font-display text-lg font-semibold">{pr.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${pr.status === "active" ? "bg-emerald-500/20 text-emerald-300" : pr.status === "completed" ? "bg-blue-500/20 text-blue-300" : "bg-yellow-500/20 text-yellow-300"}`}>{pr.status}</span>
              </div>
              {pr.summary && <p className="mt-2 text-sm text-white/60">{pr.summary}</p>}
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-white/50">
                  <span className="capitalize">{pr.stage.replace("_", " ")}</span>
                  <span>{pr.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-gradient-to-r from-[#1EA7FF] to-[#2563EB]" style={{ width: `${pr.progress}%` }} />
                </div>
              </div>
              <StageTimeline stage={pr.stage} />
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold flex items-center gap-2"><CreditCard size={18} /> Invoices</h2>
        {invoices.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-[#0B1220] p-6 text-center text-sm text-white/50">No invoices yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220]">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-white/50">
                <tr><th className="px-4 py-3">Number</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map(i => (
                  <tr key={i.id}>
                    <td className="px-4 py-3 font-mono text-xs">{i.number || i.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">{i.currency} {(i.amount_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-white/60">{i.due_date ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${i.status === "paid" ? "bg-emerald-500/20 text-emerald-300" : i.status === "overdue" ? "bg-red-500/20 text-red-300" : "bg-yellow-500/20 text-yellow-300"}`}>{i.status}</span>
                    </td>
                    <td className="px-4 py-3">{i.invoice_url && <a href={i.invoice_url} target="_blank" rel="noreferrer" className="text-[#38BDF8] hover:underline">View</a>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {openProject && <ProjectDetail projectId={openProject} onClose={() => setOpenProject(null)} />}
    </div>
  );
}

const STAGES = ["kickoff", "discovery", "design", "build", "qa", "launch"];
function StageTimeline({ stage }: { stage: string }) {
  const idx = STAGES.indexOf(stage);
  return (
    <div className="mt-4 flex items-center gap-1">
      {STAGES.map((s, i) => (
        <div key={s} className={`h-1 flex-1 rounded-full ${i <= idx ? "bg-[#38BDF8]" : "bg-white/10"}`} title={s} />
      ))}
    </div>
  );
}

function ProjectDetail({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const listFiles = useServerFn(listProjectFiles);
  const listMsgs = useServerFn(listProjectMessages);
  const sendMsg = useServerFn(sendProjectMessage);
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");

  const files = useQuery({ queryKey: ["project-files", projectId], queryFn: () => listFiles({ data: { project_id: projectId } }) });
  const msgs = useQuery({ queryKey: ["project-messages", projectId], queryFn: () => listMsgs({ data: { project_id: projectId } }), refetchInterval: 15000 });

  async function send() {
    if (!msg.trim()) return;
    try {
      await sendMsg({ data: { project_id: projectId, body: msg.trim() } });
      setMsg("");
      qc.invalidateQueries({ queryKey: ["project-messages", projectId] });
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1220] p-6" onClick={e => e.stopPropagation()}>
        <div className="mb-6 space-y-6">
          <section>
            <h3 className="mb-3 font-display text-lg font-semibold flex items-center gap-2"><FileText size={16} /> Deliverables</h3>
            {files.isLoading ? <Loader2 className="animate-spin text-white/40" /> : (files.data ?? []).length === 0 ? (
              <p className="text-xs text-white/40">No files shared yet.</p>
            ) : (
              <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
                {(files.data ?? []).map((f: { id: string; name: string; url: string; size_bytes?: number | null }) => (
                  <li key={f.id} className="flex items-center justify-between px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm">{f.name}</div>
                      <div className="text-[10px] text-white/40">{f.size_bytes ? `${Math.round(f.size_bytes / 1024)} KB` : ""}</div>
                    </div>
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-xs text-[#38BDF8] hover:underline">Download</a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-3 font-display text-lg font-semibold flex items-center gap-2"><MessageSquare size={16} /> Messages</h3>
            <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-[#111827] p-3">
              {(msgs.data ?? []).map((m: { id: string; body: string; sender_role: string; created_at: string }) => (
                <div key={m.id} className={`flex ${m.sender_role === "member" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${m.sender_role === "member" ? "bg-gradient-to-r from-[#1EA7FF] to-[#2563EB]" : "bg-white/5"}`}>
                    <div className="text-[10px] uppercase tracking-wide opacity-60">{m.sender_role}</div>
                    <div>{m.body}</div>
                  </div>
                </div>
              ))}
              {(msgs.data ?? []).length === 0 && <p className="text-center text-xs text-white/40">No messages yet.</p>}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type a message..." className="input flex-1" />
              <button onClick={send} className="btn-primary btn-primary-hover !py-2 !text-xs"><Send size={14} /></button>
            </div>
          </section>
        </div>
        <button onClick={onClose} className="text-xs text-white/50 hover:text-white">Close</button>
      </div>
    </div>
  );
}
