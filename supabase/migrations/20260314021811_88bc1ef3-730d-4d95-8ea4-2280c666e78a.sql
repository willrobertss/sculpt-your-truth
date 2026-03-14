ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS poster_url text,
  ADD COLUMN IF NOT EXISTS preview_clip_url text,
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;