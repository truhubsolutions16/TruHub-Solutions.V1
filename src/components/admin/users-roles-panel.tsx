import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Shield, UserPlus, X } from "lucide-react";
import { listUsers, assignRole, revokeRole } from "@/lib/portal/portal.functions";

const ROLES = ["admin", "employee", "member"] as const;
type Role = typeof ROLES[number];

export function UsersRolesPanel() {
  const list = useServerFn(listUsers);
  const assign = useServerFn(assignRole);
  const revoke = useServerFn(revokeRole);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });

  async function toggle(user_id: string, role: Role, hasRole: boolean) {
    try {
      if (hasRole) await revoke({ data: { user_id, role } });
      else await assign({ data: { user_id, role } });
      toast.success(hasRole ? `Removed ${role}` : `Granted ${role}`);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e) { toast.error((e as Error).message); }
  }

  const filtered = (users.data ?? []).filter(u => !search || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold flex items-center gap-2"><Shield size={18} /> Users & Roles</h2>
          <p className="mt-1 text-xs text-white/50">Assign admin, employee, or member roles. Members are clients accessing the portal.</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email..." className="input max-w-xs" />
      </div>
      {users.isLoading ? <Loader2 className="mx-auto mt-6 animate-spin text-white/40" /> : (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-white/50">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Last sign-in</th>
                {ROLES.map(r => <th key={r} className="px-4 py-3 text-center capitalize">{r}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div>{u.email}</div>
                    <div className="text-[10px] text-white/40">{u.id}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "never"}</td>
                  {ROLES.map(r => {
                    const has = u.roles.includes(r);
                    return (
                      <td key={r} className="px-4 py-3 text-center">
                        <button onClick={() => toggle(u.id, r, has)} className={`rounded-lg border px-3 py-1 text-xs transition ${has ? "border-[#38BDF8]/50 bg-[#38BDF8]/10 text-[#38BDF8]" : "border-white/10 text-white/40 hover:border-white/30"}`}>
                          {has ? "✓" : <UserPlus size={12} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-white/40">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
