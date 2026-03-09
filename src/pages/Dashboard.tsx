import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardMobileHeader from '@/components/dashboard/DashboardMobileHeader';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DashboardFilms from '@/components/dashboard/DashboardFilms';
import DashboardShorts from '@/components/dashboard/DashboardShorts';
import DashboardVerticals from '@/components/dashboard/DashboardVerticals';
import DashboardEmail from '@/components/dashboard/DashboardEmail';
import DashboardSettings from '@/components/dashboard/DashboardSettings';
import DashboardEarnings from '@/components/dashboard/DashboardEarnings';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdmin, setIsAdmin] = useState(false);
  const [myFilms, setMyFilms] = useState<any[]>([]);
  const [myShorts, setMyShorts] = useState<any[]>([]);
  const [myVerticals, setMyVerticals] = useState<any[]>([]);
  const [stats, setStats] = useState({ views: 0, active: 0, pending: 0 });
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
    const load = async () => {
      const [profileRes, filmsRes, shortsRes, verticalsRes, adminRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('films').select('*').eq('creator_id', user.id),
        supabase.from('shorts').select('*').eq('creator_id', user.id),
        supabase.from('verticals').select('*').eq('creator_id', user.id),
        supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      const films = filmsRes.data || [];
      const shorts = shortsRes.data || [];
      const verts = verticalsRes.data || [];
      setMyFilms(films);
      setMyShorts(shorts);
      setMyVerticals(verts);
      setIsAdmin(!!adminRes.data);
      const allContent = [...films, ...shorts, ...verts];
      const totalViews = allContent.reduce((s, f) => s + (f.view_count || 0), 0);
      const active = allContent.filter(f => f.status === 'live').length;
      const pending = allContent.filter(f => f.status === 'pending' || f.status === 'in_review').length;
      setStats({ views: totalViews, active, pending });
    };
    load();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <DashboardMobileHeader activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} onLogout={handleLogout} />
        <div className="p-6 md:p-10">
          {activeTab === 'overview' && <DashboardOverview profile={profile} user={user} stats={stats} myFilms={myFilms} myShorts={myShorts} />}
          {activeTab === 'films' && <DashboardFilms myFilms={myFilms} />}
          {activeTab === 'shorts' && <DashboardShorts myShorts={myShorts} />}
          {activeTab === 'verticals' && <DashboardVerticals myVerticals={myVerticals} />}
          {activeTab === 'earnings' && <DashboardEarnings profile={profile} user={user} />}
          {activeTab === 'email' && <DashboardEmail myFilms={myFilms} myShorts={myShorts} profile={profile} user={user} />}
          {activeTab === 'settings' && <DashboardSettings profile={profile} user={user} />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
