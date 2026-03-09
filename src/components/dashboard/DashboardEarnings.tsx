import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Copy, Check, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface Props {
  profile: any;
  user: any;
}

interface Referral {
  id: string;
  referred_user_id: string;
  created_at: string;
  is_active: boolean;
}

const ROYALTY_PER_REFERRAL = 1.00; // $1.00 per active referral per month

const DashboardEarnings = ({ profile, user }: Props) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const referralLink = `${window.location.origin}/ref/${profile?.slug || user?.id}`;

  useEffect(() => {
    const loadReferrals = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReferrals(data);
      }
      setLoading(false);
    };

    loadReferrals();
  }, [user?.id]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: 'Link copied!', description: 'Share it with potential subscribers.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const activeReferrals = referrals.filter(r => r.is_active).length;
  const totalReferrals = referrals.length;
  const estimatedMonthlyPayout = activeReferrals * ROYALTY_PER_REFERRAL;
  const lifetimeEarnings = referrals.reduce((sum, r) => {
    // Calculate months since referral (simplified - assumes active since creation)
    const monthsActive = r.is_active
      ? Math.max(1, Math.ceil((Date.now() - new Date(r.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000)))
      : Math.ceil((Date.now() - new Date(r.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000)) - 1;
    return sum + (monthsActive * ROYALTY_PER_REFERRAL);
  }, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">Earnings & Referrals</h1>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-8">
        Earn royalties by referring new subscribers
      </p>

      {/* Referral Link Card */}
      <div className="bg-card gold-border rounded-sm p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground">Your Referral Link</h2>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Share this link to earn ${ROYALTY_PER_REFERRAL.toFixed(2)}/month for each active subscriber you refer.
          Attribution lasts 30 days after someone clicks your link.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-surface border border-border rounded-sm px-4 py-2.5 font-mono text-xs text-foreground truncate">
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card gold-border rounded-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Active Referrals
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">{activeReferrals}</p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1">
            of {totalReferrals} total
          </p>
        </div>

        <div className="bg-card gold-border rounded-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Est. Monthly Payout
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">
            ${estimatedMonthlyPayout.toFixed(2)}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1">
            based on active referrals
          </p>
        </div>

        <div className="bg-card gold-border rounded-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-amber-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Lifetime Earnings
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">
            ${lifetimeEarnings.toFixed(2)}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1">
            estimated total
          </p>
        </div>
      </div>

      {/* Referred Users Table */}
      <div className="bg-card gold-border rounded-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg font-bold text-foreground">Referred Subscribers</h2>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            Anonymized for privacy
          </p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <p className="font-mono text-xs text-muted-foreground">Loading...</p>
          </div>
        ) : referrals.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={32} className="text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="font-body text-sm text-muted-foreground">No referrals yet</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-2">
              Share your link to start earning
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">Join Date</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-right">Monthly Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-muted-foreground" />
                      {new Date(referral.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-widest ${
                      referral.is_active
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${referral.is_active ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                      {referral.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {referral.is_active ? `$${ROYALTY_PER_REFERRAL.toFixed(2)}` : '$0.00'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-surface rounded-sm border border-border">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">How it works</p>
        <ul className="space-y-1 font-body text-xs text-muted-foreground">
          <li>• Share your unique referral link with potential subscribers</li>
          <li>• When they sign up within 30 days of clicking your link, you get credit</li>
          <li>• Earn ${ROYALTY_PER_REFERRAL.toFixed(2)}/month for each active referred subscriber</li>
          <li>• Payouts are processed manually at the end of each month</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default DashboardEarnings;
