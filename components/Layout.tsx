
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronRight,
  RefreshCw,
  X
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
        ? 'bg-indigo-50 text-indigo-600 font-medium shadow-sm' 
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
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col sticky top-0 h-screen z-40">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30">I</div>
            <h1 className="text-xl font-bold tracking-tight">Inventory<span className="text-indigo-600">Pro</span></h1>
          </div>
          
          <nav className="space-y-1.5">
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

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Plan</p>
            <p className="text-xs font-bold text-slate-900">Enterprise Cloud</p>
            <div className="mt-2 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[85%] rounded-full" />
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all w-full group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="hover:text-slate-600 cursor-pointer">Pages</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 font-semibold capitalize">{activeView}</span>
            {lastUpdated && (
              <span className="hidden md:inline-flex items-center gap-1.5 ml-4 px-2.5 py-1 bg-emerald-50 rounded-lg text-[10px] font-bold text-emerald-600 border border-emerald-100">
                <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
                LIVE {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onRefresh}
              disabled={isSyncing}
              className={`p-2 text-slate-400 hover:text-indigo-600 transition-all rounded-lg hover:bg-indigo-50 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`}
              title="Manual Sync"
            >
              <RefreshCw size={18} />
            </button>
            
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search resources..."
                className="pl-10 pr-4 py-1.5 bg-slate-100 border border-transparent rounded-full text-sm w-48 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500/10 focus:w-64 transition-all outline-none"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 transition-colors relative rounded-lg ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in-95 p-2 origin-top-right">
                    <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                      <h4 className="font-bold text-sm">Notifications</h4>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-900"><X size={16} /></button>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                      <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                        <p className="text-xs font-bold text-indigo-900">New AI Insight Generated</p>
                        <p className="text-[10px] text-indigo-700/70 mt-1">Review your stock velocity recommendations.</p>
                      </div>
                      <div className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                        <p className="text-xs font-bold text-slate-900">Sync Successful</p>
                        <p className="text-[10px] text-slate-500 mt-1">All 14 branches updated from Google Sheets.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-xs ring-1 ring-slate-200">
              JD
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
