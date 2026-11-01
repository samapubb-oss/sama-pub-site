import type {
  KlingV4ExtendedAspectRatio,
  KlingV4Mode,
  KlingV4Resolution,
  KlingV4TextAspectRatio,
} from "@/types/video";

/**
 * Grille tarifaire indicative par seconde (en USD) pour Kling 4.0 sur Higgsfield.
 * Facilement modifiable en un seul endroit :
 * - Modes standard (text-to-video, image-to-video) : ~0,11 $/s en 720p, ~0,16 $/s en 1080p
 * - Mode reference-to-video / video-edit (tarifs officiels doc Higgsfield) :
 *   - Sans vidéo d'entrée : 0,157 $/s en 720p, 0,235 $/s en 1080p (facturé sur la durée de sortie)
 *   - Avec vidéo(s) d'entrée : 0,094 $/s en 720p, 0,141 $/s en 1080p
 *     facturé sur : durée_sortie + max(durée_totale_vidéos_entrée, durée_sortie)
 */
export const VIDEO_RATE_PER_SECOND_USD: Record<
  KlingV4Mode,
  Record<KlingV4Resolution, number>
> = {
  "text-to-video": {
    "720p": 0.11,
    "1080p": 0.16,
  },
  "image-to-video": {
    "720p": 0.11,
    "1080p": 0.16,
  },
  "reference-to-video": {
    "720p": 0.157,
    "1080p": 0.235,
  },
  "video-edit": {
    "720p": 0.157,
    "1080p": 0.235,
  },
};

export const REFERENCE_WITH_VIDEO_RATE_PER_SECOND_USD: Record<
  KlingV4Resolution,
  number
> = {
  "720p": 0.094,
  "1080p": 0.141,
};

export const KLING_V4_MIN_DURATION = 3;
export const KLING_V4_MAX_DURATION = 30;
export const KLING_V4_DEFAULT_DURATION = 5;
export const KLING_V4_MAX_PROMPT_LENGTH = 25000;

export const KLING_V4_MAX_REFERENCE_IMAGES = 10;
export const KLING_V4_MAX_REFERENCE_VIDEOS = 5;
export const KLING_V4_MAX_MIDDLE_FRAMES = 8; // 1 départ + 8 intermédiaires + 1 fin = 10 cadres max

export const KLING_V4_RESOLUTIONS: readonly KlingV4Resolution[] = [
  "720p",
  "1080p",
] as const;

export const KLING_V4_TEXT_ASPECT_RATIOS: readonly KlingV4TextAspectRatio[] = [
  "16:9",
  "9:16",
  "1:1",
  "21:9",
] as const;

export const KLING_V4_EXTENDED_ASPECT_RATIOS: readonly KlingV4ExtendedAspectRatio[] =
  ["adaptive", "16:9", "9:16", "1:1", "21:9"] as const;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_VIDEO_MIME_TYPES = ["video/mp4"] as const;

/**
 * Limites de taille pour les médias d'entrée :
 * - Route directe multipart serverless : 4 Mo
 * - Upload pré-signé S3 Higgsfield : 15 Mo par image, 100 Mo par vidéo MP4
 */
export const MAX_UPLOAD_IMAGE_BYTES = 4 * 1024 * 1024; // 4 Mo (fallback route multipart)
export const MAX_PRESIGNED_IMAGE_BYTES = 15 * 1024 * 1024; // 15 Mo par image
export const MAX_PRESIGNED_VIDEO_BYTES = 100 * 1024 * 1024; // 100 Mo par vidéo MP4

/**
 * Durée de rétention des fichiers générés chez Higgsfield (7 jours = 604 800 secondes).
 */
export const HIGGSFIELD_DEFAULT_RETENTION_SECONDS = 7 * 24 * 60 * 60;

export interface KlingV4ModeDefinition {
  mode: KlingV4Mode;
  modelId: string;
  label: string;
  shortLabel: string;
  description: string;
  enabledInUi: boolean;
  requiresPrompt: boolean;
  supportsAspectRatio: boolean;
  allowedAspectRatios: readonly string[];
}

