
-- Admin can SELECT all films (including non-live)
CREATE POLICY "Admins can select all films"
ON public.films FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can UPDATE all films
CREATE POLICY "Admins can update all films"
ON public.films FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can DELETE all films
CREATE POLICY "Admins can delete all films"
ON public.films FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can SELECT all shorts
CREATE POLICY "Admins can select all shorts"
ON public.shorts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can UPDATE all shorts
CREATE POLICY "Admins can update all shorts"
ON public.shorts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can DELETE all shorts
CREATE POLICY "Admins can delete all shorts"
ON public.shorts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can SELECT all submissions
CREATE POLICY "Admins can select all submissions"
ON public.submissions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can UPDATE all submissions
CREATE POLICY "Admins can update all submissions"
ON public.submissions FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can UPDATE all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can SELECT all user_roles
CREATE POLICY "Admins can select all user_roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can INSERT user_roles
CREATE POLICY "Admins can insert user_roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can DELETE user_roles
CREATE POLICY "Admins can delete user_roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL testimonials (including inactive)
CREATE POLICY "Admins can select all testimonials"
ON public.testimonials FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
