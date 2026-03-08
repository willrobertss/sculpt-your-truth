import { motion } from 'framer-motion';
import { Play, Eye } from 'lucide-react';

interface ShortCardProps {
  id: string;
  title: string;
  thumbnail_url: string;
  duration_seconds?: number;
  view_count?: number;
  creator_name?: string;
}

const ShortCard = ({ title, thumbnail_url, duration_seconds, view_count, creator_name }: ShortCardProps) => {
  const formatDuration = (s?: number) => {
    if (!s) return '';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const formatViews = (v?: number) => {
    if (!v) return '';
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toString();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="relative group flex-shrink-0 w-[140px] md:w-[180px] cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-sm aspect-[9/16] gold-border">
        <img
          src={thumbnail_url}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
            <Play size={20} fill="hsl(var(--primary-foreground))" className="text-primary-foreground ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        {duration_seconds && (
          <div className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm rounded-sm px-1.5 py-0.5">
            <span className="font-mono text-[10px] text-foreground">{formatDuration(duration_seconds)}</span>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-display text-xs font-semibold text-foreground truncate">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            {creator_name && <span className="font-mono text-[9px] text-muted-foreground truncate">{creator_name}</span>}
            {view_count && (
              <span className="font-mono text-[9px] text-muted-foreground flex items-center gap-0.5">
                <Eye size={8} /> {formatViews(view_count)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShortCard;
