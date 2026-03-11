import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Play, Volume2, VolumeX, Heart, Share2, Smartphone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';

const Verticals = () => {
  const [verticals, setVerticals] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    supabase
      .from('verticals')
      .select('id, title, description, thumbnail_url, video_url, duration_seconds, genre, view_count, like_count')
      .eq('status', 'live')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setVerticals(data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [currentIndex]);

  const goNext = useCallback(() => setCurrentIndex((p) => Math.min(p + 1, verticals.length - 1)), [verticals.length]);
  const goPrev = useCallback(() => setCurrentIndex((p) => Math.max(p - 1, 0)), []);

  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') goNext();
      if (e.key === 'ArrowUp' || e.key === 'k') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  useEffect(() => {
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goNext();
        else goPrev();
      }
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goNext, goPrev]);

  const formatCount = (v?: number) => {
    if (!v) return '0';
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toString();
  };

  if (loading) return (
    <div className="h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground font-mono text-sm">Loading...</p>
    </div>
  );

  if (verticals.length === 0) return (
    <div className="h-screen bg-background">
      <Navbar />
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <Smartphone size={48} className="text-primary opacity-50" />
        <h2 className="font-display text-xl font-bold text-foreground">No Verticals Yet</h2>
        <p className="text-muted-foreground font-body text-sm max-w-xs text-center">
          Short-form vertical videos are coming soon. Submit yours to be first!
        </p>
      </div>
    </div>
  );

  const vertical = verticals[currentIndex];

  return (
    <div className="h-screen bg-background overflow-hidden">
      <Navbar />
      <div className="h-full flex items-center justify-center pt-16">
        <div className="relative w-full max-w-[380px] h-[calc(100vh-80px)] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={vertical.id}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -80 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0 rounded-sm overflow-hidden gold-border"
            >
              {vertical.video_url ? (
                <>
                  <video
                    ref={videoRef}
                    src={vertical.video_url}
                    muted={muted}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    poster={vertical.thumbnail_url || undefined}
                    onClick={handlePlayToggle}
                  />
                  {!playing && (
                    <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={handlePlayToggle}>
                      <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center gold-border hover:bg-primary/40 transition-colors">
                        <Play size={24} fill="hsl(var(--primary))" className="text-primary ml-1" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <img
                    src={vertical.thumbnail_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=360&h=640&fit=crop'}
                    alt={vertical.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-background/80 backdrop-blur-sm rounded-sm px-4 py-2">
                      <p className="font-mono text-xs text-muted-foreground">Video coming soon</p>
                    </div>
                  </div>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/20 pointer-events-none" />

              {/* Right side actions */}
              <div className="absolute right-4 bottom-36 flex flex-col items-center gap-6">
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Heart size={20} className="text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {formatCount(vertical.like_count)}
                  </span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Share2 size={18} className="text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">Share</span>
                </button>
                <button onClick={() => setMuted(!muted)} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center">
                    {muted ? <VolumeX size={18} className="text-foreground" /> : <Volume2 size={18} className="text-primary" />}
                  </div>
                </button>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-6 left-4 right-20">
                <h2 className="font-display text-lg font-bold text-foreground drop-shadow-lg">{vertical.title}</h2>
                {vertical.description && (
                  <p className="font-body text-xs text-muted-foreground mt-1.5 line-clamp-2 drop-shadow-lg">{vertical.description}</p>
                )}
                {vertical.genre && vertical.genre.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {vertical.genre.slice(0, 3).map((g: string) => (
                      <span key={g} className="font-mono text-[9px] uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-sm">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
                <p className="font-mono text-[9px] text-muted-foreground mt-2">
                  {formatCount(vertical.view_count)} views
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <div className="absolute -right-14 top-1/2 -translate-y-1/2 flex flex-col gap-3 hidden sm:flex">
            <button onClick={goPrev} disabled={currentIndex === 0} className="w-10 h-10 rounded-full gold-border flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">
              <ChevronUp size={18} />
            </button>
            <button onClick={goNext} disabled={currentIndex === verticals.length - 1} className="w-10 h-10 rounded-full gold-border flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Progress dots */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex-col gap-2 hidden sm:flex">
            {verticals.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((_, i) => {
              const realIndex = Math.max(0, currentIndex - 3) + i;
              return (
                <button
                  key={realIndex}
                  onClick={() => setCurrentIndex(realIndex)}
                  className={`w-1.5 rounded-full transition-all ${
                    realIndex === currentIndex ? 'h-6 bg-primary' : 'h-1.5 bg-muted-foreground/30'
                  }`}
                />
              );
            })}
          </div>

          {/* Counter */}
          <div className="absolute top-4 left-4 bg-background/60 backdrop-blur-sm rounded-sm px-2 py-1">
            <span className="font-mono text-[10px] text-foreground">
              {currentIndex + 1} / {verticals.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verticals;
