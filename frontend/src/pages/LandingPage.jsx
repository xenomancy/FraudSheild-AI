import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Cpu, 
  Lock, 
  ArrowRight,
  Database,
  Terminal,
  Activity,
  Zap,
  Globe,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { loginGuest } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLaunchDemo = async () => {
    setLoading(true);
    try {
      await loginGuest();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-dark-bg bg-grid-mesh">
      
      {/* Absolute floating colorful blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-fintech-indigo/10 rounded-full blur-[120px] -z-10 animate-float-aura pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-fintech-purple/10 rounded-full blur-[140px] -z-10 animate-float-aura-delayed pointer-events-none" />

      {/* Top Navbar */}
      <header className="h-24 flex items-center justify-between px-6 md:px-12 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fintech-indigo to-fintech-cyan flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            FRAUD<span className="text-fintech-indigo">SHIELD</span> AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-all duration-200"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-5 py-2.5 text-sm font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl hover:shadow-lg hover:shadow-white/5 transition-all duration-200"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 md:px-12 py-16 md:py-24 relative z-10 flex flex-col justify-center gap-20">
        
        {/* Upper Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Segment */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-fintech-indigo/20 to-fintech-cyan/20 border border-fintech-indigo/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider text-fintech-cyan uppercase w-fit animate-pulse">
              <Zap className="w-3.5 h-3.5 text-fintech-cyan" />
              Startup Edition / Banking-Grade Shield
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none">
              AI-Powered <br />
              <span className="bg-gradient-to-r from-fintech-cyan via-fintech-indigo to-fintech-purple bg-clip-text text-transparent">
                Fraud Prevention
              </span> <br />
              For Smart Banks.
            </h1>
            
            <p className="text-slate-400 text-base md:text-lg max-w-xl font-normal leading-relaxed">
              Empower your payment architectures with high-fidelity Random Forest inference.
              Intercept anomalous transfers, catalog device metrics, and run SMOTE-oversampled models instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={handleLaunchDemo}
                disabled={loading}
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-fintech-indigo via-fintech-purple to-fintech-cyan text-white font-bold text-base shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 transition-all duration-300 group"
              >
                {loading ? 'Securing Session...' : 'Launch Guest Mode'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass border-white/5 hover:border-white/10 text-slate-200 hover:text-white font-semibold text-base transition-all duration-200"
              >
                Sign In Console
              </button>
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-3 gap-6 border-t border-white/5 pt-8 mt-4 text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest">
              <div className="flex flex-col gap-1">
                <span className="text-2xl md:text-3xl font-black text-white font-mono">99.8%</span>
                <span>F1 Accuracy</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl md:text-3xl font-black text-fintech-cyan font-mono">&lt; 12ms</span>
                <span>Latency Index</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl md:text-3xl font-black text-fintech-emerald font-mono">SMOTE</span>
                <span>Balanced Dataset</span>
              </div>
            </div>
          </div>

          {/* Right Floating Console Card */}
          <div className="lg:col-span-5 relative w-full flex justify-center">
            {/* Ambient behind visual blob */}
            <div className="absolute inset-0 bg-gradient-to-tr from-fintech-cyan/20 to-transparent blur-3xl rounded-full scale-90 -z-10" />
            
            <div className="glass-heavy w-full max-w-sm rounded-3xl p-6 border-white/10 shadow-2xl relative select-none animate-fade-in-up">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2 text-fintech-cyan font-mono text-[10px] font-bold tracking-widest">
                  <Terminal className="w-4 h-4 text-fintech-cyan" />
                  <span>MODEL_DIAGNOSTICS_CMD</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                </div>
              </div>

              {/* Developer Command Line mock outputs */}
              <div className="flex flex-col gap-4">
                
                <div className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Model Champion</span>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">RandomForest.joblib</p>
                  </div>
                  <Cpu className="w-5 h-5 text-fintech-indigo" />
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Database Layer</span>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">MongoDB Atlas (Live)</p>
                  </div>
                  <Database className="w-5 h-5 text-fintech-purple" />
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Session Guard</span>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">JWT HMAC SHA-256</p>
                  </div>
                  <Lock className="w-5 h-5 text-fintech-cyan" />
                </div>

                {/* Simulated threat flash widget */}
                <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex gap-3 mt-2 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-fintech-rose flex items-center justify-center font-black text-sm shrink-0">!</div>
                  <div className="text-left">
                    <h5 className="text-[10px] font-black text-fintech-rose tracking-wider uppercase">THREAT LOGGED</h5>
                    <p className="text-[10px] text-slate-300 mt-1">Anomalous PayPal transfer of $14,250.00 from ASIA region blocked.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Lower Features Grid Segment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
          <div className="glass p-6 rounded-2xl text-left border-white/5 hover:border-fintech-indigo/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-fintech-indigo/10 border border-fintech-indigo/25 flex items-center justify-center text-fintech-indigo mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Geographic Risk Profiling</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes transacting locations and flags inter-regional anomalies that violate baseline behavioral matrices.
            </p>
          </div>

          <div className="glass p-6 rounded-2xl text-left border-white/5 hover:border-fintech-cyan/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-fintech-cyan/10 border border-fintech-cyan/25 flex items-center justify-center text-fintech-cyan mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Asynchronous Inference</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              FastAPI backend running under <span className="font-mono">uvicorn</span> delivers model outputs in sub-15ms, ideal for high-volume banking queues.
            </p>
          </div>

          <div className="glass p-6 rounded-2xl text-left border-white/5 hover:border-fintech-purple/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-fintech-purple/10 border border-fintech-purple/25 flex items-center justify-center text-fintech-purple mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Guest Demo Ready</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipped with credentials-free Sandbox bypass, interactive real-time simulators, and pre-seeded analytical charts.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="h-20 flex items-center justify-center border-t border-white/5 text-xs text-slate-500 px-6">
        <span>© {new Date().getFullYear()} FraudShield AI. Placement Portfolio Project.</span>
      </footer>

    </div>
  );
};
