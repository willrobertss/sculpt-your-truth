import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface FilmCardProps {
  id: string;
  title: string;
  genre: string[];
  poster_url: string;
  release_year?: number;
  duration_minutes?: number;
}

const FilmCard = ({ id, title, genre, poster_url, release_year, duration_minutes }: FilmCardProps) => {
  return (
    <Link to={`/film/${id}`} className="block group flex-shrink-0 w-[180px] md:w-[220px]">
      <motion.div
        whileHover={{ scale: 1.05, y: -8 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative overflow-hidden rounded-sm aspect-[2/3] gold-border"
      >
        <img
          src={poster_url}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="flex items-center gap-2 text-primary">
            <Play size={16} fill="currentColor" />
            <span className="font-mono text-xs uppercase tracking-widest">Watch</span>
          </div>
        </div>
        {/* Film grain overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20256%20256%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noise%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.9%22%20numOctaves=%224%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noise)%22%20opacity=%220.06%22/%3E%3C/svg%3E')]" />
      </motion.div>
      <div className="mt-3 space-y-1">
        <h3 className="font-display text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {genre.slice(0, 2).join(' · ')}{release_year ? ` · ${release_year}` : ''}{duration_minutes ? ` · ${duration_minutes}m` : ''}
        </p>
      </div>
    </Link>
  );
};

export default FilmCard;
