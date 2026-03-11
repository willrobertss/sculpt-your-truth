import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Eye, ExternalLink, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GoldButton from '@/components/GoldButton';
import ContentEditDialog from './ContentEditDialog';

interface Props {
  myFilms: any[];
  onRefresh?: () => void;
  userId: string;
  editingId?: string | null;
  onClearEdit?: () => void;
}

const statusColor: Record<string, string> = {
  live: 'bg-emerald-400/20 text-emerald-400',
  pending: 'bg-amber-400/20 text-amber-400',
  in_review: 'bg-blue-400/20 text-blue-400',
  draft: 'bg-muted text-muted-foreground',
  approved: 'bg-primary/20 text-primary',
  rejected: 'bg-destructive/20 text-destructive',
};

const DashboardFilms = ({ myFilms, onRefresh, userId, editingId, onClearEdit }: Props) => {
  const navigate = useNavigate();
  const [editItem, setEditItem] = useState<any>(null);

  // Auto-open editor if editingId is set from URL
  useEffect(() => {
    if (editingId && myFilms.length > 0) {
      const found = myFilms.find(f => f.id === editingId);
      if (found) {
        setEditItem(found);
        onClearEdit?.();
      }
    }
  }, [editingId, myFilms, onClearEdit]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">My Films</h2>
        <GoldButton size="sm" onClick={() => navigate('/submit')}>+ New Film</GoldButton>
      </div>
      {myFilms.length > 0 ? (
        <div className="space-y-3">
          {myFilms.map((f) => (
            <div key={f.id} className="bg-card gold-border rounded-sm p-4 hover:bg-surface-hover transition-colors">
              <div className="flex gap-4 items-center">
                <div
                  onClick={() => setEditItem(f)}
                  className="w-16 h-20 rounded-sm overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all relative group"
                >
                  {f.poster_url ? (
                    <img src={f.poster_url} alt={f.title} className="w-full h-full object-cover" />
                  ) : (
                    <Film size={16} className="text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil size={14} className="text-primary" />
                  </div>
                </div>
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
                    {!f.video_url && (
                      <span className="font-mono text-[10px] text-amber-400">⚠ No video</span>
                    )}
                    {!f.poster_url && (
                      <span className="font-mono text-[10px] text-amber-400">⚠ No poster</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditItem(f)}
                    className="w-8 h-8 rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Edit film"
                  >
                    <Pencil size={14} />
                  </button>
                  {f.status === 'live' && f.slug && (
                    <button onClick={() => navigate(`/film/${f.slug}`)} className="text-muted-foreground hover:text-primary transition-colors">
                      <ExternalLink size={16} />
                    </button>
                  )}
                </div>
              </div>
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

      <ContentEditDialog
        open={!!editItem}
        onClose={() => setEditItem(null)}
        item={editItem}
        contentType="films"
        userId={userId}
        onSaved={() => onRefresh?.()}
      />
    </motion.div>
  );
};

export default DashboardFilms;
