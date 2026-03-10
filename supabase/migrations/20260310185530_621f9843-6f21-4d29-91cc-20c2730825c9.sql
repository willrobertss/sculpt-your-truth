
-- Series table
CREATE TABLE public.series (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

-- Videos table
CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  synopsis text,
  thumbnail text,
  approved boolean NOT NULL DEFAULT false,
  thumb_approved boolean NOT NULL DEFAULT false,
  reviewed boolean NOT NULL DEFAULT false,
  "belowAge" boolean NOT NULL DEFAULT false,
  serie_id uuid REFERENCES public.series(id) ON DELETE SET NULL,
  creator_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Credits table
CREATE TABLE public.credits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id uuid REFERENCES public.videos(id) ON DELETE CASCADE,
  serie_id uuid REFERENCES public.series(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Genres table
CREATE TABLE public.genres (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

-- Sub-genres table
CREATE TABLE public.sub_genres (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  genre_id uuid NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  name text NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.sub_genres ENABLE ROW LEVEL SECURITY;

-- RLS policies for series
CREATE POLICY "Admins can select all series" ON public.series FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view series" ON public.series FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert series" ON public.series FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update series" ON public.series FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete series" ON public.series FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for videos
CREATE POLICY "Public can view approved videos" ON public.videos FOR SELECT TO public USING (approved = true);
CREATE POLICY "Admins can select all videos" ON public.videos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert videos" ON public.videos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update videos" ON public.videos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete videos" ON public.videos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for credits
CREATE POLICY "Public can view credits" ON public.credits FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert credits" ON public.credits FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update credits" ON public.credits FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete credits" ON public.credits FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for genres
CREATE POLICY "Public can view genres" ON public.genres FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert genres" ON public.genres FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update genres" ON public.genres FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete genres" ON public.genres FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for sub_genres
CREATE POLICY "Public can view sub_genres" ON public.sub_genres FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert sub_genres" ON public.sub_genres FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sub_genres" ON public.sub_genres FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sub_genres" ON public.sub_genres FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
