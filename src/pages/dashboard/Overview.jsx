import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Send,
  CheckCircle2,
  XCircle,
  Smartphone,
  Users,
  Activity,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Clock,
  Shield,
  Crown,
  Layers,
  Sparkles,
  Bot,
  UserPlus,
  ShieldCheck,
  FileSpreadsheet,
  Plus
} from 'lucide-react';

export default function Overview() {
  const { authFetch, user, isSuperAdmin, isAdmin, isUser, activeWorkspace } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const { data, ok } = await authFetch('/monitoring/stats');
      if (ok && data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Mengambil data ringkasan dashboard...
          </p>
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalMessages: 0,
    sentCount: 0,
    failedCount: 0,
    successRate: '100%',
    connectedDevices: 0,
    totalDevices: 0,
    activeAdmins: 0,
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isSuperAdmin
                ? 'Overview Sistem & Platform'
                : isAdmin
                ? `Dashboard Operasional: ${activeWorkspace?.name || 'Workspace'}`
                : 'Dashboard Marketing & Broadcast'}
            </h1>
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                Super Admin
              </span>
            ) : isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                Admin Tenant
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                User Staf
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isSuperAdmin
              ? 'Ringkasan performa seluruh gateway WhatsApp, antrean pesan, dan pengguna di semua tenant.'
              : isAdmin
              ? 'Pantau kinerja pengiriman pesan tim, status nomor WhatsApp, dan audiens kontak workspace Anda.'
              : 'Pantau status nomor WhatsApp siap pakai, draf pesan broadcast, dan balasan chatbot otomatis.'}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Total Pesan Terkirim */}
        <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isSuperAdmin ? 'Total Log Pesan (Global)' : 'Pesan Terkirim (Workspace)'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.totalMessages.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{summary.sentCount} sukses terkirim</span>
            </div>
          </div>
        </div>

        {/* Card 2: Keberhasilan Delivery Rate */}
        <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tingkat Keberhasilan
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.successRate}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {summary.failedCount} pesan gagal / timeout
            </div>
          </div>
        </div>

        {/* Card 3: Perangkat WhatsApp */}
        <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              WhatsApp Gateway
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.connectedDevices} / {summary.totalDevices}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{summary.connectedDevices > 0 ? 'Siap Kirim Pesan' : 'Semua Offline'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pengguna / Bot */}
        <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isSuperAdmin ? 'Total Pengguna Aktif' : 'Otomasi Chatbot'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
              {isSuperAdmin ? <Users className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isSuperAdmin ? (summary.activeAdmins || 1) : 'Aktif 24/7'}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">
              {isSuperAdmin ? 'Terdaftar di PostgreSQL' : 'Menjawab Otomatis'}
            </div>
          </div>
        </div>

      </div>

      {/* Role Quick Action Shortcuts */}
      <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
          Aksi Cepat Menu ({user?.role})
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/dashboard/broadcast"
            className="p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-3 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">Kirim Broadcast</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Pesan massal & media</p>
            </div>
          </Link>

          <Link
            to="/dashboard/contacts"
            className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">Upload Kontak</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Import Excel & CSV</p>
            </div>
          </Link>

          <Link
            to="/dashboard/auto-reply"
            className="p-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 flex items-center gap-3 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">Auto-Reply Bot</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Atur keyword chatbot</p>
            </div>
          </Link>

          {(isSuperAdmin || isAdmin) ? (
            <Link
              to="/dashboard/users"
              className="p-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 flex items-center gap-3 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-white">
                  {isSuperAdmin ? 'Kelola Pengguna' : 'Kelola Tim'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">RBAC & Hak Akses</p>
              </div>
            </Link>
          ) : (
            <Link
              to="/dashboard/devices"
              className="p-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 flex items-center gap-3 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-white">Status Perangkat</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Cek gateway online</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Kampanye Broadcast Terakhir
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daftar pengiriman pesan broadcast di WhatsApp Engine
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {stats?.recentCampaigns?.length || 0} Kampanye
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pr-4">Judul Kampanye</th>
                <th className="pb-3 px-4">Gateway</th>
                <th className="pb-3 px-4">Dibuat Oleh</th>
                <th className="pb-3 px-4 text-center">Target</th>
                <th className="pb-3 px-4 text-center">Terkirim</th>
                <th className="pb-3 px-4 text-center">Gagal</th>
                <th className="pb-3 pl-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {stats?.recentCampaigns?.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="font-bold text-slate-900 dark:text-white">{c.title}</div>
                    <div className="text-xs text-slate-400 truncate max-w-xs">{c.message}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                    {c.device?.name || 'Multi-Gateway'}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {c.createdBy?.name || 'Admin'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-200">
                    {c.totalTarget}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                    {c.sentCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-red-500">
                    {c.failedCount}
                  </td>
                  <td className="py-3.5 pl-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {c.status}
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
}
