
import React, { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, Loader2, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (userData: { name: string; email: string }) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@inventorypro.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('inventory_users') || '[]');

      if (isLogin) {
        // Mock Login Logic
        const user = users.find((u: any) => u.email === email && u.password === password);
        
        // Default admin access
        if ((email === 'admin@inventorypro.com' && password === 'password123') || user) {
          const loggedInUser = user || { name: 'Admin User', email };
          localStorage.setItem('inventory_session', JSON.stringify(loggedInUser));
          onLogin(loggedInUser);
        } else {
          setError('Invalid email or password. Try admin@inventorypro.com / password123');
          setLoading(false);
        }
      } else {
        // Registration Logic
        if (users.find((u: any) => u.email === email)) {
          setError('An account with this email already exists.');
          setLoading(false);
          return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('inventory_users', JSON.stringify(users));
        setSuccess(true);
        setLoading(false);
        
        // Auto-switch to login after success
        setTimeout(() => {
          setIsLogin(true);
          setSuccess(false);
        }, 2000);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 shadow-2xl transition-all duration-500">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-indigo-600/40 mb-6 transform hover:rotate-6 transition-transform">I</div>
            <h2 className="text-white text-3xl font-bold tracking-tight">
              {isLogin ? 'Welcome back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 mt-2 text-center">
              {isLogin ? 'Sign in to manage your inventory' : 'Start optimizing your supply chain today'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm animate-in slide-in-from-top-2">
              <CheckCircle2 size={18} />
              Account created! Switching to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-sm"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="admin@inventorypro.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 mt-4 shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Sign in' : 'Create account'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors block w-full"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
            {isLogin && (
              <a href="#" className="text-xs text-slate-600 hover:text-indigo-400 transition-colors block italic">
                Forgot your password?
              </a>
            )}
          </div>
        </div>
        
        <p className="text-center text-slate-700 text-[10px] mt-8 font-bold uppercase tracking-widest">
          Cloud-Sync • Enterprise Security • v1.2.0
        </p>
      </div>
    </div>
  );
};
