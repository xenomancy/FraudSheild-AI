import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  MapPin, 
  Laptop, 
  Clock, 
  CreditCard, 
  Sliders, 
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PredictorPage = () => {
  const { apiFetch } = () => {}; // we'll use useAuth's apiFetch
  const auth = useAuth();

  const [amount, setAmount] = useState(250);
  const [location, setLocation] = useState('US');
  const [device, setDevice] = useState('Mobile');
  const [hour, setHour] = useState(12);
  const [payment, setPayment] = useState('Credit Card');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const payload = {
      amount: parseFloat(amount),
      location,
      device_type: device,
      transaction_hour: parseInt(hour),
      payment_method: payment
    };

    try {
      // Post call to transactions/add logs the transaction so it appears in recent logs immediately!
      const data = await auth.apiFetch('/api/transactions/add', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setResult(data);

      // Trigger beautiful toast actions based on classification
      if (data.is_fraud) {
        auth.showToast(
          'Model Flag Raised',
          `Anomalous ${data.amount} transfer from ${data.location} blocked! Risk: ${data.probability}%.`,
          'error'
        );
      } else {
        auth.showToast(
          'Verification Approved',
          `Standard transaction of $${data.amount} successfully cataloged as safe.`,
          'success'
        );
      }
    } catch (err) {
      console.error("Prediction submission error:", err);
      auth.showToast('Evaluation Failed', err.message || 'Could not complete inference.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // SVG circular dial geometry calculations
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const probability = result ? result.probability : 0;
  const strokeDashoffset = circumference - (probability / 100) * circumference;

  // Determine risk presentation elements
  const getRiskStyles = (risk) => {
    if (risk === 'high') {
      return {
        color: 'text-fintech-rose',
        bg: 'bg-fintech-rose/10 border-fintech-rose/25',
        circleColor: '#f43f5e',
        label: 'HIGH RISK FLAG',
        desc: 'Model strongly advises blocking or withholding this transaction for manual review.'
      };
    } else if (risk === 'medium') {
      return {
        color: 'text-fintech-amber',
        bg: 'bg-fintech-amber/10 border-fintech-amber/25',
        circleColor: '#f59e0b',
        label: 'SUSPICIOUS (MEDIUM)',
        desc: 'Minor anomalies detected. Transaction has been flagged for active investigation.'
      };
    } else {
      return {
        color: 'text-fintech-emerald',
        bg: 'bg-fintech-emerald/10 border-fintech-emerald/25',
        circleColor: '#10b981',
        label: 'SAFE LOG (LOW RISK)',
        desc: 'Transaction parameters align perfectly with standard baseline secure profiles.'
      };
    }
  };

  const riskStyles = result ? getRiskStyles(result.risk_level) : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Predictor</h1>
        <p className="text-slate-400 text-sm mt-1">Interactively run transactions through the upgraded XGBoost model pipeline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Panel */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 glass p-6 md:p-8 rounded-3xl border-slate-800/40 flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-4 border-b border-dark-border/20">
            <Sliders className="w-5 h-5 text-fintech-indigo" />
            <h3 className="text-lg font-bold text-white">Input Parameters</h3>
          </div>

          {/* Amount Slider */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction Amount ($)</label>
              <input
                type="number"
                value={amount}
                min={1}
                max={50000}
                onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                className="bg-slate-950/80 border border-dark-border/80 text-right w-28 px-3 py-1.5 rounded-lg text-sm text-white font-bold font-mono outline-none focus:border-fintech-indigo"
              />
            </div>
            <input
              type="range"
              min={1}
              max={15000}
              value={amount > 15000 ? 15000 : amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold font-mono">
              <span>$1.00</span>
              <span className="text-slate-400">Slider limited to $15k (Type for higher values)</span>
              <span>$15,000.00</span>
            </div>
          </div>

          {/* Location and Device (Side by Side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                Location Region
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-dark-border/80 focus:border-fintech-indigo rounded-xl text-sm text-slate-200 font-medium outline-none transition cursor-pointer"
              >
                <option value="US">United States (US)</option>
                <option value="EU">European Union (EU)</option>
                <option value="IN">India (IN)</option>
                <option value="ASIA">Asia / Pacific (ASIA)</option>
                <option value="OTHER">Other / High-Anomalous (OTHER)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-slate-500" />
                Device Type
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-dark-border/80">
                {['Mobile', 'Desktop', 'Tablet'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDevice(d)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      device === d ? 'bg-fintech-indigo text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hour Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                Transaction Hour ({hour}:00)
              </label>
              <span className="text-xs font-bold text-slate-400 font-mono">
                {hour === 0 ? 'Midnight' : (hour === 12 ? 'Noon' : (hour > 12 ? `${hour - 12} PM` : `${hour} AM`))}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold font-mono">
              <span>00:00 (Midnight)</span>
              <span>12:00 (Noon)</span>
              <span>23:00 (11 PM)</span>
            </div>
          </div>

          {/* Payment Method Tab Selectors */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-slate-500" />
              Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Credit Card', 'Debit Card', 'PayPal', 'Transfer'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPayment(m)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                    payment === m 
                      ? 'bg-fintech-indigo/10 border-fintech-indigo text-white shadow-md shadow-indigo-500/5' 
                      : 'bg-slate-950 border-dark-border/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-fintech-indigo to-fintech-purple text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/15 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? 'Evaluating Model Inference...' : 'Evaluate Transaction'}
            <Zap className="w-4 h-4" />
          </button>
        </form>

        {/* Right Results Dashboard */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass p-6 md:p-8 rounded-3xl border-slate-800/40 min-h-[440px] flex flex-col items-center justify-center text-center relative overflow-hidden">
            
            {/* Background vector glow */}
            {result && (
              <div 
                className="absolute inset-0 blur-3xl rounded-full scale-50 opacity-20 -z-10 transition-colors duration-500" 
                style={{ backgroundColor: riskStyles.circleColor }}
              />
            )}

            {!result && !loading && (
              <div className="flex flex-col items-center p-8">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 animate-bounce">
                  <ShieldCheck className="w-8 h-8 text-fintech-cyan" />
                </div>
                <h3 className="text-base font-bold text-white">Platform Ready</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">Fill in transaction parameters and tap Evaluate to run the optimized XGBoost classifier diagnostic checks.</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center p-8 gap-4 animate-pulse">
                <div className="w-28 h-28 rounded-full border-4 border-slate-800 border-t-fintech-indigo animate-spin" />
                <div>
                  <h4 className="text-sm font-bold text-white">Running XGBoost Pipeline...</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Applying Standard Scalers & SMOTE categorical encoding matrices.</p>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="flex flex-col items-center gap-5 w-full">
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${riskStyles.bg} ${riskStyles.color} animate-pulse`}>
                    {riskStyles.label}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border bg-slate-950 border-slate-800 text-fintech-cyan">
                    Certainty: {result.confidence_score}%
                  </span>
                </div>

                {/* Animated circular SVG ring dial */}
                <div className="relative w-36 h-36 flex items-center justify-center my-2">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Circle Background */}
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      className="stroke-slate-900 fill-none"
                      strokeWidth={strokeWidth}
                    />
                    {/* Circle Progress */}
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      className="fill-none transition-all duration-1000 ease-out"
                      strokeWidth={strokeWidth}
                      stroke={riskStyles.circleColor}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Absolute Dial Label */}
                  <div className="absolute flex flex-col justify-center items-center">
                    <span className="text-3xl font-black text-white leading-none font-mono">{probability}%</span>
                    <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-1">FRAUD RISK</span>
                  </div>
                </div>

                <div className="max-w-xs">
                  <h4 className="text-sm font-bold text-white">
                    {result.is_fraud ? (
                      <span className="flex items-center justify-center gap-1.5 text-fintech-rose">
                        <AlertOctagon className="w-4 h-4" /> Fraud Vector Confirmed
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 text-fintech-emerald">
                        <ShieldCheck className="w-4 h-4" /> Secure Record Cataloged
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{riskStyles.desc}</p>
                  
                  {/* Mitigating Recommended Action */}
                  <div className={`mt-3 px-4 py-2 rounded-xl text-xs font-bold border transition-colors inline-block ${
                    result.is_fraud 
                      ? 'bg-fintech-rose/10 border-fintech-rose/30 text-fintech-rose' 
                      : (result.risk_level === 'medium' ? 'bg-fintech-amber/10 border-fintech-amber/30 text-fintech-amber' : 'bg-fintech-emerald/10 border-fintech-emerald/30 text-fintech-emerald')
                  }`}>
                    Action: {result.recommended_action || "Approve Transaction"}
                  </div>
                </div>

                {/* Diagnostics analysis explanation */}
                <div className="w-full border-t border-dark-border/30 pt-4 mt-2 text-left bg-slate-900/10 p-3 rounded-xl">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-fintech-cyan" />
                    Model Decision Rationale
                  </h5>
                  <ul className="list-disc pl-4 text-[10px] text-slate-500 flex flex-col gap-1.5">
                    {result.fraud_reasons && result.fraud_reasons.length > 0 ? (
                      result.fraud_reasons.map((reason, idx) => (
                        <li key={idx}>
                          <strong className="text-slate-400 capitalize">{reason}</strong> detected.
                        </li>
                      ))
                    ) : (
                      <li>All parameters conform perfectly to standard verified secure transaction patterns.</li>
                    )}
                  </ul>
                </div>

              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};
