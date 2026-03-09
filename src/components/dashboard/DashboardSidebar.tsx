import { Link, useNavigate } from 'react-router-dom';
import { Film, Tv, Settings, LogOut, Upload, LayoutDashboard, Shield, Mail, DollarSign, Smartphone } from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'films', label: 'My Films', icon: Film },
  { id: 'shorts', label: 'My Shorts', icon: Tv },
  { id: 'verticals', label: 'My Verticals', icon: Smartphone },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
  { id: 'email', label: 'Share & Invite', icon: Mail },
  { id: 'settings', label: 'Profile', icon: Settings },
];

const DashboardSidebar = ({ activeTab, setActiveTab, isAdmin, onLogout }: DashboardSidebarProps) => {
  const navigate = useNavigate();

  return (
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
              activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-surface'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
          >
            <Shield size={14} />
            Admin Panel
          </button>
        )}
      </nav>
      <div className="p-4 border-t border-border">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export { tabs };
export default DashboardSidebar;
