import { motion } from 'framer-motion';
import { Film, Eye, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GoldButton from '@/components/GoldButton';

interface Props {
  myFilms: any[];
}

const statusColor: Record<string, string> = {
  live: 'bg-emerald-400/20 text-emerald-400',
  pending: 'bg-amber-400/20 text-amber-400',
  in_review: 'bg-blue-400/20 text-blue-400',
  draft: 'bg-muted text-muted-foreground',
  approved: 'bg-primary/20 text-primary',
  rejected: 'bg-destructive/20 text-destructive',
};

const DashboardFilms = ({ myFilms }: Props) => {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">My Films</h2>
        <GoldButton size="sm" onClick={() => navigate('/submit')}>+ New Film</GoldButton>
      </div>
      {myFilms.length > 0 ? (
        <div className="space-y-3">
          {myFilms.map((f) => (
            <div key={f.id} className="flex gap-4 items-center bg-card gold-border rounded-sm p-4 hover:bg-surface-hover transition-colors">
              {f.poster_url ? (
                <img src={f.poster_url} alt={f.title} className="w-16 h-20 object-cover rounded-sm" />
              ) : (
                <div className="w-16 h-20 bg-muted rounded-sm flex items-center justify-center">
                  <Film size={20} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm font-semibold text-foreground truncate">{f.title}</h3>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  {(f.genre || []).join(' · ')} {f.duration_minutes ? `· ${f.duration_minutes} min` : ''}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-sm ${statusColor[f.status] || 'bg-muted text-muted-foreground'}`}>
                    {f.status}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    <Eye size={10} /> {(f.view_count || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              {f.status === 'live' && f.slug && (
                <button
                  onClick={() => navigate(`/film/${f.slug}`)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card gold-border rounded-sm p-8 text-center">
          <Film size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-body">No films yet. Submit your first feature or documentary.</p>
          <GoldButton className="mt-4" onClick={() => navigate('/submit')}>Upload Film</GoldButton>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardFilms;
