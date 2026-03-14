import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GoldButton from '@/components/GoldButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: 'Password updated!', description: 'You can now sign in with your new password.' });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center film-grain">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm mx-6"
      >
        <div className="text-center mb-8">
          <a href="/" className="font-display text-3xl font-bold tracking-wider">
            <span className="text-foreground">OPPRIME</span>
            <span className="text-primary">.tv</span>
          </a>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-3">
            Set Your New Password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card gold-border rounded-sm p-6 space-y-5">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-surface border-border pr-10"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <GoldButton type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </GoldButton>
        </form>

        <p className="text-center mt-6 font-mono text-xs text-muted-foreground">
          <a href="/login" className="text-primary hover:text-gold-light transition-colors">Back to Sign In</a>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
