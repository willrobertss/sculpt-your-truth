import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Film, Tv, MessageSquare, Users, LogOut, ArrowLeft, Upload } from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import AdminOverview from '@/components/admin/AdminOverview';
import SubmissionsTable from '@/components/admin/SubmissionsTable';
import FilmsTable from '@/components/admin/FilmsTable';
import ShortsTable from '@/components/admin/ShortsTable';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import UsersTable from '@/components/admin/UsersTable';
import BulkImport from '@/components/admin/BulkImport';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'submissions', label: 'Submissions', icon: FileText },
  { id: 'films', label: 'Films', icon: Film },
  { id: 'shorts', label: 'Shorts', icon: Tv },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'import', label: 'Bulk Import', icon: Upload },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { isAdmin, loading } = useAdminCheck();
  const navigate = useNavigate();

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground font-mono text-sm">Loading...</p>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-foreground mb-3">Access Denied</h1>
        <p className="text-muted-foreground font-body mb-6">You need admin privileges to access this page.</p>
        <Link to="/" className="text-primary hover:text-gold-light font-mono text-xs uppercase tracking-widest">← Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-noir-light border-r border-border flex-col flex-shrink-0">
        <div className="p-6 border-b border-border">
          <Link to="/" className="font-display text-xl font-bold tracking-wider">
            <span className="text-foreground">OPPRIME</span>
            <span className="text-primary">.tv</span>
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary mt-1">Admin Panel</p>
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
        <div className="p-4 border-t border-border space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-noir-light">
          <span className="font-display text-lg font-bold"><span className="text-foreground">OPPRIME</span><span className="text-primary">.tv</span> <span className="text-primary font-mono text-[10px] uppercase">Admin</span></span>
        </div>
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
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'submissions' && <SubmissionsTable />}
          {activeTab === 'films' && <FilmsTable />}
          {activeTab === 'shorts' && <ShortsTable />}
          {activeTab === 'testimonials' && <TestimonialsManager />}
          {activeTab === 'users' && <UsersTable />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
