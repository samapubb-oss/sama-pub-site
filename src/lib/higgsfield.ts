import crypto from "crypto";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  HIGGSFIELD_DEFAULT_RETENTION_SECONDS,
  KLING_V4_MAX_DURATION,
  KLING_V4_MAX_MIDDLE_FRAMES,
  KLING_V4_MAX_PROMPT_LENGTH,
  KLING_V4_MAX_REFERENCE_IMAGES,
  KLING_V4_MAX_REFERENCE_VIDEOS,
  KLING_V4_MIN_DURATION,
  KLING_V4_MODES,
  KLING_V4_RESOLUTIONS,
  MAX_PRESIGNED_IMAGE_BYTES,
  MAX_PRESIGNED_VIDEO_BYTES,
  MAX_UPLOAD_IMAGE_BYTES,
  estimateVideoCostUsd,
  formatUsd,
} from "@/lib/video-pricing";
import type {
  CreateVideoPayload,
  KlingV4Mode,
  KlingV4Resolution,
  VideoGenerationStatus,
} from "@/types/video";

if (typeof window !== "undefined") {
  throw new Error(
    "Module serveur uniquement : les identifiants Higgsfield ne doivent jamais être importés côté navigateur."
  );
}

const HIGGSFIELD_API_BASE_URL = "https://api.higgsfield.ai";
const HTTP_TIMEOUT_MS = 25000;

export class HiggsfieldClientError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly correlationId?: string;
  public readonly retryAfterSeconds?: number;

  constructor(params: {
    message: string;
    statusCode: number;
    code: string;
    correlationId?: string;
    retryAfterSeconds?: number;
  }) {
    super(params.message);
    this.name = "HiggsfieldClientError";
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.correlationId = params.correlationId;
    this.retryAfterSeconds = params.retryAfterSeconds;
  }
}

/**
 * Limites configurables par variables d'environnement serveur (garde-fous coûts).
 */
export function getVideoGuardrailsConfig() {
  const rawMaxDuration = Number(process.env.VIDEO_MAX_DURATION_SECONDS || 30);
  const maxDurationSeconds = Number.isFinite(rawMaxDuration)
    ? Math.min(
        KLING_V4_MAX_DURATION,
        Math.max(KLING_V4_MIN_DURATION, Math.floor(rawMaxDuration))
      )
    : KLING_V4_MAX_DURATION;

  const rawMaxDaily = Number(process.env.VIDEO_MAX_DAILY_GENERATIONS || 20);
  const maxDailyGenerations =
    Number.isFinite(rawMaxDaily) && rawMaxDaily > 0
      ? Math.floor(rawMaxDaily)
      : 20;

  const rawMaxMonthlyBudget = Number(
    process.env.VIDEO_MAX_MONTHLY_BUDGET_USD || 50
  );
  const maxMonthlyBudgetUsd =
    Number.isFinite(rawMaxMonthlyBudget) && rawMaxMonthlyBudget > 0
      ? Math.round(rawMaxMonthlyBudget * 100) / 100
      : 50;

  return {
    maxDurationSeconds,
    maxDailyGenerations,
    maxMonthlyBudgetUsd,
  };
}

/**
 * Résout les identifiants Higgsfield côté serveur uniquement (jamais exposés au client).
 * Formats officiels supportés :
 * 1. HF_API_KEY_ID + HF_API_KEY_SECRET
 * 2. HF_CREDENTIALS="KEY_ID:KEY_SECRET" (format SDK TypeScript v2)
 * 3. HF_KEY="KEY_ID:KEY_SECRET" (format cURL/Python officiel)
 * 4. Alias de compatibilité serveur (HIGGSFIELD_API_KEY / higgsfiel_api_key au format "id:secret")
 */
