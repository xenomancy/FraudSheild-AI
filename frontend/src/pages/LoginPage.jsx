import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, LogIn, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, loginGuest } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credential fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    setError('');
    try {
      await loginGuest();
      navigate('/dashboard');
    } catch (err) {
      setError('Could not establish Guest Session. Please try again.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-bg bg-grid-mesh relative overflow-hidden">
      
      {/* Decorative backdrop auras */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-fintech-indigo/5 rounded-full blur-[100px] -z-10 animate-float-aura pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fintech-purple/5 rounded-full blur-[100px] -z-10 animate-float-aura-delayed pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 glass-heavy rounded-3xl p-6 md:p-10 border-white/10 shadow-2xl relative animate-fade-in-up">
        
        {/* Left Side: Standard Login Form */}
        <div className="md:col-span-7 flex flex-col justify-center text-left">
          <div className="mb-6 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-fintech-indigo to-fintech-cyan flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-black tracking-wider text-white text-lg">FRAUDSHIELD AI</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Platform Console</h2>
          <p className="text-slate-400 text-sm mb-8">Sign in to your account or continue as a guest to explore.</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/5 focus:border-fintech-indigo rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/5 focus:border-fintech-indigo rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-4 rounded-xl bg-fintech-indigo hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <LogIn className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-slate-500 text-xs text-center md:text-left font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-fintech-indigo hover:underline font-bold">
              Create Account
            </Link>
          </p>
        </div>

        {/* Right Side: Guest Mode Card */}
        <div className="md:col-span-5 flex flex-col justify-between p-6 bg-slate-900/60 border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fintech-cyan/5 rounded-full blur-2xl -z-10" />

          <div>
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 mb-5">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 text-left">Guest Mode</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6 text-left">
              Explore the platform without an account. Guest sessions use demo data and do not write to the database.
            </p>
            <div className="bg-slate-950/50 border border-white/5 p-4 rounded-xl flex flex-col gap-2 text-left text-[11px] font-mono text-slate-400">
              <div className="flex justify-between items-center">
                <span>Role:</span>
                <span className="text-slate-300 font-bold">Guest</span>
              </div>
              <div className="flex justify-between">
                <span>Data:</span>
                <span className="text-fintech-amber font-bold">Demo Only</span>
              </div>
              <div className="flex justify-between">
                <span>DB Writes:</span>
                <span className="text-fintech-rose font-bold">Disabled</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            disabled={guestLoading}
            className="mt-6 w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white text-sm font-bold active:scale-[0.98] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            {guestLoading ? 'Loading...' : 'Continue as Guest'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};
