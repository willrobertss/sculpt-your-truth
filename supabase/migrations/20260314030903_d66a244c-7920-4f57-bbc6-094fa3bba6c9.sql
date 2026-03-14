
CREATE TABLE public.video_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view comments" ON public.video_comments FOR SELECT TO public USING (true);
CREATE POLICY "Auth users can insert comments" ON public.video_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.video_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Public can view likes" ON public.video_likes FOR SELECT TO public USING (true);
CREATE POLICY "Auth users can toggle likes" ON public.video_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.video_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