export const KLING_V4_MODES: Record<KlingV4Mode, KlingV4ModeDefinition> = {
  "text-to-video": {
    mode: "text-to-video",
    modelId: "kling-video/v4.0/text-to-video",
    label: "Texte → Vidéo",
    shortLabel: "Texte → Vidéo",
    description:
      "Génère une vidéo originale à partir d'un prompt descriptif (scène, action, éclairage, mouvement de caméra).",
    enabledInUi: true,
    requiresPrompt: true,
    supportsAspectRatio: true,
    allowedAspectRatios: KLING_V4_TEXT_ASPECT_RATIOS,
  },
  "reference-to-video": {
    mode: "reference-to-video",
    modelId: "kling-video/v4.0/reference-to-video",
    label: "Références (jusqu'à 10 images & 5 vidéos)",
    shortLabel: "Références",
    description:
      "Crée une vidéo guidée par jusqu'à 10 images et 5 vidéos de référence (@image_1, @video_1).",
    enabledInUi: true,
    requiresPrompt: true,
    supportsAspectRatio: true,
    allowedAspectRatios: KLING_V4_EXTENDED_ASPECT_RATIOS,
  },
  "image-to-video": {
    mode: "image-to-video",
    modelId: "kling-video/v4.0/image-to-video",
    label: "Cadres (jusqu'à 10 images clés)",
    shortLabel: "Cadres",
    description:
      "Anime une séquence chronologique allant jusqu'à 10 images (1 départ + jusqu'à 8 intermédiaires + 1 fin).",
    enabledInUi: true,
    requiresPrompt: false,
    supportsAspectRatio: false,
    allowedAspectRatios: [],
  },
  "video-edit": {
    mode: "video-edit",
    modelId: "kling-video/v4.0/video-edit",
    label: "Édition Vidéo",
    shortLabel: "Édition",
    description:
      "Modifie une vidéo source (@video_1) à l'aide d'instructions textuelles et de références optionnelles.",
    enabledInUi: false,
    requiresPrompt: true,
    supportsAspectRatio: true,
    allowedAspectRatios: KLING_V4_EXTENDED_ASPECT_RATIOS,
  },
};

export function getRatePerSecondUsd(
  mode: KlingV4Mode,
  resolution: KlingV4Resolution,
  hasInputVideos = false
): number {
  if (
    (mode === "reference-to-video" || mode === "video-edit") &&
    hasInputVideos
  ) {
    return (
      REFERENCE_WITH_VIDEO_RATE_PER_SECOND_USD[resolution] ??
      REFERENCE_WITH_VIDEO_RATE_PER_SECOND_USD["1080p"]
    );
  }
  const modeRates =
    VIDEO_RATE_PER_SECOND_USD[mode] || VIDEO_RATE_PER_SECOND_USD["text-to-video"];
  return modeRates[resolution] ?? modeRates["1080p"];
}

export function estimateVideoCostUsd(params: {
  mode: KlingV4Mode;
  duration: number;
  resolution: KlingV4Resolution;
  inputVideosCount?: number;
  totalInputVideoDurationSec?: number;
}): number {
  const safeDuration = Number.isFinite(params.duration)
    ? Math.max(0, params.duration)
    : 0;
  const hasInputVideos = (params.inputVideosCount || 0) > 0;
  const rate = getRatePerSecondUsd(
    params.mode,
    params.resolution,
    hasInputVideos
  );

  // Règle officielle doc Higgsfield pour reference-to-video avec vidéo(s) d'entrée :
  // facturé sur : output_duration + max(total_input_video_duration, output_duration)
  if (
    (params.mode === "reference-to-video" || params.mode === "video-edit") &&
    hasInputVideos
  ) {
    const inputDur =
      typeof params.totalInputVideoDurationSec === "number" &&
      params.totalInputVideoDurationSec > 0
        ? params.totalInputVideoDurationSec
        : safeDuration * (params.inputVideosCount || 1);
    const billedSeconds = safeDuration + Math.max(inputDur, safeDuration);
    return Math.round(billedSeconds * rate * 10000) / 10000;
  }

  return Math.round(safeDuration * rate * 10000) / 10000;
}

export function formatUsd(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe) + " $"
  );
}

export const TERMINAL_VIDEO_STATUSES = new Set([
  "completed",
  "failed",
  "nsfw",
  "canceled",
]);

export const NON_BILLED_VIDEO_STATUSES = new Set([
  "failed",
  "nsfw",
  "canceled",
]);
