-- Create referrals table for tracking creator referrals
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Creators can view their own referrals
CREATE POLICY "Creators can view own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_id);

-- System can insert referrals (via trigger/function)
CREATE POLICY "System can insert referrals"
  ON public.referrals
  FOR INSERT
  WITH CHECK (auth.uid() = referred_user_id);

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
  ON public.referrals
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update referrals (for is_active status)
CREATE POLICY "Admins can update referrals"
  ON public.referrals
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON public.referrals(referred_user_id);