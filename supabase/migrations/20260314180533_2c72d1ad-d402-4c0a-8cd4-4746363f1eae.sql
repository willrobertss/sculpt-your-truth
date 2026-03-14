
-- Create ad placement type enum
CREATE TYPE public.ad_placement_type AS ENUM ('pre_roll', 'mid_roll', 'post_roll');

-- Create ads table
CREATE TABLE public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  video_url text NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create ad_placements table
CREATE TABLE public.ad_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  video_id text NOT NULL,
  placement ad_placement_type NOT NULL DEFAULT 'pre_roll',
  trigger_at_seconds integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;

-- RLS for ads: admin CRUD, public SELECT
CREATE POLICY "Admins can insert ads" ON public.ads FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update ads" ON public.ads FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete ads" ON public.ads FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can select all ads" ON public.ads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view active ads" ON public.ads FOR SELECT USING (is_active = true);

-- RLS for ad_placements: admin CRUD, public SELECT
CREATE POLICY "Admins can insert ad_placements" ON public.ad_placements FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update ad_placements" ON public.ad_placements FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete ad_placements" ON public.ad_placements FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can select all ad_placements" ON public.ad_placements FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view ad_placements" ON public.ad_placements FOR SELECT USING (true);

-- Create ads storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('ads', 'ads', true);

-- Storage RLS: admins can upload, public can read
CREATE POLICY "Admins can upload ads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ads' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update ads files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'ads' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete ads files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'ads' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view ads files" ON storage.objects FOR SELECT USING (bucket_id = 'ads');

-- Updated_at trigger for ads
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
