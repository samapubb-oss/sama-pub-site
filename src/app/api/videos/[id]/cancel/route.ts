import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient, isAdminAuthorized } from "@/lib/admin-auth";
import {
  HiggsfieldClientError,
  cancelHiggsfieldQueuedJob,
  sanitizeDiagnosticText,
} from "@/lib/higgsfield";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/videos/[id]/cancel
 * Annule une génération encore en file d'attente (`queued`) via cancel_url Higgsfield.
 */
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json(
        {
          success: false,
          error: "Accès non autorisé. Veuillez vous connecter au dashboard.",
        },
        { status: 401 }
      );
    }

    const id = (context.params?.id || "").trim();
    if (!id || id.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Identifiant de vidéo invalide.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServerSupabaseClient();
    const { data: row, error: fetchError } = await supabaseAdmin
      .from("video_generations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !row) {
      return NextResponse.json(
        {
          success: false,
          error: "Vidéo introuvable.",
        },
        { status: 404 }
      );
    }

    if (row.status !== "queued") {
      return NextResponse.json(
        {
          success: false,
          error:
            row.status === "in_progress"
              ? "La génération a déjà démarré et ne peut plus être annulée."
              : "Cette génération est déjà terminée.",
        },
        { status: 409 }
      );
    }

    if (!row.request_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucun request_id associé à cette génération.",
        },
        { status: 400 }
      );
    }

    const result = await cancelHiggsfieldQueuedJob({
      requestId: row.request_id,
      cancelUrl: row.cancel_url,
    });

    const nextStatus = result.canceled ? "canceled" : "in_progress";
    const nextErrorMsg = result.canceled
      ? "Génération annulée par l'administrateur avant traitement (aucun crédit débité)."
      : row.error_message;

    const { data: updated } = await supabaseAdmin
      .from("video_generations")
      .update({
        status: nextStatus,
        error_message: nextErrorMsg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (!result.canceled) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          data: updated
            ? {
                ...updated,
                estimated_cost_usd: Number(updated.estimated_cost_usd || 0),
              }
            : undefined,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: updated
        ? {
            ...updated,
            estimated_cost_usd: Number(updated.estimated_cost_usd || 0),
          }
        : {
            ...row,
            status: "canceled",
            estimated_cost_usd: Number(row.estimated_cost_usd || 0),
          },
    });
  } catch (err: unknown) {
    if (err instanceof HiggsfieldClientError) {
      return NextResponse.json(
        {
          success: false,
          code: err.code,
          error: err.message,
        },
        { status: err.statusCode }
      );
    }

    console.error(
      "Exception POST /api/videos/[id]/cancel :",
      sanitizeDiagnosticText(err)
    );
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de l'annulation de la vidéo.",
      },
      { status: 500 }
    );
  }
}

