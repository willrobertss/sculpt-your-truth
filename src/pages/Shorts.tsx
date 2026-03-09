import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Play, Volume2, VolumeX, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';

const Shorts = () => {
  const [shorts, setShorts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('shorts')
      .select('id, title, description, thumbnail_url, duration_seconds, genre, view_count')
      .eq('status', 'live')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setShorts(data || []);
        setLoading(false);
      });
  }, []);

  const goNext = () => setCurrentIndex((p) => Math.min(p + 1, shorts.length - 1));
  const goPrev = () => setCurrentIndex((p) => Math.max(p - 1, 0));

  if (loading) return (
    <div className="h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground font-mono text-sm">Loading...</p>
    </div>
  );

  if (shorts.length === 0) return (
    <div className="h-screen bg-background">
      <Navbar />
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground font-display text-lg">No shorts available yet</p>
      </div>
    </div>
  );

  const short = shorts[currentIndex];

  return (
    <div className="h-screen bg-background overflow-hidden">
      <Navbar />
      <div className="h-full flex items-center justify-center pt-16">
        <div className="relative w-full max-w-[400px] h-[calc(100vh-80px)] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={short.id}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 rounded-sm overflow-hidden gold-border"
            >
              <img
                src={short.thumbnail_url || 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a3aaf?w=360&h=640&fit=crop'}
                alt={short.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/30" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center gold-border cursor-pointer hover:bg-primary/40 transition-colors">
                  <Play size={24} fill="hsl(var(--primary))" className="text-primary ml-1" />
                </div>
              </div>

              <div className="absolute right-4 bottom-32 flex flex-col items-center gap-5">
                <button className="flex flex-col items-center gap-1">
                  <Heart size={24} className="text-foreground hover:text-primary transition-colors" />
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {short.view_count ? (short.view_count / 1000).toFixed(1) + 'K' : ''}
                  </span>
                </button>
                <button onClick={() => setMuted(!muted)}>
                  {muted ? <VolumeX size={22} className="text-foreground" /> : <Volume2 size={22} className="text-primary" />}
                </button>
              </div>

              <div className="absolute bottom-6 left-4 right-16">
                <h2 className="font-display text-lg font-bold text-foreground">{short.title}</h2>
                {short.description && (
                  <p className="font-body text-xs text-muted-foreground mt-2 line-clamp-2">{short.description}</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute -right-14 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            <button onClick={goPrev} disabled={currentIndex === 0} className="w-10 h-10 rounded-full gold-border flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">
              <ChevronUp size={18} />
            </button>
            <button onClick={goNext} disabled={currentIndex === shorts.length - 1} className="w-10 h-10 rounded-full gold-border flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">
              <ChevronDown size={18} />
            </button>
          </div>

          <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            {shorts.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'h-6 bg-primary' : 'h-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shorts;