function resolveHiggsfieldAuthorizationHeader(): string {
  const keyId = (process.env.HF_API_KEY_ID || "").trim();
  const keySecret = (process.env.HF_API_KEY_SECRET || "").trim();

  if (keyId && keySecret) {
    return `Key ${keyId}:${keySecret}`;
  }

  const combinedCandidates = [
    process.env.HF_CREDENTIALS,
    process.env.HF_KEY,
    process.env.HIGGSFIELD_API_KEY,
    process.env.higgsfiel_api_key,
  ];

  for (const candidate of combinedCandidates) {
    const trimmed = (candidate || "").trim().replace(/^["']|["']$/g, "");
    if (!trimmed) continue;
    const withoutPrefix = trimmed.startsWith("Key ")
      ? trimmed.slice(4).trim()
      : trimmed;
    const colonIdx = withoutPrefix.indexOf(":");
    if (
      colonIdx > 0 &&
      colonIdx < withoutPrefix.length - 1 &&
      !withoutPrefix.includes(" ")
    ) {
      return `Key ${withoutPrefix}`;
    }
  }

  throw new HiggsfieldClientError({
    message:
      "Identifiants Higgsfield non configurés côté serveur. Définissez HF_API_KEY_ID et HF_API_KEY_SECRET (ou HF_CREDENTIALS au format ID:SECRET) dans vos variables d'environnement.",
    statusCode: 503,
    code: "missing_credentials",
  });
}

/**
 * Résout l'URL de webhook HTTPS publique si configurée avec HF_WEBHOOK_SECRET.
 * Higgsfield exige une URL HTTPS joignable publiquement (pas de localhost).
 */
export function resolveWebhookUrl(): string | null {
  const secret = (process.env.HF_WEBHOOK_SECRET || "").trim();
  if (!secret) return null;

  const explicitUrl = (process.env.HF_WEBHOOK_URL || "").trim();
  if (explicitUrl) {
    try {
      const parsed = new URL(explicitUrl);
      if (
        parsed.protocol === "https:" &&
        parsed.hostname !== "localhost" &&
        parsed.hostname !== "127.0.0.1"
      ) {
        return parsed.toString();
      }
    } catch {
      return null;
    }
  }

  const prodHost = (
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ""
  ).trim();
  if (!prodHost) return null;

  try {
    const base = prodHost.startsWith("http")
      ? prodHost
      : `https://${prodHost}`;
    const parsed = new URL("/api/webhooks/higgsfield", base);
    if (
      parsed.protocol === "https:" &&
      parsed.hostname !== "localhost" &&
      parsed.hostname !== "127.0.0.1"
    ) {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Nettoie toute chaîne d'erreur pour garantir qu'aucun secret ne fuite dans les logs ou réponses.
 */
export function sanitizeDiagnosticText(input: unknown): string {
  const raw =
    typeof input === "string"
      ? input
      : input instanceof Error
      ? input.message
      : "";
  if (!raw) return "";

  return raw
    .replace(/Key\s+[^\s"']+/gi, "Key [REDACTED]")
    .replace(/whsec_[^\s"']+/gi, "whsec_[REDACTED]")
    .slice(0, 300);
}

/**
 * Traduit les codes HTTP synchrones Higgsfield en messages d'erreur clairs en français.
 */
function mapHttpErrorToFrench(
  status: number,
  body: any,
  correlationId?: string,
  retryAfterHeader?: string | null
): HiggsfieldClientError {
  const retryAfterSeconds = retryAfterHeader
    ? Number.parseInt(retryAfterHeader, 10) || undefined
    : undefined;

  const detailStr =
    typeof body?.detail === "string"
      ? sanitizeDiagnosticText(body.detail)
      : Array.isArray(body?.detail)
      ? body.detail
          .map((d: any) =>
            typeof d?.msg === "string" ? sanitizeDiagnosticText(d.msg) : ""
          )
          .filter(Boolean)
          .join("; ")
      : "";

  const lowerDetail = detailStr.toLowerCase();

  if (status === 401) {
    return new HiggsfieldClientError({
      message:
        "Authentification Higgsfield refusée (401). Vérifiez vos variables serveur HF_API_KEY_ID et HF_API_KEY_SECRET.",
      statusCode: 502,
      code: "higgsfield_unauthorized",
      correlationId,
    });
  }

  if (status === 403) {
    return new HiggsfieldClientError({
      message:
        "Crédits Higgsfield insuffisants ou accès refusé pour ce compte (403). Rechargez votre solde sur console.higgsfield.ai.",
      statusCode: 402,
      code: "insufficient_credits",
      correlationId,
    });
  }

  if (status === 404) {
    return new HiggsfieldClientError({
      message:
        "Modèle ou requête introuvable sur ce compte Higgsfield (404).",
      statusCode: 404,
      code: "not_found",
      correlationId,
    });
  }

  if (status === 409) {
    return new HiggsfieldClientError({
      message:
        "Cette génération est encore en file d'attente ou en cours d'exécution chez Higgsfield (409).",
      statusCode: 409,
      code: "conflict_in_progress",
      correlationId,
    });
  }

  if (status === 422) {
    if (lowerDetail.includes("idempotency")) {
      return new HiggsfieldClientError({
        message:
          "Clé d'idempotence déjà utilisée avec des paramètres différents. Veuillez relancer une nouvelle demande.",
        statusCode: 422,
        code: "idempotency_mismatch",
        correlationId,
      });
    }
    return new HiggsfieldClientError({
      message:
        "Paramètres refusés par la validation Higgsfield (422). Vérifiez le prompt, la durée, la résolution ou l'image fournie.",
      statusCode: 422,
      code: "validation_failed",
      correlationId,
    });
  }

  if (status === 423) {
    return new HiggsfieldClientError({
      message:
        "Le modèle Kling 4.0 est temporairement indisponible (423). Réessayez dans quelques instants.",
      statusCode: 503,
      code: "model_locked",
      correlationId,
    });
  }

  if (status === 429) {
    const waitHint = retryAfterSeconds
      ? ` Réessayez dans ${retryAfterSeconds} s.`
      : " Réessayez dans quelques instants.";
    return new HiggsfieldClientError({
      message: `File d'attente ou limite de débit Higgsfield atteinte (429).${waitHint}`,
      statusCode: 429,
      code: "rate_limited",
      correlationId,
      retryAfterSeconds,
    });
  }

  if (status === 400) {
    if (
      lowerDetail.includes("moderation") ||
      lowerDetail.includes("nsfw") ||
      lowerDetail.includes("safety") ||
      lowerDetail.includes("policy")
    ) {
      return new HiggsfieldClientError({
        message:
          "Votre requête a été refusée par le filtre de modération de contenu.",
        statusCode: 400,
        code: "content_moderated",
        correlationId,
      });
    }
    return new HiggsfieldClientError({
      message:
        "Requête invalide refusée par l'API Higgsfield (400). Vérifiez les paramètres ou le média d'entrée.",
      statusCode: 400,
      code: "bad_request",
      correlationId,
    });
  }

  if (status === 503) {
    return new HiggsfieldClientError({
      message:
        "Le service Kling 4.0 chez Higgsfield est momentanément saturé ou en maintenance (503). Réessayez dans quelques minutes.",
      statusCode: 503,
      code: "service_unavailable",
      correlationId,
    });
  }

  return new HiggsfieldClientError({
    message: `Erreur serveur Higgsfield (${status}). Veuillez réessayer ultérieurement.`,
    statusCode: 502,
    code: "upstream_error",
    correlationId,
  });
}

export interface ValidatedGenerationInput {
  mode: KlingV4Mode;
  modelId: string;
  prompt: string | null;
  duration: number;
  resolution: KlingV4Resolution;
  aspectRatio: string | null;
  inputImageUrl: string | null;
  endImageUrl: string | null;
  idempotencyKey: string;
  estimatedCostUsd: number;
  higgsfieldBody: Record<string, unknown>;
}

function isSafeHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local") ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function normalizeIdempotencyKey(raw?: unknown): string {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    // 1-255 caractères ASCII visibles sans espace (spécification headers.md / idempotency.md)
    if (
      trimmed.length >= 8 &&
      trimmed.length <= 255 &&
      /^[\x21-\x7E]+$/.test(trimmed)
    ) {
      return trimmed;
    }
  }
  return crypto.randomUUID();
}

/**
 * Validation stricte côté serveur de tous les paramètres avant appel Higgsfield.
 * Ne laisse passer que les champs exacts documentés pour chaque mode Kling 4.0.
 */
export function validateVideoGenerationPayload(
  raw: Partial<CreateVideoPayload> | null | undefined
): ValidatedGenerationInput {
  if (!raw || typeof raw !== "object") {
    throw new HiggsfieldClientError({
      message: "Corps de requête invalide.",
      statusCode: 400,
      code: "invalid_body",
    });
  }

  const mode = raw.mode as KlingV4Mode;
  const modeDef = mode ? KLING_V4_MODES[mode] : undefined;
  if (!modeDef) {
    throw new HiggsfieldClientError({
      message:
        "Mode de génération invalide. Modes autorisés : Texte → Vidéo ou Image → Vidéo.",
      statusCode: 400,
      code: "invalid_mode",
    });
  }

  const { maxDurationSeconds } = getVideoGuardrailsConfig();

  const durationNum = Number(raw.duration);
  if (
    !Number.isInteger(durationNum) ||
    durationNum < KLING_V4_MIN_DURATION ||
    durationNum > KLING_V4_MAX_DURATION
  ) {
    throw new HiggsfieldClientError({
      message: `La durée doit être un nombre entier compris entre ${KLING_V4_MIN_DURATION} et ${KLING_V4_MAX_DURATION} secondes.`,
      statusCode: 400,
      code: "invalid_duration",
    });
  }

  if (durationNum > maxDurationSeconds) {
    throw new HiggsfieldClientError({
      message: `La durée demandée (${durationNum} s) dépasse la limite maximale configurée (${maxDurationSeconds} s par vidéo).`,
      statusCode: 400,
      code: "max_duration_exceeded",
    });
  }

  const resolution = raw.resolution as KlingV4Resolution;
  if (!KLING_V4_RESOLUTIONS.includes(resolution)) {
    throw new HiggsfieldClientError({
      message: "Résolution non autorisée. Choisissez 720p ou 1080p.",
      statusCode: 400,
      code: "invalid_resolution",
    });
  }

  const rawPrompt = typeof raw.prompt === "string" ? raw.prompt.trim() : "";
  if (rawPrompt.length > KLING_V4_MAX_PROMPT_LENGTH) {
    throw new HiggsfieldClientError({
      message: `Le prompt est trop long (${rawPrompt.length} caractères, maximum ${KLING_V4_MAX_PROMPT_LENGTH}).`,
      statusCode: 400,
      code: "prompt_too_long",
    });
  }

  if (modeDef.requiresPrompt && rawPrompt.length < 1) {
    throw new HiggsfieldClientError({
      message: "Veuillez saisir un prompt décrivant la vidéo à générer.",
      statusCode: 400,
      code: "prompt_required",
    });
  }

  let aspectRatio: string | null = null;
  if (modeDef.supportsAspectRatio) {
    const candidateRatio = (raw.aspect_ratio || "16:9").trim();
    if (!modeDef.allowedAspectRatios.includes(candidateRatio)) {
      throw new HiggsfieldClientError({
        message: `Ratio d'affichage invalide (${candidateRatio}). Valeurs acceptées : ${modeDef.allowedAspectRatios.join(", ")}.`,
        statusCode: 400,
        code: "invalid_aspect_ratio",
      });
    }
    aspectRatio = candidateRatio;
  }

  let inputImageUrl: string | null = null;
  let endImageUrl: string | null = null;
  let inputVideosCount = 0;
  const higgsfieldBody: Record<string, unknown> = {
    duration: durationNum,
    resolution,
  };

  if (rawPrompt.length > 0) {
    higgsfieldBody.prompt = rawPrompt;
  }

  if (mode === "text-to-video") {
    higgsfieldBody.aspect_ratio = aspectRatio || "16:9";
  } else if (mode === "image-to-video") {
    const startUrl = (raw.image_url || "").trim();
    if (!startUrl || !isSafeHttpsUrl(startUrl)) {
      throw new HiggsfieldClientError({
        message:
          "Une image de départ valide est obligatoire pour le mode Cadres (Image → Vidéo).",
        statusCode: 400,
        code: "start_image_required",
      });
    }
    inputImageUrl = startUrl;
    higgsfieldBody.image_url = startUrl;

    const middleUrls = Array.isArray(raw.image_urls)
      ? raw.image_urls.map((u) => String(u).trim()).filter(Boolean)
      : [];
    if (middleUrls.length > KLING_V4_MAX_MIDDLE_FRAMES) {
      throw new HiggsfieldClientError({
        message: `Vous pouvez ajouter au maximum ${KLING_V4_MAX_MIDDLE_FRAMES} images intermédiaires (soit 10 images au total avec le départ et la fin).`,
        statusCode: 400,
        code: "too_many_middle_frames",
      });
    }
    if (!middleUrls.every(isSafeHttpsUrl)) {
      throw new HiggsfieldClientError({
        message: "Une ou plusieurs images intermédiaires ont une URL invalide.",
        statusCode: 400,
        code: "invalid_middle_frames",
      });
    }
    if (middleUrls.length > 0) {
      higgsfieldBody.image_urls = middleUrls;
    }

    const endUrl = (raw.end_image_url || "").trim();
    if (endUrl) {
      if (!isSafeHttpsUrl(endUrl)) {
        throw new HiggsfieldClientError({
          message: "L'URL de l'image de fin est invalide.",
          statusCode: 400,
          code: "invalid_end_image",
        });
      }
      endImageUrl = endUrl;
      higgsfieldBody.end_image_url = endUrl;
    }
  } else if (mode === "reference-to-video") {
    const imageUrls = Array.isArray(raw.image_urls)
      ? raw.image_urls.map((u) => String(u).trim()).filter(Boolean)
      : [];
    const videoUrls = Array.isArray(raw.video_urls)
      ? raw.video_urls.map((u) => String(u).trim()).filter(Boolean)
      : [];

    if (imageUrls.length === 0 && videoUrls.length === 0) {
      throw new HiggsfieldClientError({
        message:
          "Ajoutez au moins une image ou une vidéo de référence (jusqu'à 10 images et 5 vidéos).",
        statusCode: 400,
        code: "reference_required",
      });
    }
    if (imageUrls.length > KLING_V4_MAX_REFERENCE_IMAGES) {
      throw new HiggsfieldClientError({
        message: `Maximum ${KLING_V4_MAX_REFERENCE_IMAGES} images de référence autorisées.`,
        statusCode: 400,
        code: "too_many_reference_images",
      });
    }
    if (videoUrls.length > KLING_V4_MAX_REFERENCE_VIDEOS) {
      throw new HiggsfieldClientError({
        message: `Maximum ${KLING_V4_MAX_REFERENCE_VIDEOS} vidéos de référence autorisées.`,
        statusCode: 400,
        code: "too_many_reference_videos",
      });
    }
    if (!imageUrls.every(isSafeHttpsUrl) || !videoUrls.every(isSafeHttpsUrl)) {
      throw new HiggsfieldClientError({
        message: "Une ou plusieurs références média ont une URL invalide.",
        statusCode: 400,
        code: "invalid_references",
      });
    }
    if (imageUrls.length > 0) higgsfieldBody.image_urls = imageUrls;
    if (videoUrls.length > 0) higgsfieldBody.video_urls = videoUrls;
    inputImageUrl = imageUrls[0] || videoUrls[0] || null;
    inputVideosCount = videoUrls.length;
    higgsfieldBody.aspect_ratio = aspectRatio || "adaptive";
  } else if (mode === "video-edit") {
    const srcVideoUrl = (raw.video_url || "").trim();
    if (!srcVideoUrl || !isSafeHttpsUrl(srcVideoUrl)) {
      throw new HiggsfieldClientError({
        message: "Une vidéo source valide est requise pour l'édition vidéo.",
        statusCode: 400,
        code: "source_video_required",
      });
    }
    inputVideosCount = 1;
    higgsfieldBody.video_url = srcVideoUrl;
    higgsfieldBody.aspect_ratio = aspectRatio || "adaptive";
  }

  const rawInputVideoDur = Number(raw.total_input_video_duration_sec || 0);
  const safeInputVideoDur =
    Number.isFinite(rawInputVideoDur) && rawInputVideoDur > 0
      ? Math.min(30, rawInputVideoDur)
      : undefined;

  const idempotencyKey = normalizeIdempotencyKey(raw.idempotency_key);
  const estimatedCostUsd = estimateVideoCostUsd({
    mode,
    duration: durationNum,
    resolution,
    inputVideosCount,
    totalInputVideoDurationSec: safeInputVideoDur,
  });

  return {
    mode,
    modelId: modeDef.modelId,
    prompt: rawPrompt || null,
    duration: durationNum,
    resolution,
    aspectRatio,
    inputImageUrl,
    endImageUrl,
    idempotencyKey,
    estimatedCostUsd,
    higgsfieldBody,
  };
}

/**
 * Vérifie les octets d'en-tête (magic bytes) d'une image téléversée (JPEG, PNG, WebP).
 */
export function validateUploadedImageBuffer(
  buffer: Buffer,
  declaredMimeType: string
): "image/jpeg" | "image/png" | "image/webp" {
  const mime = declaredMimeType.toLowerCase().trim();
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      mime as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
    )
  ) {
    throw new HiggsfieldClientError({
      message:
        "Format d'image non supporté. Utilisez uniquement JPG, PNG ou WebP.",
      statusCode: 400,
      code: "unsupported_image_type",
    });
  }

  if (buffer.byteLength === 0) {
    throw new HiggsfieldClientError({
      message: "Le fichier image est vide.",
      statusCode: 400,
      code: "empty_image",
    });
  }

  if (buffer.byteLength > MAX_UPLOAD_IMAGE_BYTES) {
    throw new HiggsfieldClientError({
      message: `L'image dépasse la taille maximale autorisée (${Math.round(
        MAX_UPLOAD_IMAGE_BYTES / (1024 * 1024)
      )} Mo).`,
      statusCode: 413,
      code: "image_too_large",
    });
  }

  // JPEG: FF D8 FF
  const isJpeg =
    buffer.byteLength >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer.byteLength >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;

  // WebP: "RIFF"...."WEBP"
  const isWebp =
    buffer.byteLength >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";

  if (isJpeg && (mime === "image/jpeg" || mime === "image/jpg")) {
    return "image/jpeg";
  }
  if (isPng && mime === "image/png") {
    return "image/png";
  }
  if (isWebp && mime === "image/webp") {
    return "image/webp";
  }

  throw new HiggsfieldClientError({
    message:
      "Le contenu du fichier ne correspond pas à une image JPG, PNG ou WebP valide.",
    statusCode: 400,
    code: "invalid_image_signature",
  });
}

/**
 * Génère côté serveur une URL pré-signée temporaire Higgsfield (POST /files/generate-upload-url)
 * pour une image (JPG, PNG, WebP, GIF <= 15 Mo) ou une vidéo (MP4 <= 100 Mo).
 * Les identifiants Higgsfield restent strictement côté serveur.
 */
export async function createHiggsfieldPresignedUpload(params: {
  contentType: string;
  sizeBytes: number;
}): Promise<{
  uploadUrl: string;
  publicUrl: string;
  uploadHeaders: Record<string, string>;
  normalizedContentType: string;
}> {
  const rawMime = (params.contentType || "").toLowerCase().trim();
  const normalizedMime = rawMime === "image/jpg" ? "image/jpeg" : rawMime;

  const isAllowedImage = ALLOWED_IMAGE_MIME_TYPES.includes(
    normalizedMime as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
  );
  const isAllowedVideo = ALLOWED_VIDEO_MIME_TYPES.includes(
    normalizedMime as (typeof ALLOWED_VIDEO_MIME_TYPES)[number]
  );

  if (!isAllowedImage && !isAllowedVideo) {
    throw new HiggsfieldClientError({
      message:
        "Format de fichier non supporté. Utilisez des images (JPG, PNG, WebP, GIF) ou des vidéos (MP4).",
      statusCode: 400,
      code: "unsupported_media_type",
    });
  }

  if (!Number.isFinite(params.sizeBytes) || params.sizeBytes <= 0) {
    throw new HiggsfieldClientError({
      message: "Taille du fichier invalide ou fichier vide.",
      statusCode: 400,
      code: "invalid_file_size",
    });
  }

  const maxBytes = isAllowedVideo
    ? MAX_PRESIGNED_VIDEO_BYTES
    : MAX_PRESIGNED_IMAGE_BYTES;

  if (params.sizeBytes > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw new HiggsfieldClientError({
      message: isAllowedVideo
        ? `La vidéo sélectionnée dépasse la taille maximale autorisée (${maxMb} Mo par vidéo MP4).`
        : `L'image sélectionnée dépasse la taille maximale autorisée (${maxMb} Mo par image).`,
      statusCode: 413,
      code: "media_too_large",
    });
  }

  const authHeader = resolveHiggsfieldAuthorizationHeader();
  const presignRes = await fetch(
    `${HIGGSFIELD_API_BASE_URL}/files/generate-upload-url`,
    {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content_type: normalizedMime }),
      cache: "no-store",
      signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
    }
  );

  const correlationId = presignRes.headers.get("x-correlation-id") || undefined;

  if (!presignRes.ok) {
    const errBody = await presignRes.json().catch(() => null);
    throw mapHttpErrorToFrench(
      presignRes.status,
      errBody,
      correlationId,
      presignRes.headers.get("retry-after")
    );
  }

  const presignData = (await presignRes.json()) as {
    public_url?: string;
    upload_url?: string;
    upload_headers?: Record<string, string>;
  };

  if (!presignData.upload_url || !presignData.public_url) {
    throw new HiggsfieldClientError({
      message:
        "Réponse incomplète lors de la génération de l'URL de téléversement Higgsfield.",
      statusCode: 502,
      code: "invalid_upload_response",
      correlationId,
    });
  }

  return {
    uploadUrl: presignData.upload_url,
    publicUrl: presignData.public_url,
    uploadHeaders: {
      "Content-Type": normalizedMime,
      ...(presignData.upload_headers || {}),
    },
    normalizedContentType: normalizedMime,
  };
}

/**
 * Téléverse une image vers le stockage d'entrée temporaire officiel Higgsfield
 * (POST /files/generate-upload-url -> PUT presigned upload_url).
 */
export async function uploadInputImageToHiggsfield(
  buffer: Buffer,
  contentType: "image/jpeg" | "image/png" | "image/webp"
): Promise<string> {
  const authHeader = resolveHiggsfieldAuthorizationHeader();

  // Étape 1 : Générer l'URL pré-signée
  const presignRes = await fetch(
    `${HIGGSFIELD_API_BASE_URL}/files/generate-upload-url`,
    {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content_type: contentType }),
      cache: "no-store",
      signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
    }
  );

  const correlationId = presignRes.headers.get("x-correlation-id") || undefined;

  if (!presignRes.ok) {
    const errBody = await presignRes.json().catch(() => null);
    throw mapHttpErrorToFrench(
      presignRes.status,
      errBody,
      correlationId,
      presignRes.headers.get("retry-after")
    );
  }

  const presignData = (await presignRes.json()) as {
    public_url?: string;
    upload_url?: string;
    upload_headers?: Record<string, string>;
  };

  if (!presignData.upload_url || !presignData.public_url) {
    throw new HiggsfieldClientError({
      message:
        "Réponse incomplète lors de la préparation du téléversement chez Higgsfield.",
      statusCode: 502,
      code: "invalid_upload_response",
      correlationId,
    });
  }

  // Étape 2 : Envoyer le binaire avec les upload_headers exacts SANS l'en-tête Authorization Higgsfield
  const uploadHeaders: Record<string, string> = {
    "Content-Type": contentType,
    ...(presignData.upload_headers || {}),
  };

  const putRes = await fetch(presignData.upload_url, {
    method: "PUT",
    headers: uploadHeaders,
    body: new Uint8Array(buffer),
    cache: "no-store",
    signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
  });

  if (!putRes.ok) {
    throw new HiggsfieldClientError({
      message: `Échec du téléversement de l'image vers le CDN Higgsfield (${putRes.status}).`,
      statusCode: 502,
      code: "presigned_put_failed",
      correlationId,
    });
  }

  return presignData.public_url;
}

export interface HiggsfieldSubmissionReceipt {
  requestId: string;
  status: VideoGenerationStatus;
  statusUrl: string;
  cancelUrl: string | null;
  expiresAfterSeconds: number;
  correlationId?: string;
}

/**
 * Soumet de manière asynchrone (non-bloquante) une génération Kling 4.0 chez Higgsfield
 * avec en-tête Idempotency-Key et paramètre optionnel hf_webhook.
 */
export async function submitHiggsfieldGeneration(params: {
  modelId: string;
  body: Record<string, unknown>;
  idempotencyKey: string;
}): Promise<HiggsfieldSubmissionReceipt> {
  const authHeader = resolveHiggsfieldAuthorizationHeader();
  const cleanModelPath = params.modelId.replace(/^\/+/, "");
  const webhookUrl = resolveWebhookUrl();

  const endpointUrl = new URL(
    `/${cleanModelPath}`,
    HIGGSFIELD_API_BASE_URL
  );
  if (webhookUrl) {
    endpointUrl.searchParams.set("hf_webhook", webhookUrl);
  }

  const res = await fetch(endpointUrl.toString(), {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      "Idempotency-Key": params.idempotencyKey,
    },
    body: JSON.stringify(params.body),
    cache: "no-store",
    signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
  });

  const correlationId = res.headers.get("x-correlation-id") || undefined;

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw mapHttpErrorToFrench(
      res.status,
      errBody,
      correlationId,
      res.headers.get("retry-after")
    );
  }

  const data = (await res.json()) as {
    request_id?: string;
    status?: string;
    status_url?: string;
    cancel_url?: string;
    expires_after?: number;
  };

  if (!data.request_id) {
    throw new HiggsfieldClientError({
      message:
        "Réponse inattendue de Higgsfield : identifiant de requête (request_id) absent.",
      statusCode: 502,
      code: "missing_request_id",
      correlationId,
    });
  }

  const statusUrl =
    data.status_url ||
    `${HIGGSFIELD_API_BASE_URL}/requests/${data.request_id}/status`;
  const cancelUrl =
    data.cancel_url ||
    `${HIGGSFIELD_API_BASE_URL}/requests/${data.request_id}/cancel`;

  const validStatuses: VideoGenerationStatus[] = [
    "queued",
    "in_progress",
    "completed",
    "failed",
    "nsfw",
    "canceled",
  ];
  const initialStatus = validStatuses.includes(
    data.status as VideoGenerationStatus
  )
    ? (data.status as VideoGenerationStatus)
    : "queued";

  return {
    requestId: data.request_id,
    status: initialStatus,
    statusUrl,
    cancelUrl,
    expiresAfterSeconds:
      typeof data.expires_after === "number" && data.expires_after > 0
        ? data.expires_after
        : HIGGSFIELD_DEFAULT_RETENTION_SECONDS,
    correlationId,
  };
}

