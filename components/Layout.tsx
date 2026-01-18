
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setView: (view: ViewType) => void;
  onLogout: () => void;
  onRefresh?: () => void;
  isSyncing?: boolean;
  lastUpdated?: Date | null;
}

const SidebarLink: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group w-full ${
      active 
        ? 'bg-indigo-50 text-indigo-600 font-medium' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    <span className="text-sm">{label}</span>
  </button>
);

export const AppLayout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  setView, 
  onLogout, 
  onRefresh,
  isSyncing,
  lastUpdated
}) => {
  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col sticky top-0 h-screen z-40">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">I</div>
            <h1 className="text-xl font-bold tracking-tight">Inventory<span className="text-indigo-600">Pro</span></h1>
          </div>
          
          <nav className="space-y-2">
            <SidebarLink 
              icon={<LayoutDashboard size={18} />} 
              label="Overview" 
              active={activeView === 'dashboard'} 
              onClick={() => setView('dashboard')}
            />
            <SidebarLink 
              icon={<Package size={18} />} 
              label="Inventory" 
              active={activeView === 'inventory'} 
              onClick={() => setView('inventory')}
            />
            <SidebarLink 
              icon={<BarChart3 size={18} />} 
              label="Metrics" 
              active={activeView === 'metrics'} 
              onClick={() => setView('metrics')}
            />
            <SidebarLink 
              icon={<Settings size={18} />} 
              label="Settings" 
              active={activeView === 'settings'} 
              onClick={() => setView('settings')}
            />
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>Pages</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 font-medium capitalize">{activeView}</span>
            {lastUpdated && (
              <span className="hidden md:inline-flex items-center gap-1.5 ml-4 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-500">
                Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onRefresh}
              disabled={isSyncing}
              className={`p-2 text-slate-400 hover:text-indigo-600 transition-all rounded-lg hover:bg-indigo-50 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`}
              title="Sync with Google Sheets"
            >
              <RefreshCw size={18} />
            </button>
            
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Command + K"
                className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm w-48 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-xs">
              JD
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
