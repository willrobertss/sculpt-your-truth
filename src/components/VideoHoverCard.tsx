import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { getThumbnailUrl } from '@/lib/opprime-client';

interface VideoHoverCardProps {
  id: string;
  title: string;
  thumbnail: string | null;
  poster_url?: string | null;
  synopsis?: string | null;
  genre_name?: string;
  /** When true, renders as a tall portrait card (9:16) for verticals */
  vertical?: boolean;
  /** Link prefix — defaults to /watch */
  linkPrefix?: string;
}

const VideoHoverCard = ({ id, title, thumbnail, poster_url, synopsis, genre_name, vertical, linkPrefix = '/watch' }: VideoHoverCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const imgSrc = poster_url || (thumbnail?.startsWith('http') ? thumbnail : getThumbnailUrl(thumbnail));

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setHovered(true), 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(false);
    setExpanded(false);
  };

  const cardWidth = vertical ? 'w-[150px] md:w-[180px]' : 'w-[220px] md:w-[260px]';
  const aspectClass = vertical ? 'aspect-[9/16]' : 'aspect-video';

  return (
    <div
      className={`relative flex-shrink-0 ${cardWidth} ${hovered ? 'z-50' : 'z-0'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Base card */}
      <div
        className={`relative rounded-md overflow-hidden transition-all duration-300 ${
          hovered ? 'z-30 scale-[1.3] shadow-2xl shadow-black/80' : 'z-10 scale-100'
        }`}
        style={{ transformOrigin: 'center center' }}
      >
        {/* Image */}
        <div className={`${aspectClass} relative`}>
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {hovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          )}
        </div>

        {/* Hover content panel */}
        {hovered && (
          <div className="bg-card p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Link
                to={`${linkPrefix}/${id}`}
                className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center hover:bg-foreground/80 transition-colors"
              >
                <Play size={14} className="text-background ml-0.5" fill="currentColor" />
              </Link>
              <button className="w-8 h-8 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-colors">
                <Plus size={14} className="text-foreground" />
              </button>
              <button className="w-8 h-8 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-colors">
                <ThumbsUp size={12} className="text-foreground" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
                className="w-8 h-8 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-colors ml-auto"
              >
                {expanded ? <ChevronUp size={14} className="text-foreground" /> : <ChevronDown size={14} className="text-foreground" />}
              </button>
            </div>

            <h3 className="font-display text-sm font-semibold text-foreground truncate">{title}</h3>

            {genre_name && (
              <span className="inline-block font-mono text-[9px] uppercase tracking-widest text-primary border border-primary/30 px-2 py-0.5 rounded-sm">
                {genre_name}
              </span>
            )}

            {expanded && synopsis && (
              <p className="font-body text-xs text-muted-foreground line-clamp-4 pt-1 border-t border-border">
                {synopsis}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Non-hover fallback title */}
      {!hovered && (
        <Link to={`${linkPrefix}/${id}`} className="block mt-2">
          <h3 className="font-display text-sm font-semibold text-foreground truncate hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
      )}
    </div>
  );
};

export default VideoHoverCard;
