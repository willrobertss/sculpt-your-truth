import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Tv, Clock, Eye, Settings, LogOut, Upload, LayoutDashboard } from 'lucide-react';
import GoldButton from '@/components/GoldButton';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      else setUser(session.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single().then(({ data }) => {
      if (data) setProfile(data);
    });
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'films', label: 'My Films', icon: Film },
    { id: 'shorts', label: 'My Shorts', icon: Tv },
    { id: 'settings', label: 'Profile', icon: Settings },
  ];

  const stats = [
    { label: 'Total Views', value: '0', icon: Eye },
    { label: 'Active Titles', value: '0', icon: Film },
    { label: 'Pending', value: '0', icon: Clock },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-noir-light border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="font-display text-xl font-bold tracking-wider">
            <span className="text-foreground">OPPRIME</span>
            <span className="text-primary">.tv</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-noir-light">
          <Link to="/" className="font-display text-lg font-bold">
            <span className="text-foreground">OPPRIME</span>
            <span className="text-primary">.tv</span>
          </Link>
          <button onClick={handleLogout} className="text-muted-foreground">
            <LogOut size={18} />
          </button>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex overflow-x-auto hide-scrollbar border-b border-border bg-noir-light">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 font-mono text-[10px] uppercase tracking-widest border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-10">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                Welcome, {profile?.display_name || user.email?.split('@')[0]}
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-8">Creator Dashboard</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-card gold-border rounded-sm p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon size={14} className="text-primary" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                    </div>
                    <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card gold-border rounded-sm p-8 text-center">
                <Upload size={32} className="text-primary mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold text-foreground mb-2">Ready to share your work?</h3>
                <p className="font-body text-sm text-muted-foreground mb-6">Submit your first film or short to get started.</p>
                <GoldButton onClick={() => navigate('/submit')}>Submit Content</GoldButton>
              </div>
            </motion.div>
          )}

          {activeTab === 'films' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">My Films</h2>
              <div className="bg-card gold-border rounded-sm p-8 text-center">
                <Film size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-body">No films yet. Submit your first feature or documentary.</p>
                <GoldButton className="mt-4" onClick={() => navigate('/submit')}>Upload Film</GoldButton>
              </div>
            </motion.div>
          )}

          {activeTab === 'shorts' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">My Shorts</h2>
              <div className="bg-card gold-border rounded-sm p-8 text-center">
                <Tv size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-body">No shorts yet. Upload a vertical short film.</p>
                <GoldButton className="mt-4" onClick={() => navigate('/submit')}>Upload Short</GoldButton>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Profile Settings</h2>
              <div className="bg-card gold-border rounded-sm p-6 max-w-lg">
                <div className="space-y-4">
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Display Name</label>
                    <p className="text-foreground">{profile?.display_name || '—'}</p>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Email</label>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Creator Slug</label>
                    <p className="text-foreground font-mono text-sm">{profile?.slug || '—'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
