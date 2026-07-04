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

export const recordLoginAttempt = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      email: z.string().email().max(255),
      success: z.boolean(),
      failure_reason: z.string().max(255).optional().nullable(),
      user_agent: z.string().max(500).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("login_history").insert({
      email: data.email,
      success: data.success,
      failure_reason: data.failure_reason ?? null,
      user_agent: data.user_agent ?? null,
    });
    return { ok: true as const };
  });

export const listActivityLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ limit: z.number().int().min(1).max(500).default(100) }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { data: rows, error } = await context.supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listLoginHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ limit: z.number().int().min(1).max(500).default(100) }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { data: rows, error } = await context.supabase
      .from("login_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getSecurityOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [succ, fail, recent, admins] = await Promise.all([
      context.supabase.from("login_history").select("id", { count: "exact", head: true }).eq("success", true).gte("created_at", since),
      context.supabase.from("login_history").select("id", { count: "exact", head: true }).eq("success", false).gte("created_at", since),
      context.supabase.from("login_history").select("*").order("created_at", { ascending: false }).limit(10),
      context.supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "admin"),
    ]);
    return {
      successCount24h: succ.count ?? 0,
      failureCount24h: fail.count ?? 0,
      recent: recent.data ?? [],
      adminCount: admins.count ?? 0,
    };
  });
