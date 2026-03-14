import { useEffect, useRef, useState } from 'react';
import { Play, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GoldButton from './GoldButton';
import { getThumbnailUrl } from '@/lib/opprime-client';

interface FeaturedVideo {
  id: string;
  title: string;
  synopsis: string | null;
  thumbnail: string | null;
  poster_url?: string | null;
  preview_clip_url?: string | null;
}

interface HeroBillboardProps {
  video: FeaturedVideo | null;
  fallbackImage: string;
}

const HeroBillboard = ({ video, fallbackImage }: HeroBillboardProps) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (video?.preview_clip_url) {
      const timer = setTimeout(() => setShowVideo(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [video?.preview_clip_url]);

  if (!video) {
    // Fallback to static hero
    return (
      <section className="relative h-[75vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={fallbackImage} alt="" className="w-full h-full object-cover opacity-50" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </section>
    );
  }

  const bgImage = video.poster_url || getThumbnailUrl(video.thumbnail);

  return (
    <section className="relative h-[75vh] flex items-end overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={bgImage} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Preview video overlay */}
      {showVideo && video.preview_clip_url && (
        <video
          ref={videoRef}
          src={video.preview_clip_url}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setShowVideo(false)}
        />
      )}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 container mx-auto px-6 pb-16 max-w-2xl"
      >
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
          {video.title}
        </h1>
        {video.synopsis && (
          <p className="font-body text-sm md:text-base text-muted-foreground line-clamp-3 mb-6 max-w-lg">
            {video.synopsis}
          </p>
        )}
        <div className="flex gap-3">
          <GoldButton size="md" onClick={() => navigate(`/watch/${video.id}`)}>
            <Play size={16} className="mr-2" fill="currentColor" /> Play
          </GoldButton>
          <GoldButton size="md" variant="outline" onClick={() => navigate(`/watch/${video.id}`)}>
            <Info size={16} className="mr-2" /> More Info
          </GoldButton>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroBillboard;
