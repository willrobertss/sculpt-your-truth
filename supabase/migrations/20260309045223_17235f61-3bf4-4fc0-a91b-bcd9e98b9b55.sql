-- Create verticals table for TikTok/Reels-style portrait videos
CREATE TABLE public.verticals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  genre TEXT[] DEFAULT '{}'::text[],
  tags TEXT[] DEFAULT '{}'::text[],
  status public.submission_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verticals ENABLE ROW LEVEL SECURITY;

-- Published verticals visible to all
CREATE POLICY "Published verticals visible to all"
  ON public.verticals FOR SELECT
  USING ((status = 'live') OR (auth.uid() = creator_id));

-- Admins can select all verticals
CREATE POLICY "Admins can select all verticals"
  ON public.verticals FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Creators can insert own verticals
CREATE POLICY "Creators can insert own verticals"
  ON public.verticals FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update own verticals
CREATE POLICY "Creators can update own verticals"
  ON public.verticals FOR UPDATE
  USING (auth.uid() = creator_id);

-- Creators can delete own verticals
CREATE POLICY "Creators can delete own verticals"
  ON public.verticals FOR DELETE
  USING (auth.uid() = creator_id);

-- Admins can update all verticals
CREATE POLICY "Admins can update all verticals"
  ON public.verticals FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete all verticals
CREATE POLICY "Admins can delete all verticals"
  ON public.verticals FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for performance
CREATE INDEX idx_verticals_creator_id ON public.verticals(creator_id);
CREATE INDEX idx_verticals_status ON public.verticals(status);

-- Add updated_at trigger
CREATE TRIGGER update_verticals_updated_at
  BEFORE UPDATE ON public.verticals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();