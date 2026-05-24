import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Laptop,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TransactionsPage = () => {
  const { apiFetch } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [risk, setRisk] = useState('All');
  const [payment, setPayment] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 15;

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      let endpoint = `/api/transactions?skip=${skip}&limit=${limit}`;
      
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;
      if (risk !== 'All') endpoint += `&risk=${encodeURIComponent(risk)}`;
      if (payment !== 'All') endpoint += `&payment=${encodeURIComponent(payment)}`;

      const data = await apiFetch(endpoint);
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Transactions fetching error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset page to 1 when filters or search change
    setPage(1);
  }, [search, risk, payment]);

  useEffect(() => {
    fetchTransactions();
  }, [page, search, risk, payment]);

  const handleResetFilters = () => {
    setSearch('');
    setRisk('All');
    setPayment('All');
    setPage(1);
  };

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Audit Ledger</h1>
        <p className="text-slate-400 text-sm mt-1">Search, examine, and trace transaction records processed by the platform.</p>
      </div>

      {/* Filters Toolbar */}
      <div className="glass p-5 rounded-2xl border-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Transaction ID or Location..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-dark-border/80 focus:border-fintech-indigo rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all duration-250"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-2 rounded-xl border border-dark-border/40">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-950">All Risk Ratings</option>
              <option value="low" className="bg-slate-950">Low Risk Only</option>
              <option value="medium" className="bg-slate-950">Medium Risk Only</option>
              <option value="high" className="bg-slate-950">High Risk Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-2 rounded-xl border border-dark-border/40">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-950">All Payment Types</option>
              <option value="Credit Card" className="bg-slate-950">Credit Card</option>
              <option value="Debit Card" className="bg-slate-950">Debit Card</option>
              <option value="PayPal" className="bg-slate-950">PayPal</option>
              <option value="Transfer" className="bg-slate-950">Transfer</option>
            </select>
          </div>

          {(search || risk !== 'All' || payment !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-fintech-indigo hover:text-white hover:bg-slate-900 rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="glass rounded-2xl border-slate-800/40 overflow-hidden shadow-2xl">
        {loading ? (
          <TableSkeleton />
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-16">
            <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 animate-bounce">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Transactions Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">We couldn't locate any records matching your search queries. Try adjusting your filter parameters.</p>
            <button 
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-fintech-indigo text-white rounded-xl hover:bg-indigo-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-border/40 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-900/10">
                    <th className="py-4 pl-6">Transaction ID</th>
                    <th className="py-4">Timestamp</th>
                    <th className="py-4">Location</th>
                    <th className="py-4">Device</th>
                    <th className="py-4">Payment Method</th>
                    <th className="py-4">Amount</th>
                    <th className="py-4">Risk Weight</th>
                    <th className="py-4 pr-6">Status Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/10 text-xs">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-900/15 transition-colors">
                      <td className="py-4 pl-6 font-mono font-semibold text-slate-300">{tx._id}</td>
                      <td className="py-4 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {new Date(tx.transaction_date).toLocaleDateString([], { month: 'short', day: '2-digit' })}{' '}
                            {new Date(tx.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {tx.location}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Laptop className="w-3.5 h-3.5 text-slate-500" />
                          {tx.device_type}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400 font-semibold">{tx.payment_method}</td>
                      <td className="py-4 font-bold text-white">${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-950 border border-dark-border/40 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full ${
                                tx.risk_level === 'high' ? 'bg-fintech-rose' : (tx.risk_level === 'medium' ? 'bg-fintech-amber' : 'bg-fintech-emerald')
                              }`}
                              style={{ width: `${tx.probability}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">{tx.probability}%</span>
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'Flagged' ? 'bg-fintech-rose/10 text-fintech-rose border border-fintech-rose/25' : 
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-dark-border/20 bg-slate-900/10">
              <span className="text-xs text-slate-400">
                Showing <span className="font-semibold text-white">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-semibold text-white">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-semibold text-white">{total}</span> audited logs
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-dark-border/60 text-slate-400 hover:text-white hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs text-slate-400 font-bold">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-dark-border/60 text-slate-400 hover:text-white hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- TABLE SKELETON PLACEHOLDER ---
const TableSkeleton = () => {
  return (
    <div className="p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-10 bg-slate-900 border border-slate-800 rounded-xl" />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-12 bg-slate-900 border border-slate-800 rounded-xl" />
      ))}
    </div>
  );
};
