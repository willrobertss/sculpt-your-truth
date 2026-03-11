import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tv, Eye, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GoldButton from '@/components/GoldButton';
import ContentEditDialog from './ContentEditDialog';

interface Props {
  myShorts: any[];
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

const DashboardShorts = ({ myShorts, onRefresh, userId, editingId, onClearEdit }: Props) => {
  const navigate = useNavigate();
  const [editItem, setEditItem] = useState<any>(null);

  useEffect(() => {
    if (editingId && myShorts.length > 0) {
      const found = myShorts.find(s => s.id === editingId);
      if (found) {
        setEditItem(found);
        onClearEdit?.();
      }
    }
  }, [editingId, myShorts, onClearEdit]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">My Shorts</h2>
        <GoldButton size="sm" onClick={() => navigate('/submit')}>+ New Short</GoldButton>
      </div>
      {myShorts.length > 0 ? (
        <div className="space-y-3">
          {myShorts.map((s) => (
            <div key={s.id} className="bg-card gold-border rounded-sm p-4 hover:bg-surface-hover transition-colors">
              <div className="flex gap-4 items-center">
                <div
                  onClick={() => setEditItem(s)}
                  className="w-16 h-20 rounded-sm overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all relative group"
                >
                  {s.thumbnail_url ? (
                    <img src={s.thumbnail_url} alt={s.title} className="w-full h-full object-cover" />
                  ) : (
                    <Tv size={16} className="text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil size={14} className="text-primary" />
                  </div>
                </div>
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
                    {!s.video_url && <span className="font-mono text-[10px] text-amber-400">⚠ No video</span>}
                  </div>
                </div>
                <button
                  onClick={() => setEditItem(s)}
                  className="w-8 h-8 rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Edit short"
                >
                  <Pencil size={14} />
                </button>
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

      <ContentEditDialog
        open={!!editItem}
        onClose={() => setEditItem(null)}
        item={editItem}
        contentType="shorts"
        userId={userId}
        onSaved={() => onRefresh?.()}
      />
    </motion.div>
  );
};

export default DashboardShorts;
