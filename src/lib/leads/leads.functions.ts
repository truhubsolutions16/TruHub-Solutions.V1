import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireAdmin(ctx: any) {
  const { data } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin only");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logActivity(ctx: any, action: string, entityType: string, entityId: string, oldData: unknown = null, newData: unknown = null) {
  try {
    await ctx.supabase.from("activity_logs").insert({
      actor_id: ctx.userId,
      actor_email: ctx.claims?.email ?? null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_data: oldData,
      new_data: newData,
    });
  } catch (e) {
    console.warn("[activity] log failed", e);
  }
}

const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost", "archived"] as const;
const LEAD_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const { data, error } = await context.supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getLeadTimeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ leadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { data: rows, error } = await context.supabase
      .from("lead_timeline")
      .select("*")
      .eq("lead_id", data.leadId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const updateLeadSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(LEAD_STATUSES).optional(),
  priority: z.enum(LEAD_PRIORITIES).optional(),
  lead_score: z.number().int().min(0).max(100).optional(),
  follow_up_at: z.string().nullable().optional(),
  notes: z.string().max(10000).nullable().optional(),
  is_read: z.boolean().optional(),
  source: z.string().max(120).nullable().optional(),
});

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateLeadSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { id, ...patch } = data;
    const { data: prev } = await context.supabase.from("contact_submissions").select("*").eq("id", id).maybeSingle();
    const { data: row, error } = await context.supabase
      .from("contact_submissions")
      .update(patch as never)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    await logActivity(context as never, "lead.update", "contact_submissions", id, prev, row);
    return row;
  });

export const addLeadNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ leadId: z.string().uuid(), message: z.string().min(1).max(4000) }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { error } = await context.supabase.from("lead_timeline").insert({
      lead_id: data.leadId,
      actor_id: context.userId,
      event_type: "note",
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { data: prev } = await context.supabase.from("contact_submissions").select("*").eq("id", data.id).maybeSingle();
    const { error } = await context.supabase.from("contact_submissions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context as never, "lead.delete", "contact_submissions", data.id, prev, null);
    return { ok: true as const };
  });

export const exportLeadsCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const { data, error } = await context.supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const headers = [
      "id","created_at","name","email","phone","business_name","status","priority","lead_score",
      "source","assigned_to","follow_up_at","is_read","notes","project_details",
    ];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(",")];
    for (const r of rows) lines.push(headers.map((h) => esc((r as Record<string, unknown>)[h])).join(","));
    return { csv: lines.join("\n"), count: rows.length };
  });
