import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { DELETED_LEAD_MARKER } from "@/lib/devis-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getAdminSupabaseClient() {
  const supabaseUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://rgdcehpynsfllenfidei.supabase.co"
  ).trim();

  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZGNlaHB5bnNmbGxlbmZpZGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNzY2MDQsImV4cCI6MjEwNzc1MjYwNH0.3GAS_TqKXS8Z0g5CUKZrB0ean3dE72ia1aLV-4OhCuw"
  ).trim();

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function isAdminAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("x-sama-admin-auth");
  const authBearer = req.headers.get("authorization");
  const authCookie = req.cookies.get("sama_admin_auth")?.value;

  return Boolean(
    authHeader === "true" ||
      authCookie === "true" ||
      (authBearer && authBearer.startsWith("Bearer "))
  );
}

/**
 * Route GET /api/admin/devis
 * Récupère toutes les demandes de devis côté serveur (contourne tout blocage navigateur,
 * bloqueur de pub ou jeton expiré en localStorage).
 */
export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json(
        {
          success: false,
          error: "Accès non autorisé.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = getAdminSupabaseClient();
    const { data, error } = await supabaseAdmin
      .from("leads_quotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur GET /api/admin/devis :", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: data || [],
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("Exception GET /api/admin/devis :", err);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors du chargement des demandes de devis.",
      },
      { status: 500 }
    );
  }
}

/**
 * Route PATCH /api/admin/devis
 * Met à jour le statut d'une demande de devis côté serveur.
 */
export async function PATCH(req: NextRequest) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: "Accès non autorisé." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const leadId = (body?.id || "").trim();
    const status = (body?.status || "").trim();

    if (!leadId || !status) {
      return NextResponse.json(
        { success: false, error: "Identifiant ou statut manquant." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminSupabaseClient();
    const { error } = await supabaseAdmin
      .from("leads_quotes")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", leadId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: leadId, status });
  } catch (err: any) {
    console.error("Exception PATCH /api/admin/devis :", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la mise à jour." },
      { status: 500 }
    );
  }
}

/**
 * Route DELETE /api/admin/devis?id=... (ou corps JSON { id })
 * Supprime définitivement une demande de devis (Campagne ou Site Web) dans Supabase.
 */
export async function DELETE(req: NextRequest) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json(
        {
          success: false,
          error: "Accès non autorisé. Veuillez vous connecter au tableau de bord.",
        },
        { status: 401 }
      );
    }

    const urlId = req.nextUrl.searchParams.get("id");
    let bodyId: string | undefined;

    if (!urlId) {
      const body = await req.json().catch(() => null);
      if (body && typeof body.id === "string") {
        bodyId = body.id;
      }
    }

    const leadId = (urlId || bodyId || "").trim();

    if (!leadId || leadId.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: "Identifiant de la demande de devis manquant ou invalide.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminSupabaseClient();

    // 1. Tentative de suppression physique directe dans public.leads_quotes
    const { data: deletedRows, error: deleteError } = await supabaseAdmin
      .from("leads_quotes")
      .delete()
      .eq("id", leadId)
      .select("id");

    if (!deleteError && deletedRows && deletedRows.length > 0) {
      return NextResponse.json({
        success: true,
        id: leadId,
        mode: "hard_delete",
      });
    }

    // 2. Vérifier si la ligne existe encore (ex: déjà supprimée ou politique RLS DELETE absente)
    const { data: existingRow, error: fetchError } = await supabaseAdmin
      .from("leads_quotes")
      .select("id, message")
      .eq("id", leadId)
      .maybeSingle();

    if (!fetchError && !existingRow) {
      return NextResponse.json({
        success: true,
        id: leadId,
        mode: "already_deleted",
      });
    }

    // 3. Repli persistant en base si RLS bloque DELETE sur la clé publique (UPDATE autorisé)
    if (existingRow) {
      const currentMessage = existingRow.message || "";
      const updatedMessage = currentMessage.includes(DELETED_LEAD_MARKER)
        ? currentMessage
        : `${currentMessage}\n${DELETED_LEAD_MARKER}`;

      const { data: updatedRows, error: updateError } = await supabaseAdmin
        .from("leads_quotes")
        .update({
          message: updatedMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", leadId)
        .select("id");

      if (!updateError && updatedRows && updatedRows.length > 0) {
        return NextResponse.json({
          success: true,
          id: leadId,
          mode: "soft_delete",
        });
      }

      return NextResponse.json(
        {
          success: false,
          error:
            updateError?.message ||
            deleteError?.message ||
            "La base de données a refusé la suppression de cette demande.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          deleteError?.message ||
          fetchError?.message ||
          "Impossible de supprimer cette demande de devis.",
      },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("Erreur dans DELETE /api/admin/devis :", err);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la suppression de la demande de devis.",
      },
      { status: 500 }
    );
  }
}
