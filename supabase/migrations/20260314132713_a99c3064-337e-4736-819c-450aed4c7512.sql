ALTER TABLE public.video_likes ALTER COLUMN video_id TYPE text USING video_id::text;
ALTER TABLE public.video_comments ALTER COLUMN video_id TYPE text USING video_id::text;