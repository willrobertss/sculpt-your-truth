
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_slug text;
BEGIN
  base_slug := lower(replace(split_part(NEW.email, '@', 1), '.', '-'));
  
  IF EXISTS (SELECT 1 FROM public.profiles WHERE slug = base_slug) THEN
    base_slug := base_slug || '-' || substr(md5(random()::text), 1, 4);
  END IF;

  INSERT INTO public.profiles (user_id, display_name, slug)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), base_slug);
  
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'creator');
  
  IF NEW.email = 'will@actorwillroberts.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$function$;
