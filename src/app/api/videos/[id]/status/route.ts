import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient, isAdminAuthorized } from "@/lib/admin-auth";
import {
  HiggsfieldClientError,
  fetchHiggsfieldJobStatus,
  sanitizeDiagnosticText,
} from "@/lib/higgsfield";
import { TERMINAL_VIDEO_STATUSES } from "@/lib/video-pricing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/videos/[id]/status
 * Interroge de façon non-bloquante le statut chez Higgsfield (si non terminal),
 * met à jour l'URL vidéo et la date d'expiration (7 jours) dans Supabase et renvoie l'état à jour.
 */
export async function GET(
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

    if (fetchError) {
      console.error(
        "Erreur lecture statut video :",
        sanitizeDiagnosticText(fetchError.message)
      );
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de la lecture du suivi vidéo.",
        },
        { status: 500 }
      );
    }

    if (!row) {
      return NextResponse.json(
        {
          success: false,
          error: "Vidéo introuvable.",
        },
        { status: 404 }
      );
    }

    // Déjà dans un état terminal : aucune requête externe inutile
    if (TERMINAL_VIDEO_STATUSES.has(row.status) || !row.request_id) {
      return NextResponse.json(
        {
          success: true,
          data: {
            ...row,
            estimated_cost_usd: Number(row.estimated_cost_usd || 0),
          },
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    const upstream = await fetchHiggsfieldJobStatus({
      requestId: row.request_id,
      statusUrl: row.status_url,
    });

    const hasChanged =
      upstream.status !== row.status ||
      upstream.videoUrl !== row.video_url ||
      upstream.expiresAt !== row.expires_at ||
      upstream.errorMessage !== row.error_message;

    if (!hasChanged) {
      return NextResponse.json(
        {
          success: true,
          data: {
            ...row,
            estimated_cost_usd: Number(row.estimated_cost_usd || 0),
          },
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("video_generations")
      .update({
        status: upstream.status,
        video_url: upstream.videoUrl ?? row.video_url,
        expires_at: upstream.expiresAt ?? row.expires_at,
        error_message: upstream.errorMessage ?? row.error_message,
        correlation_id: upstream.correlationId || row.correlation_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    const finalRecord = updated || {
      ...row,
      status: upstream.status,
      video_url: upstream.videoUrl ?? row.video_url,
      expires_at: upstream.expiresAt ?? row.expires_at,
      error_message: upstream.errorMessage ?? row.error_message,
    };

    if (updateError) {
      console.error(
        "Erreur mise à jour statut video :",
        sanitizeDiagnosticText(updateError.message)
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...finalRecord,
          estimated_cost_usd: Number(finalRecord.estimated_cost_usd || 0),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
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
      "Exception GET /api/videos/[id]/status :",
      sanitizeDiagnosticText(err)
    );
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la vérification du statut vidéo.",
      },
      { status: 500 }
    );
  }
}

