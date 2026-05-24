import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  ListTodo, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user, logout, isGuest } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Transactions', path: '/transactions', icon: ListTodo },
    { name: 'Fraud Predictor', path: '/predictor', icon: ShieldAlert },
    { name: 'Model Tester', path: '/verification', icon: ShieldCheck },
  ];

  const activeStyle = "flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-fintech-indigo/20 to-fintech-purple/10 border-l-4 border-fintech-indigo text-white font-medium shadow-md shadow-indigo-500/5 transition-all duration-200";
  const inactiveStyle = "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/50 hover:border-l-4 hover:border-slate-800 transition-all duration-200";

  return (
    <>
      {/* Mobile Header Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass flex items-center justify-between px-6 z-40 border-b border-dark-border/40">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="FraudShield AI Logo" className="w-7 h-7" />
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            FRAUDSHIELD AI
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/60"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 w-64 glass-heavy border-r border-dark-border/40 p-6 flex flex-col justify-between z-50 transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:z-30
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        pt-6 lg:pt-6
      `}>
        <div className="hidden lg:flex items-center gap-2 mb-4 px-2">
          <img src="/favicon.svg" alt="FraudShield AI Logo" className="w-8 h-8" />
          <span className="font-bold text-xl tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            FRAUD<span className="text-fintech-indigo">SHIELD</span>
          </span>
        </div>

        {/* Guest Mode Badge — shown only when in guest session */}
        {isGuest && (
          <div className="mb-6 px-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/80 border border-white/5">
              <span className="h-1.5 w-1.5 rounded-full bg-fintech-amber shrink-0" />
              <span className="text-[10px] font-bold text-fintech-amber uppercase tracking-widest">Guest Mode</span>
            </div>
          </div>
        )}

        {/* Sidebar Nav Links */}
        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Profile Section */}
        <div className="border-t border-dark-border/40 pt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fintech-indigo to-fintech-purple flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/10">
              {user?.full_name ? user.full_name.charAt(0) : 'E'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-medium text-white truncate">{user?.full_name || 'Guest User'}</h4>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'guest@fraudshield.ai'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/10 hover:border-l-4 hover:border-rose-500 transition-all duration-200 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