export interface HiggsfieldStatusResult {
  status: VideoGenerationStatus;
  videoUrl: string | null;
  expiresAt: string | null;
  errorMessage: string | null;
  correlationId?: string;
}

function isAllowedHiggsfieldApiUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    return u.protocol === "https:" && u.hostname === "api.higgsfield.ai";
  } catch {
    return false;
  }
}

/**
 * Interroge de manière non-bloquante le statut d'un job chez Higgsfield.
 */
export async function fetchHiggsfieldJobStatus(params: {
  requestId: string;
  statusUrl?: string | null;
}): Promise<HiggsfieldStatusResult> {
  const authHeader = resolveHiggsfieldAuthorizationHeader();
  const targetUrl =
    params.statusUrl && isAllowedHiggsfieldApiUrl(params.statusUrl)
      ? params.statusUrl
      : `${HIGGSFIELD_API_BASE_URL}/requests/${encodeURIComponent(
          params.requestId
        )}/status`;

  const res = await fetch(targetUrl, {
    method: "GET",
    headers: {
      Authorization: authHeader,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const correlationId = res.headers.get("x-correlation-id") || undefined;

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw mapHttpErrorToFrench(
      res.status,
      errBody,
      correlationId,
      res.headers.get("retry-after")
    );
  }

  const data = (await res.json()) as {
    status?: string;
    video?: { url?: string };
    expires_at?: string;
    error?: string;
  };

  const status = (data.status || "in_progress") as VideoGenerationStatus;

  if (status === "completed") {
    const videoUrl = data.video?.url || null;
    const expiresAt =
      data.expires_at ||
      new Date(
        Date.now() + HIGGSFIELD_DEFAULT_RETENTION_SECONDS * 1000
      ).toISOString();

    return {
      status: "completed",
      videoUrl,
      expiresAt,
      errorMessage: null,
      correlationId,
    };
  }

  if (status === "nsfw") {
    return {
      status: "nsfw",
      videoUrl: null,
      expiresAt: null,
      errorMessage:
        "Contenu refusé par la modération automatique de sécurité Higgsfield (aucun crédit débité).",
      correlationId,
    };
  }

  if (status === "failed") {
    const cleanErr = data.error ? sanitizeDiagnosticText(data.error) : "";
    return {
      status: "failed",
      videoUrl: null,
      expiresAt: null,
      errorMessage: cleanErr
        ? `La génération a échoué chez Higgsfield (${cleanErr}). Aucun crédit n'a été débité.`
        : "La génération a échoué chez Higgsfield (aucun crédit débité).",
      correlationId,
    };
  }

  if (status === "canceled") {
    return {
      status: "canceled",
      videoUrl: null,
      expiresAt: null,
      errorMessage:
        "Génération annulée avant traitement (crédits réservés remboursés).",
      correlationId,
    };
  }

  return {
    status: status === "queued" ? "queued" : "in_progress",
    videoUrl: null,
    expiresAt: null,
    errorMessage: null,
    correlationId,
  };
}

/**
 * Annule une requête encore en file d'attente (`queued`) via POST /requests/{id}/cancel.
 * Renvoie true si accepté (202), false si le traitement a déjà commencé (400).
 */
export async function cancelHiggsfieldQueuedJob(params: {
  requestId: string;
  cancelUrl?: string | null;
}): Promise<{ canceled: boolean; message: string }> {
  const authHeader = resolveHiggsfieldAuthorizationHeader();
  const targetUrl =
    params.cancelUrl && isAllowedHiggsfieldApiUrl(params.cancelUrl)
      ? params.cancelUrl
      : `${HIGGSFIELD_API_BASE_URL}/requests/${encodeURIComponent(
          params.requestId
        )}/cancel`;

  const res = await fetch(targetUrl, {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (res.status === 202 || res.status === 200) {
    return {
      canceled: true,
      message: "La génération en file d'attente a bien été annulée.",
    };
  }

  if (res.status === 400) {
    return {
      canceled: false,
      message:
        "Le calcul vidéo a déjà commencé sur les serveurs Higgsfield et ne peut plus être annulé.",
    };
  }

  const errBody = await res.json().catch(() => null);
  throw mapHttpErrorToFrench(
    res.status,
    errBody,
    res.headers.get("x-correlation-id") || undefined,
    res.headers.get("retry-after")
  );
}

/**
 * Supprime les données d'une requête terminée chez Higgsfield (DELETE /requests/{request_id}).
 * Opération best-effort lors de la suppression depuis la galerie.
 */
export async function deleteHiggsfieldRequestData(
  requestId: string
): Promise<void> {
  try {
    const authHeader = resolveHiggsfieldAuthorizationHeader();
    await fetch(
      `${HIGGSFIELD_API_BASE_URL}/requests/${encodeURIComponent(requestId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );
  } catch {
    // Non-bloquant si la requête a déjà expiré ou si les clés ne sont pas configurées
  }
}

/**
 * Vérification cryptographique d'authenticité Standard Webhooks (webhooks.md / webhook-security.md) :
 * - En-têtes requis : webhook-id, webhook-timestamp, webhook-signature
 * - Tolérance d'horodatage : ± 5 minutes (300 s)
 * - Clé secrète : HF_WEBHOOK_SECRET préfixée par "whsec_" puis décodée en base64
 * - Contenu signé : "{webhook-id}.{webhook-timestamp}.{rawBody}" en HMAC-SHA256
 */
export function verifyHiggsfieldWebhookSignature(params: {
  rawBody: string;
  webhookId: string | null;
  webhookTimestamp: string | null;
  webhookSignature: string | null;
}): boolean {
  const secretRaw = (process.env.HF_WEBHOOK_SECRET || "").trim();
  if (!secretRaw || !secretRaw.startsWith("whsec_")) {
    return false;
  }

  const { rawBody, webhookId, webhookTimestamp, webhookSignature } = params;
  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return false;
  }

  const tsSeconds = Number.parseInt(webhookTimestamp, 10);
  if (!Number.isFinite(tsSeconds)) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - tsSeconds) > 300) {
    return false;
  }

  const base64Secret = secretRaw.slice("whsec_".length);
  let keyBuffer: Buffer;
  try {
    keyBuffer = Buffer.from(base64Secret, "base64");
    if (keyBuffer.byteLength === 0) return false;
  } catch {
    return false;
  }

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const expectedBase64 = crypto
    .createHmac("sha256", keyBuffer)
    .update(signedContent, "utf8")
    .digest("base64");

  const expectedBuf = Buffer.from(expectedBase64, "utf8");

  const signatures = webhookSignature.trim().split(/\s+/);
  for (const entry of signatures) {
    if (!entry.startsWith("v1,")) continue;
    const candidate = entry.slice(3);
    const candidateBuf = Buffer.from(candidate, "utf8");
    if (
      candidateBuf.byteLength === expectedBuf.byteLength &&
      crypto.timingSafeEqual(candidateBuf, expectedBuf)
    ) {
      return true;
    }
  }

  return false;
}

export function buildQuotaExceededMessage(params: {
  type: "daily" | "monthly";
  limit: number;
  used: number;
}): string {
  if (params.type === "daily") {
    return `Limite quotidienne atteinte : ${params.used}/${params.limit} générations effectuées aujourd'hui. Vous pouvez ajuster VIDEO_MAX_DAILY_GENERATIONS dans la configuration serveur.`;
  }
  return `Plafond budgétaire mensuel atteint (${formatUsd(
    params.used
  )} / ${formatUsd(
    params.limit
  )}). Ajustez VIDEO_MAX_MONTHLY_BUDGET_USD si vous souhaitez relever la limite.`;
}

