import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ViewType, InventoryRecord, ProductCategory } from './types';
import { fetchInventoryData } from './services/googleSheets';
import { getInventoryInsights } from './services/aiService';
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
  Terminal,
  Info,
  ExternalLink,
  CheckCircle
} from 'lucide-react';

const categorizeProduct = (name: string): 'power-station' | 'accessory' => {
  if (!name) return 'accessory';
  const n = name.toString().toLowerCase();
  const isStation = /^(ac|eb|ep|b\d+|b \d+)/i.test(n) || n.includes('station') || n.includes('battery');
  return isStation ? 'power-station' : 'accessory';
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [view, setView] = useState<ViewType>('dashboard');
  const [data, setData] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<string[] | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory>('both');

  // Connection Settings
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
      const rawData = await fetchInventoryData({
        apiKey: googleAPIKey,
        accessToken: googleAccessToken
      });
      
      if (!rawData) {
        setData([]);
        return;
      }

      const categorized = rawData.map(record => ({
        ...record,
        category: categorizeProduct(record.deviceName)
      }));
      
      setData(categorized);
      setLastUpdated(new Date());

      if (categorized.length > 0) {
        getInventoryInsights(categorized).then(setAiInsights).catch(() => setAiInsights(null));
      }
    } catch (err: any) {
      setError(err.message);
      if (!isSilent) setData([]);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [googleAPIKey, googleAccessToken]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (categoryFilter === 'both') return data;
    const target = categoryFilter === 'power-stations' ? 'power-station' : 'accessory';
    return data.filter(d => d.category === target);
  }, [data, categoryFilter]);

  const handleSaveSettings = () => {
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
    setAiInsights(null);
  };

  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-12 h-12 border-2 border-slate-100 rounded-full border-t-indigo-600 animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Establishing Bluetti Cloud Handshake...</p>
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
        <div className="mb-10 space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-rose-800">
            <div className="flex items-start gap-5">
              <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 shrink-0 shadow-sm">
                <ShieldAlert size={24} />
              </div>
              <div className="text-sm">
                <p className="font-bold text-lg mb-1">Access Denied</p>
                <p className="opacity-90 leading-relaxed font-medium">{error}</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => setView('settings')} 
                className="flex-1 md:flex-none bg-rose-600 text-white px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
              >
                Resolve Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'dashboard' && (
        <Dashboard 
          data={filteredData} 
          insights={aiInsights} 
          category={categoryFilter} 
          onCategoryChange={setCategoryFilter}
        />
      )}
      {view === 'branches' && <Inventory data={filteredData} />}
      {view === 'metrics' && <Metrics data={filteredData} />}
      {view === 'settings' && (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
          <div className="flex flex-col gap-1 px-1">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900">System Configuration</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium">Calibrate your Bluetti data source and security keys.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[32px] p-5 md:p-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-row items-start justify-between gap-4 mb-10">
              <div className="flex items-start md:items-center gap-4 flex-1">
                <div className={`p-3 rounded-2xl shrink-0 transition-all duration-300 ${googleAPIKey || process.env.API_KEY ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-100 text-slate-400'}`}>
                  <Fingerprint size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">Cloud Integration</h3>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Syncing with Google Sheets API v4.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Active</span>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Runtime API Key</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      value={googleAPIKey}
                      onChange={(e) => setGoogleAPIKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500/30 transition-all outline-none placeholder:text-slate-300"
                      placeholder={process.env.API_KEY ? "Environmental key active..." : "Enter Google API Key..."}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Identity Token</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      value={googleAccessToken}
                      onChange={(e) => setGoogleAccessToken(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500/30 transition-all outline-none placeholder:text-slate-300"
                      placeholder="OAuth2 Token (Optional)..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              className="mt-8 md:mt-10 w-full py-5 bg-indigo-600 text-white rounded-[24px] font-bold text-sm md:text-base hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
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