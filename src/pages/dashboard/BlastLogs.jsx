import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ScrollText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Send,
  CheckCheck
} from 'lucide-react';

export default function BlastLogs() {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      let url = `/monitoring/logs?page=${page}&limit=20&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter && statusFilter !== 'ALL') url += `status=${statusFilter}&`;

      const { data, ok } = await authFetch(url);
      if (ok && data.success) {
        setLogs(data.data.logs);
        setTotalPages(data.data.totalPages);
        setTotalCount(data.data.total);
      }
    } catch (err) {
      console.error('Failed to load blast logs:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, statusFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLogs();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'READ':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
            <CheckCheck className="w-3 h-3 text-blue-500" />
            Dibaca (Read)
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
            <CheckCheck className="w-3 h-3 text-emerald-500" />
            Terkirim (Delivered)
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
            <Send className="w-3 h-3 text-slate-400" />
            Terkirim ke Server
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300">
            <XCircle className="w-3 h-3 text-red-500" />
            Gagal Terkirim
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300">
            <Clock className="w-3 h-3 text-yellow-500" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Log Pesan Blast WhatsApp
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitoring riwayat pengiriman pesan per nomor penerima, status delivery, dan pesan kegagalan.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor HP penerima, nama, atau isi pesan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">Semua Status Pesan</option>
            <option value="READ">Dibaca (Read)</option>
            <option value="DELIVERED">Terkirim (Delivered)</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Gagal (Failed)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#06152B] border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Penerima & Nomor</th>
                <th className="py-3.5 px-4">Kampanye</th>
                <th className="py-3.5 px-4">Isi Pesan</th>
                <th className="py-3.5 px-4">Status Pengiriman</th>
                <th className="py-3.5 px-6 text-right">Waktu Eksekusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {log.name || 'Kontak WhatsApp'}
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-mono">
                      {log.recipient}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                    {log.campaign?.title || 'Broadcast Langsung'}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-xs">
                      {log.message}
                    </div>
                    {log.errorReason && (
                      <div className="text-[11px] text-red-500 mt-0.5">
                        Alasan Gagal: {log.errorReason}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(log.status)}
                  </td>

                  <td className="py-3.5 px-6 text-right text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(log.sentAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}{' '}
                    • {new Date(log.sentAt).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 bg-slate-50 dark:bg-[#06152B] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Total {totalCount} log pesan tercatat</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span>Halaman {page} dari {totalPages || 1}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
