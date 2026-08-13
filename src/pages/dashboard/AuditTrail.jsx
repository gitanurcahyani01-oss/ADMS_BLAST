import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  Activity,
  UserX,
  UserPlus,
  RefreshCw,
  Search,
  Lock,
  Filter,
  Shield,
  Layers
} from 'lucide-react';

export default function AuditTrail() {
  const { authFetch, isSuperAdmin, isAdmin, activeWorkspace } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [moduleFilter, setModuleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchAuditLogs = async () => {
    try {
      let url = '/audit-logs?limit=100&';
      if (moduleFilter) url += `module=${moduleFilter}&`;

      const { data, ok } = await authFetch(url);
      if (ok && data.success) {
        setLogs(data.data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [moduleFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAuditLogs();
  };

  const getActionBadge = (action) => {
    if (action.includes('REVOKE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-300 dark:border-red-500/30">
          <UserX className="w-3 h-3 text-red-500" />
          PENCABUTAN AKSES
        </span>
      );
    }
    if (action.includes('CREATE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
          <UserPlus className="w-3 h-3 text-emerald-500" />
          PEMBUATAN DATA
        </span>
      );
    }
    if (action.includes('DELETE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-300 dark:border-red-500/30">
          PENGHAPUSAN
        </span>
      );
    }
    if (action.includes('CHANGE_ROLE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
          GANTI ROLE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
        <Activity className="w-3 h-3 text-amber-500" />
        {action}
      </span>
    );
  };

  // Blocked for regular user
  if (!isSuperAdmin && !isAdmin) {
    return (
      <div className="bg-white dark:bg-[#0A2540] border border-red-200 dark:border-red-900/50 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-300">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Akses Terbatas</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Halaman Audit Trail Keamanan hanya dapat diakses oleh <strong>Super Admin</strong> dan <strong>Admin Operasional</strong>.
        </p>
      </div>
    );
  }

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.details?.toLowerCase().includes(q) ||
      l.actor?.name?.toLowerCase().includes(q) ||
      l.actor?.email?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isSuperAdmin ? 'Audit Trail & Rekam Jejak Global' : `Log Aktivitas Workspace: ${activeWorkspace?.name || 'Utama'}`}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-black border ${
              isSuperAdmin
                ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
            }`}>
              {isSuperAdmin ? 'Super Admin System Log' : 'Workspace Team Log'}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isSuperAdmin
              ? 'Catatan permanen di database PostgreSQL mengenai seluruh aktivitas di semua tenant, login, broadcast, dan perubahan izin.'
              : 'Catatan riwayat aktivitas operasional tim marketing di dalam workspace Anda.'}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Segarkan Log Audit</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari rincian aktivitas, aktor, atau aksi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">Semua Modul</option>
            <option value="users">Modul Pengguna</option>
            <option value="rbac">Modul RBAC & Role</option>
            <option value="auth">Modul Autentikasi / Login</option>
            <option value="whatsapp">Modul WhatsApp</option>
            <option value="broadcast">Modul Broadcast</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#06152B] border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Pelaksana (Actor)</th>
                <th className="py-3.5 px-4">Jenis Aksi</th>
                <th className="py-3.5 px-4">Detail Aktivitas</th>
                <th className="py-3.5 px-4">Target User</th>
                <th className="py-3.5 px-6 text-right">Waktu & IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-500" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada riwayat audit log</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.actor?.name || 'Super Admin'}
                      </div>
                      <div className="text-xs text-amber-500 font-medium flex items-center gap-1">
                        <span>{item.actor?.email || 'System'}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">({item.actor?.role || 'SYSTEM'})</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {getActionBadge(item.action)}
                    </td>

                    <td className="py-4 px-4">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {item.details}
                      </p>
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {item.targetUser ? (
                        <div>
                          <div>{item.targetUser.name}</div>
                          <div className="text-[11px] text-slate-400">{item.targetUser.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div>
                        {new Date(item.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}{' '}
                        • {new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        IP: {item.ipAddress || '127.0.0.1'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
