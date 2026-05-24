import React from 'react';
import { Sparkles, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RecruiterBanner = () => {
  const { isGuest } = useAuth();

  if (!isGuest) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-10 bg-gradient-to-r from-fintech-indigo via-fintech-purple to-fintech-cyan z-[999] flex items-center justify-center px-4 shadow-lg shadow-indigo-500/10 border-b border-white/10 animate-pulse-slow">
      <div className="flex items-center gap-2 text-white font-medium text-xs md:text-sm tracking-wider uppercase">
        <Terminal className="w-4 h-4 text-fintech-cyan animate-bounce" />
        <span>Demo Mode Enabled for Recruiters & Placement Evaluation</span>
        <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
          <Sparkles className="w-3 h-3 text-yellow-300" />
          No Signup Required
        </span>
      </div>
    </div>
  );
};
