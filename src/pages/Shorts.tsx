import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Play, Volume2, VolumeX, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { mockShorts } from '@/lib/mock-data';

const Shorts = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  const goNext = () => setCurrentIndex((p) => Math.min(p + 1, mockShorts.length - 1));
  const goPrev = () => setCurrentIndex((p) => Math.max(p - 1, 0));

  const short = mockShorts[currentIndex];

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
                src={short.thumbnail_url}
                alt={short.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/30" />

              {/* Play icon center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center gold-border cursor-pointer hover:bg-primary/40 transition-colors">
                  <Play size={24} fill="hsl(var(--primary))" className="text-primary ml-1" />
                </div>
              </div>

              {/* Right actions */}
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

              {/* Bottom info */}
              <div className="absolute bottom-6 left-4 right-16">
                <h2 className="font-display text-lg font-bold text-foreground">{short.title}</h2>
                <p className="font-mono text-[10px] text-primary uppercase tracking-widest mt-1">@{short.creator_name}</p>
                {short.description && (
                  <p className="font-body text-xs text-muted-foreground mt-2 line-clamp-2">{short.description}</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows */}
          <div className="absolute -right-14 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full gold-border flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronUp size={18} />
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === mockShorts.length - 1}
              className="w-10 h-10 rounded-full gold-border flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Progress dots */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            {mockShorts.map((_, i) => (
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
