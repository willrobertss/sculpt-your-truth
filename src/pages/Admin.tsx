import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import VideoPendingSection from '@/components/admin/VideoPendingSection';
import VideoPoolSection from '@/components/admin/VideoPoolSection';
import FinancialsPanel from '@/components/admin/FinancialsPanel';
import GenresManager from '@/components/admin/GenresManager';
import UsersTable from '@/components/admin/UsersTable';
import BulkImport from '@/components/admin/BulkImport';
import AdsManager from '@/components/admin/AdsManager';

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'ads', label: 'Ads' },
  { id: 'financials', label: 'Financials' },
  { id: 'management', label: 'Management' },
  { id: 'settings', label: 'Settings' },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isAdmin, loading } = useAdminCheck();
  const navigate = useNavigate();

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-400 font-sans text-sm">Loading...</p>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-black mb-3 uppercase tracking-wide">Access Denied</h1>
        <p className="text-gray-500 font-sans mb-6">You need admin privileges to access this page.</p>
        <Link to="/" className="text-[hsl(356,80%,42%)] hover:underline font-heading text-xs uppercase tracking-widest">← Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div className="admin-theme min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="font-heading text-xl font-bold tracking-widest uppercase">
              <span className="text-white">OPPRIME</span>
              <span className="text-[hsl(356,80%,42%)]">.tv</span>
            </Link>

            {/* Nav links - desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 font-heading text-xs uppercase tracking-widest transition-colors ${
                    activeTab === item.id
                      ? 'text-[hsl(356,80%,42%)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Sign out */}
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
              className="text-gray-400 hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex overflow-x-auto hide-scrollbar border-t border-gray-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 px-4 py-3 font-heading text-[10px] uppercase tracking-widest border-b-2 transition-colors ${
                activeTab === item.id ? 'border-[hsl(356,80%,42%)] text-[hsl(356,80%,42%)]' : 'border-transparent text-gray-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            <VideoPendingSection />
            <VideoPoolSection />
          </div>
        )}
        {activeTab === 'ads' && <AdsManager />}
        {activeTab === 'financials' && <FinancialsPanel />}
        {activeTab === 'management' && (
          <div className="space-y-12">
            <UsersTable />
            <BulkImport />
          </div>
        )}
        {activeTab === 'settings' && <GenresManager />}
      </main>
    </div>
  );
};

export default Admin;
