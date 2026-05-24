import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isGuest, setIsGuest] = useState(localStorage.getItem('isGuest') === 'true');
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Use same-origin in dev (Vite proxies /api → backend). Override with VITE_API_URL if needed.
  const API_URL = import.meta.env.VITE_API_URL ?? '';

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedIsGuest = localStorage.getItem('isGuest') === 'true';

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsGuest(storedIsGuest);
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  // Show Toast method
  const showToast = (title, message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, message, type };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const parseApiErrorDetail = (errData) => {
    if (!errData?.detail) return null;
    if (typeof errData.detail === 'string') return errData.detail;
    if (Array.isArray(errData.detail)) {
      return errData.detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(', ');
    }
    return String(errData.detail);
  };

  const isNetworkFailure = (err) =>
    err?.message === 'Failed to fetch' ||
    err?.message?.includes('NetworkError') ||
    err?.message?.includes('ERR_CONNECTION_REFUSED');

  // API Request Wrapper with automatic Authorization Header integration
  const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiErrorDetail(errData) || `HTTP Error ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      // Auth must hit the real backend — never use offline mock data
      if (endpoint.startsWith('/api/auth')) {
        if (isNetworkFailure(err)) {
          throw new Error(
            'Cannot reach the backend server. From the backend folder run: uvicorn app.main:app --reload --port 8000'
          );
        }
        throw err;
      }
      // For data routes, use offline fallback only when server is completely unreachable
      if (isNetworkFailure(err)) {
        return mockOfflineFallback(endpoint, options);
      }
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      saveSession(data.access_token, data.user, false);
      showToast('Welcome Back', `Signed in as ${data.user.full_name}.`, 'success');
      return data.user;
    } catch (err) {
      showToast('Sign In Failed', err.message || 'Incorrect email or password.', 'error');
      throw err;
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      showToast('Account Created', 'Successfully registered security credentials.', 'success');
      return res;
    } catch (err) {
      showToast('Registration Refused', err.message || 'Could not complete signup.', 'error');
      throw err;
    }
  };

  const loginGuest = async () => {
    try {
      const data = await apiFetch('/api/auth/demo', {
        method: 'POST',
      });
      saveSession(data.access_token, data.user, true);
      showToast('Guest Mode Active', 'Browsing with demo data. Database writes are disabled.', 'info');
      return data.user;
    } catch (err) {
      // Full offline fallback if backend is not running
      console.warn('Backend offline. Enabling client-side guest session.');
      const mockUser = { email: 'guest@fraudshield.ai', full_name: 'Guest User' };
      saveSession('offline_mock_jwt_token', mockUser, true);
      showToast('Guest Mode Active (Offline)', 'Running on local demo data.', 'warning');
      return mockUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isGuest');
    setToken(null);
    setUser(null);
    setIsGuest(false);
    showToast('Signed Out', 'Session ended successfully.', 'info');
  };

  const saveSession = (tokenVal, userVal, guestVal) => {
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('user', JSON.stringify(userVal));
    localStorage.setItem('isGuest', String(guestVal));
    setToken(tokenVal);
    setUser(userVal);
    setIsGuest(guestVal);
  };

  // Pre-compiled Mock API data for absolute offline resilience
  const mockOfflineFallback = (endpoint, options) => {
    console.info(`[Offline Fallback Client Engine] Serving mock payload for: ${endpoint}`);
    
    if (endpoint === '/api/auth/demo') {
      return {
        access_token: 'offline_mock_jwt_token',
        token_type: 'bearer',
        user: { email: 'guest@fraudshield.ai', full_name: 'Placement Evaluator (Offline Mode)' }
      };
    }
    
    if (endpoint === '/api/transactions/analytics') {
      return generateMockAnalytics();
    }
    
    if (endpoint === '/api/predict/metrics') {
      return {
        success: true,
        best_model: "Random Forest",
        features: ["amount", "transaction_hour", "location", "device_type", "payment_method"],
        metrics: {
          accuracy: 0.785,
          precision: 0.1369,
          recall: 0.6139,
          f1_score: 0.2238,
          roc_auc: 0.8226
        },
        confusion_matrix: {
          tp: 62,
          tn: 3078,
          fp: 391,
          fn: 39
        }
      };
    }
    
    if (endpoint.startsWith('/api/transactions')) {
      return generateMockTransactionsList(endpoint);
    }
    
    if (endpoint === '/api/predict' || endpoint === '/api/transactions/add') {
      const tx = JSON.parse(options.body);
      return simulatePrediction(tx);
    }
    
    throw new Error('Backend Server is currently offline. Action unavailable.');
  };

  return (
    <AuthContext.Provider value={{ user, token, isGuest, loading, login, register, loginGuest, logout, apiFetch, toasts, showToast, removeToast }}>
      {children}

      {/* Floating Glass Toast Notification Deck */}
      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`
              pointer-events-auto p-4 rounded-2xl glass-heavy border shadow-2xl flex items-start gap-3 w-full
              animate-toast-in transition-all duration-300
              ${
                t.type === 'success' ? 'border-fintech-emerald/30 shadow-emerald-500/10' :
                t.type === 'error' ? 'border-fintech-rose/30 shadow-rose-500/10' :
                t.type === 'warning' ? 'border-fintech-amber/30 shadow-amber-500/10' :
                'border-fintech-cyan/30 shadow-cyan-500/10'
              }
            `}
          >
            {/* Left Accent Neon Strip */}
            <div className={`
              w-1.5 self-stretch rounded-full shrink-0
              ${
                t.type === 'success' ? 'bg-fintech-emerald shadow-lg shadow-emerald-500/50' :
                t.type === 'error' ? 'bg-fintech-rose shadow-lg shadow-rose-500/50' :
                t.type === 'warning' ? 'bg-fintech-amber shadow-lg shadow-amber-500/50' :
                'bg-fintech-cyan shadow-lg shadow-cyan-500/50'
              }
            `} />
            
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-extrabold text-white tracking-wide uppercase leading-none">{t.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{t.message}</p>
            </div>
            
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-500 hover:text-white transition-colors duration-150 text-[10px] font-extrabold pl-2 shrink-0 self-center"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

// --- MOCK OFFLINE DATA GENERATORS ---
const generateMockAnalytics = () => {
  return {
    stats: { total_count: 128, fraud_count: 5, fraud_percentage: 3.91, average_risk: 12.35 },
    risk_distribution: [
      { name: 'Low Risk', value: 114, color: '#10B981' },
      { name: 'Medium Risk', value: 9, color: '#F59E0B' },
      { name: 'High Risk', value: 5, color: '#EF4444' }
    ],
    payment_distribution: [
      { name: 'Credit Card', total: 60, fraud: 2 },
      { name: 'Debit Card', total: 42, fraud: 0 },
      { name: 'PayPal', total: 18, fraud: 1 },
      { name: 'Transfer', total: 8, fraud: 2 }
    ],
    trend_data: [
      { date: 'May 10', Safe: 4, Suspicious: 0, Total: 4 },
      { date: 'May 12', Safe: 8, Suspicious: 0, Total: 8 },
      { date: 'May 14', Safe: 5, Suspicious: 1, Total: 6 },
      { date: 'May 16', Safe: 12, Suspicious: 0, Total: 12 },
      { date: 'May 18', Safe: 6, Suspicious: 0, Total: 6 },
      { date: 'May 20', Safe: 14, Suspicious: 1, Total: 15 },
      { date: 'May 22', Safe: 9, Suspicious: 2, Total: 11 },
      { date: 'May 24', Safe: 10, Suspicious: 1, Total: 11 }
    ],
    monthly_summary: [
      { month: 'March', Safe: 40, Fraud: 1, Total: 41 },
      { month: 'April', Safe: 50, Fraud: 2, Total: 52 },
      { month: 'May', Safe: 33, Fraud: 2, Total: 35 }
    ]
  };
};

const generateMockTransactionsList = (endpoint) => {
  // Extract mock query params
  const transactions = [];
  const locations = ['US', 'EU', 'IN', 'ASIA', 'OTHER'];
  const methods = ['Credit Card', 'Debit Card', 'PayPal', 'Transfer'];
  
  for (let i = 0; i < 40; i++) {
    const isHigh = i % 8 === 0;
    const amount = isHigh ? Math.round(Math.random() * 8000 + 2000) : Math.round(Math.random() * 450 + 10);
    const method = methods[i % methods.length];
    const risk = isHigh ? 'high' : (i % 5 === 1 ? 'medium' : 'low');
    
    transactions.push({
      _id: `TXN${100000 + i}`,
      user_id: 'guest_demo',
      amount,
      location: locations[i % locations.length],
      device_type: i % 3 === 0 ? 'Mobile' : (i % 3 === 1 ? 'Desktop' : 'Tablet'),
      transaction_hour: (10 + i) % 24,
      transaction_date: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
      payment_method: method,
      is_fraud: isHigh ? 1 : 0,
      probability: isHigh ? 78.4 : (risk === 'medium' ? 34.2 : 2.5),
      risk_level: risk,
      status: isHigh ? 'Flagged' : (risk === 'medium' ? 'Investigating' : 'Safe')
    });
  }
  
  return {
    transactions,
    total: transactions.length,
    skip: 0,
    limit: 20
  };
};

const simulatePrediction = (tx) => {
  let prob = 0.005;
  if (tx.amount > 10000) prob += 0.35;
  else if (tx.amount > 5000) prob += 0.15;
  else if (tx.amount > 1000) prob += 0.05;

  if ([23, 0, 1, 2, 3, 4].includes(tx.transaction_hour)) prob += 0.08;
  if (tx.payment_method === 'Transfer' && tx.amount > 2000) prob += 0.20;
  if (tx.device_type === 'Mobile' && ['ASIA', 'OTHER'].includes(tx.location)) prob += 0.10;

  prob = Math.min(Math.max(prob, 0.001), 0.95);
  const is_fraud = prob > 0.45;
  const risk_level = prob >= 0.60 || is_fraud ? 'high' : (prob >= 0.25 ? 'medium' : 'low');

  // Format exactly matching our API structure
  const resultData = {
    _id: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
    amount: tx.amount,
    location: tx.location,
    device_type: tx.device_type,
    transaction_hour: tx.transaction_hour,
    transaction_date: new Date().toISOString(),
    payment_method: tx.payment_method,
    is_fraud: is_fraud ? 1 : 0,
    probability: Math.round(prob * 100 * 10) / 10,
    risk_level,
    status: is_fraud ? 'Flagged' : (risk_level === 'medium' ? 'Investigating' : 'Safe')
  };

  return resultData;
};
