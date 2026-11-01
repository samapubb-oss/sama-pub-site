import { NextRequest, NextResponse } from "next/server";
import {
  getAdminUserIdentifier,
  getServerSupabaseClient,
  isAdminAuthorized,
  isMissingTableError,
} from "@/lib/admin-auth";
import {
  HiggsfieldClientError,
  buildQuotaExceededMessage,
  getVideoGuardrailsConfig,
  sanitizeDiagnosticText,
  submitHiggsfieldGeneration,
  uploadInputImageToHiggsfield,
  validateUploadedImageBuffer,
  validateVideoGenerationPayload,
} from "@/lib/higgsfield";
import { NON_BILLED_VIDEO_STATUSES, formatUsd } from "@/lib/video-pricing";
import type { CreateVideoPayload, VideoQuotaSummary } from "@/types/video";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStartOfUtcDayIso(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
  ).toISOString();
}

function getStartOfUtcMonthIso(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
  ).toISOString();
}

async function computeQuotaSummary(
  supabaseAdmin: ReturnType<typeof getServerSupabaseClient>,
  userIdentifier: string
): Promise<VideoQuotaSummary> {
  const guardrails = getVideoGuardrailsConfig();
  const monthStartIso = getStartOfUtcMonthIso();
  const dayStartIso = getStartOfUtcDayIso();

  const { data: monthRows, error } = await supabaseAdmin
    .from("video_generations")
    .select("created_by, created_at, status, estimated_cost_usd")
    .gte("created_at", monthStartIso);

  if (error || !monthRows) {
    return {
      ...guardrails,
      usedToday: 0,
      usedThisMonthUsd: 0,
    };
  }

  let usedToday = 0;
  let usedThisMonthUsd = 0;

  for (const row of monthRows) {
    if (NON_BILLED_VIDEO_STATUSES.has(row.status)) {
      continue;
    }
    const cost = Number(row.estimated_cost_usd || 0);
    if (Number.isFinite(cost) && cost > 0) {
      usedThisMonthUsd += cost;
    }
    if (
      row.created_by === userIdentifier &&
      row.created_at &&
      row.created_at >= dayStartIso
    ) {
      usedToday += 1;
    }
  }

  return {
    ...guardrails,
    usedToday,
    usedThisMonthUsd: Math.round(usedThisMonthUsd * 10000) / 10000,
  };
}

/**
 * GET /api/videos
 * Liste l'historique des vidéos générées (du plus récent au plus ancien) + résumé des quotas.
 */
