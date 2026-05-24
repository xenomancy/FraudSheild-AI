import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { PredictorPage } from './pages/PredictorPage';
import { VerificationPage } from './pages/VerificationPage';

// Protected Route Shielding Component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center animate-pulse">
        <div className="text-slate-400 font-bold text-sm tracking-widest uppercase">Initializing Vault...</div>
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Console Layout Frame with Sidebar
const ConsoleLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-dark-text relative bg-grid-mesh overflow-hidden">
      {/* Dynamic Background Auras */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-fintech-indigo/5 rounded-full blur-[120px] -z-10 animate-float-aura pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-fintech-purple/5 rounded-full blur-[130px] -z-10 animate-float-aura-delayed pointer-events-none" />

      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-1 min-w-0 p-6 pt-8 overflow-y-auto lg:pl-72">
          <div className="animate-fade-in-up max-w-6xl mx-auto w-full pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Secure Platform Console Views */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ConsoleLayout>
                <DashboardPage />
              </ConsoleLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <ConsoleLayout>
                <AnalyticsPage />
              </ConsoleLayout>
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <ConsoleLayout>
                <TransactionsPage />
              </ConsoleLayout>
            </ProtectedRoute>
          } />
          <Route path="/predictor" element={
            <ProtectedRoute>
              <ConsoleLayout>
                <PredictorPage />
              </ConsoleLayout>
            </ProtectedRoute>
          } />
          <Route path="/verification" element={
            <ProtectedRoute>
              <ConsoleLayout>
                <VerificationPage />
              </ConsoleLayout>
            </ProtectedRoute>
          } />

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
