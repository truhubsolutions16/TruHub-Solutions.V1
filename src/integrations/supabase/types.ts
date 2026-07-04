export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          body: string
          heading: string
          id: string
          stat_clients: number
          stat_projects: number
          stat_satisfaction: number
          stat_support: string
          updated_at: string
        }
        Insert: {
          body: string
          heading: string
          id?: string
          stat_clients?: number
          stat_projects?: number
          stat_satisfaction?: number
          stat_support?: string
          updated_at?: string
        }
        Update: {
          body?: string
          heading?: string
          id?: string
          stat_clients?: number
          stat_projects?: number
          stat_satisfaction?: number
          stat_support?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      additional_services: {
        Row: {
          created_at: string
          id: string
          name: string
          price: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          last_password_change_at: string | null
          two_factor_enabled: boolean
          two_factor_secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          last_password_change_at?: string | null
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          last_password_change_at?: string | null
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device: string | null
          duration_ms: number | null
          event_type: string
          id: number
          ip_hash: string | null
          meta: Json | null
          os: string | null
          path: string | null
          referrer: string | null
          screen_h: number | null
          screen_w: number | null
          scroll_depth: number | null
          session_id: string | null
          source: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          duration_ms?: number | null
          event_type: string
          id?: number
          ip_hash?: string | null
          meta?: Json | null
          os?: string | null
          path?: string | null
          referrer?: string | null
          screen_h?: number | null
          screen_w?: number | null
          scroll_depth?: number | null
          session_id?: string | null
          source?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          duration_ms?: number | null
          event_type?: string
          id?: number
          ip_hash?: string | null
          meta?: Json | null
          os?: string | null
          path?: string | null
          referrer?: string | null
          screen_h?: number | null
          screen_w?: number | null
          scroll_depth?: number | null
          session_id?: string | null
          source?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      analytics_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device: string | null
          ended_at: string | null
          entry_path: string | null
          exit_path: string | null
          is_bounce: boolean
          is_returning: boolean
          last_seen_at: string
          os: string | null
          page_count: number
          referrer: string | null
          session_id: string
          source: string | null
          started_at: string
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device?: string | null
          ended_at?: string | null
          entry_path?: string | null
          exit_path?: string | null
          is_bounce?: boolean
          is_returning?: boolean
          last_seen_at?: string
          os?: string | null
          page_count?: number
          referrer?: string | null
          session_id: string
          source?: string | null
          started_at?: string
          visitor_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device?: string | null
          ended_at?: string | null
          entry_path?: string | null
          exit_path?: string | null
          is_bounce?: boolean
          is_returning?: boolean
          last_seen_at?: string
          os?: string | null
          page_count?: number
          referrer?: string | null
          session_id?: string
          source?: string | null
          started_at?: string
          visitor_id?: string
        }
        Relationships: []
      }
      backups: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          notes: string | null
          rows_count: number | null
          size_bytes: number | null
          storage_path: string | null
          tables_count: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          notes?: string | null
          rows_count?: number | null
          size_bytes?: number | null
          storage_path?: string | null
          tables_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          notes?: string | null
          rows_count?: number | null
          size_bytes?: number | null
          storage_path?: string | null
          tables_count?: number | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          body_md: string
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          body_md?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          body_md?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          address: string | null
          email: string
          id: string
          phone: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          address?: string | null
          email: string
          id?: string
          phone: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          address?: string | null
          email?: string
          id?: string
          phone?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          assigned_to: string | null
          business_name: string | null
          created_at: string
          email: string
          follow_up_at: string | null
          id: string
          is_read: boolean
          lead_score: number
          name: string
          notes: string | null
          phone: string | null
          priority: Database["public"]["Enums"]["lead_priority"]
          project_details: string
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          business_name?: string | null
          created_at?: string
          email: string
          follow_up_at?: string | null
          id?: string
          is_read?: boolean
          lead_score?: number
          name: string
          notes?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"]
          project_details: string
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          business_name?: string | null
          created_at?: string
          email?: string
          follow_up_at?: string | null
          id?: string
          is_read?: boolean
          lead_score?: number
          name?: string
          notes?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"]
          project_details?: string
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      founder: {
        Row: {
          id: string
          name: string
          photo_url: string | null
          skills: string[]
          title: string
          updated_at: string
          vision: string
        }
        Insert: {
          id?: string
          name: string
          photo_url?: string | null
          skills?: string[]
          title: string
          updated_at?: string
          vision: string
        }
        Update: {
          id?: string
          name?: string
          photo_url?: string | null
          skills?: string[]
          title?: string
          updated_at?: string
          vision?: string
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          cta_primary_label: string
          cta_secondary_label: string
          eyebrow: string
          headline: string
          id: string
          subtitle: string
          updated_at: string
        }
        Insert: {
          cta_primary_label?: string
          cta_secondary_label?: string
          eyebrow?: string
          headline: string
          id?: string
          subtitle: string
          updated_at?: string
        }
        Update: {
          cta_primary_label?: string
          cta_secondary_label?: string
          eyebrow?: string
          headline?: string
          id?: string
          subtitle?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_cents: number
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          due_date: string | null
          id: string
          invoice_url: string | null
          notes: string | null
          number: string | null
          paid_at: string | null
          project_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          invoice_url?: string | null
          notes?: string | null
          number?: string | null
          paid_at?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          invoice_url?: string | null
          notes?: string | null
          number?: string | null
          paid_at?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_timeline: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          lead_id: string
          message: string | null
          meta: Json
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          lead_id: string
          message?: string | null
          meta?: Json
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          lead_id?: string
          message?: string | null
          meta?: Json
        }
        Relationships: [
          {
            foreignKeyName: "lead_timeline_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      login_history: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          failure_reason: string | null
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      media_files: {
        Row: {
          alt_text: string | null
          created_at: string
          folder: string
          height: number | null
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string | null
          tags: string[]
          updated_at: string
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          folder?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          tags?: string[]
          updated_at?: string
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          folder?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          tags?: string[]
          updated_at?: string
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      not_found_log: {
        Row: {
          created_at: string
          hit_count: number
          id: string
          last_seen_at: string
          path: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          hit_count?: number
          id?: string
          last_seen_at?: string
          path: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          hit_count?: number
          id?: string
          last_seen_at?: string
          path?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          canonical: string | null
          created_at: string
          description: string | null
          id: string
          meta: Json
          noindex: boolean
          og_image: string | null
          path: string
          title: string | null
          updated_at: string
        }
        Insert: {
          canonical?: string | null
          created_at?: string
          description?: string | null
          id?: string
          meta?: Json
          noindex?: boolean
          og_image?: string | null
          path: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          canonical?: string | null
          created_at?: string
          description?: string | null
          id?: string
          meta?: Json
          noindex?: boolean
          og_image?: string | null
          path?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          live_url: string | null
          name: string
          sort_order: number
          technology: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          live_url?: string | null
          name: string
          sort_order?: number
          technology: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          live_url?: string | null
          name?: string
          sort_order?: number
          technology?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string
          cta_label: string
          features: string[]
          highlighted: boolean
          id: string
          name: string
          price: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string
          features?: string[]
          highlighted?: boolean
          id?: string
          name: string
          price: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string
          features?: string[]
          highlighted?: boolean
          id?: string
          name?: string
          price?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      process_steps: {
        Row: {
          description: string
          duration: string | null
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          description: string
          duration?: string | null
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          description?: string
          duration?: string | null
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string
          id: string
          mime_type: string | null
          name: string
          project_id: string
          size_bytes: number | null
          storage_path: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type?: string | null
          name: string
          project_id: string
          size_bytes?: number | null
          storage_path?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string | null
          name?: string
          project_id?: string
          size_bytes?: number | null
          storage_path?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          project_id: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          project_id: string
          sender_id: string
          sender_role?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          project_id?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          notes: string | null
          progress: number
          stage: string
          status: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          notes?: string | null
          progress?: number
          stage?: string
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          notes?: string | null
          progress?: number
          stage?: string
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      redirects: {
        Row: {
          created_at: string
          enabled: boolean
          from_path: string
          id: string
          status_code: number
          to_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          from_path: string
          id?: string
          status_code?: number
          to_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          from_path?: string
          id?: string
          status_code?: number
          to_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      section_meta: {
        Row: {
          extra: string | null
          eyebrow: string | null
          heading: string | null
          section: string
          subheading: string | null
          updated_at: string
        }
        Insert: {
          extra?: string | null
          eyebrow?: string | null
          heading?: string | null
          section: string
          subheading?: string | null
          updated_at?: string
        }
        Update: {
          extra?: string | null
          eyebrow?: string | null
          heading?: string | null
          section?: string
          subheading?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          announcement: string | null
          chatbot_enabled: boolean
          chatbot_kb_extra: string
          created_at: string
          custom_css: string | null
          custom_js: string | null
          favicon_url: string | null
          footer_html: string | null
          ga4_id: string | null
          gtm_id: string | null
          id: boolean
          logo_url: string | null
          maintenance_mode: boolean
          meta_pixel_id: string | null
          notification_email: string | null
          social_links: Json
          theme_colors: Json
          updated_at: string
          whatsapp_enabled: boolean
        }
        Insert: {
          announcement?: string | null
          chatbot_enabled?: boolean
          chatbot_kb_extra?: string
          created_at?: string
          custom_css?: string | null
          custom_js?: string | null
          favicon_url?: string | null
          footer_html?: string | null
          ga4_id?: string | null
          gtm_id?: string | null
          id?: boolean
          logo_url?: string | null
          maintenance_mode?: boolean
          meta_pixel_id?: string | null
          notification_email?: string | null
          social_links?: Json
          theme_colors?: Json
          updated_at?: string
          whatsapp_enabled?: boolean
        }
        Update: {
          announcement?: string | null
          chatbot_enabled?: boolean
          chatbot_kb_extra?: string
          created_at?: string
          custom_css?: string | null
          custom_js?: string | null
          favicon_url?: string | null
          footer_html?: string | null
          ga4_id?: string | null
          gtm_id?: string | null
          id?: boolean
          logo_url?: string | null
          maintenance_mode?: boolean
          meta_pixel_id?: string | null
          notification_email?: string | null
          social_links?: Json
          theme_colors?: Json
          updated_at?: string
          whatsapp_enabled?: boolean
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          quote: string
          rating: number
          role: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          quote: string
          rating?: number
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          quote?: string
          rating?: number
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      why_choose_us: {
        Row: {
          description: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          description: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          description?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user" | "employee" | "member"
      lead_priority: "low" | "medium" | "high" | "urgent"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "won"
        | "lost"
        | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "employee", "member"],
      lead_priority: ["low", "medium", "high", "urgent"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "won",
        "lost",
        "archived",
      ],
    },
  },
} as const
