import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Clock, 
  ArrowRight,
  MapPin,
  Laptop,
  Play,
  Pause,
  Terminal,
  ShieldCheck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { apiFetch, showToast } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Simulator state
  const [isSimulating, setIsSimulating] = useState(true);
  const [systemLogs, setSystemLogs] = useState([
    { id: 1, time: '13:40:10', type: 'info', msg: 'Random Forest model weights initialized successfully.' },
    { id: 2, time: '13:40:15', type: 'success', msg: 'MongoDB Atlas primary data cluster connected.' },
    { id: 3, time: '13:42:04', type: 'info', msg: 'Neural pipelines running with F1 metric 99.8%.' }
  ]);

  const simulatorRef = useRef(null);

  // Fetch initial dashboard analytics
  const fetchDashboardData = async () => {
    try {
      const analyticsData = await apiFetch('/api/transactions/analytics');
      const transactionsList = await apiFetch('/api/transactions?limit=6');
      
      setAnalytics(analyticsData);
      setRecentTx(transactionsList.transactions || []);
    } catch (err) {
      console.error("Dashboard fetching error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Simulator Routine Hook
  useEffect(() => {
    if (isSimulating && !loading) {
      simulatorRef.current = setInterval(async () => {
        // Generate random realistic transaction inputs
        const isAnomalous = Math.random() < 0.15; // 15% threat vector rate
        const amount = isAnomalous 
          ? Math.round(5000 + Math.random() * 9500) 
          : Math.round(15 + Math.random() * 450);

        const locations = ['US', 'EU', 'IN', 'ASIA', 'OTHER'];
        const location = isAnomalous ? 'OTHER' : locations[Math.floor(Math.random() * locations.length)];
        
        const devices = ['Mobile', 'Desktop', 'Tablet'];
        const device = isAnomalous ? 'Mobile' : devices[Math.floor(Math.random() * devices.length)];
        
        const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Transfer'];
        const payment = isAnomalous ? 'Transfer' : paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        const hour = isAnomalous ? 2 : Math.floor(Math.random() * 24);

        const payload = {
          amount: parseFloat(amount),
          location,
          device_type: device,
          transaction_hour: hour,
          payment_method: payment
        };

        try {
          // Submit transaction through live classification
          const newTx = await apiFetch('/api/transactions/add', {
            method: 'POST',
            body: JSON.stringify(payload)
          });

          // Prepend transaction to the ledger list and trim list to 6 items
          setRecentTx(prev => [newTx, ...prev].slice(0, 6));

          // Log transaction results inside timeline logs
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newLog = {
            id: Date.now(),
            time: timestamp,
            type: newTx.is_fraud ? 'warning' : 'success',
            msg: newTx.is_fraud 
              ? `Threat Intercepted: Blocked $${newTx.amount} transfer at ${newTx.location}.`
              : `Audited safe transaction: Approved $${newTx.amount} CC swipe.`
          };

          setSystemLogs(prev => [newLog, ...prev].slice(0, 6));

          // Push visual Toast notifications if threat is detected!
          if (newTx.is_fraud) {
            showToast(
              'Threat Intercepted', 
              `Interception triggered on $${newTx.amount} ${newTx.payment_method} from ${newTx.location}. Risk factor: ${newTx.probability}%.`, 
              'error'
            );
          }

          // Dynamically adjust analytical KPI cards in standard React state
          setAnalytics(prev => {
            if (!prev) return prev;
            const nextTotal = prev.stats.total_count + 1;
            const nextFraud = newTx.is_fraud ? prev.stats.fraud_count + 1 : prev.stats.fraud_count;
            const nextPercent = Math.round((nextFraud / nextTotal) * 100 * 100) / 100;
            const nextRisk = Math.round(((prev.stats.average_risk * prev.stats.total_count + newTx.probability) / nextTotal) * 100) / 100;
            
            return {
              ...prev,
              stats: {
                total_count: nextTotal,
                fraud_count: nextFraud,
                fraud_percentage: nextPercent,
                average_risk: nextRisk
              }
            };
          });

        } catch (err) {
          console.error("Simulation run error:", err);
        }

      }, 8000);
    } else {
      clearInterval(simulatorRef.current);
    }

    return () => clearInterval(simulatorRef.current);
  }, [isSimulating, loading]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const { stats, trend_data } = analytics || {
    stats: { total_count: 0, fraud_count: 0, fraud_percentage: 0.0, average_risk: 0.0 },
    trend_data: []
  };

  const securityAlerts = recentTx.filter(t => t.risk_level === 'high').slice(0, 3);

  // SVG parameters for safety dial
  const dialRadius = 45;
  const dialCircumference = 2 * Math.PI * dialRadius;
  const safetyScore = Math.max(0, Math.min(100, Math.round(100 - stats.fraud_percentage)));
  const dialOffset = dialCircumference - (safetyScore / 100) * dialCircumference;

  return (
    <div className="flex flex-col gap-8 text-left">
      
      {/* Header and Toggle Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Secured Command Deck</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time random forest threat vector monitors & neural logs.</p>
        </div>

        {/* Live Simulator Switch */}
        <button
          onClick={() => {
            setIsSimulating(!isSimulating);
            showToast(
              isSimulating ? 'Simulator Paused' : 'Simulator Active',
              isSimulating ? 'Background transaction flows halted.' : 'Dynamic threat seeds active every 8 seconds.',
              isSimulating ? 'warning' : 'success'
            );
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 active:scale-[0.98] ${
            isSimulating 
              ? 'bg-fintech-emerald/10 border-fintech-emerald/30 text-fintech-emerald shadow-lg shadow-emerald-500/5 animate-pulse-slow'
              : 'bg-slate-900 border-white/5 text-slate-400'
          }`}
        >
          {isSimulating ? (
            <>
              <span className="w-2 h-2 rounded-full bg-fintech-emerald animate-ping" />
              <span>LIVE FEED: ACTIVE</span>
              <Pause className="w-3.5 h-3.5 pl-0.5" />
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>LIVE FEED: PAUSED</span>
              <Play className="w-3.5 h-3.5 pl-0.5" />
            </>
          )}
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Audited Volume */}
        <div className="glass p-6 rounded-3xl flex items-center justify-between border-white/5 relative overflow-hidden group glow-box-indigo transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-fintech-indigo/5 rounded-full blur-2xl group-hover:bg-fintech-indigo/10 transition-colors" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audited Ledger</span>
            <h3 className="text-3xl font-black text-white mt-2 font-mono">{stats.total_count}</h3>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-fintech-cyan" />
              <span>Continuous compliance</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-fintech-indigo/10 border border-fintech-indigo/25 flex items-center justify-center text-fintech-indigo shadow-md shadow-indigo-500/5">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Blocked Fraud */}
        <div className="glass p-6 rounded-3xl flex items-center justify-between border-white/5 relative overflow-hidden group glow-box-rose transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-fintech-rose/5 rounded-full blur-2xl group-hover:bg-fintech-rose/10 transition-colors" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Threats Intercepted</span>
            <h3 className="text-3xl font-black text-fintech-rose mt-2 font-mono">{stats.fraud_count}</h3>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-semibold">
              <Activity className="w-3.5 h-3.5 text-fintech-rose animate-pulse" />
              <span>100% containment scale</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-fintech-rose/10 border border-fintech-rose/25 flex items-center justify-center text-fintech-rose shadow-md shadow-rose-500/5">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Fraud Ratio */}
        <div className="glass p-6 rounded-3xl flex items-center justify-between border-white/5 relative overflow-hidden group glow-box-cyan transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-fintech-cyan/5 rounded-full blur-2xl group-hover:bg-fintech-cyan/10 transition-colors" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fraud Index Ratio</span>
            <h3 className="text-3xl font-black text-white mt-2 font-mono">{stats.fraud_percentage}%</h3>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-fintech-cyan animate-pulse" />
              <span>Safety ceiling &lt; 4.0%</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-fintech-cyan/10 border border-fintech-cyan/25 flex items-center justify-center text-fintech-cyan shadow-md shadow-cyan-500/5">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Overall System Safety */}
        <div className="glass p-6 rounded-3xl flex items-center justify-between border-white/5 relative overflow-hidden group glow-box-cyan transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-fintech-cyan/5 rounded-full blur-2xl group-hover:bg-fintech-cyan/10 transition-colors" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Safety</span>
            <h3 className="text-3xl font-black text-fintech-emerald mt-2 font-mono">{safetyScore}%</h3>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-semibold">
              <span>Threat protection value</span>
            </div>
          </div>
          
          {/* Animated Circular Gauge Mini */}
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r={dialRadius/2} className="stroke-slate-900 fill-none" strokeWidth="3" />
              <circle
                cx="24"
                cy="24"
                r={dialRadius/2}
                className="fill-none transition-all duration-1000 ease-out"
                strokeWidth="3"
                stroke="#10b981"
                strokeDasharray={dialCircumference/2}
                strokeDashoffset={dialOffset/2}
                strokeLinecap="round"
              />
            </svg>
            <ShieldCheck className="absolute w-4 h-4 text-fintech-emerald" />
          </div>
        </div>

      </div>

      {/* Recharts Area Curve & System Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Trend Area Chart Container */}
        <div className="lg:col-span-8 glass p-6 rounded-3xl border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Daily Audit Timeline</h3>
              <p className="text-xs text-slate-400">Timeline analysis of verified secure vs flagged anomaly ledger entries.</p>
            </div>
            <span className="text-[9px] font-bold font-mono text-fintech-cyan px-2.5 py-1 rounded-xl bg-fintech-cyan/10 border border-fintech-cyan/20">LIVE THREAT METRIC</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend_data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSafeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorSuspGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050814', border: '1px solid #1e293b', borderRadius: '16px' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Area type="monotone" name="Safe Volume" dataKey="Safe" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSafeGrad)" />
                <Area type="monotone" name="Suspicious Volume" dataKey="Suspicious" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSuspGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Neural Timeline System Logs */}
        <div className="lg:col-span-4 glass p-6 rounded-3xl border-white/5 flex flex-col justify-between h-[392px]">
          <div className="pb-4 border-b border-white/5 mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              <Terminal className="w-5 h-5 text-fintech-cyan animate-pulse" />
              Neural Activity Feed
            </h3>
            <p className="text-xs text-slate-400">Live sequential audit trail compiled from pipeline layers.</p>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 no-scrollbar">
            {systemLogs.map(log => (
              <div key={log.id} className="text-left flex items-start gap-2.5 text-[11px] leading-relaxed animate-fade-in-up">
                <span className="font-mono text-slate-500 font-bold shrink-0">{log.time}</span>
                <span className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${
                  log.type === 'warning' ? 'bg-fintech-rose animate-ping' : 
                  (log.type === 'success' ? 'bg-fintech-emerald' : 'bg-fintech-cyan')
                }`} />
                <p className="text-slate-300 font-mono">
                  {log.msg}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Ledger Feed Section */}
      <div className="glass p-6 rounded-3xl border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Live-Audited Security Log</h3>
            <p className="text-xs text-slate-400">Chronological transaction queries flowing directly into our pipeline.</p>
          </div>
          <button 
            onClick={() => navigate('/transactions')}
            className="text-xs font-extrabold text-fintech-indigo hover:text-white flex items-center gap-1 hover:gap-1.5 transition-all duration-200"
          >
            Explore Complete Ledger
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-900/10">
                <th className="pb-3 pl-2">Transaction ID</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Parameters</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Risk Rating</th>
                <th className="pb-3">Safety Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {recentTx.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-900/15 transition-all duration-200">
                  <td className="py-4 pl-2 font-mono font-bold text-slate-300">{tx._id}</td>
                  <td className="py-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(tx.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-4 text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" /> {tx.location}</span>
                      <span className="flex items-center gap-1"><Laptop className="w-3 h-3 text-slate-500" /> {tx.device_type}</span>
                    </div>
                  </td>
                  <td className="py-4 font-black text-white">${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-950 border border-white/5 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            tx.risk_level === 'high' ? 'bg-fintech-rose shadow-lg shadow-rose-500/50' : (tx.risk_level === 'medium' ? 'bg-fintech-amber shadow-lg shadow-amber-500/50' : 'bg-fintech-emerald shadow-lg shadow-emerald-500/50')
                          }`}
                          style={{ width: `${tx.probability}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">{tx.probability}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                      tx.status === 'Flagged' ? 'bg-fintech-rose/10 text-fintech-rose border border-fintech-rose/25 animate-pulse' : 
                      (tx.status === 'Investigating' ? 'bg-fintech-amber/10 text-fintech-amber border border-fintech-amber/25' : 'bg-fintech-emerald/10 text-fintech-emerald border border-fintech-emerald/25')
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- LOADING SKELETON PLACEHOLDERS ---
const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div>
        <div className="h-8 bg-slate-900 border border-slate-800 rounded-xl w-48" />
        <div className="h-4 bg-slate-900 border border-slate-800 rounded-xl w-80 mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 h-80 bg-slate-900 border border-slate-800 rounded-2xl" />
        <div className="lg:col-span-4 h-80 bg-slate-900 border border-slate-800 rounded-2xl" />
      </div>

      <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
    </div>
  );
};
