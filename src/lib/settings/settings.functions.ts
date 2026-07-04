import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireAdmin(ctx: any) {
  const { data } = await ctx.supabase
    .from("user_roles").select("role")
    .eq("user_id", ctx.userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden: admin only");
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logActivity(ctx: any, action: string, entityType: string, entityId: string, oldData: unknown = null, newData: unknown = null) {
  try {
    await ctx.supabase.from("activity_logs").insert({
      actor_id: ctx.userId, actor_email: ctx.claims?.email ?? null,
      action, entity_type: entityType, entity_id: entityId,
      old_data: oldData, new_data: newData,
    });
  } catch (e) { console.warn("[activity] log failed", e); }
}

/* ---------------- SITE SETTINGS ---------------- */

export const getExtendedSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const { data, error } = await context.supabase
      .from("site_settings").select("*").limit(1).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const settingsSchema = z.object({
  notification_email: z.string().email().nullable().optional(),
  chatbot_enabled: z.boolean().optional(),
  whatsapp_enabled: z.boolean().optional(),
  chatbot_kb_extra: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  favicon_url: z.string().nullable().optional(),
  footer_html: z.string().nullable().optional(),
  social_links: z.record(z.string(), z.string()).optional(),
  ga4_id: z.string().nullable().optional(),
  gtm_id: z.string().nullable().optional(),
  meta_pixel_id: z.string().nullable().optional(),
  theme_colors: z.record(z.string(), z.string()).optional(),
  custom_css: z.string().nullable().optional(),
  custom_js: z.string().nullable().optional(),
  maintenance_mode: z.boolean().optional(),
  announcement: z.string().nullable().optional(),
});

export const updateExtendedSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => settingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { data: existing } = await context.supabase
      .from("site_settings").select("*").limit(1).maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = data as any;
    let result;
    if (existing) {
      const { data: updated, error } = await context.supabase
        .from("site_settings").update(payload).eq("id", existing.id).select().single();
      if (error) throw new Error(error.message);
      result = updated;
    } else {
      const { data: inserted, error } = await context.supabase
        .from("site_settings").insert(payload).select().single();
      if (error) throw new Error(error.message);
      result = inserted;
    }
    await logActivity(context, "update", "site_settings", String(result?.id ?? "singleton"), existing, result);
    return result;
  });


/* ---------------- PAGE SEO ---------------- */

export const listPageSeo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const { data, error } = await context.supabase
      .from("page_seo").select("*").order("path", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const pageSeoSchema = z.object({
  id: z.string().uuid().optional(),
  path: z.string().min(1),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  og_image: z.string().nullable().optional(),
  canonical: z.string().nullable().optional(),
  noindex: z.boolean().optional(),
});

export const upsertPageSeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pageSeoSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { data: result, error } = await context.supabase
      .from("page_seo").upsert(data, { onConflict: "path" }).select().single();
    if (error) throw new Error(error.message);
    await logActivity(context, data.id ? "update" : "create", "page_seo", result.id, null, result);
    return result;
  });

export const deletePageSeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { error } = await context.supabase.from("page_seo").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context, "delete", "page_seo", data.id);
    return { ok: true };
  });

/* ---------------- REDIRECTS ---------------- */

export const listRedirects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const { data, error } = await context.supabase
      .from("redirects").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const redirectSchema = z.object({
  id: z.string().uuid().optional(),
  from_path: z.string().min(1),
  to_path: z.string().min(1),
  status_code: z.number().int().min(300).max(399).optional(),
  enabled: z.boolean().optional(),
});

export const upsertRedirect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => redirectSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { data: result, error } = await context.supabase
      .from("redirects").upsert(data, { onConflict: "from_path" }).select().single();
    if (error) throw new Error(error.message);
    await logActivity(context, data.id ? "update" : "create", "redirect", result.id, null, result);
    return result;
  });

export const deleteRedirect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { error } = await context.supabase.from("redirects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context, "delete", "redirect", data.id);
    return { ok: true };
  });

/* ---------------- MEDIA LIBRARY ---------------- */

export const listMediaFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const { data, error } = await context.supabase
      .from("media_files").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const mediaSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url(),
  storage_path: z.string().nullable().optional(),
  folder: z.string().optional(),
  tags: z.array(z.string()).optional(),
  mime_type: z.string().nullable().optional(),
  size_bytes: z.number().nullable().optional(),
  alt_text: z.string().nullable().optional(),
});

export const upsertMediaFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => mediaSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const payload = { ...data, uploaded_by: context.userId };
    const { data: result, error } = await context.supabase
      .from("media_files").upsert(payload).select().single();
    if (error) throw new Error(error.message);
    await logActivity(context, data.id ? "update" : "create", "media_file", result.id, null, result);
    return result;
  });

export const deleteMediaFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { error } = await context.supabase.from("media_files").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context, "delete", "media_file", data.id);
    return { ok: true };
  });

/* ---------------- NOT FOUND LOG ---------------- */

export const listNotFoundLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const { data, error } = await context.supabase
      .from("not_found_log").select("*")
      .order("last_seen_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const clearNotFoundLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const { error } = await context.supabase.from("not_found_log").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw new Error(error.message);
    await logActivity(context, "clear", "not_found_log", "all");
    return { ok: true };
  });
