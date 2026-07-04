import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  checkEmployeeAccess,
  listAllProjects, updateProjectStatus, listProjectMessages, sendProjectMessage,
} from "@/lib/portal/portal.functions";
import { recordLoginAttempt } from "@/lib/security/security.functions";

export const Route = createFileRoute("/employee")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Employee — TruHub Solutions" },
    { name: "robots", content: "noindex, nofollow" },
  ]}),
  component: EmployeePage,
});

type Stage = "auth" | "loading" | "denied" | "ready";

function EmployeePage() {
  const [stage, setStage] = useState<Stage>("loading");
  const [session, setSession] = useState<{ user: { email?: string | null; id: string } } | null>(null);
  const check = useServerFn(checkEmployeeAccess);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession({ user: data.session.user });
        doCheck();
      } else {
        setStage("auth");
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ? { user: s.user } : null));
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line
  }, []);

  async function doCheck() {
    setStage("loading");
    try {
      const r = await check();
      setStage(r.isEmployee ? "ready" : "denied");
    } catch { setStage("denied"); }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setStage("auth");
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {stage === "auth" && !session && <EmployeeAuth onDone={() => doCheck()} />}
        {stage === "loading" && <Loader2 className="mx-auto animate-spin text-[#38BDF8]" />}
        {stage === "denied" && (
          <div className="mx-auto max-w-md rounded-3xl border border-red-500/30 bg-[#0B1220] p-8 text-center">
            <h1 className="font-display text-2xl font-semibold">Access denied</h1>
            <p className="mt-2 text-sm text-white/60">Your account does not have employee access. Ask an admin to assign you the <span className="text-[#38BDF8]">employee</span> role.</p>
            <button onClick={signOut} className="btn-ghost btn-ghost-hover mt-6 w-full !py-2 !text-xs"><LogOut size={14} /> Sign out</button>
          </div>
        )}
        {stage === "ready" && <EmployeeDashboard email={session?.user.email ?? ""} onSignOut={signOut} />}
      </div>
    </div>
  );
}

function EmployeeAuth({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const logAttempt = useServerFn(recordLoginAttempt);

  async function submit(e: React.FormEvent) {
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
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-[#0B1220] p-8">
      <h1 className="font-display text-2xl font-semibold">Employee sign in</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="input" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="input" required />
        <button disabled={busy} className="btn-primary btn-primary-hover w-full">
          {busy && <Loader2 size={14} className="mr-2 inline animate-spin" />} Sign in
        </button>
      </form>
    </div>
  );
}

const STAGES = ["kickoff", "discovery", "design", "build", "qa", "launch", "post_launch"] as const;
const STATUSES = ["active", "on_hold", "completed", "cancelled"] as const;

function EmployeeDashboard({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const list = useServerFn(listAllProjects);
  const update = useServerFn(updateProjectStatus);
  const qc = useQueryClient();
  const projects = useQuery({ queryKey: ["employee-projects"], queryFn: () => list() });
  const [openId, setOpenId] = useState<string | null>(null);

  async function patch(id: string, patch: Partial<{ stage: typeof STAGES[number]; progress: number; status: typeof STATUSES[number]; notes: string }>) {
    try {
      await update({ data: { id, ...patch } });
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["employee-projects"] });
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient">Employee Dashboard</h1>
          <p className="text-xs text-white/50">{email}</p>
        </div>
        <button onClick={onSignOut} className="btn-ghost btn-ghost-hover !py-2 !text-xs"><LogOut size={14} /> Sign out</button>
      </header>

      {projects.isLoading ? <Loader2 className="mx-auto animate-spin text-[#38BDF8]" /> : (
        <div className="space-y-4">
          {(projects.data ?? []).map((p: { id: string; name: string; client_email: string; stage: string; progress: number; status: string; notes?: string | null }) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-[#0B1220] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                  <p className="text-xs text-white/50">{p.client_email}</p>
                </div>
                <button onClick={() => setOpenId(openId === p.id ? null : p.id)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:border-[#38BDF8]/40">
                  {openId === p.id ? "Close messages" : "Open messages"}
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <label className="block">
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-white/50">Stage</div>
                  <select defaultValue={p.stage} onChange={e => patch(p.id, { stage: e.target.value as typeof STAGES[number] })} className="input">
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="block">
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-white/50">Progress %</div>
                  <input type="number" min={0} max={100} defaultValue={p.progress} onBlur={e => { const v = Number(e.target.value); if (v !== p.progress) patch(p.id, { progress: v }); }} className="input" />
                </label>
                <label className="block">
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-white/50">Status</div>
                  <select defaultValue={p.status} onChange={e => patch(p.id, { status: e.target.value as typeof STATUSES[number] })} className="input">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <label className="mt-3 block">
                <div className="mb-1 text-[10px] uppercase tracking-wide text-white/50">Internal notes</div>
                <textarea defaultValue={p.notes ?? ""} onBlur={e => { if (e.target.value !== (p.notes ?? "")) patch(p.id, { notes: e.target.value }); }} className="input min-h-[70px]" />
              </label>
              {openId === p.id && <ProjectMessagesInline projectId={p.id} />}
            </div>
          ))}
          {(projects.data ?? []).length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-[#0B1220] p-10 text-center text-sm text-white/50">No projects yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectMessagesInline({ projectId }: { projectId: string }) {
  const listMsgs = useServerFn(listProjectMessages);
  const sendMsg = useServerFn(sendProjectMessage);
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");
  const q = useQuery({ queryKey: ["emp-msgs", projectId], queryFn: () => listMsgs({ data: { project_id: projectId } }), refetchInterval: 10000 });

  async function send() {
    if (!msg.trim()) return;
    await sendMsg({ data: { project_id: projectId, body: msg.trim() } });
    setMsg("");
    qc.invalidateQueries({ queryKey: ["emp-msgs", projectId] });
  }

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-[#111827] p-3">
      <div className="max-h-[240px] space-y-1.5 overflow-y-auto">
        {(q.data ?? []).map((m: { id: string; body: string; sender_role: string; created_at: string }) => (
          <div key={m.id} className={`flex ${m.sender_role === "member" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[75%] rounded-lg px-2.5 py-1.5 text-xs ${m.sender_role === "member" ? "bg-white/10" : "bg-gradient-to-r from-[#1EA7FF] to-[#2563EB]"}`}>
              <div className="text-[9px] uppercase opacity-60">{m.sender_role}</div>
              {m.body}
            </div>
          </div>
        ))}
        {(q.data ?? []).length === 0 && <p className="text-center text-xs text-white/40">No messages.</p>}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Reply..." className="input flex-1 !text-xs" />
        <button onClick={send} className="btn-primary btn-primary-hover !py-1.5 !text-xs">Send</button>
      </div>
    </div>
  );
}
