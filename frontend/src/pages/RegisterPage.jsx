import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all input fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-bg bg-grid-mesh relative overflow-hidden">
      
      {/* Absolute aura indicators */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-fintech-cyan/5 rounded-full blur-[100px] -z-10 animate-float-aura pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-fintech-indigo/5 rounded-full blur-[100px] -z-10 animate-float-aura-delayed pointer-events-none" />

      <div className="w-full max-w-md glass-heavy rounded-3xl p-6 md:p-10 border-white/10 shadow-2xl relative animate-fade-in-up">
        
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-fintech-indigo to-fintech-cyan flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-black tracking-wider text-white text-lg">FRAUDSHIELD AI</span>
        </div>

        <h2 className="text-xl md:text-2xl font-black text-center text-white mb-2">Create Identity</h2>
        <p className="text-slate-400 text-xs text-center mb-8">Setup unique secure credentials to enter the workspace.</p>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-pulse text-left">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-pulse text-left">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/5 focus:border-fintech-indigo rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/5 focus:border-fintech-indigo rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secure Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/5 focus:border-fintech-indigo rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/5 focus:border-fintech-indigo rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full py-3.5 rounded-xl bg-gradient-to-r from-fintech-indigo to-fintech-purple hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? 'Generating Security Keys...' : 'Register Credentials'}
            <UserPlus className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-slate-500 text-xs text-center font-medium">
          Already have credentials?{' '}
          <Link to="/login" className="text-fintech-indigo hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
