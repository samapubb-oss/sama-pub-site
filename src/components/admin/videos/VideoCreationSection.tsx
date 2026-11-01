"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Video,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Download,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Ban,
  Film,
  Info,
  Database,
  X,
  Plus,
  Layers,
} from "lucide-react";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  KLING_V4_DEFAULT_DURATION,
  KLING_V4_EXTENDED_ASPECT_RATIOS,
  KLING_V4_MAX_DURATION,
  KLING_V4_MAX_MIDDLE_FRAMES,
  KLING_V4_MAX_PROMPT_LENGTH,
  KLING_V4_MAX_REFERENCE_IMAGES,
  KLING_V4_MAX_REFERENCE_VIDEOS,
  KLING_V4_MIN_DURATION,
  KLING_V4_RESOLUTIONS,
  KLING_V4_TEXT_ASPECT_RATIOS,
  MAX_PRESIGNED_IMAGE_BYTES,
  MAX_PRESIGNED_VIDEO_BYTES,
  MAX_UPLOAD_IMAGE_BYTES,
  NON_BILLED_VIDEO_STATUSES,
  TERMINAL_VIDEO_STATUSES,
  estimateVideoCostUsd,
  formatUsd,
  getRatePerSecondUsd,
} from "@/lib/video-pricing";
import type {
  KlingV4ExtendedAspectRatio,
  KlingV4Mode,
  KlingV4Resolution,
  KlingV4TextAspectRatio,
  VideoGenerationRecord,
  VideoGenerationStatus,
  VideoQuotaSummary,
} from "@/types/video";
import {
  PromptMentionInput,
  renderFormattedPromptText,
  type PromptMediaOption,
} from "./PromptMentionInput";

const POLL_INTERVAL_MS = 4000;
const CLIENT_POLL_TIMEOUT_MS = 12 * 60 * 1000;

interface LocalMediaItem {
  localId: string;
  file: File;
  previewUrl: string;
  uploadedUrl: string | null;
  kind: "image" | "video";
  durationSec?: number;
}

const MIGRATION_SQL_SNIPPET = `-- Exécuter dans Supabase > SQL Editor (fichier supabase_videos_migration.sql)
CREATE TABLE IF NOT EXISTS public.video_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL,
  model_id TEXT NOT NULL,
  prompt TEXT,
  duration INTEGER NOT NULL CHECK (duration >= 3 AND duration <= 30),
  resolution TEXT NOT NULL CHECK (resolution IN ('720p', '1080p')),
  aspect_ratio TEXT,
  input_image_url TEXT,
  end_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (
    status IN ('queued', 'in_progress', 'completed', 'failed', 'nsfw', 'canceled')
  ),
  status_url TEXT,
  cancel_url TEXT,
  video_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  estimated_cost_usd NUMERIC(10, 4) NOT NULL DEFAULT 0,
  error_message TEXT,
  correlation_id TEXT,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.video_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acces dashboard video_generations" ON public.video_generations
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);`;

function generateClientUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `vid-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function getAuthHeaders(): Record<string, string> {
  let adminUser = "admin";
  if (typeof window !== "undefined") {
    try {
      adminUser = sessionStorage.getItem("sama_admin_user") || "admin";
    } catch {
      adminUser = "admin";
    }
  }
  return {
    "x-sama-admin-auth": "true",
    "x-sama-admin-user": adminUser,
  };
}

function probeLocalVideoDurationSec(previewUrl: string): Promise<number> {
  return new Promise((resolve) => {
    try {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        const dur = Number.isFinite(v.duration)
          ? Math.min(30, Math.max(1, Math.ceil(v.duration)))
          : 5;
        resolve(dur);
      };
      v.onerror = () => resolve(5);
      v.src = previewUrl;
    } catch {
      resolve(5);
    }
  });
}

function getExpirationState(expiresAt: string | null) {
  if (!expiresAt) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      label: "Valable 7 jours chez Higgsfield",
    };
  }

  const expTime = new Date(expiresAt).getTime();
  if (Number.isNaN(expTime)) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      label: "Valable 7 jours",
    };
  }

  const diffMs = expTime - Date.now();
  const formattedDate = new Date(expiresAt).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffMs <= 0) {
    return {
      isExpired: true,
      isExpiringSoon: false,
      label: `Expirée le ${formattedDate}`,
    };
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (hoursLeft < 48) {
    return {
      isExpired: false,
      isExpiringSoon: true,
      label: `Expire bientôt : ${formattedDate} (${hoursLeft} h restantes)`,
    };
  }

  return {
    isExpired: false,
    isExpiringSoon: false,
    label: `Expire le ${formattedDate} (${daysLeft} j restants)`,
  };
}

function renderStatusBadge(status: VideoGenerationStatus) {
  switch (status) {
    case "queued":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <Clock className="w-3 h-3 animate-pulse" />
          <span>En file d&apos;attente</span>
        </span>
      );
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-sama-orange border border-orange-200">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>En cours</span>
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          <span>Terminé</span>
        </span>
      );
    case "nsfw":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <ShieldAlert className="w-3 h-3" />
          <span>Refusé (modération)</span>
        </span>
      );
    case "canceled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
          <Ban className="w-3 h-3" />
          <span>Annulé</span>
        </span>
      );
    case "failed":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3" />
          <span>Échec</span>
        </span>
      );
  }
}

function getModeDisplayLabel(mode: string): string {
  if (mode === "reference-to-video") return "Références";
  if (mode === "image-to-video") return "Cadres (Image → Vidéo)";
  if (mode === "video-edit") return "Édition vidéo";
  return "Texte → Vidéo";
}

interface VideoCreationSectionProps {
  onActiveJobsCountChange?: (count: number) => void;
}

export const VideoCreationSection: React.FC<VideoCreationSectionProps> = ({
  onActiveJobsCountChange,
}) => {
  // --- Mode selection ---
  // Top switch: "text" vs "media" (where "media" exposes "Références: 10 images + 5 vidéos" and "Cadres: jusqu'à 10 images")
  const [mode, setMode] = useState<
    "text-to-video" | "reference-to-video" | "image-to-video"
  >("text-to-video");
  const [lastMediaSubMode, setLastMediaSubMode] = useState<
    "reference-to-video" | "image-to-video"
  >("reference-to-video");
  const [mobileTab, setMobileTab] = useState<"studio" | "gallery">("studio");

  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<number>(KLING_V4_DEFAULT_DURATION);
  const [resolution, setResolution] = useState<KlingV4Resolution>("720p");
  const [textAspectRatio, setTextAspectRatio] =
    useState<KlingV4TextAspectRatio>("16:9");
  const [refAspectRatio, setRefAspectRatio] =
    useState<KlingV4ExtendedAspectRatio>("adaptive");

  // --- Mode "Références" (jusqu'à 10 images + 5 vidéos) ---
  const [refImages, setRefImages] = useState<LocalMediaItem[]>([]);
  const [refVideos, setRefVideos] = useState<LocalMediaItem[]>([]);
  const [isDraggingRef, setIsDraggingRef] = useState(false);

  // --- Mode "Cadres / Image -> Vidéo" (1 départ + jusqu'à 8 intermédiaires + 1 fin = 10 images) ---
  const [startFrame, setStartFrame] = useState<LocalMediaItem | null>(null);
  const [middleFrames, setMiddleFrames] = useState<LocalMediaItem[]>([]);
  const [endFrame, setEndFrame] = useState<LocalMediaItem | null>(null);

  // Submission & Idempotency states
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() =>
    generateClientUuid()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStepLabel, setSubmitStepLabel] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Gallery, Quotas & Polling states
  const [videos, setVideos] = useState<VideoGenerationRecord[]>([]);
  const [quotas, setQuotas] = useState<VideoQuotaSummary>({
    maxDurationSeconds: KLING_V4_MAX_DURATION,
    maxDailyGenerations: 20,
    usedToday: 0,
    maxMonthlyBudgetUsd: 50,
    usedThisMonthUsd: 0,
  });
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [isRefreshingGallery, setIsRefreshingGallery] = useState(false);

  // Card actions
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [videoToDelete, setVideoToDelete] =
    useState<VideoGenerationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [timedOutIds, setTimedOutIds] = useState<Set<string>>(new Set());

  const pollStartedAtRef = useRef<Map<string, number>>(new Map());
  const refMixedInputRef = useRef<HTMLInputElement | null>(null);
  const refImageInputRef = useRef<HTMLInputElement | null>(null);
  const refVideoInputRef = useRef<HTMLInputElement | null>(null);
  const startFrameInputRef = useRef<HTMLInputElement | null>(null);
  const middleFramesInputRef = useRef<HTMLInputElement | null>(null);
  const endFrameInputRef = useRef<HTMLInputElement | null>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Keep a ref of all object URLs to revoke on unmount
  const createdObjectUrlsRef = useRef<Set<string>>(new Set());

  const createTrackedObjectUrl = useCallback((file: File): string => {
    const url = URL.createObjectURL(file);
    createdObjectUrlsRef.current.add(url);
    return url;
  }, []);

  const revokeTrackedObjectUrl = useCallback((url?: string | null) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    createdObjectUrlsRef.current.delete(url);
  }, []);

  useEffect(() => {
    const tracked = createdObjectUrlsRef.current;
    return () => {
      tracked.forEach((u) => URL.revokeObjectURL(u));
      tracked.clear();
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  }, []);

  const refreshIntentKey = useCallback(() => {
    setIdempotencyKey(generateClientUuid());
  }, []);

  const effectiveMaxDuration = useMemo(() => {
    return Math.min(
      KLING_V4_MAX_DURATION,
      Math.max(KLING_V4_MIN_DURATION, quotas.maxDurationSeconds || 30)
    );
  }, [quotas.maxDurationSeconds]);

  const totalRefVideoDurationSec = useMemo(() => {
    return refVideos.reduce((acc, v) => acc + (v.durationSec || 5), 0);
  }, [refVideos]);

  const hasRefVideos = mode === "reference-to-video" && refVideos.length > 0;

  const currentRatePerSec = useMemo(
    () => getRatePerSecondUsd(mode as KlingV4Mode, resolution, hasRefVideos),
    [mode, resolution, hasRefVideos]
  );

  const currentEstimatedCostUsd = useMemo(
    () =>
      estimateVideoCostUsd({
        mode: mode as KlingV4Mode,
        duration,
        resolution,
        inputVideosCount: mode === "reference-to-video" ? refVideos.length : 0,
        totalInputVideoDurationSec:
          mode === "reference-to-video" ? totalRefVideoDurationSec : 0,
      }),
    [mode, duration, resolution, refVideos.length, totalRefVideoDurationSec]
  );

  // Active jobs for polling
  const activeJobs = useMemo(
    () =>
      videos.filter(
        (v) =>
          !TERMINAL_VIDEO_STATUSES.has(v.status) && !timedOutIds.has(v.id)
      ),
    [videos, timedOutIds]
  );

  useEffect(() => {
    if (onActiveJobsCountChange) {
      const runningCount = videos.filter(
        (v) => !TERMINAL_VIDEO_STATUSES.has(v.status)
      ).length;
      onActiveJobsCountChange(runningCount);
    }
  }, [videos, onActiveJobsCountChange]);

  const fetchVideos = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshingGallery(true);
    try {
      const res = await fetch("/api/videos", {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setVideos(Array.isArray(json.data) ? json.data : []);
        setMigrationRequired(Boolean(json.migrationRequired));
        if (json.quotas) {
          setQuotas(json.quotas);
        }
      }
    } catch (err) {
      console.error("Erreur chargement galerie vidéos :", err);
    } finally {
      setIsLoadingGallery(false);
      setIsRefreshingGallery(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(true);
  }, [fetchVideos]);

  const pollSingleJob = useCallback(
    async (jobId: string) => {
      try {
        const res = await fetch(`/api/videos/${jobId}/status`, {
          method: "GET",
          headers: getAuthHeaders(),
          cache: "no-store",
        });
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          const updatedJob = json.data as VideoGenerationRecord;
          setVideos((prev) =>
            prev.map((item) => (item.id === jobId ? updatedJob : item))
          );

          if (TERMINAL_VIDEO_STATUSES.has(updatedJob.status)) {
            pollStartedAtRef.current.delete(jobId);
            if (updatedJob.status === "completed") {
              showToast("Votre vidéo Kling 4.0 est prête dans la galerie !");
            }
            fetchVideos(true);
          }
        }
      } catch {
        // Prochain cycle de polling réessaiera automatiquement
      }
    },
    [fetchVideos, showToast]
  );

  useEffect(() => {
    if (activeJobs.length === 0) return;

    const now = Date.now();
    for (const job of activeJobs) {
      if (!pollStartedAtRef.current.has(job.id)) {
        pollStartedAtRef.current.set(job.id, now);
      }
    }

    const intervalId = setInterval(() => {
      const checkTime = Date.now();
      for (const job of activeJobs) {
        const startedAt = pollStartedAtRef.current.get(job.id) || checkTime;
        if (checkTime - startedAt > CLIENT_POLL_TIMEOUT_MS) {
          setTimedOutIds((prev) => {
            const next = new Set(prev);
            next.add(job.id);
            return next;
          });
          continue;
        }
        pollSingleJob(job.id);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [activeJobs, pollSingleJob]);

  // --- Helpers d'ajout de médias ---
  const validateSingleMediaFile = (
    file: File,
    allowVideo: boolean
  ): { ok: true; kind: "image" | "video" } | { ok: false; error: string } => {
    const mime = (file.type || "").toLowerCase();
    const isImage = ALLOWED_IMAGE_MIME_TYPES.includes(
      mime as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
    );
    const isVideo =
      allowVideo &&
      ALLOWED_VIDEO_MIME_TYPES.includes(
        mime as (typeof ALLOWED_VIDEO_MIME_TYPES)[number]
      );

    if (!isImage && !isVideo) {
      return {
        ok: false,
        error: allowVideo
          ? `Format non supporté pour "${file.name}". Utilisez des images (JPG, PNG, WebP, GIF) ou des vidéos MP4.`
          : `Format non supporté pour "${file.name}". Utilisez uniquement JPG, PNG, WebP ou GIF.`,
      };
    }

    if (isImage && file.size > MAX_PRESIGNED_IMAGE_BYTES) {
      return {
        ok: false,
        error: `L'image "${file.name}" dépasse la limite de 15 Mo.`,
      };
    }

    if (isVideo && file.size > MAX_PRESIGNED_VIDEO_BYTES) {
      return {
        ok: false,
        error: `La vidéo "${file.name}" dépasse la limite de 100 Mo.`,
      };
    }

    return { ok: true, kind: isVideo ? "video" : "image" };
  };

  // Ajout multiple dans l'onglet "Références" (jusqu'à 10 images + 5 vidéos)
  const handleAddReferenceFiles = async (
    fileList: FileList | File[] | null
  ): Promise<{ addedImageTags: string[]; addedVideoTags: string[] }> => {
    if (!fileList) return { addedImageTags: [], addedVideoTags: [] };
    const files = Array.from(fileList);
    if (files.length === 0) return { addedImageTags: [], addedVideoTags: [] };

    setFormError(null);
    refreshIntentKey();

    let nextImgCount = refImages.length;
    let nextVidCount = refVideos.length;
    const addedImages: LocalMediaItem[] = [];
    const addedVideos: LocalMediaItem[] = [];
    const addedImageTags: string[] = [];
    const addedVideoTags: string[] = [];
    let firstWarning: string | null = null;

    for (const file of files) {
      const check = validateSingleMediaFile(file, true);
      if (!check.ok) {
        if (!firstWarning) firstWarning = check.error;
        continue;
      }

      if (check.kind === "image") {
        if (nextImgCount >= KLING_V4_MAX_REFERENCE_IMAGES) {
          if (!firstWarning) {
            firstWarning = `Maximum ${KLING_V4_MAX_REFERENCE_IMAGES} images de référence atteint.`;
          }
          continue;
        }
        nextImgCount += 1;
        addedImageTags.push(`@image_${nextImgCount}`);
        addedImages.push({
          localId: generateClientUuid(),
          file,
          previewUrl: createTrackedObjectUrl(file),
          uploadedUrl: null,
          kind: "image",
        });
      } else {
        if (nextVidCount >= KLING_V4_MAX_REFERENCE_VIDEOS) {
          if (!firstWarning) {
            firstWarning = `Maximum ${KLING_V4_MAX_REFERENCE_VIDEOS} vidéos de référence atteint.`;
          }
          continue;
        }
        nextVidCount += 1;
        addedVideoTags.push(`@video_${nextVidCount}`);
        const previewUrl = createTrackedObjectUrl(file);
        const durSec = await probeLocalVideoDurationSec(previewUrl);
        addedVideos.push({
          localId: generateClientUuid(),
          file,
          previewUrl,
          uploadedUrl: null,
          kind: "video",
          durationSec: durSec,
        });
      }
    }

    if (addedImages.length > 0) {
      setRefImages((prev) => [...prev, ...addedImages]);
    }
    if (addedVideos.length > 0) {
      setRefVideos((prev) => [...prev, ...addedVideos]);
    }
    if (firstWarning) {
      setFormError(firstWarning);
    }

    return { addedImageTags, addedVideoTags };
  };

  const handleRemoveRefItem = (localId: string, kind: "image" | "video") => {
    refreshIntentKey();
    if (kind === "image") {
      setRefImages((prev) => {
        const target = prev.find((i) => i.localId === localId);
        if (target) revokeTrackedObjectUrl(target.previewUrl);
        return prev.filter((i) => i.localId !== localId);
      });
    } else {
      setRefVideos((prev) => {
        const target = prev.find((i) => i.localId === localId);
        if (target) revokeTrackedObjectUrl(target.previewUrl);
        return prev.filter((i) => i.localId !== localId);
      });
    }
  };

  const insertTagIntoPrompt = (tag: string) => {
    refreshIntentKey();
    setPrompt((prev) => {
      const sep = prev.length === 0 || prev.endsWith(" ") ? "" : " ";
      return `${prev}${sep}${tag} `;
    });
    promptTextareaRef.current?.focus();
  };

  // --- Gestion des images du sous-onglet "Cadres" (1 départ + 8 intermédiaires + 1 fin = 10 images) ---
  const handleSelectSingleFrame = (
    file: File | undefined,
    slot: "start" | "end"
  ) => {
    if (!file) return;
    setFormError(null);

    const check = validateSingleMediaFile(file, false);
    if (!check.ok) {
      setFormError(check.error);
      return;
    }

    refreshIntentKey();
    const item: LocalMediaItem = {
      localId: generateClientUuid(),
      file,
      previewUrl: createTrackedObjectUrl(file),
      uploadedUrl: null,
      kind: "image",
    };

    if (slot === "start") {
      if (startFrame) revokeTrackedObjectUrl(startFrame.previewUrl);
      setStartFrame(item);
    } else {
      if (endFrame) revokeTrackedObjectUrl(endFrame.previewUrl);
      setEndFrame(item);
    }
  };

  const handleAddMiddleFrames = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setFormError(null);
    refreshIntentKey();

    let count = middleFrames.length;
    const added: LocalMediaItem[] = [];
    let warning: string | null = null;

    for (const file of files) {
      const check = validateSingleMediaFile(file, false);
      if (!check.ok) {
        if (!warning) warning = check.error;
        continue;
      }
      if (count >= KLING_V4_MAX_MIDDLE_FRAMES) {
        if (!warning) {
          warning = `Maximum ${KLING_V4_MAX_MIDDLE_FRAMES} cadres intermédiaires atteint (10 images au total avec départ et fin).`;
        }
        continue;
      }
      count += 1;
      added.push({
        localId: generateClientUuid(),
        file,
        previewUrl: createTrackedObjectUrl(file),
        uploadedUrl: null,
        kind: "image",
      });
    }

    if (added.length > 0) {
      setMiddleFrames((prev) => [...prev, ...added]);
    }
    if (warning) setFormError(warning);
  };

  // --- Téléversement unitaire via URL pré-signée S3 Higgsfield (avec repli serveur <= 4 Mo) ---
  const uploadSingleMediaItem = async (
    item: LocalMediaItem
  ): Promise<string> => {
    if (item.uploadedUrl) return item.uploadedUrl;

    const rawMime = (item.file.type || "").toLowerCase();
    const contentType = rawMime === "image/jpg" ? "image/jpeg" : rawMime;

    // 1. Demander une URL pré-signée à notre route serveur authentifiée
    const presignRes = await fetch("/api/videos/upload-url", {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType,
        sizeBytes: item.file.size,
      }),
    });

    const presignJson = await presignRes.json().catch(() => null);
    if (!presignRes.ok || !presignJson?.success || !presignJson?.uploadUrl) {
      throw new Error(
        presignJson?.error ||
          `Impossible de préparer l'envoi de "${item.file.name}".`
      );
    }

    // 2. PUT direct vers le stockage pré-signé S3 Higgsfield (compatible fichiers vidéo > 4.5 Mo sur Vercel)
    try {
      const putRes = await fetch(presignJson.uploadUrl, {
        method: "PUT",
        headers: presignJson.uploadHeaders || { "Content-Type": contentType },
        body: item.file,
      });

      if (putRes.ok) {
        return presignJson.publicUrl as string;
      }
    } catch {
      // Repli vers l'upload serveur si petite image <= 4 Mo
    }

    if (item.kind === "image" && item.file.size <= MAX_UPLOAD_IMAGE_BYTES) {
      const fd = new FormData();
      fd.append("file", item.file);
      const fallbackRes = await fetch("/api/videos/upload", {
        method: "POST",
        headers: getAuthHeaders(),
        body: fd,
      });
      const fallbackJson = await fallbackRes.json().catch(() => null);
      if (fallbackRes.ok && fallbackJson?.success && fallbackJson?.publicUrl) {
        return fallbackJson.publicUrl as string;
      }
    }

    throw new Error(`Échec du téléversement du fichier "${item.file.name}".`);
  };

  // --- Soumission du formulaire ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError(null);

    const cleanPrompt = prompt.trim();

    if (
      (mode === "text-to-video" || mode === "reference-to-video") &&
      cleanPrompt.length < 1
    ) {
      setFormError(
        "Veuillez saisir un prompt décrivant la vidéo souhaitée."
      );
      return;
    }

    if (cleanPrompt.length > KLING_V4_MAX_PROMPT_LENGTH) {
      setFormError(
        `Votre prompt dépasse la limite de ${KLING_V4_MAX_PROMPT_LENGTH} caractères.`
      );
      return;
    }

    if (
      mode === "reference-to-video" &&
      refImages.length === 0 &&
      refVideos.length === 0
    ) {
      setFormError(
        "Ajoutez au moins une image ou une vidéo dans « Ajouter des références » (jusqu'à 10 images et 5 vidéos)."
      );
      return;
    }

    if (mode === "image-to-video" && !startFrame) {
      setFormError(
        "Veuillez sélectionner au minimum l'image de départ dans l'onglet Cadres."
      );
      return;
    }

    if (duration < KLING_V4_MIN_DURATION || duration > effectiveMaxDuration) {
      setFormError(
        `La durée doit être comprise entre ${KLING_V4_MIN_DURATION} et ${effectiveMaxDuration} secondes.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        mode,
        duration,
        resolution,
        idempotency_key: idempotencyKey,
      };

      if (cleanPrompt.length > 0) {
        payload.prompt = cleanPrompt;
      }

      if (mode === "text-to-video") {
        payload.aspect_ratio = textAspectRatio;
      } else if (mode === "reference-to-video") {
        const totalMedia = refImages.length + refVideos.length;
        let uploadedCount = 0;

        const uploadedImageUrls: string[] = [];
        for (let i = 0; i < refImages.length; i++) {
          uploadedCount += 1;
          setSubmitStepLabel(
            `Téléversement média (${uploadedCount}/${totalMedia})...`
          );
          const url = await uploadSingleMediaItem(refImages[i]);
          uploadedImageUrls.push(url);
        }

        const uploadedVideoUrls: string[] = [];
        for (let i = 0; i < refVideos.length; i++) {
          uploadedCount += 1;
          setSubmitStepLabel(
            `Téléversement vidéo (${uploadedCount}/${totalMedia})...`
          );
          const url = await uploadSingleMediaItem(refVideos[i]);
          uploadedVideoUrls.push(url);
        }

        // Cache uploaded URLs locally so retries don't re-upload
        setRefImages((prev) =>
          prev.map((item, idx) => ({
            ...item,
            uploadedUrl: uploadedImageUrls[idx] || item.uploadedUrl,
          }))
        );
        setRefVideos((prev) =>
          prev.map((item, idx) => ({
            ...item,
            uploadedUrl: uploadedVideoUrls[idx] || item.uploadedUrl,
          }))
        );

        if (uploadedImageUrls.length > 0) {
          payload.image_urls = uploadedImageUrls;
        }
        if (uploadedVideoUrls.length > 0) {
          payload.video_urls = uploadedVideoUrls;
          payload.total_input_video_duration_sec = totalRefVideoDurationSec;
        }
        payload.aspect_ratio = refAspectRatio;
      } else if (mode === "image-to-video" && startFrame) {
        const totalFrames =
          1 + middleFrames.length + (endFrame ? 1 : 0);
        let uploadedCount = 1;
        setSubmitStepLabel(
          `Téléversement cadre (${uploadedCount}/${totalFrames})...`
        );
        const startUrl = await uploadSingleMediaItem(startFrame);
        setStartFrame((prev) =>
          prev ? { ...prev, uploadedUrl: startUrl } : null
        );
        payload.image_url = startUrl;

        if (middleFrames.length > 0) {
          const midUrls: string[] = [];
          for (let i = 0; i < middleFrames.length; i++) {
            uploadedCount += 1;
            setSubmitStepLabel(
              `Téléversement cadre (${uploadedCount}/${totalFrames})...`
            );
            const u = await uploadSingleMediaItem(middleFrames[i]);
            midUrls.push(u);
          }
          setMiddleFrames((prev) =>
            prev.map((item, idx) => ({
              ...item,
              uploadedUrl: midUrls[idx] || item.uploadedUrl,
            }))
          );
          payload.image_urls = midUrls;
        }

        if (endFrame) {
          uploadedCount += 1;
          setSubmitStepLabel(
            `Téléversement cadre (${uploadedCount}/${totalFrames})...`
          );
          const endUrl = await uploadSingleMediaItem(endFrame);
          setEndFrame((prev) =>
            prev ? { ...prev, uploadedUrl: endUrl } : null
          );
          payload.end_image_url = endUrl;
        }
      }

      setSubmitStepLabel("Soumission à Kling 4.0...");

      const res = await fetch("/api/videos", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success || !json?.data) {
        if (json?.migrationRequired) {
          setMigrationRequired(true);
        }
        throw new Error(
          json?.error || "Impossible de lancer la génération vidéo."
        );
      }

      const createdRecord = json.data as VideoGenerationRecord;
      pollStartedAtRef.current.set(createdRecord.id, Date.now());

      setVideos((prev) => {
        const exists = prev.some((v) => v.id === createdRecord.id);
        return exists
          ? prev.map((v) => (v.id === createdRecord.id ? createdRecord : v))
          : [createdRecord, ...prev];
      });

      setIdempotencyKey(generateClientUuid());
      showToast("Génération lancée ! Suivi automatique en cours.");
      fetchVideos(true);
      setMobileTab("gallery");
    } catch (err: any) {
      setFormError(err?.message || "Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
      setSubmitStepLabel("");
    }
  };

  const handleCancelJob = async (video: VideoGenerationRecord) => {
    if (cancelingId) return;
    setCancelingId(video.id);
    try {
      const res = await fetch(`/api/videos/${video.id}/cancel`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const json = await res.json().catch(() => null);

      if (json?.data) {
        setVideos((prev) =>
          prev.map((v) => (v.id === video.id ? json.data : v))
        );
      }

      if (!res.ok || !json?.success) {
        showToast(
          json?.error || "Cette génération ne peut plus être annulée."
        );
      } else {
        showToast("Génération annulée en file d'attente.");
        fetchVideos(true);
      }
    } catch {
      showToast("Erreur réseau lors de la demande d'annulation.");
    } finally {
      setCancelingId(null);
    }
  };

  const handleDownloadVideo = async (video: VideoGenerationRecord) => {
    if (!video.video_url || downloadingId) return;
    setDownloadingId(video.id);
    try {
      const res = await fetch(`/api/videos/${video.id}/download`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(
          errJson?.error || "Impossible de télécharger ce fichier vidéo."
        );
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `sama-pub-kling4-${video.id.slice(0, 8)}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      showToast("Téléchargement de la vidéo lancé !");
    } catch (err: any) {
      showToast(err?.message || "Échec du téléchargement.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/videos/${videoToDelete.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Échec de la suppression.");
      }

      pollStartedAtRef.current.delete(videoToDelete.id);
      setVideos((prev) => prev.filter((v) => v.id !== videoToDelete.id));
      setVideoToDelete(null);
      showToast("Vidéo supprimée de l'historique.");
      fetchVideos(true);
    } catch (err: any) {
      showToast(err?.message || "Erreur lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

  const quickDurations = [3, 5, 10, 15, 30].filter(
    (d) => d <= effectiveMaxDuration
  );

  const isMediaMode = mode !== "text-to-video";
  const totalCadresCount =
    (startFrame ? 1 : 0) + middleFrames.length + (endFrame ? 1 : 0);

  // Options de médias exposées au menu `@` et à la coloration du prompt
  const promptImageOptions = useMemo<PromptMediaOption[]>(() => {
    if (mode === "image-to-video") {
      const seq: PromptMediaOption[] = [];
      if (startFrame) {
        seq.push({
          tag: "@image_1",
          label: "Image de départ",
          fileName: startFrame.file.name,
          previewUrl: startFrame.previewUrl,
          kind: "image",
        });
      }
      middleFrames.forEach((f, idx) => {
        const num = (startFrame ? 1 : 0) + idx + 1;
        seq.push({
          tag: `@image_${num}`,
          label: `Cadre intermédiaire #${idx + 2}`,
          fileName: f.file.name,
          previewUrl: f.previewUrl,
          kind: "image",
        });
      });
      if (endFrame) {
        const num = (startFrame ? 1 : 0) + middleFrames.length + 1;
        seq.push({
          tag: `@image_${num}`,
          label: "Image de fin",
          fileName: endFrame.file.name,
          previewUrl: endFrame.previewUrl,
          kind: "image",
        });
      }
      return seq;
    }

    return refImages.map((img, idx) => ({
      tag: `@image_${idx + 1}`,
      label: `Image de référence ${idx + 1}`,
      fileName: img.file.name,
      previewUrl: img.previewUrl,
      kind: "image",
    }));
  }, [mode, refImages, startFrame, middleFrames, endFrame]);

  const promptVideoOptions = useMemo<PromptMediaOption[]>(() => {
    if (mode === "image-to-video") return [];
    return refVideos.map((vid, idx) => ({
      tag: `@video_${idx + 1}`,
      label: vid.durationSec
        ? `Vidéo ${idx + 1} (~${vid.durationSec}s)`
        : `Vidéo de référence ${idx + 1}`,
      fileName: vid.file.name,
      previewUrl: vid.previewUrl,
      kind: "video",
      durationSec: vid.durationSec,
    }));
  }, [mode, refVideos]);

  const canImportMorePromptImages =
    mode === "image-to-video"
      ? totalCadresCount < 10
      : refImages.length < KLING_V4_MAX_REFERENCE_IMAGES;

  const nextPromptImageTag =
    mode === "image-to-video"
      ? `@image_${Math.min(10, totalCadresCount + 1)}`
      : `@image_${Math.min(
          KLING_V4_MAX_REFERENCE_IMAGES,
          refImages.length + 1
        )}`;

  const canImportMorePromptVideos =
    mode !== "image-to-video" &&
    refVideos.length < KLING_V4_MAX_REFERENCE_VIDEOS;

  const nextPromptVideoTag = `@video_${Math.min(
    KLING_V4_MAX_REFERENCE_VIDEOS,
    refVideos.length + 1
  )}`;

  const handleImportImageFromMention = async (
    files: File[]
  ): Promise<string[]> => {
    if (mode === "image-to-video") {
      const arr = Array.from(files);
      const assignedTags: string[] = [];
      let currentTotal = totalCadresCount;
      let hasStart = Boolean(startFrame);
      let midCount = middleFrames.length;
      let hasEnd = Boolean(endFrame);
      const newMiddle: LocalMediaItem[] = [];

      for (const file of arr) {
        const check = validateSingleMediaFile(file, false);
        if (!check.ok) {
          setFormError(check.error);
          continue;
        }
        if (currentTotal >= 10) break;

        const item: LocalMediaItem = {
          localId: generateClientUuid(),
          file,
          previewUrl: createTrackedObjectUrl(file),
          uploadedUrl: null,
          kind: "image",
        };

        if (!hasStart) {
          hasStart = true;
          currentTotal += 1;
          setStartFrame(item);
          assignedTags.push("@image_1");
        } else if (midCount < KLING_V4_MAX_MIDDLE_FRAMES) {
          midCount += 1;
          currentTotal += 1;
          newMiddle.push(item);
          assignedTags.push(`@image_${1 + midCount}`);
        } else if (!hasEnd) {
          hasEnd = true;
          currentTotal += 1;
          setEndFrame(item);
          assignedTags.push(`@image_${currentTotal}`);
        }
      }

      if (newMiddle.length > 0) {
        setMiddleFrames((prev) => [...prev, ...newMiddle]);
      }
      refreshIntentKey();
      return assignedTags;
    }

    if (mode === "text-to-video") {
      setMode("reference-to-video");
      setLastMediaSubMode("reference-to-video");
    }
    const { addedImageTags } = await handleAddReferenceFiles(files);
    return addedImageTags;
  };

  const handleImportVideoFromMention = async (
    files: File[]
  ): Promise<string[]> => {
    if (mode !== "reference-to-video") {
      setMode("reference-to-video");
      setLastMediaSubMode("reference-to-video");
    }
    const { addedVideoTags } = await handleAddReferenceFiles(files);
    return addedVideoTags;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête Studio Vidéo + Garde-fous Quotas */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] text-sama-orange border border-orange-200/80 flex items-center justify-center shrink-0 shadow-xs">
            <Video className="w-5 h-5 text-sama-orange" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Création Vidéo IA Kling 4.0
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-sama-orange" />
                Higgsfield
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
              <span className="sm:hidden">
                Vidéos publicitaires haute conversion (3 à {effectiveMaxDuration}s).
              </span>
              <span className="hidden sm:inline">
                Générez des publicités et séquences vidéo (3 à {effectiveMaxDuration}s) par texte, références ou cadres clés.
              </span>
            </p>
          </div>
        </div>

        {/* Compteurs Quotas en direct */}
        <div className="flex items-center gap-2 text-xs shrink-0 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
          <div className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center sm:justify-start gap-1.5 text-[11px]">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-slate-500">Aujourd&apos;hui :</span>
            <span className="font-bold text-slate-900 font-mono">
              {quotas.usedToday}/{quotas.maxDailyGenerations}
            </span>
          </div>
          <div className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center sm:justify-start gap-1.5 text-[11px]">
            <span className="text-slate-500">Budget :</span>
            <span className="font-bold text-slate-900 font-mono">
              {formatUsd(quotas.usedThisMonthUsd)} / {formatUsd(quotas.maxMonthlyBudgetUsd)}
            </span>
          </div>
        </div>
      </div>

      {/* Alerte migration Supabase si la table video_generations n'est pas encore créée */}
      {migrationRequired && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-amber-900">
                  Initialisation requise : table Supabase{" "}
                  <code className="font-mono bg-amber-100/80 px-1.5 py-0.5 rounded">
                    public.video_generations
                  </code>
                </h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Exécutez une seule fois le script{" "}
                  <code className="font-mono font-semibold">
                    supabase_videos_migration.sql
                  </code>{" "}
                  dans l&apos;éditeur SQL de votre projet Supabase pour activer
                  l&apos;enregistrement de vos vidéos.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(MIGRATION_SQL_SNIPPET);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 2500);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors self-start sm:self-auto"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SQL copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le SQL</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Avertissement rétention 7 jours Higgsfield */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl sm:rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-xs text-sky-950">
        <div className="flex items-center gap-2 min-w-0">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <p className="text-[11px] sm:text-xs leading-relaxed truncate sm:whitespace-normal">
            <span className="font-bold">Conservation 7 jours :</span>{" "}
            <span className="sm:hidden">téléchargez vos vidéos dans la galerie pour les conserver.</span>
            <span className="hidden sm:inline">les liens vidéo générés expirent au bout de 7 jours. Utilisez le bouton « Télécharger » dans la galerie pour les sauvegarder sur votre appareil.</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileTab("gallery")}
          className="xl:hidden shrink-0 text-[10px] font-bold text-sky-700 bg-sky-100/90 hover:bg-sky-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          Voir galerie
        </button>
      </div>

      {/* Navigation Mobile Immersive : [✦ Studio Vidéo] vs [🎬 Galerie & Rendu (N)] */}
      <div className="xl:hidden flex items-center p-1 rounded-2xl bg-slate-900 text-white shadow-md">
        <button
          type="button"
          onClick={() => setMobileTab("studio")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mobileTab === "studio"
              ? "bg-white/20 text-white shadow-xs ring-1 ring-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sama-orange" />
          <span>Studio Création</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("gallery")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mobileTab === "gallery"
              ? "bg-white/20 text-white shadow-xs ring-1 ring-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Film className="w-3.5 h-3.5 text-sama-orange" />
          <span>Galerie &amp; Rendu</span>
          {videos.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-sama-orange text-white font-bold">
              {videos.length}
            </span>
          )}
          {activeJobs.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Grille principale : Formulaire de création (gauche) + Galerie / Historique (droite) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* =================================================================== */}
        {/* 1. FORMULAIRE DE CRÉATION                                           */}
        {/* =================================================================== */}
        <div
          className={`xl:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-xs p-3.5 sm:p-6 ${
            mobileTab === "studio" ? "block" : "hidden xl:block"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Sélecteur Principal : Texte -> Vidéo vs Image / Références -> Vidéo */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Mode de génération
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setMode("text-to-video");
                    setFormError(null);
                    refreshIntentKey();
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === "text-to-video"
                      ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/70"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-sama-orange" />
                  <span>Texte → Vidéo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode(lastMediaSubMode);
                    setFormError(null);
                    refreshIntentKey();
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isMediaMode
                      ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/70"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sama-orange" />
                  <span>Image → Vidéo</span>
                </button>
              </div>
            </div>

            {/* Sous-sélecteur Kling 4.0 : Références (10 images + 5 vidéos) vs Cadres (jusqu'à 10 images) */}
            {isMediaMode && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900 text-white">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reference-to-video");
                      setLastMediaSubMode("reference-to-video");
                      setFormError(null);
                      refreshIntentKey();
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mode === "reference-to-video"
                        ? "bg-white/15 text-white ring-1 ring-white/25"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-sama-orange" />
                    <span>Références (10 img · 5 vid)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("image-to-video");
                      setLastMediaSubMode("image-to-video");
                      setFormError(null);
                      refreshIntentKey();
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mode === "image-to-video"
                        ? "bg-white/15 text-white ring-1 ring-white/25"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-sama-orange" />
                    <span>Cadres (jusqu&apos;à 10 img)</span>
                  </button>
                </div>

                {/* ========================================================= */}
                {/* SOUS-MODE A : RÉFÉRENCES (JUSQU'À 10 IMAGES ET 5 VIDÉOS)   */}
                {/* ========================================================= */}
                {mode === "reference-to-video" && (
                  <div className="space-y-3">
                    {/* Inputs cachés pour import mixte, images seules ou vidéos seules */}
                    <input
                      ref={refMixedInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
                      onChange={(e) => {
                        handleAddReferenceFiles(e.target.files);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                    <input
                      ref={refImageInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        handleAddReferenceFiles(e.target.files);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                    <input
                      ref={refVideoInputRef}
                      type="file"
                      multiple
                      accept="video/mp4"
                      onChange={(e) => {
                        handleAddReferenceFiles(e.target.files);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />

                    {/* Zone principale "Ajouter des références — Jusqu'à 10 images et 5 vidéos" */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingRef(true);
                      }}
                      onDragLeave={() => setIsDraggingRef(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingRef(false);
                        if (!isSubmitting) {
                          handleAddReferenceFiles(e.dataTransfer.files);
                        }
                      }}
                      onClick={() => {
                        if (!isSubmitting) refMixedInputRef.current?.click();
                      }}
                      className={`rounded-2xl border-2 border-dashed p-5 text-center transition-all cursor-pointer ${
                        isDraggingRef
                          ? "border-sama-orange bg-orange-50/60"
                          : "border-slate-200 hover:border-sama-orange bg-slate-50/70 hover:bg-orange-50/20"
                      }`}
                    >
                      <div className="flex items-center justify-center -space-x-2 mb-2.5">
                        <span className="w-9 h-9 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center shadow-xs">
                          <ImageIcon className="w-4 h-4 text-sama-orange" />
                        </span>
                        <span className="w-9 h-9 rounded-full bg-slate-800 text-white border-2 border-white flex items-center justify-center shadow-xs">
                          <Layers className="w-4 h-4 text-sky-400" />
                        </span>
                        <span className="w-9 h-9 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center shadow-xs">
                          <Video className="w-4 h-4 text-emerald-400" />
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        Ajouter des références
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Jusqu&apos;à {KLING_V4_MAX_REFERENCE_IMAGES} images
                        (JPG, PNG, WebP) et {KLING_V4_MAX_REFERENCE_VIDEOS}{" "}
                        vidéos (MP4)
                      </div>
                    </div>

                    {/* Boutons d'ajout rapide + compteurs X/10 et Y/5 */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={
                          isSubmitting ||
                          refImages.length >= KLING_V4_MAX_REFERENCE_IMAGES
                        }
                        onClick={() => refImageInputRef.current?.click()}
                        className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer disabled:opacity-50"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-sama-orange" />
                          <span>Images</span>
                        </span>
                        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-sama-orange">
                          {refImages.length}/{KLING_V4_MAX_REFERENCE_IMAGES}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={
                          isSubmitting ||
                          refVideos.length >= KLING_V4_MAX_REFERENCE_VIDEOS
                        }
                        onClick={() => refVideoInputRef.current?.click()}
                        className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer disabled:opacity-50"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Vidéos MP4</span>
                        </span>
                        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {refVideos.length}/{KLING_V4_MAX_REFERENCE_VIDEOS}
                        </span>
                      </button>
                    </div>

                    {/* Grille des images de référence importées (@image_1 ... @image_10) */}
                    {refImages.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                          <span>
                            Images de référence ({refImages.length}/
                            {KLING_V4_MAX_REFERENCE_IMAGES})
                          </span>
                          <span className="text-[10px] font-normal text-slate-400">
                            Cliquez sur @image_X pour l&apos;insérer dans le
                            prompt
                          </span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {refImages.map((img, idx) => {
                            const tag = `@image_${idx + 1}`;
                            return (
                              <div
                                key={img.localId}
                                className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-square group"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={img.previewUrl}
                                  alt={tag}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveRefItem(img.localId, "image")
                                  }
                                  disabled={isSubmitting}
                                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/85 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                                  title="Supprimer cette image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => insertTagIntoPrompt(tag)}
                                  className="absolute bottom-1 left-1 right-1 py-0.5 px-1.5 rounded bg-slate-900/85 hover:bg-sama-orange text-[10px] font-mono font-bold text-white text-center truncate transition-colors cursor-pointer"
                                  title={`Insérer ${tag} dans le prompt`}
                                >
                                  {tag}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Grille des vidéos de référence importées (@video_1 ... @video_5) */}
                    {refVideos.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                          <span>
                            Vidéos de référence ({refVideos.length}/
                            {KLING_V4_MAX_REFERENCE_VIDEOS})
                          </span>
                          <span className="text-[10px] font-normal text-slate-400">
                            Cliquez sur @video_X pour l&apos;insérer dans le
                            prompt
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {refVideos.map((vid, idx) => {
                            const tag = `@video_${idx + 1}`;
                            return (
                              <div
                                key={vid.localId}
                                className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video group"
                              >
                                <video
                                  src={vid.previewUrl}
                                  muted
                                  playsInline
                                  preload="metadata"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveRefItem(vid.localId, "video")
                                  }
                                  disabled={isSubmitting}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/85 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                                  title="Supprimer cette vidéo"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => insertTagIntoPrompt(tag)}
                                  className="absolute bottom-1.5 left-1.5 py-0.5 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-[10px] font-mono font-bold text-white transition-colors cursor-pointer"
                                  title={`Insérer ${tag} dans le prompt`}
                                >
                                  {tag}
                                </button>
                                {vid.durationSec && (
                                  <span className="absolute bottom-1.5 right-1.5 py-0.5 px-1.5 rounded bg-slate-900/80 text-[10px] font-mono text-slate-200">
                                    ~{vid.durationSec}s
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================= */}
                {/* SOUS-MODE B : CADRES CLÉS (JUSQU'À 10 IMAGES)             */}
                {/* ========================================================= */}
                {mode === "image-to-video" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Séquence d&apos;images clés dans l&apos;ordre :</span>
                      <span className="font-mono font-bold text-sama-orange">
                        {totalCadresCount} / 10 images
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Image de départ (obligatoire) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          1. Image de départ{" "}
                          <span className="text-sama-orange">*</span>
                        </label>
                        <input
                          ref={startFrameInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(e) => {
                            handleSelectSingleFrame(
                              e.target.files?.[0],
                              "start"
                            );
                            e.target.value = "";
                          }}
                          className="hidden"
                        />
                        {startFrame ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={startFrame.previewUrl}
                              alt="Image de départ"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                revokeTrackedObjectUrl(startFrame.previewUrl);
                                setStartFrame(null);
                                refreshIntentKey();
                              }}
                              disabled={isSubmitting}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-slate-900/75 text-[10px] font-semibold text-white">
                              Départ
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startFrameInputRef.current?.click()}
                            disabled={isSubmitting}
                            className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-sama-orange bg-slate-50/60 hover:bg-orange-50/30 flex flex-col items-center justify-center gap-1 p-3 text-center transition-colors cursor-pointer"
                          >
                            <Upload className="w-5 h-5 text-sama-orange" />
                            <span className="text-xs font-semibold text-slate-700">
                              Choisir la 1re image
                            </span>
                            <span className="text-[10px] text-slate-400">
                              JPG, PNG, WebP · max 15 Mo
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Image de fin (optionnelle) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          3. Image de fin{" "}
                          <span className="text-[10px] font-normal text-slate-400">
                            (optionnel)
                          </span>
                        </label>
                        <input
                          ref={endFrameInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(e) => {
                            handleSelectSingleFrame(e.target.files?.[0], "end");
                            e.target.value = "";
                          }}
                          className="hidden"
                        />
                        {endFrame ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={endFrame.previewUrl}
                              alt="Image de fin"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                revokeTrackedObjectUrl(endFrame.previewUrl);
                                setEndFrame(null);
                                refreshIntentKey();
                              }}
                              disabled={isSubmitting}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-slate-900/75 text-[10px] font-semibold text-white">
                              Fin
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => endFrameInputRef.current?.click()}
                            disabled={isSubmitting}
                            className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50 flex flex-col items-center justify-center gap-1 p-3 text-center transition-colors cursor-pointer"
                          >
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-600">
                              Image finale (optionnel)
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Dernier plan
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Images intermédiaires (jusqu'à 8 images) */}
                    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-700">
                            2. Images intermédiaires{" "}
                            <span className="text-[10px] font-normal text-slate-400">
                              ({middleFrames.length}/{KLING_V4_MAX_MIDDLE_FRAMES})
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Étapes entre l&apos;image de départ et la fin
                            (jusqu&apos;à 8 images)
                          </p>
                        </div>
                        <input
                          ref={middleFramesInputRef}
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(e) => {
                            handleAddMiddleFrames(e.target.files);
                            e.target.value = "";
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={
                            isSubmitting ||
                            middleFrames.length >= KLING_V4_MAX_MIDDLE_FRAMES
                          }
                          onClick={() => middleFramesInputRef.current?.click()}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-sama-orange text-[11px] font-bold text-slate-700 cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 text-sama-orange" />
                          <span>Ajouter</span>
                        </button>
                      </div>

                      {middleFrames.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          {middleFrames.map((frame, idx) => (
                            <div
                              key={frame.localId}
                              className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-950 aspect-square"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={frame.previewUrl}
                                alt={`Cadre ${idx + 2}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  revokeTrackedObjectUrl(frame.previewUrl);
                                  setMiddleFrames((prev) =>
                                    prev.filter(
                                      (f) => f.localId !== frame.localId
                                    )
                                  );
                                  refreshIntentKey();
                                }}
                                disabled={isSubmitting}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/85 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-[9px] font-bold text-white">
                                #{idx + 2}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prompt avec coloration @ style Higgsfield et autocomplétion / import d'image */}
            <PromptMentionInput
              textareaRef={promptTextareaRef}
              value={prompt}
              onChange={(nextVal) => {
                setPrompt(nextVal);
                if (formError) setFormError(null);
                refreshIntentKey();
              }}
              disabled={isSubmitting}
              required={mode === "text-to-video" || mode === "reference-to-video"}
              maxLength={KLING_V4_MAX_PROMPT_LENGTH}
              placeholder={
                mode === "reference-to-video"
                  ? "Ex. : Utilise le personnage de @image_1 et le produit de @image_2 dans une boutique moderne en suivant le mouvement de caméra de @video_1..."
                  : mode === "text-to-video"
                  ? "Ex. : Plan cinématique détaillé (tapez @ à tout moment pour référencer ou importer une image)..."
                  : "Ex. : Transition fluide à travers @image_1 vers la scène suivante avec mouvement de caméra doux..."
              }
              availableImages={promptImageOptions}
              availableVideos={promptVideoOptions}
              canImportMoreImages={canImportMorePromptImages}
              nextImageTag={nextPromptImageTag}
              canImportMoreVideos={canImportMorePromptVideos}
              nextVideoTag={nextPromptVideoTag}
              onImportImageForMention={handleImportImageFromMention}
              onImportVideoForMention={handleImportVideoFromMention}
            />

            {/* Durée (3 à 30 s, défaut 5 s) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="video-duration"
                  className="text-xs font-bold text-slate-700"
                >
                  Durée de la vidéo
                </label>
                <span className="text-xs font-extrabold text-sama-orange bg-[#FFF7ED] px-2.5 py-0.5 rounded-full border border-orange-200">
                  {duration} s
                </span>
              </div>
              <input
                id="video-duration"
                type="range"
                min={KLING_V4_MIN_DURATION}
                max={effectiveMaxDuration}
                step={1}
                value={duration}
                disabled={isSubmitting}
                onChange={(e) => {
                  setDuration(Number(e.target.value));
                  refreshIntentKey();
                }}
                className="w-full accent-[#FF6B00] cursor-pointer"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {quickDurations.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setDuration(sec);
                      refreshIntentKey();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      duration === sec
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {sec} s
                  </button>
                ))}
              </div>
            </div>

            {/* Résolution & Ratio */}
            <div className="space-y-3.5">
              {/* Résolution */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Résolution de sortie
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {KLING_V4_RESOLUTIONS.map((resOpt) => {
                    const rate = getRatePerSecondUsd(
                      mode as KlingV4Mode,
                      resOpt,
                      hasRefVideos
                    );
                    const active = resolution === resOpt;
                    return (
                      <button
                        key={resOpt}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setResolution(resOpt);
                          refreshIntentKey();
                        }}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? "border-sama-orange bg-[#FFF7ED] ring-2 ring-sama-orange/30 shadow-xs"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {resOpt === "720p" ? "720p HD" : "1080p FHD"}
                          </span>
                          {active && (
                            <span className="w-2 h-2 rounded-full bg-sama-orange" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {formatUsd(rate)} / s
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio pour text-to-video */}
              {mode === "text-to-video" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Format (Ratio)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {KLING_V4_TEXT_ASPECT_RATIOS.map((ratioOpt) => {
                      const ratioLabels: Record<KlingV4TextAspectRatio, string> =
                        {
                          "16:9": "Paysage",
                          "9:16": "Vertical",
                          "1:1": "Carré",
                          "21:9": "Cinéma",
                        };
                      const active = textAspectRatio === ratioOpt;
                      return (
                        <button
                          key={ratioOpt}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            setTextAspectRatio(ratioOpt);
                            refreshIntentKey();
                          }}
                          className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                            active
                              ? "border-sama-orange bg-[#FFF7ED] ring-2 ring-sama-orange/30 shadow-xs"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-900">
                            {ratioOpt}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {ratioLabels[ratioOpt]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Aspect Ratio pour reference-to-video (inclut Auto / adaptive) */}
              {mode === "reference-to-video" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Format (Ratio)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {KLING_V4_EXTENDED_ASPECT_RATIOS.map((ratioOpt) => {
                      const ratioLabels: Record<
                        KlingV4ExtendedAspectRatio,
                        string
                      > = {
                        adaptive: "Auto",
                        "16:9": "Paysage",
                        "9:16": "Vertical",
                        "1:1": "Carré",
                        "21:9": "Cinéma",
                      };
                      const active = refAspectRatio === ratioOpt;
                      return (
                        <button
                          key={ratioOpt}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            setRefAspectRatio(ratioOpt);
                            refreshIntentKey();
                          }}
                          className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                            active
                              ? "border-sama-orange bg-[#FFF7ED] ring-2 ring-sama-orange/30 shadow-xs"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="text-[11px] font-bold text-slate-900">
                            {ratioOpt === "adaptive" ? "Auto" : ratioOpt}
                          </div>
                          <div className="text-[9px] text-slate-500 truncate">
                            {ratioLabels[ratioOpt]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Aperçu du coût estimé AVANT lancement */}
            <div className="rounded-2xl bg-gradient-to-br from-[#07162C] to-[#0E284F] text-white p-3.5 sm:p-4 border border-slate-700/50 shadow-md flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Coût estimé
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                  {hasRefVideos
                    ? `Sortie ${duration}s + réf. (~${totalRefVideoDurationSec}s) · ${resolution}`
                    : `${duration}s × ${formatUsd(currentRatePerSec)}/s (${resolution})`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black text-sama-orange tracking-tight">
                  {formatUsd(currentEstimatedCostUsd)}
                </div>
                <div className="text-[9px] sm:text-[10px] text-emerald-400 font-medium">
                  ✓ Remboursé si échec
                </div>
              </div>
            </div>

            {/* Erreur de formulaire / API */}
            {formError && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Bouton Générer */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-sama-orange to-[#FF8533] hover:from-[#E66000] hover:to-sama-orange text-white text-sm font-bold shadow-lg shadow-orange-500/25 active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{submitStepLabel || "Envoi en cours..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Générer la vidéo ({formatUsd(currentEstimatedCostUsd)})
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* =================================================================== */}
        {/* 2. GALERIE / HISTORIQUE DES VIDÉOS                                  */}
        {/* =================================================================== */}
        <div
          className={`xl:col-span-7 space-y-4 ${
            mobileTab === "gallery" ? "block" : "hidden xl:block"
          }`}
        >
          <div className="bg-white rounded-2xl px-3.5 sm:px-6 py-3.5 sm:py-4 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Galerie des vidéos</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                  {videos.length}
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                Suivi automatique en temps réel
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileTab("studio")}
                className="xl:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 text-sama-orange text-xs font-bold hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau</span>
              </button>
              <button
                type="button"
                onClick={() => fetchVideos(false)}
                disabled={isRefreshingGallery}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isRefreshingGallery ? "animate-spin text-sama-orange" : ""
                  }`}
                />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            </div>
          </div>

          {isLoadingGallery ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((skeleton) => (
                <div
                  key={skeleton}
                  className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 animate-pulse"
                >
                  <div className="aspect-video rounded-xl bg-slate-100" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-sama-orange flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Film className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Aucune vidéo générée pour le moment
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Configurez votre première séquence Kling 4.0 dans le formulaire
                (texte seul, ou jusqu&apos;à 10 images et 5 vidéos de
                référence).
              </p>
              <button
                type="button"
                onClick={() => setMobileTab("studio")}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sama-orange hover:bg-sama-orange-hover text-white text-xs font-bold shadow-md shadow-orange-500/20 xl:hidden cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Créer ma première vidéo</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((vid) => {
                const expiration = getExpirationState(vid.expires_at);
                const isNonBilled = NON_BILLED_VIDEO_STATUSES.has(vid.status);
                const isTimedOut = timedOutIds.has(vid.id);

                return (
                  <div
                    key={vid.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                        {vid.status === "completed" &&
                        vid.video_url &&
                        !expiration.isExpired ? (
                          <video
                            src={vid.video_url}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-contain bg-black"
                          />
                        ) : vid.status === "completed" &&
                          expiration.isExpired ? (
                          <div className="p-4 text-center text-slate-300 space-y-1.5">
                            <Clock className="w-7 h-7 text-rose-400 mx-auto" />
                            <p className="text-xs font-bold text-white">
                              Lien vidéo expiré (7 jours dépassés)
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Les fichiers temporaires ont été purgés par
                              Higgsfield.
                            </p>
                          </div>
                        ) : vid.status === "queued" ||
                          vid.status === "in_progress" ? (
                          <div className="p-4 sm:p-5 text-center space-y-2">
                            <div className="relative w-10 h-10 mx-auto flex items-center justify-center">
                              <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping" />
                              <Loader2 className="w-7 h-7 text-sama-orange animate-spin relative" />
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-white">
                              {vid.status === "queued"
                                ? "En file d'attente chez Higgsfield..."
                                : "Rendu Kling 4.0 en cours..."}
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-slate-400 max-w-xs mx-auto">
                              {isTimedOut
                                ? "Délai dépassé. Cliquez sur « Vérifier » pour actualiser."
                                : "Calcul GPU en direct · Vos crédits restent garantis."}
                            </p>
                            {isTimedOut && (
                              <button
                                type="button"
                                onClick={() => {
                                  pollStartedAtRef.current.set(
                                    vid.id,
                                    Date.now()
                                  );
                                  setTimedOutIds((prev) => {
                                    const next = new Set(prev);
                                    next.delete(vid.id);
                                    return next;
                                  });
                                  pollSingleJob(vid.id);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sama-orange text-white text-[11px] font-bold cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Vérifier maintenant</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="p-5 text-center space-y-1.5">
                            <XCircle className="w-7 h-7 text-rose-400 mx-auto" />
                            <p className="text-xs font-bold text-white">
                              {vid.status === "nsfw"
                                ? "Bloqué par la modération"
                                : vid.status === "canceled"
                                ? "Génération annulée"
                                : "Échec de la génération"}
                            </p>
                            {vid.error_message && (
                              <p className="text-[11px] text-slate-300 max-w-xs mx-auto line-clamp-3">
                                {vid.error_message}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {renderStatusBadge(vid.status)}
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            {isNonBilled
                              ? "0,00 $ (non facturé)"
                              : formatUsd(vid.estimated_cost_usd)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">
                            {getModeDisplayLabel(vid.mode)}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">
                            {vid.duration} s
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">
                            {vid.resolution}
                          </span>
                          {vid.aspect_ratio && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">
                              {vid.aspect_ratio === "adaptive"
                                ? "Auto"
                                : vid.aspect_ratio}
                            </span>
                          )}
                        </div>

                        {vid.prompt ? (
                          <div className="group relative bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                            <p className="text-xs text-slate-700 line-clamp-2 pr-6 leading-relaxed">
                              {renderFormattedPromptText(vid.prompt)}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(vid.prompt || "");
                                setCopiedPromptId(vid.id);
                                setTimeout(() => setCopiedPromptId(null), 2000);
                              }}
                              className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copier le prompt"
                            >
                              {copiedPromptId === vid.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <p className="text-[11px] italic text-slate-400">
                            Animation d&apos;images sans prompt textuel
                          </p>
                        )}

                        <div className="space-y-1 text-[11px] text-slate-500">
                          <div>
                            Créée le{" "}
                            {new Date(vid.created_at).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {vid.status === "completed" && (
                            <div
                              className={`flex items-center gap-1 font-semibold ${
                                expiration.isExpired
                                  ? "text-rose-600"
                                  : expiration.isExpiringSoon
                                  ? "text-amber-600"
                                  : "text-emerald-700"
                              }`}
                            >
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{expiration.label}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center gap-2">
                      {vid.status === "completed" &&
                        vid.video_url &&
                        !expiration.isExpired && (
                          <button
                            type="button"
                            onClick={() => handleDownloadVideo(vid)}
                            disabled={downloadingId === vid.id}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sama-orange to-[#FF8533] hover:from-[#E66000] hover:to-sama-orange text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                          >
                            {downloadingId === vid.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Téléchargement...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>Télécharger (.mp4)</span>
                              </>
                            )}
                          </button>
                        )}

                      {vid.status === "queued" && (
                        <button
                          type="button"
                          onClick={() => handleCancelJob(vid)}
                          disabled={cancelingId === vid.id}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {cancelingId === vid.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          <span>Annuler</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setVideoToDelete(vid)}
                        className="p-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-600 text-rose-600 hover:text-white transition-colors cursor-pointer ml-auto"
                        title="Supprimer cette vidéo"
                        aria-label="Supprimer cette vidéo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modale de confirmation de suppression */}
      {videoToDelete && (
        <div
          className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            if (!isDeleting) setVideoToDelete(null);
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Supprimer cette vidéo ?
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Cette action retirera définitivement cette création de
                  l&apos;historique du dashboard et demandera la suppression des
                  fichiers distants chez Higgsfield.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setVideoToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Conserver
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Supprimer définitivement</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[95] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
