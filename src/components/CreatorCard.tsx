import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';

interface CreatorCardProps {
  slug: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  genre_focus?: string[];
  film_count?: number;
}

const CreatorCard = ({ slug, display_name, avatar_url, bio, genre_focus, film_count }: CreatorCardProps) => {
  return (
    <Link to={`/creators/${slug}`} className="block group flex-shrink-0 w-[200px] md:w-[240px]">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        className="bg-card gold-border rounded-sm p-5 h-full"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full overflow-hidden gold-border mb-3">
            <img src={avatar_url} alt={display_name} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {display_name}
          </h3>
          {genre_focus && (
            <p className="font-mono text-[9px] uppercase tracking-widest text-primary mt-1">
              {genre_focus.slice(0, 2).join(' · ')}
            </p>
          )}
          {bio && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 font-body">{bio}</p>
          )}
          {film_count !== undefined && (
            <div className="flex items-center gap-1 mt-3 text-muted-foreground">
              <Film size={10} />
              <span className="font-mono text-[10px]">{film_count} titles</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default CreatorCard;
