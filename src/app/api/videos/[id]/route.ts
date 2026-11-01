import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient, isAdminAuthorized } from "@/lib/admin-auth";
import {
  cancelHiggsfieldQueuedJob,
  deleteHiggsfieldRequestData,
  sanitizeDiagnosticText,
} from "@/lib/higgsfield";
import { TERMINAL_VIDEO_STATUSES } from "@/lib/video-pricing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * DELETE /api/videos/[id]
 * - Si la vidéo est encore en file d'attente (`queued`), tente une annulation chez Higgsfield.
 * - Si elle est dans un état terminal, demande la suppression des fichiers chez Higgsfield (`DELETE /requests/{request_id}`).
 * - Supprime l'entrée de l'historique dans Supabase.
 */
export async function DELETE(
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

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("video_generations")
      .select("id, request_id, status, cancel_url")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error(
        "Erreur lecture avant suppression video :",
        sanitizeDiagnosticText(fetchError.message)
      );
      return NextResponse.json(
        {
          success: false,
          error: "Impossible de vérifier cette vidéo en base de données.",
        },
        { status: 500 }
      );
    }

    if (existing?.request_id) {
      if (existing.status === "queued") {
        await cancelHiggsfieldQueuedJob({
          requestId: existing.request_id,
          cancelUrl: existing.cancel_url,
        }).catch(() => null);
      } else if (TERMINAL_VIDEO_STATUSES.has(existing.status)) {
        await deleteHiggsfieldRequestData(existing.request_id);
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from("video_generations")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(
        "Erreur DELETE /api/videos/[id] :",
        sanitizeDiagnosticText(deleteError.message)
      );
      return NextResponse.json(
        {
          success: false,
          error: "La suppression en base de données a échoué.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (err: unknown) {
    console.error(
      "Exception DELETE /api/videos/[id] :",
      sanitizeDiagnosticText(err)
    );
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la suppression de la vidéo.",
      },
      { status: 500 }
    );
  }
}