export async function GET(req: NextRequest) {
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

    const userIdentifier = getAdminUserIdentifier(req);
    const supabaseAdmin = getServerSupabaseClient();

    const { data, error } = await supabaseAdmin
      .from("video_generations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      if (isMissingTableError(error)) {
        const guardrails = getVideoGuardrailsConfig();
        return NextResponse.json(
          {
            success: true,
            data: [],
            migrationRequired: true,
            quotas: {
              ...guardrails,
              usedToday: 0,
              usedThisMonthUsd: 0,
            },
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          }
        );
      }

      console.error(
        "Erreur GET /api/videos :",
        sanitizeDiagnosticText(error.message)
      );
      return NextResponse.json(
        {
          success: false,
          error: "Impossible de charger l'historique des vidéos.",
        },
        { status: 500 }
      );
    }

    const quotas = await computeQuotaSummary(supabaseAdmin, userIdentifier);

    return NextResponse.json(
      {
        success: true,
        data: (data || []).map((row) => ({
          ...row,
          estimated_cost_usd: Number(row.estimated_cost_usd || 0),
        })),
        migrationRequired: false,
        quotas,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: unknown) {
    console.error("Exception GET /api/videos :", sanitizeDiagnosticText(err));
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération des vidéos.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/videos
 * Valide l'entrée, vérifie l'authentification et les garde-fous coûts,
 * soumet le job asynchrone chez Higgsfield avec Idempotency-Key,
 * enregistre la ligne dans Supabase et renvoie immédiatement l'identifiant.
 */
export async function POST(req: NextRequest) {
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

    const userIdentifier = getAdminUserIdentifier(req);
    const contentType = req.headers.get("content-type") || "";
    const headerIdempotencyKey = req.headers.get("idempotency-key") || undefined;

    let rawPayload: Partial<CreateVideoPayload>;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const startFile = formData.get("start_image");
      const endFile = formData.get("end_image");

      let uploadedStartUrl =
        typeof formData.get("image_url") === "string"
          ? String(formData.get("image_url"))
          : undefined;
      let uploadedEndUrl =
        typeof formData.get("end_image_url") === "string"
          ? String(formData.get("end_image_url"))
          : undefined;

      if (startFile instanceof File && startFile.size > 0) {
        const buf = Buffer.from(await startFile.arrayBuffer());
        const validMime = validateUploadedImageBuffer(buf, startFile.type);
        uploadedStartUrl = await uploadInputImageToHiggsfield(buf, validMime);
      }

      if (endFile instanceof File && endFile.size > 0) {
        const buf = Buffer.from(await endFile.arrayBuffer());
        const validMime = validateUploadedImageBuffer(buf, endFile.type);
        uploadedEndUrl = await uploadInputImageToHiggsfield(buf, validMime);
      }

      rawPayload = {
        mode: String(formData.get("mode") || "") as CreateVideoPayload["mode"],
        prompt:
          typeof formData.get("prompt") === "string"
            ? String(formData.get("prompt"))
            : undefined,
        duration: Number(formData.get("duration")),
        resolution: String(
          formData.get("resolution") || ""
        ) as CreateVideoPayload["resolution"],
        aspect_ratio:
          typeof formData.get("aspect_ratio") === "string"
            ? String(formData.get("aspect_ratio"))
            : undefined,
        image_url: uploadedStartUrl,
        end_image_url: uploadedEndUrl,
        idempotency_key:
          headerIdempotencyKey ||
          (typeof formData.get("idempotency_key") === "string"
            ? String(formData.get("idempotency_key"))
            : undefined),
      };
    } else {
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") {
        return NextResponse.json(
          { success: false, error: "Corps JSON invalide." },
          { status: 400 }
        );
      }
      rawPayload = {
        ...body,
        idempotency_key: headerIdempotencyKey || body.idempotency_key,
      };
    }

    // 1. Validation stricte côté serveur
    const validated = validateVideoGenerationPayload(rawPayload);
    const supabaseAdmin = getServerSupabaseClient();

    // 2. Déduplication locale sur Idempotency-Key avant tout appel externe
    const { data: existingByKey, error: existingErr } = await supabaseAdmin
      .from("video_generations")
      .select("*")
      .eq("idempotency_key", validated.idempotencyKey)
      .maybeSingle();

    if (existingErr && isMissingTableError(existingErr)) {
      return NextResponse.json(
        {
          success: false,
          migrationRequired: true,
          error:
            "La table Supabase public.video_generations n'est pas encore créée. Exécutez le fichier supabase_videos_migration.sql dans l'éditeur SQL Supabase avant de lancer une génération.",
        },
        { status: 503 }
      );
    }

    if (existingByKey) {
      return NextResponse.json({
        success: true,
        deduplicated: true,
        data: {
          ...existingByKey,
          estimated_cost_usd: Number(existingByKey.estimated_cost_usd || 0),
        },
      });
    }

    // 3. Garde-fous coûts & quotas journaliers / mensuels
    const quotas = await computeQuotaSummary(supabaseAdmin, userIdentifier);

    if (quotas.usedToday >= quotas.maxDailyGenerations) {
      return NextResponse.json(
        {
          success: false,
          error: buildQuotaExceededMessage({
            type: "daily",
            limit: quotas.maxDailyGenerations,
            used: quotas.usedToday,
          }),
        },
        { status: 429 }
      );
    }

    const projectedMonthSpend =
      quotas.usedThisMonthUsd + validated.estimatedCostUsd;
    if (projectedMonthSpend > quotas.maxMonthlyBudgetUsd) {
      return NextResponse.json(
        {
          success: false,
          error: `${buildQuotaExceededMessage({
            type: "monthly",
            limit: quotas.maxMonthlyBudgetUsd,
            used: quotas.usedThisMonthUsd,
          })} Coût estimé de cette vidéo : ${formatUsd(
            validated.estimatedCostUsd
          )}.`,
        },
        { status: 429 }
      );
    }

    // 4. Soumission asynchrone non-bloquante chez Higgsfield avec Idempotency-Key
    const receipt = await submitHiggsfieldGeneration({
      modelId: validated.modelId,
      body: validated.higgsfieldBody,
      idempotencyKey: validated.idempotencyKey,
    });

    // 5. Persistance immédiate dans Supabase (ou récupération si replay idempotent)
    const nowIso = new Date().toISOString();
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("video_generations")
      .upsert(
        {
          request_id: receipt.requestId,
          idempotency_key: validated.idempotencyKey,
          mode: validated.mode,
          model_id: validated.modelId,
          prompt: validated.prompt,
          duration: validated.duration,
          resolution: validated.resolution,
          aspect_ratio: validated.aspectRatio,
          input_image_url: validated.inputImageUrl,
          end_image_url: validated.endImageUrl,
          status: receipt.status,
          status_url: receipt.statusUrl,
          cancel_url: receipt.cancelUrl,
          estimated_cost_usd: validated.estimatedCostUsd,
          correlation_id: receipt.correlationId || null,
          created_by: userIdentifier,
          updated_at: nowIso,
        },
        { onConflict: "idempotency_key" }
      )
      .select("*")
      .single();

    if (insertError || !inserted) {
      console.error(
        "Erreur insertion video_generations :",
        sanitizeDiagnosticText(insertError?.message)
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "La génération a été soumise mais l'enregistrement en base de données a échoué.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...inserted,
          estimated_cost_usd: Number(inserted.estimated_cost_usd || 0),
        },
      },
      { status: 201 }
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

    console.error("Exception POST /api/videos :", sanitizeDiagnosticText(err));
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors du lancement de la génération vidéo.",
      },
      { status: 500 }
    );
  }
}

