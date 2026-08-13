import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock, KeyRound } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles, requiredPermission }) {
  const { user, loading, isAuthenticated, isSuperAdmin, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Memeriksa hak akses & sesi autentikasi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Role validation
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#0E2A47] border border-red-200 dark:border-red-900/50 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Akses Ditolak ({allowedRoles.join(', ')})
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
            Halaman ini membutuhkan role <strong>{allowedRoles.join(' atau ')}</strong>. Akun Anda saat ini memiliki role <strong>{user.role}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Granular permission validation
  if (requiredPermission && !isSuperAdmin && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#0E2A47] border border-amber-200 dark:border-amber-900/50 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Izin Akses Tidak Memadai
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
            Akun Anda tidak memiliki permission <code>{requiredPermission}</code> untuk membuka modul ini. Silakan hubungi Super Admin untuk penambahan izin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
