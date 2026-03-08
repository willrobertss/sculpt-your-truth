import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Upload, FileText, Shield, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GoldButton from '@/components/GoldButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { icon: Check, label: 'Account' },
  { icon: Upload, label: 'Upload' },
  { icon: FileText, label: 'Details' },
  { icon: Shield, label: 'Rights' },
  { icon: Send, label: 'Submit' },
];

const Submit = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [genre, setGenre] = useState('');
  const [contentType, setContentType] = useState<'feature' | 'short'>('feature');
  const [rightsAgreed, setRightsAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setCurrentStep(1);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setCurrentStep(1);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const table = contentType === 'short' ? 'shorts' : 'films';
      const insertData = contentType === 'short'
        ? { creator_id: user.id, title, description: synopsis, genre: genre.split(',').map(g => g.trim()), status: 'pending' as const }
        : { creator_id: user.id, title, synopsis, genre: genre.split(',').map(g => g.trim()), content_type: contentType as any, status: 'pending' as const };

      const { data, error } = await supabase.from(table).insert(insertData).select().single();
      if (error) throw error;

      // Create submission record
      const submissionData = contentType === 'short'
        ? { creator_id: user.id, short_id: data.id, status: 'pending' as const, rights_agreed: true }
        : { creator_id: user.id, film_id: data.id, status: 'pending' as const, rights_agreed: true };

      await supabase.from('submissions').insert(submissionData);

      setSubmitted(true);
      toast({ title: 'Submitted!', description: 'Your content has been submitted for review.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 text-center container mx-auto px-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-6 gold-glow">
            <Check size={32} className="text-primary" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Submission Received!</h1>
          <p className="font-body text-muted-foreground mb-8">Our curatorial team will review your submission within 5-10 business days.</p>
          <div className="flex gap-3 justify-center">
            <GoldButton onClick={() => navigate('/dashboard')}>Go to Dashboard</GoldButton>
            <GoldButton variant="outline" onClick={() => { setSubmitted(false); setCurrentStep(1); setTitle(''); setSynopsis(''); }}>
              Submit Another
            </GoldButton>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Submit Your Work</h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    i <= currentStep ? 'bg-primary text-primary-foreground' : 'gold-border text-muted-foreground'
                  }`}
                >
                  {i < currentStep ? <Check size={14} /> : <step.icon size={14} />}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-px ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card gold-border rounded-sm p-6">
            {currentStep === 0 && (
              <div className="text-center space-y-4">
                <h2 className="font-display text-xl font-bold text-foreground">Sign In Required</h2>
                <p className="font-body text-sm text-muted-foreground">You need a creator account to submit content.</p>
                <GoldButton onClick={() => navigate('/login')}>Sign In / Create Account</GoldButton>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-foreground">Upload</h2>
                <p className="font-body text-sm text-muted-foreground">Select your content type. Video upload will be available once your submission is approved.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setContentType('feature')}
                    className={`flex-1 p-4 rounded-sm text-center transition-colors ${
                      contentType === 'feature' ? 'bg-primary/10 gold-border text-primary' : 'bg-surface text-muted-foreground'
                    }`}
                  >
                    <p className="font-mono text-xs uppercase tracking-widest">Feature / Doc</p>
                  </button>
                  <button
                    onClick={() => setContentType('short')}
                    className={`flex-1 p-4 rounded-sm text-center transition-colors ${
                      contentType === 'short' ? 'bg-primary/10 gold-border text-primary' : 'bg-surface text-muted-foreground'
                    }`}
                  >
                    <p className="font-mono text-xs uppercase tracking-widest">Short Film</p>
                  </button>
                </div>
                <GoldButton className="w-full" onClick={() => setCurrentStep(2)}>Continue</GoldButton>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-foreground">Details</h2>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Film title" className="bg-surface border-border" required />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Synopsis</Label>
                  <Textarea value={synopsis} onChange={(e) => setSynopsis(e.target.value)} placeholder="Brief description..." className="bg-surface border-border min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Genre(s)</Label>
                  <Input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Drama, Thriller" className="bg-surface border-border" />
                </div>
                <div className="flex gap-3">
                  <GoldButton variant="outline" onClick={() => setCurrentStep(1)}>Back</GoldButton>
                  <GoldButton className="flex-1" onClick={() => setCurrentStep(3)} disabled={!title}>Continue</GoldButton>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-foreground">Rights Agreement</h2>
                <div className="bg-surface rounded-sm p-4 max-h-48 overflow-y-auto">
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    By submitting your content to OPPRIME.tv, you confirm that you are the rightful owner or have obtained all necessary rights, licenses, and permissions for the content. You grant OPPRIME.tv a non-exclusive license to stream, display, and promote your content on our platform. You retain full ownership of your work. Revenue sharing terms apply as outlined in our Creator Agreement. You may request removal of your content at any time through your dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="rights"
                    checked={rightsAgreed}
                    onCheckedChange={(c) => setRightsAgreed(c === true)}
                  />
                  <label htmlFor="rights" className="font-mono text-xs text-muted-foreground cursor-pointer">
                    I agree to the terms above
                  </label>
                </div>
                <div className="flex gap-3">
                  <GoldButton variant="outline" onClick={() => setCurrentStep(2)}>Back</GoldButton>
                  <GoldButton className="flex-1" onClick={() => setCurrentStep(4)} disabled={!rightsAgreed}>Continue</GoldButton>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-5 text-center">
                <h2 className="font-display text-xl font-bold text-foreground">Review & Submit</h2>
                <div className="bg-surface rounded-sm p-4 text-left space-y-2">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Title</p>
                  <p className="text-foreground text-sm">{title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-3">Type</p>
                  <p className="text-foreground text-sm capitalize">{contentType}</p>
                  {synopsis && (
                    <>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-3">Synopsis</p>
                      <p className="text-foreground text-sm">{synopsis}</p>
                    </>
                  )}
                  {genre && (
                    <>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-3">Genre</p>
                      <p className="text-foreground text-sm">{genre}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-3">
                  <GoldButton variant="outline" onClick={() => setCurrentStep(3)}>Back</GoldButton>
                  <GoldButton className="flex-1" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit for Review'}
                  </GoldButton>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Submit;
