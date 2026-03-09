import { motion } from 'framer-motion';
import { Tv, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GoldButton from '@/components/GoldButton';

interface Props {
  myShorts: any[];
}

const statusColor: Record<string, string> = {
  live: 'bg-emerald-400/20 text-emerald-400',
  pending: 'bg-amber-400/20 text-amber-400',
  in_review: 'bg-blue-400/20 text-blue-400',
  draft: 'bg-muted text-muted-foreground',
  approved: 'bg-primary/20 text-primary',
  rejected: 'bg-destructive/20 text-destructive',
};

const DashboardShorts = ({ myShorts }: Props) => {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">My Shorts</h2>
        <GoldButton size="sm" onClick={() => navigate('/submit')}>+ New Short</GoldButton>
      </div>
      {myShorts.length > 0 ? (
        <div className="space-y-3">
          {myShorts.map((s) => (
            <div key={s.id} className="flex gap-4 items-center bg-card gold-border rounded-sm p-4 hover:bg-surface-hover transition-colors">
              {s.thumbnail_url ? (
                <img src={s.thumbnail_url} alt={s.title} className="w-16 h-20 object-cover rounded-sm" />
              ) : (
                <div className="w-16 h-20 bg-muted rounded-sm flex items-center justify-center">
                  <Tv size={20} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm font-semibold text-foreground truncate">{s.title}</h3>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  {s.duration_seconds ? `${s.duration_seconds}s` : ''} {(s.genre || []).length > 0 ? `· ${(s.genre || []).join(' · ')}` : ''}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-sm ${statusColor[s.status] || 'bg-muted text-muted-foreground'}`}>
                    {s.status}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    <Eye size={10} /> {(s.view_count || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card gold-border rounded-sm p-8 text-center">
          <Tv size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-body">No shorts yet. Upload a vertical short film.</p>
          <GoldButton className="mt-4" onClick={() => navigate('/submit')}>Upload Short</GoldButton>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardShorts;
