
-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'creator', 'viewer');

-- Enum for submission status
CREATE TYPE public.submission_status AS ENUM ('draft', 'pending', 'in_review', 'approved', 'rejected', 'live');

-- Enum for content type
CREATE TYPE public.content_type AS ENUM ('feature', 'short', 'documentary', 'series_episode');

-- Function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- User roles table (created BEFORE has_role function)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function for role checks (AFTER user_roles table)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  slug TEXT UNIQUE,
  genre_focus TEXT[],
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + creator role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, slug)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), lower(replace(split_part(NEW.email, '@', 1), '.', '-')));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'creator');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Films table
CREATE TABLE public.films (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  tagline TEXT,
  synopsis TEXT,
  genre TEXT[] DEFAULT '{}',
  content_type content_type NOT NULL DEFAULT 'feature',
  duration_minutes INTEGER,
  release_year INTEGER,
  poster_url TEXT,
  banner_url TEXT,
  trailer_url TEXT,
  video_url TEXT,
  status submission_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  credits JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published films visible to all" ON public.films FOR SELECT USING (status = 'live' OR auth.uid() = creator_id);
CREATE POLICY "Creators can insert own films" ON public.films FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own films" ON public.films FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own films" ON public.films FOR DELETE USING (auth.uid() = creator_id);

CREATE TRIGGER update_films_updated_at BEFORE UPDATE ON public.films
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Shorts table
CREATE TABLE public.shorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  genre TEXT[] DEFAULT '{}',
  status submission_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published shorts visible to all" ON public.shorts FOR SELECT USING (status = 'live' OR auth.uid() = creator_id);
CREATE POLICY "Creators can insert own shorts" ON public.shorts FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own shorts" ON public.shorts FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own shorts" ON public.shorts FOR DELETE USING (auth.uid() = creator_id);

CREATE TRIGGER update_shorts_updated_at BEFORE UPDATE ON public.shorts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  film_id UUID REFERENCES public.films(id) ON DELETE SET NULL,
  short_id UUID REFERENCES public.shorts(id) ON DELETE SET NULL,
  status submission_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  rights_agreed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators can view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Creators can insert own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own submissions" ON public.submissions FOR UPDATE USING (auth.uid() = creator_id);

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_films_creator ON public.films(creator_id);
CREATE INDEX idx_films_status ON public.films(status);
CREATE INDEX idx_films_genre ON public.films USING GIN(genre);
CREATE INDEX idx_shorts_creator ON public.shorts(creator_id);
CREATE INDEX idx_shorts_status ON public.shorts(status);
CREATE INDEX idx_profiles_slug ON public.profiles(slug);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('posters', 'posters', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

-- Storage policies
CREATE POLICY "Public read posters" ON storage.objects FOR SELECT USING (bucket_id = 'posters');
CREATE POLICY "Creators upload posters" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posters' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Creators update posters" ON storage.objects FOR UPDATE USING (bucket_id = 'posters' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Creators delete posters" ON storage.objects FOR DELETE USING (bucket_id = 'posters' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Creators upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Creators update videos" ON storage.objects FOR UPDATE USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Creators delete videos" ON storage.objects FOR DELETE USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');
CREATE POLICY "Creators upload thumbnails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Creators update thumbnails" ON storage.objects FOR UPDATE USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Creators delete thumbnails" ON storage.objects FOR DELETE USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
