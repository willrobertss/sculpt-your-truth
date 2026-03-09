import { useState, useEffect } from 'react';
import { Film, Tv, FileText, Eye, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminOverview = () => {
  const [stats, setStats] = useState({ films: 0, shorts: 0, submissions: 0, pending: 0, profiles: 0, totalViews: 0 });

  useEffect(() => {
    const load = async () => {
      const [films, shorts, subs, pending, profiles] = await Promise.all([
        supabase.from('films').select('view_count'),
        supabase.from('shorts').select('view_count'),
        supabase.from('submissions').select('id', { count: 'exact', head: true }),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      const filmViews = (films.data || []).reduce((s, f) => s + (f.view_count || 0), 0);
      const shortViews = (shorts.data || []).reduce((s, f) => s + (f.view_count || 0), 0);
      setStats({
        films: films.data?.length || 0,
        shorts: shorts.data?.length || 0,
        submissions: subs.count || 0,
        pending: pending.count || 0,
        profiles: profiles.count || 0,
        totalViews: filmViews + shortViews,
      });
    };
    load();
  }, []);

  const cards = [
    { label: 'Total Films', value: stats.films, icon: Film },
    { label: 'Total Shorts', value: stats.shorts, icon: Tv },
    { label: 'Submissions', value: stats.submissions, icon: FileText },
    { label: 'Pending Review', value: stats.pending, icon: Clock },
    { label: 'Creators', value: stats.profiles, icon: Users },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Admin Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card gold-border rounded-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <c.icon size={14} className="text-primary" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.label}</span>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
