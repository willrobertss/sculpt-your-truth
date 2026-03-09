import { motion } from 'framer-motion';
import { Eye, Film, Clock, Upload, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GoldButton from '@/components/GoldButton';

interface Props {
  profile: any;
  user: any;
  stats: { views: number; active: number; pending: number };
  myFilms: any[];
  myShorts: any[];
}

const DashboardOverview = ({ profile, user, stats, myFilms, myShorts }: Props) => {
  const navigate = useNavigate();
  const recentContent = [...myFilms, ...myShorts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const topContent = [...myFilms, ...myShorts]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
        Welcome, {profile?.display_name || user.email?.split('@')[0]}
      </h1>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-8">Creator Dashboard</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Views', value: stats.views.toLocaleString(), icon: Eye, color: 'text-primary' },
          { label: 'Active Titles', value: stats.active.toString(), icon: Film, color: 'text-emerald-400' },
          { label: 'Pending', value: stats.pending.toString(), icon: Clock, color: 'text-amber-400' },
          { label: 'Total Content', value: (myFilms.length + myShorts.length).toString(), icon: BarChart3, color: 'text-blue-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card gold-border rounded-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} className={stat.color} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</span>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Top Performing Content */}
      {topContent.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Top Performing</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topContent.map((item, i) => (
              <div key={item.id} className="bg-card gold-border rounded-sm p-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-primary/20 text-primary font-mono text-[10px] px-2 py-0.5 rounded-sm">
                  #{i + 1}
                </div>
                <h3 className="font-display text-sm font-semibold text-foreground truncate pr-8">{item.title}</h3>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">
                  {(item.view_count || 0).toLocaleString()} views
                </p>
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${topContent[0]?.view_count ? ((item.view_count || 0) / topContent[0].view_count) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentContent.length > 0 ? (
        <div className="mb-8">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {recentContent.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-card gold-border rounded-sm p-3">
                <div className={`w-2 h-2 rounded-full ${item.status === 'live' ? 'bg-emerald-400' : item.status === 'pending' || item.status === 'in_review' ? 'bg-amber-400' : 'bg-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm font-semibold text-foreground truncate">{item.title}</h3>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    {item.duration_minutes ? 'Film' : 'Short'} · {item.status} · {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{(item.view_count || 0).toLocaleString()} views</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card gold-border rounded-sm p-8 text-center">
          <Upload size={32} className="text-primary mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">Ready to share your work?</h3>
          <p className="font-body text-sm text-muted-foreground mb-6">Submit your first film or short to get started.</p>
          <GoldButton onClick={() => navigate('/submit')}>Submit Content</GoldButton>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardOverview;
