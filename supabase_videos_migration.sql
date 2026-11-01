-- ==============================================================================
-- SAMA PUB — MIGRATION SUPABASE : SECTION CRÉATION VIDÉO (KLING 4.0 / HIGGSFIELD)
-- À exécuter dans l'éditeur SQL de votre projet Supabase (SQL Editor -> New query)
-- ==============================================================================

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

CREATE INDEX IF NOT EXISTS idx_video_generations_created_at
  ON public.video_generations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_video_generations_request_id
  ON public.video_generations (request_id);

CREATE INDEX IF NOT EXISTS idx_video_generations_status
  ON public.video_generations (status);

CREATE INDEX IF NOT EXISTS idx_video_generations_user_date
  ON public.video_generations (created_by, created_at DESC);

ALTER TABLE public.video_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture video_generations dashboard" ON public.video_generations;
CREATE POLICY "Lecture video_generations dashboard"
  ON public.video_generations
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Insertion video_generations dashboard" ON public.video_generations;
CREATE POLICY "Insertion video_generations dashboard"
  ON public.video_generations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Mise a jour video_generations dashboard" ON public.video_generations;
CREATE POLICY "Mise a jour video_generations dashboard"
  ON public.video_generations
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Suppression video_generations dashboard" ON public.video_generations;
CREATE POLICY "Suppression video_generations dashboard"
  ON public.video_generations
  FOR DELETE
  TO anon, authenticated
  USING (true);

