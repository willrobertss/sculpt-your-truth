import { supabase } from '@/integrations/supabase/client';

const REFERRAL_STORAGE_KEY = 'opprime_referrer';

interface StoredReferral {
  referrerId: string;
  timestamp: number;
  expiresAt: number;
}

export const getStoredReferral = (): StoredReferral | null => {
  try {
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!stored) return null;

    const referral: StoredReferral = JSON.parse(stored);
    
    // Check if expired
    if (Date.now() > referral.expiresAt) {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
      return null;
    }

    return referral;
  } catch {
    return null;
  }
};

export const clearStoredReferral = () => {
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
};

export const processReferralAttribution = async (newUserId: string): Promise<boolean> => {
  const referral = getStoredReferral();
  
  if (!referral || !referral.referrerId) {
    return false;
  }

  // Don't allow self-referral
  if (referral.referrerId === newUserId) {
    clearStoredReferral();
    return false;
  }

  try {
    // Insert the referral record
    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referral.referrerId,
        referred_user_id: newUserId,
        is_active: true,
      });

    if (error) {
      // Likely a duplicate (user already referred) - ignore
      console.log('Referral attribution skipped:', error.message);
    }

    // Clear the stored referral regardless of success
    clearStoredReferral();
    
    return !error;
  } catch (err) {
    console.error('Failed to process referral:', err);
    clearStoredReferral();
    return false;
  }
};
