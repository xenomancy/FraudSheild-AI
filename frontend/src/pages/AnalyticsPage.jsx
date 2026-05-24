import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  CalendarRange, 
  Layers, 
  CreditCard, 
  BarChart2, 
  Cpu, 
  Workflow, 
  Target, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

export const AnalyticsPage = () => {
  const { apiFetch } = useAuth();
  const [data, setData] = useState(null);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const [res, mlRes] = await Promise.all([
          apiFetch('/api/transactions/analytics'),
          apiFetch('/api/predict/metrics')
        ]);
        setData(res);
        setMlMetrics(mlRes);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  const {
    stats,
    risk_distribution,
    payment_distribution,
    trend_data,
    monthly_summary
  } = data || {
    stats: {},
    risk_distribution: [],
    payment_distribution: [],
    trend_data: [],
    monthly_summary: []
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Threat Intelligence</h1>
        <p className="text-slate-400 text-sm mt-1">Multi-dimensional machine learning transaction insights & risk breakdowns.</p>
      </div>

      {/* Primary Charts Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chart 1: Fraud Trend Graph (Area Chart) */}
        <div className="lg:col-span-8 glass p-6 rounded-2xl border-slate-800/40">
          <div className="flex items-center gap-2 mb-4">
            <CalendarRange className="w-5 h-5 text-fintech-cyan" />
            <h3 className="text-lg font-bold text-white">Daily Fraud Detection Trend</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">Visualizes active threat vectors comparing flagged anomalies against safe volume timelines.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend_data}>
                <defs>
                  <linearGradient id="areaSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="areaFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.25} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d1f', border: '1px solid #1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area type="monotone" name="Safe Transactions" dataKey="Safe" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#areaSafe)" />
                <Area type="monotone" name="Flagged Threats" dataKey="Suspicious" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#areaFraud)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Distribution Pie Chart */}
        <div className="lg:col-span-4 glass p-6 rounded-2xl border-slate-800/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-fintech-indigo" />
              <h3 className="text-lg font-bold text-white">Risk Rating Ratios</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">Percentage allocation of audited logs partitioned by system risk level.</p>
          </div>
          <div className="h-48 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {risk_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d1f', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-[10px] font-bold text-slate-400 mt-4 border-t border-dark-border/20 pt-4">
            {risk_distribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chart 3: Transaction Activity Graph (Line Chart) */}
        <div className="lg:col-span-4 glass p-6 rounded-2xl border-slate-800/40">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-fintech-purple" />
            <h3 className="text-lg font-bold text-white">Activity Frequency</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">Chronological tracking of transaction counts audited in real-time.</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d1f', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Line type="monotone" name="Audit Hits" dataKey="Total" stroke="#a855f7" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Fraud vs Safe Transaction Chart (Payment breakdown) */}
        <div className="lg:col-span-4 glass p-6 rounded-2xl border-slate-800/40">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-fintech-cyan" />
            <h3 className="text-lg font-bold text-white">Payment Method Profiling</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">Threat vulnerability index compared across primary payment channels.</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payment_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d1f', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Bar name="Total Volume" dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar name="Fraud Vector" dataKey="fraud" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Monthly Fraud Analysis (Bar Chart) */}
        <div className="lg:col-span-4 glass p-6 rounded-2xl border-slate-800/40">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-fintech-emerald" />
            <h3 className="text-lg font-bold text-white">Monthly Comparative Safety</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">Long-term compliance evaluation comparing fraud metrics monthly.</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly_summary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d1f', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Bar name="Safe Volume" dataKey="Safe" stackId="a" fill="#10b981" />
                <Bar name="Fraud Vector" dataKey="Fraud" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION: Upgraded AI Model Diagnostics */}
      {mlMetrics && mlMetrics.success && (
        <div className="flex flex-col gap-8 mt-12 pt-12 border-t border-slate-900/60">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-fintech-indigo" />
              AI Core Engine & Diagnostics
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Upgraded classification diagnostics from the production XGBoost pipeline (SMOTE inside cross-validation, custom classification threshold).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 1. Model Comparative Metrics */}
            <div className="lg:col-span-8 glass p-6 rounded-2xl border-slate-800/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-fintech-cyan" />
                    <h3 className="text-base font-bold text-white">Model Comparison Test Bench</h3>
                  </div>
                  <span className="text-[9px] font-bold text-fintech-emerald bg-fintech-emerald/10 border border-fintech-emerald/30 px-2 py-0.5 rounded-full uppercase">
                    Best: {mlMetrics.best_model}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Comparison between baseline Logistic Regression, existing Random Forest, and upgraded XGBoost Classifier.
                </p>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Accuracy',
                        'Logistic Regression': parseFloat((mlMetrics.metrics?.['Logistic Regression']?.accuracy * 100).toFixed(1)),
                        'Random Forest': parseFloat((mlMetrics.metrics?.['Random Forest']?.accuracy * 100).toFixed(1)),
                        'XGBoost (Upgraded)': parseFloat((mlMetrics.metrics?.['XGBoost']?.accuracy * 100).toFixed(1)),
                      },
                      {
                        name: 'Precision',
                        'Logistic Regression': parseFloat((mlMetrics.metrics?.['Logistic Regression']?.precision * 100).toFixed(1)),
                        'Random Forest': parseFloat((mlMetrics.metrics?.['Random Forest']?.precision * 100).toFixed(1)),
                        'XGBoost (Upgraded)': parseFloat((mlMetrics.metrics?.['XGBoost']?.precision * 100).toFixed(1)),
                      },
                      {
                        name: 'Recall',
                        'Logistic Regression': parseFloat((mlMetrics.metrics?.['Logistic Regression']?.recall * 100).toFixed(1)),
                        'Random Forest': parseFloat((mlMetrics.metrics?.['Random Forest']?.recall * 100).toFixed(1)),
                        'XGBoost (Upgraded)': parseFloat((mlMetrics.metrics?.['XGBoost']?.recall * 100).toFixed(1)),
                      },
                      {
                        name: 'F1-Score',
                        'Logistic Regression': parseFloat((mlMetrics.metrics?.['Logistic Regression']?.f1_score * 100).toFixed(1)),
                        'Random Forest': parseFloat((mlMetrics.metrics?.['Random Forest']?.f1_score * 100).toFixed(1)),
                        'XGBoost (Upgraded)': parseFloat((mlMetrics.metrics?.['XGBoost']?.f1_score * 100).toFixed(1)),
                      },
                      {
                        name: 'ROC-AUC',
                        'Logistic Regression': parseFloat((mlMetrics.metrics?.['Logistic Regression']?.roc_auc * 100).toFixed(1)),
                        'Random Forest': parseFloat((mlMetrics.metrics?.['Random Forest']?.roc_auc * 100).toFixed(1)),
                        'XGBoost (Upgraded)': parseFloat((mlMetrics.metrics?.['XGBoost']?.roc_auc * 100).toFixed(1)),
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[70, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d1f', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                    <Bar name="Logistic Regression" dataKey="Logistic Regression" fill="#475569" radius={[3, 3, 0, 0]} />
                    <Bar name="Random Forest" dataKey="Random Forest" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                    <Bar name="XGBoost (Upgraded)" dataKey="XGBoost (Upgraded)" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Confusion Matrix */}
            <div className="lg:col-span-4 glass p-6 rounded-2xl border-slate-800/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-fintech-rose" />
                  <h3 className="text-base font-bold text-white">Confusion Matrix</h3>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  True predictions vs. misclassifications of the upgraded {mlMetrics.best_model} model.
                </p>
              </div>

              {/* Matrix Layout Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">True Negative (TN)</span>
                  <span className="text-2xl font-black text-white font-mono mt-1">{mlMetrics.confusion_matrix?.tn}</span>
                  <span className="text-[8px] text-slate-400 mt-0.5">Correctly Allowed Safe</span>
                </div>
                <div className="bg-slate-950/80 border border-fintech-rose/20 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold text-fintech-rose uppercase tracking-widest">False Positive (FP)</span>
                  <span className="text-2xl font-black text-fintech-rose font-mono mt-1">{mlMetrics.confusion_matrix?.fp}</span>
                  <span className="text-[8px] text-slate-500 mt-0.5">False Alarms (Low!)</span>
                </div>
                <div className="bg-slate-950/80 border border-fintech-rose/20 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold text-fintech-rose uppercase tracking-widest">False Negative (FN)</span>
                  <span className="text-2xl font-black text-fintech-rose font-mono mt-1">{mlMetrics.confusion_matrix?.fn}</span>
                  <span className="text-[8px] text-slate-500 mt-0.5">Missed Fraud (Low!)</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold text-fintech-cyan uppercase tracking-widest">True Positive (TP)</span>
                  <span className="text-2xl font-black text-fintech-cyan font-mono mt-1">{mlMetrics.confusion_matrix?.tp}</span>
                  <span className="text-[8px] text-slate-400 mt-0.5">Correctly Blocked Fraud</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-center italic mt-2">
                Minimal False Positives ensures frictionless customer checkout.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 3. Feature Importance BarChart */}
            <div className="lg:col-span-6 glass p-6 rounded-2xl border-slate-800/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-5 h-5 text-fintech-indigo" />
                  <h3 className="text-base font-bold text-white">Top Predictive Threat Vectors</h3>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  The primary risk features driving predictions inside XGBoost's ensemble trees.
                </p>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={Object.entries(mlMetrics.feature_importances || {})
                      .map(([key, val]) => ({
                        name: key.replace(/_/g, ' ').replace('flag', '').trim(),
                        weight: parseFloat((val * 100).toFixed(1))
                      }))
                      .sort((a, b) => b.weight - a.weight)
                      .slice(0, 7)}
                    margin={{ left: 20, right: 10, top: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.1} horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d1f', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                    <Bar name="Feature Weight %" dataKey="weight" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Threshold & Hyperparameters Detail card */}
            <div className="lg:col-span-6 glass p-6 rounded-2xl border-slate-800/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-fintech-cyan" />
                  <h3 className="text-base font-bold text-white">AI Threshold & Optimization Strategy</h3>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Dynamic safety boundaries designed to maximize fraud recall while eliminating user checkout friction.
                </p>
              </div>

              <div className="flex flex-col gap-4 flex-1 justify-center">
                <div className="flex items-center justify-between border-b border-dark-border/20 pb-3">
                  <span className="text-xs text-slate-400 font-medium">Optimal Decision Threshold</span>
                  <span className="text-sm font-bold text-white font-mono">{mlMetrics.optimal_threshold}</span>
                </div>
                <div className="flex items-center justify-between border-b border-dark-border/20 pb-3">
                  <span className="text-xs text-slate-400 font-medium">Hyperparameter Search Tuning</span>
                  <span className="text-xs text-slate-400 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg font-mono">
                    3-Fold CV Stratified Grid
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dark-border/20 pb-3">
                  <span className="text-xs text-slate-400 font-medium">Class Imbalance Oversampling</span>
                  <span className="text-xs text-slate-400 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg font-mono">
                    SMOTE Interpolation
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Selection Objective Function</span>
                  <span className="text-xs text-fintech-cyan font-extrabold uppercase">
                    Maximize Held-out Validation F1
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-dark-border/20 pt-4 flex gap-3 items-center">
                <div className="p-2 bg-fintech-cyan/10 border border-fintech-cyan/20 rounded-xl">
                  <Workflow className="w-4 h-4 text-fintech-cyan" />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Our pipeline automatically balances dataset imbalance across categories to minimize missed occurrences, targeting &gt;0.90 Precision/Recall.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

// --- LOADING SKELETON PLACEHOLDERS ---
const AnalyticsSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div>
        <div className="h-8 bg-slate-900 border border-slate-800 rounded-xl w-64" />
        <div className="h-4 bg-slate-900 border border-slate-800 rounded-xl w-96 mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 h-80 bg-slate-900 border border-slate-800 rounded-2xl" />
        <div className="lg:col-span-4 h-80 bg-slate-900 border border-slate-800 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-72 bg-slate-900 border border-slate-800 rounded-2xl" />
        ))}
      </div>
    </div>
  );
};
