import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const REFERRAL_STORAGE_KEY = 'opprime_referrer';
const REFERRAL_EXPIRY_DAYS = 30;

const ReferralLanding = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const storeReferral = async () => {
      if (!slug) {
        navigate('/');
        return;
      }

      // Look up the referrer by slug or user ID
      let referrerId: string | null = null;

      // First try to find by profile slug
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('slug', slug)
        .single();

      if (profileData) {
        referrerId = profileData.user_id;
      } else {
        // Check if slug is a valid UUID (direct user ID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(slug)) {
          referrerId = slug;
        }
      }

      if (referrerId) {
        // Store referral data in localStorage with expiry
        const referralData = {
          referrerId,
          timestamp: Date.now(),
          expiresAt: Date.now() + (REFERRAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        };
        localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(referralData));
      }

      // Redirect to homepage or signup
      navigate('/login');
    };

    storeReferral();
  }, [slug, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center film-grain">
      <div className="text-center">
        <div className="font-display text-2xl font-bold tracking-wider mb-4">
          <span className="text-foreground">OPPRIME</span>
          <span className="text-primary">.tv</span>
        </div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Redirecting...
        </p>
      </div>
    </div>
  );
};

export default ReferralLanding;
