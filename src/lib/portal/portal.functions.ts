import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ---------------- ROLE HELPERS ---------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getRoles(ctx: any): Promise<string[]> {
  const { data } = await ctx.supabase
    .from("user_roles").select("role").eq("user_id", ctx.userId);
  return (data ?? []).map((r: { role: string }) => r.role);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireStaff(ctx: any) {
  const roles = await getRoles(ctx);
  if (!roles.includes("admin") && !roles.includes("employee")) throw new Error("Forbidden");
  return roles;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireAdmin(ctx: any) {
  const roles = await getRoles(ctx);
  if (!roles.includes("admin")) throw new Error("Forbidden: admin only");
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logActivity(ctx: any, action: string, entityType: string, entityId: string, newData: unknown = null) {
  try {
    await ctx.supabase.from("activity_logs").insert({
      actor_id: ctx.userId, actor_email: ctx.claims?.email ?? null,
      action, entity_type: entityType, entity_id: entityId, new_data: newData,
    });
  } catch { /* noop */ }
}

/* ---------------- EMPLOYEE GATE ---------------- */

export const verifyEmployeeCode = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ code: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const expected = process.env.EMPLOYEE_ACCESS_CODE;
    if (!expected) return { ok: false as const };
    const a = data.code, b = expected;
    if (a.length !== b.length) return { ok: false as const };
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return { ok: diff === 0 };
  });

// Grant employee role to signed-in user IF admin already promoted them.
// (Admin assigns 'employee' in dashboard; this fn just checks + reports.)
export const checkEmployeeAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await getRoles(context);
    return {
      userId: context.userId,
      email: context.claims?.email ?? null,
      isEmployee: roles.includes("employee") || roles.includes("admin"),
      isAdmin: roles.includes("admin"),
    };
  });

/* ---------------- ROLE MANAGEMENT (admin) ---------------- */

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string[]>();
    (roles ?? []).forEach((r) => {
      if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, []);
      roleMap.get(r.user_id)!.push(r.role);
    });
    return users.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      roles: roleMap.get(u.id) ?? [],
    }));
  });

const roleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "employee", "member", "user"]),
});

export const assignRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => roleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    await logActivity(context, "assign_role", "user_roles", data.user_id, data);
    return { ok: true };
  });

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => roleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles").delete()
      .eq("user_id", data.user_id).eq("role", data.role);
    if (error) throw new Error(error.message);
    await logActivity(context, "revoke_role", "user_roles", data.user_id, data);
    return { ok: true };
  });

/* ---------------- PROJECTS ---------------- */

export const listAllProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireStaff(context as never);
    const { data, error } = await context.supabase
      .from("projects").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    // Enrich with client email via admin client
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const clientIds = Array.from(new Set((data ?? []).map((p) => p.client_id)));
    const emails = new Map<string, string>();
    for (const id of clientIds) {
      try {
        const { data: u } = await supabaseAdmin.auth.admin.getUserById(id);
        if (u.user?.email) emails.set(id, u.user.email);
      } catch { /* noop */ }
    }
    return (data ?? []).map((p) => ({ ...p, client_email: emails.get(p.client_id) ?? "—" }));
  });

export const listMyProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects").select("*")
      .eq("client_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const PROJECT_STAGES = ["kickoff", "discovery", "design", "build", "qa", "launch", "post_launch"] as const;

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  stage: z.enum(PROJECT_STAGES).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  status: z.enum(["active", "on_hold", "completed", "cancelled"]).optional(),
  summary: z.string().max(500).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export const upsertProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => projectSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const payload = { ...data, created_by: context.userId };
    const { data: result, error } = await context.supabase
      .from("projects").upsert(payload).select().single();
    if (error) throw new Error(error.message);
    await logActivity(context, data.id ? "update" : "create", "project", result.id, result);
    return result;
  });

// Employees can update stage/progress/status/notes only
const projectStatusSchema = z.object({
  id: z.string().uuid(),
  stage: z.enum(PROJECT_STAGES).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  status: z.enum(["active", "on_hold", "completed", "cancelled"]).optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export const updateProjectStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => projectStatusSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireStaff(context as never);
    const { id, ...patch } = data;
    const { data: result, error } = await context.supabase
      .from("projects").update(patch).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    await logActivity(context, "update_status", "project", id, patch);
    return result;
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { error } = await context.supabase.from("projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context, "delete", "project", data.id);
    return { ok: true };
  });

/* ---------------- PROJECT FILES ---------------- */

export const listProjectFiles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ project_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: files, error } = await context.supabase
      .from("project_files").select("*")
      .eq("project_id", data.project_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return files ?? [];
  });

const fileSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  url: z.string().url(),
  storage_path: z.string().nullable().optional(),
  size_bytes: z.number().nullable().optional(),
  mime_type: z.string().nullable().optional(),
});

export const addProjectFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => fileSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { data: result, error } = await context.supabase
      .from("project_files").insert({ ...data, uploaded_by: context.userId })
      .select().single();
    if (error) throw new Error(error.message);
    await logActivity(context, "create", "project_file", result.id, result);
    return result;
  });

export const deleteProjectFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { error } = await context.supabase.from("project_files").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context, "delete", "project_file", data.id);
    return { ok: true };
  });

/* ---------------- INVOICES ---------------- */

export const listAllInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireStaff(context as never);
    const { data, error } = await context.supabase
      .from("invoices").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listMyInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("invoices").select("*")
      .eq("client_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const invoiceSchema = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().uuid().nullable().optional(),
  client_id: z.string().uuid(),
  number: z.string().nullable().optional(),
  amount_cents: z.number().int().min(0),
  currency: z.string().max(6).optional(),
  status: z.enum(["draft", "unpaid", "paid", "overdue", "cancelled"]).optional(),
  due_date: z.string().nullable().optional(),
  invoice_url: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const upsertInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => invoiceSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const payload = {
      ...data,
      paid_at: data.status === "paid" ? new Date().toISOString() : null,
      created_by: context.userId,
    };
    const { data: result, error } = await context.supabase
      .from("invoices").upsert(payload).select().single();
    if (error) throw new Error(error.message);
    await logActivity(context, data.id ? "update" : "create", "invoice", result.id, result);
    return result;
  });

export const deleteInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { error } = await context.supabase.from("invoices").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context, "delete", "invoice", data.id);
    return { ok: true };
  });

/* ---------------- MESSAGES ---------------- */

export const listProjectMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ project_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: msgs, error } = await context.supabase
      .from("project_messages").select("*")
      .eq("project_id", data.project_id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return msgs ?? [];
  });

const messageSchema = z.object({
  project_id: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

export const sendProjectMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => messageSchema.parse(d))
  .handler(async ({ data, context }) => {
    const roles = await getRoles(context);
    const senderRole = roles.includes("admin") ? "admin"
      : roles.includes("employee") ? "employee" : "member";
    const { data: result, error } = await context.supabase
      .from("project_messages").insert({
        project_id: data.project_id,
        sender_id: context.userId,
        sender_role: senderRole,
        body: data.body,
      }).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

/* ---------------- BACKUPS ---------------- */

const BACKUP_TABLES = [
  "hero_content", "about_content", "services", "portfolio_items", "pricing_plans",
  "additional_services", "why_choose_us", "testimonials", "faqs", "founder",
  "process_steps", "section_meta", "contact_info", "blog_posts", "site_settings",
  "page_seo", "redirects", "media_files", "projects", "invoices",
];

export const createBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snapshot: Record<string, any[]> = {};
    let totalRows = 0;
    for (const table of BACKUP_TABLES) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await supabaseAdmin.from(table as any).select("*");
      snapshot[table] = data ?? [];
      totalRows += (data ?? []).length;
    }
    const body = JSON.stringify({ created_at: new Date().toISOString(), tables: snapshot });
    const path = `backups/${Date.now()}.json`;
    const { error: upErr } = await supabaseAdmin.storage.from("media").upload(path, body, {
      contentType: "application/json", upsert: false,
    });
    if (upErr) throw new Error(upErr.message);
    const { data: record, error } = await supabaseAdmin.from("backups").insert({
      kind: "manual", storage_path: path,
      size_bytes: body.length, tables_count: BACKUP_TABLES.length,
      rows_count: totalRows, created_by: context.userId,
    }).select().single();
    if (error) throw new Error(error.message);
    await logActivity(context, "create", "backup", record.id, { size: body.length, rows: totalRows });
    return record;
  });

export const listBackups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const { data, error } = await context.supabase
      .from("backups").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getBackupDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: b } = await supabaseAdmin.from("backups").select("storage_path").eq("id", data.id).single();
    if (!b?.storage_path) throw new Error("Backup file missing");
    const { data: signed, error } = await supabaseAdmin.storage.from("media")
      .createSignedUrl(b.storage_path, 300);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });

export const deleteBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: b } = await supabaseAdmin.from("backups").select("storage_path").eq("id", data.id).single();
    if (b?.storage_path) await supabaseAdmin.storage.from("media").remove([b.storage_path]);
    const { error } = await supabaseAdmin.from("backups").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context, "delete", "backup", data.id);
    return { ok: true };
  });
