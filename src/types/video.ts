export type KlingV4Mode =
  | "text-to-video"
  | "image-to-video"
  | "reference-to-video"
  | "video-edit";

export type KlingV4Resolution = "720p" | "1080p";

export type KlingV4TextAspectRatio = "16:9" | "9:16" | "1:1" | "21:9";

export type KlingV4ExtendedAspectRatio = KlingV4TextAspectRatio | "adaptive";

export type VideoGenerationStatus =
  | "queued"
  | "in_progress"
  | "completed"
  | "failed"
  | "nsfw"
  | "canceled";

export interface VideoGenerationRecord {
  id: string;
  request_id: string | null;
  idempotency_key: string;
  mode: KlingV4Mode;
  model_id: string;
  prompt: string | null;
  duration: number;
  resolution: KlingV4Resolution;
  aspect_ratio: string | null;
  input_image_url: string | null;
  end_image_url: string | null;
  status: VideoGenerationStatus;
  status_url: string | null;
  cancel_url: string | null;
  video_url: string | null;
  expires_at: string | null;
  estimated_cost_usd: number;
  error_message: string | null;
  correlation_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface VideoQuotaSummary {
  maxDurationSeconds: number;
  maxDailyGenerations: number;
  usedToday: number;
  maxMonthlyBudgetUsd: number;
  usedThisMonthUsd: number;
}

export interface CreateVideoPayload {
  mode: KlingV4Mode;
  prompt?: string;
  duration: number;
  resolution: KlingV4Resolution;
  aspect_ratio?: string;
  image_url?: string;
  end_image_url?: string;
  image_urls?: string[];
  video_url?: string;
  video_urls?: string[];
  total_input_video_duration_sec?: number;
  idempotency_key?: string;
}

