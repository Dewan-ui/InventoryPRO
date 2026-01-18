
import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, InventoryRecord } from './types';
import { fetchInventoryData } from './services/googleSheets';
import { AppLayout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Metrics } from './components/Metrics';
import { Auth } from './components/Auth';
import { 
  ShieldAlert, 
  Key, 
  Lock, 
  Save,
  Fingerprint,
  Terminal
} from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [view, setView] = useState<ViewType>('dashboard');
  const [data, setData] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Connection Settings
  const [usePrivateAPI, setUsePrivateAPI] = useState(() => localStorage.getItem('inventory_use_private') === 'true');
  const [googleAPIKey, setGoogleAPIKey] = useState(() => localStorage.getItem('inventory_google_key') || '');
  const [googleAccessToken, setGoogleAccessToken] = useState(() => localStorage.getItem('inventory_access_token') || '');

  useEffect(() => {
    const savedSession = localStorage.getItem('inventory_session');
    if (savedSession) {
      try {
        const userData = JSON.parse(savedSession);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('inventory_session');
      }
    }
    setLoading(false);
  }, []);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsSyncing(true);
    
    setError(null);
    try {
      const inventory = await fetchInventoryData({
        apiKey: googleAPIKey,
        accessToken: googleAccessToken,
        usePrivateAPI: usePrivateAPI
      });
      setData(inventory);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
      if (!isSilent) setData([]);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [googleAPIKey, googleAccessToken, usePrivateAPI]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleSaveSettings = () => {
    localStorage.setItem('inventory_use_private', String(usePrivateAPI));
    localStorage.setItem('inventory_google_key', googleAPIKey);
    localStorage.setItem('inventory_access_token', googleAccessToken);
    loadData();
  };

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('inventory_session');
    setUser(null);
    setIsAuthenticated(false);
    setData([]);
  };

  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-12 h-12 border-2 border-slate-100 rounded-full border-t-indigo-600 animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Syncing Inventory...</p>
      </div>
    );
  }

  return (
    <AppLayout 
      activeView={view} 
      setView={setView} 
      onLogout={handleLogout}
      onRefresh={() => loadData(true)}
      isSyncing={isSyncing}
      lastUpdated={lastUpdated}
    >
      {error && !isSyncing && (
        <div className="mb-8 p-5 md:p-6 bg-rose-50 border border-rose-200 rounded-[28px] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-rose-800 animate-in slide-in-from-top-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-600 shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div className="text-sm">
              <p className="font-bold text-base mb-1">Connection Error</p>
              <p className="opacity-90 leading-relaxed text-xs md:text-sm">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => setView('settings')} 
            className="w-full md:w-auto shrink-0 bg-rose-600 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
          >
            Adjust Settings
          </button>
        </div>
      )}

      {view === 'dashboard' && <Dashboard data={data} />}
      {view === 'inventory' && <Inventory data={data} />}
      {view === 'metrics' && <Metrics data={data} />}
      {view === 'settings' && (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
          <div className="flex flex-col gap-1 px-1">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900">Settings</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium">Manage your Google Sheet connection.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[32px] p-5 md:p-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-row items-start justify-between gap-4 mb-10">
              <div className="flex items-start md:items-center gap-4 flex-1">
                <div className={`p-3 rounded-2xl shrink-0 transition-all duration-300 ${usePrivateAPI ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-100 text-slate-400'}`}>
                  <Fingerprint size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">Private Sheet Mode</h3>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Enable if your sheet access is restricted.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setUsePrivateAPI(!usePrivateAPI)}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-all focus:outline-none mt-2 md:mt-0 ${usePrivateAPI ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${usePrivateAPI ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">API Key</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      value={googleAPIKey}
                      onChange={(e) => setGoogleAPIKey(e.target.value)}
                      disabled={!usePrivateAPI}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500/30 transition-all disabled:opacity-30 outline-none placeholder:text-slate-300"
                      placeholder="Enter Google API Key..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Access Token</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      value={googleAccessToken}
                      onChange={(e) => setGoogleAccessToken(e.target.value)}
                      disabled={!usePrivateAPI}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500/30 transition-all disabled:opacity-30 outline-none placeholder:text-slate-300"
                      placeholder="Enter OAuth Token..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-8 rounded-[28px] bg-slate-900 text-white space-y-5">
                <div className="flex items-center gap-3 mb-1">
                  <Terminal size={18} className="text-indigo-400" />
                  <h4 className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-indigo-200">Connection Guide</h4>
                </div>
                <div className="space-y-5">
                  {[
                    { step: 1, text: "Enable Sheets API in your Google Cloud Project." },
                    { step: 2, text: "Share your spreadsheet with your service account email." },
                    { step: 3, text: "Apply your credentials above to begin syncing." }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[11px] font-black shrink-0 text-white">
                        {item.step}
                      </div>
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              className="mt-8 md:mt-10 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm md:text-base hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-[0.98] group"
            >
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default App;
