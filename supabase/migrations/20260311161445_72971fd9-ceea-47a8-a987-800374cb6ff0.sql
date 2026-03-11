
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, slug)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), lower(replace(split_part(NEW.email, '@', 1), '.', '-')));
  
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'creator');
  
  IF NEW.email = 'will@actorwillroberts.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$function$;
