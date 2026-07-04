import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { listAllProjects, listProjectMessages, sendProjectMessage } from "@/lib/portal/portal.functions";

type Project = { id: string; name: string; client_email: string; stage: string; status: string };
type Message = { id: string; body: string; sender_role: string; created_at: string };

export function MessagesPanel() {
  const listProjects = useServerFn(listAllProjects);
  const projects = useQuery({ queryKey: ["admin-projects-msgs"], queryFn: () => listProjects() });
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare size={18} className="text-[#38BDF8]" />
        <h2 className="font-display text-xl font-semibold">Messages</h2>
      </div>
      <p className="mb-5 text-xs text-white/50">Chat with clients in real time. Select a project to view and reply.</p>

      {projects.isLoading ? <Loader2 className="mx-auto animate-spin text-[#38BDF8]" /> : (
        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <div className="space-y-1.5 rounded-2xl border border-white/10 bg-[#0B1220] p-2">
            {(projects.data ?? []).map((p: Project) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition ${activeId === p.id ? "bg-gradient-to-r from-[#1EA7FF] to-[#2563EB] text-white" : "text-white/70 hover:bg-white/5"}`}
              >
                <div className="font-medium">{p.name}</div>
                <div className="mt-0.5 truncate text-[10px] opacity-70">{p.client_email}</div>
              </button>
            ))}
            {(projects.data ?? []).length === 0 && (
              <p className="p-6 text-center text-xs text-white/40">No projects yet.</p>
            )}
          </div>

          {activeId ? <Thread projectId={activeId} /> : (
            <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 p-16 text-sm text-white/40">
              Select a project to open the chat.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Thread({ projectId }: { projectId: string }) {
  const listMsgs = useServerFn(listProjectMessages);
  const sendMsg = useServerFn(sendProjectMessage);
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const q = useQuery({
    queryKey: ["admin-msgs", projectId],
    queryFn: () => listMsgs({ data: { project_id: projectId } }),
    refetchInterval: 8000,
  });

  async function send() {
    const text = body.trim();
    if (!text) return;
    await sendMsg({ data: { project_id: projectId, body: text } });
    setBody("");
    qc.invalidateQueries({ queryKey: ["admin-msgs", projectId] });
  }

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0B1220]">
      <div className="flex-1 space-y-2 overflow-y-auto p-4" style={{ minHeight: 400, maxHeight: 500 }}>
        {(q.data ?? []).map((m: Message) => {
          const mine = m.sender_role === "admin" || m.sender_role === "employee";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs ${mine ? "bg-gradient-to-r from-[#1EA7FF] to-[#2563EB] text-white" : "bg-white/10 text-white"}`}>
                <div className="text-[9px] uppercase opacity-60">{m.sender_role} · {new Date(m.created_at).toLocaleTimeString()}</div>
                <div className="mt-0.5 whitespace-pre-wrap">{m.body}</div>
              </div>
            </div>
          );
        })}
        {(q.data ?? []).length === 0 && <p className="pt-16 text-center text-xs text-white/40">No messages yet — say hi.</p>}
      </div>
      <div className="flex gap-2 border-t border-white/10 p-3">
        <input
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Type a reply..."
          className="input flex-1 !text-sm"
        />
        <button onClick={send} className="btn-primary btn-primary-hover !py-2 !text-xs"><Send size={14} /> Send</button>
      </div>
    </div>
  );
}
