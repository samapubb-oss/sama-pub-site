import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/admin-auth";
import {
  sanitizeDiagnosticText,
  verifyHiggsfieldWebhookSignature,
} from "@/lib/higgsfield";
import {
  HIGGSFIELD_DEFAULT_RETENTION_SECONDS,
  TERMINAL_VIDEO_STATUSES,
} from "@/lib/video-pricing";
import type { VideoGenerationStatus } from "@/types/video";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface HiggsfieldWebhookEnvelope {
  request_id?: string;
  status?: string;
  error?: string | null;
  expires_at?: string | null;
  payload?: {
    video?: {
      url?: string;
      content_type?: string;
    } | null;
  } | null;
}

/**
 * POST /api/webhooks/higgsfield
 * Réception asynchrone des résultats terminaux Higgsfield (`completed`, `failed`, `nsfw`),
 * avec vérification d'authenticité Standard Webhooks (HMAC-SHA256 sur le corps brut).
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.HF_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Webhook non configuré." },
        { status: 503 }
      );
    }

    const rawBody = await req.text();
    const webhookId = req.headers.get("webhook-id");
    const webhookTimestamp = req.headers.get("webhook-timestamp");
    const webhookSignature = req.headers.get("webhook-signature");

    const isSignatureValid = verifyHiggsfieldWebhookSignature({
      rawBody,
      webhookId,
      webhookTimestamp,
      webhookSignature,
    });

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: "Signature webhook invalide." },
        { status: 400 }
      );
    }

    let event: HiggsfieldWebhookEnvelope;
    try {
      event = JSON.parse(rawBody) as HiggsfieldWebhookEnvelope;
    } catch {
      return NextResponse.json(
        { error: "Enveloppe JSON invalide." },
        { status: 400 }
      );
    }

    const requestId = (event.request_id || "").trim();
    const status = (event.status || "").trim() as VideoGenerationStatus;

    if (!requestId || !TERMINAL_VIDEO_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Enveloppe d'événement non reconnue." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServerSupabaseClient();
    const { data: existing } = await supabaseAdmin
      .from("video_generations")
      .select("id, status, video_url, expires_at")
      .eq("request_id", requestId)
      .maybeSingle();

    // Déduplication idempotente : répondre 200 même si la requête a déjà été mise à jour ou supprimée
    if (!existing) {
      return NextResponse.json({ received: true, matched: false });
    }

    if (TERMINAL_VIDEO_STATUSES.has(existing.status)) {
      return NextResponse.json({ received: true, deduplicated: true });
    }

    let videoUrl: string | null = existing.video_url;
    let expiresAt: string | null = existing.expires_at;
    let errorMessage: string | null = null;

    if (status === "completed") {
      videoUrl = event.payload?.video?.url || existing.video_url;
      expiresAt =
        event.expires_at ||
        new Date(
          Date.now() + HIGGSFIELD_DEFAULT_RETENTION_SECONDS * 1000
        ).toISOString();
    } else if (status === "nsfw") {
      errorMessage =
        "Contenu refusé par la modération automatique de sécurité Higgsfield (aucun crédit débité).";
    } else if (status === "failed") {
      const cleanErr = event.error ? sanitizeDiagnosticText(event.error) : "";
      errorMessage = cleanErr
        ? `La génération a échoué chez Higgsfield (${cleanErr}). Aucun crédit n'a été débité.`
        : "La génération a échoué chez Higgsfield (aucun crédit débité).";
    }

    const { error: updateError } = await supabaseAdmin
      .from("video_generations")
      .update({
        status,
        video_url: videoUrl,
        expires_at: expiresAt,
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error(
        "Erreur mise à jour webhook Higgsfield :",
        sanitizeDiagnosticText(updateError.message)
      );
      return NextResponse.json(
        { error: "Erreur temporaire base de données." },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error(
      "Exception POST /api/webhooks/higgsfield :",
      sanitizeDiagnosticText(err)
    );
    return NextResponse.json(
      { error: "Erreur interne webhook." },
      { status: 500 }
    );
  }
}

