import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import { tabs } from './DashboardSidebar';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

const DashboardMobileHeader = ({ activeTab, setActiveTab, isAdmin, onLogout }: Props) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-noir-light">
        <Link to="/" className="font-display text-lg font-bold">
          <span className="text-foreground">OPPRIME</span><span className="text-primary">.tv</span>
        </Link>
        <button onClick={onLogout} className="text-muted-foreground"><LogOut size={18} /></button>
      </div>
      <div className="md:hidden flex overflow-x-auto hide-scrollbar border-b border-border bg-noir-light">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-3 font-mono text-[10px] uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
            {tab.label}
          </button>
        ))}
        {isAdmin && (
          <button onClick={() => navigate('/admin')} className="flex-shrink-0 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-primary border-b-2 border-transparent">
            Admin
          </button>
        )}
      </div>
    </>
  );
};

export default DashboardMobileHeader;
