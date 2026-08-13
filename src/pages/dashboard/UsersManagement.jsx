import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserPlus,
  UserX,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Crown,
  Sparkles,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Shield,
  Building2,
  Lock,
  Edit,
  RefreshCw,
  Calendar,
  Clock,
  Zap,
  Gift,
  DollarSign
} from 'lucide-react';

export default function UsersManagement() {
  const { authFetch, user: currentUser, isSuperAdmin, isAdmin, activeWorkspace } = useAuth();
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [scope, setScope] = useState('GLOBAL');
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedWorkspaceFilter, setSelectedWorkspaceFilter] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [newSelectedRole, setNewSelectedRole] = useState('USER');
  const [selectedDurationDays, setSelectedDurationDays] = useState(30);
  const [customDays, setCustomDays] = useState('');

  // Add User Form State
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: isSuperAdmin ? 'ADMIN' : 'USER',
    phone: '',
    workspaceId: '',
  });

  const [notification, setNotification] = useState(null);

  // Tab & Payout Overview State
  const [activeTab, setActiveTab] = useState('users');
  const [payoutOverview, setPayoutOverview] = useState(null);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchPayoutOverview = async () => {
    setLoadingPayouts(true);
    try {
      const { data, ok } = await authFetch('/referrals/admin/overview');
      if (ok && data.success) {
        setPayoutOverview(data.data);
      }
    } catch (err) {
      console.error('Failed to load payout overview:', err);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handleProcessPayout = async (payoutId, action) => {
    const note = prompt(
      action === 'APPROVE'
        ? 'Masukkan catatan bukti transfer (opsional):'
        : 'Masukkan alasan penolakan penarikan dana:'
    );
    if (note === null) return;

    try {
      const { data, ok } = await authFetch(`/referrals/admin/payout/${payoutId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action, notes: note }),
      });

      if (ok && data.success) {
        showToast(data.message);
        fetchPayoutOverview();
      } else {
        showToast(data.message || 'Gagal memproses permohonan', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi server.', 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      let url = '/admin/users?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (roleFilter) url += `role=${roleFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (selectedWorkspaceFilter) url += `workspaceId=${selectedWorkspaceFilter}&`;

      const { data, ok } = await authFetch(url);
      if (ok && data.success) {
        setUsers(data.data.users);
        if (data.data.workspaces) {
          setWorkspaces(data.data.workspaces);
        }
        if (data.data.scope) {
          setScope(data.data.scope);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, selectedWorkspaceFilter]);

  // 1. Create New User/Admin
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newUserData.name,
        email: newUserData.email,
        password: newUserData.password,
        role: isSuperAdmin ? newUserData.role : 'USER',
        phone: newUserData.phone,
        workspaceId: isSuperAdmin ? newUserData.workspaceId || undefined : undefined,
      };

      const { data, ok } = await authFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (ok && data.success) {
        showToast(`Pengguna ${newUserData.name} (${payload.role}) berhasil ditambahkan.`);
        setShowAddModal(false);
        setNewUserData({
          name: '',
          email: '',
          password: '',
          role: isSuperAdmin ? 'ADMIN' : 'USER',
          phone: '',
          workspaceId: '',
        });
        fetchUsers();
      } else {
        showToast(data.message || 'Gagal menambahkan pengguna', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  // 2. Revoke User Access (Super Admin Only)
  const handleRevokeAdmin = async () => {
    if (!selectedUser) return;
    try {
      const { data, ok } = await authFetch(`/admin/users/${selectedUser.id}/revoke`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: revokeReason || 'Dicabut oleh Super Admin' }),
      });

      if (ok && data.success) {
        showToast(`Hak akses ${selectedUser.name} telah berhasil DICABUT (Revoked).`);
        setShowRevokeModal(false);
        setSelectedUser(null);
        setRevokeReason('');
        fetchUsers();
      } else {
        showToast(data.message || 'Gagal mencabut hak akses', 'error');
      }
    } catch (err) {
      showToast('Gagal memproses pencabutan hak akses.', 'error');
    }
  };

  // 3. Change Role (Super Admin Only)
  const handleChangeRole = async () => {
    if (!selectedUser) return;
    try {
      const { data, ok } = await authFetch(`/admin/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newSelectedRole }),
      });

      if (ok && data.success) {
        showToast(`Role ${selectedUser.name} berhasil diubah menjadi ${newSelectedRole}.`);
        setShowRoleModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        showToast(data.message || 'Gagal mengubah role', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  // 4. Open Activate/Extend Subscription Modal
  const handleOpenActivateModal = (targetUser) => {
    setSelectedUser(targetUser);
    setSelectedDurationDays(30);
    setCustomDays('');
    setShowActivateModal(true);
  };

  // 5. Submit Activate/Extend Subscription
  const handleConfirmActivate = async () => {
    if (!selectedUser) return;
    const days = selectedDurationDays === 'CUSTOM' ? parseInt(customDays) || 30 : selectedDurationDays;

    try {
      const { data, ok } = await authFetch(`/admin/users/${selectedUser.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'ACTIVE',
          durationDays: days,
          reason: `Aktivasi pembayaran langganan ${days} hari oleh ${currentUser.name}`,
        }),
      });

      if (ok && data.success) {
        showToast(`Akun ${selectedUser.name} berhasil diaktifkan dengan masa aktif ${days} hari.`);
        setShowActivateModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        showToast(data.message || 'Gagal mengaktifkan akun', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  // 6. Suspend User
  const handleSuspendUser = async (targetUser) => {
    if (!window.confirm(`Apakah Anda yakin ingin menangguhkan (Suspend) akun "${targetUser.name}"? Fitur broadcast dan chatbot pengguna ini akan dinonaktifkan sementara.`)) {
      return;
    }

    try {
      const { data, ok } = await authFetch(`/admin/users/${targetUser.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'SUSPENDED',
          reason: `Ditangguhkan oleh ${currentUser.name} (Masa aktif habis / Belum bayar)`,
        }),
      });

      if (ok && data.success) {
        showToast(`Akun ${targetUser.name} telah ditangguhkan.`);
        fetchUsers();
      } else {
        showToast(data.message || 'Gagal menangguhkan akun', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  // 7. Delete User Permanently
  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${targetUser.name}"?`)) {
      return;
    }
    try {
      const { data, ok } = await authFetch(`/admin/users/${targetUser.id}`, {
        method: 'DELETE',
      });

      if (ok && data.success) {
        showToast(`Pengguna ${targetUser.name} berhasil dihapus.`);
        fetchUsers();
      } else {
        showToast(data.message || 'Gagal menghapus pengguna', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  // Access check for regular user
  if (!isSuperAdmin && !isAdmin) {
    return (
      <div className="bg-white dark:bg-[#0A2540] border border-red-200 dark:border-red-900/50 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-300">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Akses Terbatas</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Halaman Manajemen Pengguna hanya dapat diakses oleh <strong>Super Admin</strong> dan <strong>Admin Operasional</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between shadow-lg transition-all animate-fadeIn ${
            notification.type === 'error'
              ? 'bg-red-950/90 border-red-800 text-red-200'
              : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Role Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isSuperAdmin ? 'Manajemen Pengguna & Tenant Global' : 'Manajemen Pengguna & Verifikasi Pembayaran'}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-black border ${
              isSuperAdmin
                ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
            }`}>
              {isSuperAdmin ? 'Super Admin Mode (Global & Role)' : 'Admin Mode (Verifikasi & Aktivasi)'}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isSuperAdmin
              ? 'Kelola semua akun pengguna, admin operasional, hak akses role, dan penempatan tenant di seluruh platform.'
              : 'Verifikasi dan aktifkan/tangguhkan status akun pengguna setelah pembayaran QRIS/DANA masuk.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isSuperAdmin ? 'Tambah Pengguna Global' : 'Tambah Pengguna Baru'}</span>
        </button>
      </div>

      {/* TABS (Super Admin Only) */}
      {isSuperAdmin && (
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'users'
                ? 'bg-[#0E2A47] dark:bg-amber-400 text-amber-300 dark:text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            👥 Pengguna &amp; Tenant Workspace ({users.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('payouts');
              fetchPayoutOverview();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'payouts'
                ? 'bg-[#0E2A47] dark:bg-amber-400 text-amber-300 dark:text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Permohonan Penarikan Komisi Afiliasi (Payouts)</span>
            {payoutOverview?.summary?.pendingPayouts > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black">
                {payoutOverview.summary.pendingPayouts}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Payouts Tab View */}
      {activeTab === 'payouts' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Komisi Diberikan</span>
              <p className="text-2xl font-black text-amber-500 mt-1">
                {payoutOverview?.summary?.totalRewards || 0} Transaksi
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Menunggu Transfer (Pending)</span>
              <p className="text-2xl font-black text-red-500 mt-1">
                {payoutOverview?.summary?.pendingPayouts || 0} Permohonan
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Pengajuan Penarikan</span>
              <p className="text-2xl font-black text-emerald-500 mt-1">
                {payoutOverview?.summary?.totalPayouts || 0} Riwayat
              </p>
            </div>
          </div>

          {/* Payouts Table */}
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <span>Daftar Permohonan Pencairan Saldo Afiliasi</span>
              </h3>
              <button
                onClick={fetchPayoutOverview}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                title="Segarkan"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingPayouts ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                <span className="text-xs font-bold">Memuat data penarikan...</span>
              </div>
            ) : payoutOverview?.payouts?.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Belum ada permohonan penarikan komisi yang diajukan user.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-[#06152B] border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                    <tr>
                      <th className="py-3.5 px-4">User Pemohon</th>
                      <th className="py-3.5 px-4">Nominal</th>
                      <th className="py-3.5 px-4">Rekening / E-Wallet Tujuan</th>
                      <th className="py-3.5 px-4">Waktu Pengajuan</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi Super Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payoutOverview?.payouts?.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{p.user?.name}</p>
                          <span className="text-[11px] text-slate-400">{p.user?.email} • {p.user?.phone || '-'}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                            Rp {p.amount.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{p.bankName}</p>
                          <p className="font-mono text-slate-500 dark:text-slate-400">{p.accountNumber}</p>
                          <span className="text-[10px] text-slate-400">a.n {p.accountHolder}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          {p.status === 'COMPLETED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              Selesai / Ditransfer
                            </span>
                          ) : p.status === 'REJECTED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                              Ditolak (Refund)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse">
                              Menunggu Transfer
                            </span>
                          )}
                          {p.notes && (
                            <p className="text-[10px] text-slate-400 italic mt-0.5 max-w-xs">{p.notes}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {p.status === 'PENDING' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleProcessPayout(p.id, 'APPROVE')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                              >
                                ✅ Setujui (Transfer)
                              </button>
                              <button
                                onClick={() => handleProcessPayout(p.id, 'REJECT')}
                                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition"
                              >
                                ❌ Tolak
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Filters & Search */}
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau email pengguna..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Workspace Filter (Super Admin & Admin) */}
          {workspaces.length > 0 && (
            <select
              value={selectedWorkspaceFilter}
              onChange={(e) => setSelectedWorkspaceFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">Semua Workspace ({workspaces.length})</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">Semua Role</option>
            {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
            <option value="ADMIN">Admin Operasional</option>
            <option value="USER">User (Staf / Klien)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif (Active)</option>
            <option value="SUSPENDED">Ditangguhkan</option>
            {isSuperAdmin && <option value="REVOKED">Dicabut (Revoked)</option>}
          </select>

          <button
            onClick={fetchUsers}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#06152B] border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Pengguna</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Tenant / Workspace</th>
                <th className="py-3.5 px-4">Masa Aktif Paket</th>
                <th className="py-3.5 px-4">Status Akun</th>
                <th className="py-3.5 px-4">Terdaftar</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Tidak ada data pengguna yang cocok</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isRevoked = u.status === 'REVOKED';
                  const isActive = u.status === 'ACTIVE';
                  const isTargetSuperAdmin = u.role === 'SUPER_ADMIN';

                  // Calculate Subscription Days Left
                  const userWs = u.workspaceMembers?.[0]?.workspace;
                  const sub = userWs?.subscription;
                  let daysLeft = null;
                  let expiryDateStr = null;

                  if (sub?.expiresAt) {
                    const expiry = new Date(sub.expiresAt);
                    const now = new Date();
                    daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                    expiryDateStr = expiry.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                  }

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        isRevoked ? 'bg-red-500/5' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        {u.role === 'SUPER_ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                            <Crown className="w-3 h-3 text-amber-500" />
                            Super Admin
                          </span>
                        ) : u.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
                            <Shield className="w-3 h-3 text-blue-500" />
                            Admin Operasional
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            User Staf
                          </span>
                        )}
                      </td>

                      {/* Workspace */}
                      <td className="py-4 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {u.workspaceMembers && u.workspaceMembers.length > 0 ? (
                          u.workspaceMembers.map((wm) => wm.workspace?.name).join(', ')
                        ) : (
                          <span className="text-slate-400 italic">Tanpa Workspace</span>
                        )}
                      </td>

                      {/* Masa Aktif Paket */}
                      <td className="py-4 px-4">
                        {isTargetSuperAdmin ? (
                          <span className="text-xs text-amber-500 font-bold">Akses Unlimited</span>
                        ) : daysLeft !== null ? (
                          daysLeft > 5 ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {daysLeft} Hari Lagi
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">Hingga {expiryDateStr}</div>
                            </div>
                          ) : daysLeft > 0 ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/30">
                                <Clock className="w-3 h-3 text-yellow-500" />
                                {daysLeft} Hari Lagi
                              </span>
                              <div className="text-[10px] text-yellow-500 font-semibold mt-0.5">Segera Berakhir</div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-300 dark:border-red-500/30">
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                              Kedaluwarsa
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum Ada Paket</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isActive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Aktif
                          </span>
                        )}
                        {isRevoked && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-300 dark:border-red-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Dicabut (Revoked)
                          </span>
                        )}
                        {u.status === 'SUSPENDED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                            Ditangguhkan
                          </span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {isSelf ? (
                          <span className="text-xs text-slate-400 italic">Akun Anda</span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            {/* Super Admin Change Role Button */}
                            {isSuperAdmin && (
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setNewSelectedRole(u.role);
                                  setShowRoleModal(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Ubah Role Pengguna"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Activate / Suspend Actions */}
                            {(!isTargetSuperAdmin || isSuperAdmin) && (
                              isActive ? (
                                <button
                                  onClick={() => handleSuspendUser(u)}
                                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 transition-all"
                                  title="Tangguhkan Akun (Nonaktifkan Broadcast)"
                                >
                                  Tangguhkan
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenActivateModal(u)}
                                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1"
                                  title="Aktifkan Akun & Atur Durasi Langganan"
                                >
                                  <Zap className="w-3 h-3 text-emerald-500" />
                                  <span>Aktifkan</span>
                                </button>
                              )
                            )}

                            {/* Super Admin Revoke Button */}
                            {isSuperAdmin && isActive && (
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowRevokeModal(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Cabut Akses Akun Permanen"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete permanently */}
                            {(!isTargetSuperAdmin || isSuperAdmin) && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* MODAL: Tambah Pengguna / Anggota Baru */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isSuperAdmin ? 'Tambah Pengguna Global' : 'Tambah Pengguna Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isSuperAdmin ? 'Buat akun dengan pilihan role global' : `Akan ditambahkan ke sistem`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Login
                </label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="user@admsblast.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Password Akun
                </label>
                <input
                  type="password"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Role Selection (Super Admin only - Admin is locked to USER) */}
              {isSuperAdmin ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Role Hierarki
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="USER">User (Staf Operasional / Klien)</option>
                    <option value="ADMIN">Admin Operasional</option>
                    <option value="SUPER_ADMIN">Super Admin (Owner Platform)</option>
                  </select>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-500 font-medium">Role yang dibuat: </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">User (Staf Operasional)</span>
                </div>
              )}

              {/* Workspace Assignment */}
              {workspaces.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Tetapkan ke Workspace (Tenant)
                  </label>
                  <select
                    value={newUserData.workspaceId}
                    onChange={(e) => setNewUserData({ ...newUserData, workspaceId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Pilih Workspace --</option>
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Aktivasi Pembayaran & Pilih Durasi Langganan */}
      {showActivateModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-800 flex-shrink-0">
                <Zap className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Aktivasi Akun & Pembayaran
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target: <strong>{selectedUser.name}</strong> ({selectedUser.email})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Pilih durasi paket langganan yang telah dibayar oleh pengguna via QRIS / DANA / Transfer Bank:
            </p>

            {/* Durations Grid */}
            <div className="space-y-2 mb-4">
              {[
                { days: 30, title: 'Paket 1 Bulan (+30 Hari)', desc: '1–5 Nomor WhatsApp Multi-Device' },
                { days: 90, title: 'Paket 3 Bulan (+90 Hari)', desc: '5–10 Nomor WhatsApp Multi-Device' },
                { days: 365, title: 'Paket 1 Tahun (+365 Hari)', desc: '10–20 Nomor WhatsApp Multi-Device' },
                { days: 'CUSTOM', title: 'Kustom Hari', desc: 'Tentukan jumlah hari secara manual' },
              ].map((p) => (
                <div
                  key={p.days}
                  onClick={() => setSelectedDurationDays(p.days)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedDurationDays === p.days
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#06152B]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{p.title}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{p.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedDurationDays === 'CUSTOM' && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Masukkan Jumlah Hari
                </label>
                <input
                  type="number"
                  min="1"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="Misal: 14 atau 60"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowActivateModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmActivate}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                Konfirmasi & Aktifkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Ubah Role Pengguna (Super Admin Only) */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Ubah Role Pengguna
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target: <strong>{selectedUser.name}</strong> ({selectedUser.email})
                </p>
              </div>
            </div>

            <div className="space-y-4 my-4">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pilih Role Baru:
              </label>
              <div className="space-y-2">
                {[
                  { id: 'SUPER_ADMIN', name: 'Super Admin', desc: 'Akses penuh ke seluruh sistem dan semua tenant' },
                  { id: 'ADMIN', name: 'Admin Operasional', desc: 'Kelola tim dan operasional workspace' },
                  { id: 'USER', name: 'User Staf', desc: 'Fokus operasional broadcast & kontak saja' },
                ].map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setNewSelectedRole(r.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      newSelectedRole === r.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#06152B]'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{r.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleChangeRole}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cabut Akses (Revoke) */}
      {showRevokeModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-red-200 dark:border-red-900/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800 flex-shrink-0">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Cabut Hak Akses Pengguna?
                </h3>
                <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                  Konfirmasi Tindakan Super Admin
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 mb-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Anda akan mencabut hak akses untuk <strong>{selectedUser.name}</strong> ({selectedUser.email}).
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Alasan Pencabutan (Audit Log)
              </label>
              <input
                type="text"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Misal: Rotasi tugas / Pelanggaran kebijakan"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRevokeModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleRevokeAdmin}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all"
              >
                Ya, Cabut Hak Akses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
