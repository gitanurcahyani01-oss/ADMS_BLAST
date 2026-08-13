import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Lock,
  CreditCard,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Save,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Zap,
  Smartphone
} from 'lucide-react';

export default function Settings() {
  const { authFetch, user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'subscription'
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    workspaceName: '',
  });

  // Security Form
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Subscription Info
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [workspaceStats, setWorkspaceStats] = useState(null);

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchProfile = async () => {
    try {
      const { data, ok } = await authFetch('/profile/me');
      if (ok && data.success) {
        setProfileData({
          name: data.data.user.name || '',
          email: data.data.user.email || '',
          phone: data.data.user.phone || '',
          workspaceName: data.data.workspace.name || '',
        });
        setSubscriptionInfo(data.data.subscription);
        setWorkspaceStats(data.data.workspace);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data, ok } = await authFetch('/profile/update-info', {
        method: 'PATCH',
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          workspaceName: profileData.workspaceName,
        }),
      });

      if (ok && data.success) {
        showToast('Data profil dan bisnis berhasil diperbarui!');
        fetchProfile();
      } else {
        showToast(data.message || 'Gagal memperbarui profil', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      showToast('Konfirmasi password baru tidak cocok.', 'error');
      return;
    }

    if (securityData.newPassword.length < 6) {
      showToast('Password baru minimal 6 karakter.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const { data, ok } = await authFetch('/profile/change-password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword,
        }),
      });

      if (ok && data.success) {
        showToast('Password berhasil diubah!');
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(data.message || 'Gagal mengubah password', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Memuat data pengaturan akun...</p>
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
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pengaturan Akun &amp; Bisnis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola profil personal, ganti kata sandi, dan pantau status masa aktif langganan Anda.
          </p>
        </div>
      </div>

      {/* Settings Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'profile'
              ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/40 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Data Akun &amp; Bisnis</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'security'
              ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/40 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Keamanan &amp; Sandi</span>
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'subscription'
              ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/40 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Status Langganan</span>
          {subscriptionInfo?.daysLeft > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black">
              {subscriptionInfo.daysLeft} Hari
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Profile & Business Data */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Informasi Pribadi &amp; Profil Toko
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Data ini digunakan untuk identitas login dan branding pesan WhatsApp bisnis Anda.
          </p>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Akun (Login)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={profileData.email}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  No. WhatsApp Aktif
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Nama Bisnis / Toko (Nama Tenant Workspace)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={profileData.workspaceName}
                  onChange={(e) => setProfileData({ ...profileData, workspaceName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition hover:scale-105 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Ganti Kata Sandi (Password)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Gunakan kombinasi password yang kuat demi menjaga keamanan data broadcast dan nomor WhatsApp Anda.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Password Saat Ini (Lama)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  placeholder="Masukkan password lama"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Password Baru
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Ulangi Password Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    placeholder="Konfirmasi password baru"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition hover:scale-105 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Ubah Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Subscription & Validity Status */}
      {activeTab === 'subscription' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-white dark:bg-[#0A2540] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-500">
                  Paket Langganan Saat Ini
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {subscriptionInfo?.planName || 'Paket Langganan'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Workspace: <strong>{workspaceStats?.name || 'Utama'}</strong>
                </p>
              </div>

              <div>
                {subscriptionInfo?.isExpired ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/40">
                    <Clock className="w-4 h-4" />
                    KEDALUWARSA / BELUM AKTIF
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="w-4 h-4" />
                    AKTIF ({subscriptionInfo?.daysLeft} Hari Tersisa)
                  </span>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Masa Aktif Hingga</span>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {subscriptionInfo?.expiresAt
                    ? new Date(subscriptionInfo.expiresAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Perangkat WhatsApp</span>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {workspaceStats?.deviceCount || 0} Terhubung
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Kontak Audiens</span>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {workspaceStats?.contactCount || 0} Kontak
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ingin menambah kuota nomor WhatsApp atau memperpanjang masa aktif paket?
              </p>

              <Link
                to="/harga"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition hover:scale-105"
              >
                <span>Perpanjang / Upgrade Paket</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
