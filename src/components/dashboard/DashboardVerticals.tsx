import { motion } from 'framer-motion';
import { Smartphone, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GoldButton from '@/components/GoldButton';

interface Props {
  myVerticals: any[];
}

const statusColor: Record<string, string> = {
  live: 'bg-emerald-400/20 text-emerald-400',
  pending: 'bg-amber-400/20 text-amber-400',
  in_review: 'bg-blue-400/20 text-blue-400',
  draft: 'bg-muted text-muted-foreground',
  approved: 'bg-primary/20 text-primary',
  rejected: 'bg-destructive/20 text-destructive',
};

const DashboardVerticals = ({ myVerticals }: Props) => {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">My Verticals</h2>
        <GoldButton size="sm" onClick={() => navigate('/submit')}>+ New Vertical</GoldButton>
      </div>
      {myVerticals.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {myVerticals.map((v) => (
            <div key={v.id} className="bg-card gold-border rounded-sm overflow-hidden group hover:ring-1 hover:ring-primary/30 transition-all">
              <div className="relative aspect-[9/16]">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Smartphone size={24} className="text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="font-display text-xs font-semibold text-foreground truncate">{v.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded-sm ${statusColor[v.status] || 'bg-muted text-muted-foreground'}`}>
                      {v.status}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
                      <Eye size={8} /> {(v.view_count || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card gold-border rounded-sm p-8 text-center">
          <Smartphone size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-body">No verticals yet. Create short-form portrait videos to grow your audience.</p>
          <GoldButton className="mt-4" onClick={() => navigate('/submit')}>Create Vertical</GoldButton>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardVerticals;
