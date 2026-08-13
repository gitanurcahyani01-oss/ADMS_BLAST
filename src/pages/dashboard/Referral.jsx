import React, { useState, useEffect } from 'react';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Send,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Referral() {
  const { user, authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    bankName: 'BCA',
    accountNumber: '',
    accountHolder: user?.name || '',
  });
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState({ type: '', text: '' });

  const fetchReferralStats = async () => {
    try {
      const { data: resData, ok } = await authFetch('/referrals/me');
      if (ok && resData.success && resData.data) {
        setData(resData.data);
      }
    } catch (err) {
      console.error('Error fetching referral stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const handleCopyCode = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleCopyLink = () => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsApp = () => {
    if (!data?.referralLink) return;
    const text =
      `Halo rekan bisnis! 🚀\n\n` +
      `Gunakan tool WhatsApp Marketing & Broadcast resmi ADMS BLAST untuk meningkatkan omzet tokomu hingga 300%.\n\n` +
      `Dapatkan DISKON KHUSUS dengan daftar melalui link referral saya:\n` +
      `👉 ${data.referralLink}\n\n` +
      `Gunakan kode referral: *${data.referralCode}* saat checkout!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    setPayoutMessage({ type: '', text: '' });
    setIsSubmittingPayout(true);

    try {
      const { data: resData, ok } = await authFetch('/referrals/payout', {
        method: 'POST',
        body: JSON.stringify(payoutForm),
      });
      setIsSubmittingPayout(false);

      if (ok && resData.success) {
        setPayoutMessage({
          type: 'success',
          text: resData.message || 'Permohonan penarikan berhasil diajukan!',
        });
        setPayoutForm({
          amount: '',
          bankName: 'BCA',
          accountNumber: '',
          accountHolder: user?.name || '',
        });
        fetchReferralStats();
        setTimeout(() => setShowPayoutModal(false), 2000);
      } else {
        setPayoutMessage({
          type: 'error',
          text: resData?.message || 'Gagal mengajukan penarikan.',
        });
      }
    } catch (err) {
      setIsSubmittingPayout(false);
      setPayoutMessage({
        type: 'error',
        text: 'Terjadi kesalahan koneksi server.',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="ml-3 text-sm font-bold text-slate-400">Memuat data afiliasi...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-black uppercase mb-1.5 border border-amber-500/30">
            <Gift className="w-3.5 h-3.5" />
            <span>Kemitraan &amp; Afiliasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Program Afiliasi &amp; Komisi Referral
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Bagikan link referral Anda dan dapatkan komisi instan hingga <strong>Rp 150.000 per transaksi</strong> yang berhasil!
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowPayoutModal(true)}
            disabled={!data?.walletBalance || data?.walletBalance < 50000}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <DollarSign className="w-4 h-4" />
            <span>Tarik Saldo Komisi ({data?.walletBalanceFormatted || 'Rp 0'})</span>
          </button>
        </div>
      </div>

      {/* 1. HERO REFERRAL LINK & CODE CARD */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0A2540] via-[#0E2A47] to-[#0A2540] p-6 sm:p-8 text-white shadow-2xl border border-amber-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          
          {/* Left Column: Code & Link */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                Kode Referral Eksklusif Anda
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-5 py-2.5 rounded-2xl bg-slate-900/90 border-2 border-amber-400 font-mono text-2xl sm:text-3xl font-black text-[#FFC727] tracking-wider shadow-inner">
                {data?.referralCode || 'ADMSVIP'}
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>

            {/* Referral URL Bar */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Link Referral Anda (Otomatis Potong Diskon):
              </label>
              <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
                <input
                  type="text"
                  readOnly
                  value={data?.referralLink || ''}
                  className="flex-1 px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono select-all focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-slate-700"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share WA</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Balance Pill */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Saldo Komisi Siap Ditarik:
            </span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 block my-1">
              {data?.walletBalanceFormatted || 'Rp 0'}
            </span>
            <p className="text-[11px] text-slate-400">Minimal penarikan Rp 50.000</p>
            <button
              type="button"
              onClick={() => setShowPayoutModal(true)}
              disabled={!data?.walletBalance || data?.walletBalance < 50000}
              className="mt-3 w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs transition"
            >
              Ajukan Penarikan Dana
            </button>
          </div>

        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E2238] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Diajak</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {data?.stats?.totalInvited || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Calon klien mendaftar</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E2238] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Closing Berhasil</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {data?.stats?.successfulReferrals || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Akun aktif dan lunas</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E2238] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Komisi Didapat</span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500 mt-2">
            {data?.stats?.totalEarnedFormatted || 'Rp 0'}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Akumulasi seluruh komisi</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E2238] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Saldo Dompet</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {data?.walletBalanceFormatted || 'Rp 0'}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Siap ditransfer ke rekening</span>
        </div>
      </div>

      {/* 3. REFERRAL SCHEME QUICK GUIDE */}
      <div className="p-5 rounded-3xl bg-amber-50/50 dark:bg-[#0A2540]/60 border border-amber-300 dark:border-amber-500/30">
        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Tabel Keuntungan Komisi Anda &amp; Diskon Calon Pembeli:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-[#0E2238] rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-900 dark:text-white block">Paket Bulanan (Rp 99.000)</span>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-1">Pembeli Diskon: -Rp 10.000</p>
            <p className="text-amber-500 font-black mt-0.5">Komisi Anda: +Rp 20.000</p>
          </div>
          <div className="p-3 bg-white dark:bg-[#0E2238] rounded-xl border border-amber-300 dark:border-amber-500/50">
            <span className="font-bold text-slate-900 dark:text-white block">Paket 3 Bulan (Rp 299.000)</span>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-1">Pembeli Diskon: -Rp 25.000</p>
            <p className="text-amber-500 font-black mt-0.5">Komisi Anda: +Rp 50.000</p>
          </div>
          <div className="p-3 bg-white dark:bg-[#0E2238] rounded-xl border border-amber-400 dark:border-amber-400">
            <span className="font-bold text-slate-900 dark:text-white block">Paket 1 Tahun (Rp 888.000)</span>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-1">Pembeli Diskon: -Rp 50.000</p>
            <p className="text-amber-500 font-black mt-0.5">Komisi Anda: +Rp 150.000</p>
          </div>
        </div>
      </div>

      {/* 4. TABLES: REWARD HISTORY & PAYOUT HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Referral Rewards Log */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#0E2238] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Riwayat Pengguna yang Menggunakan Kodemu</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
              {data?.rewards?.length || 0} Data
            </span>
          </h3>

          {data?.rewards?.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Belum ada yang mendaftar lewat kode referral Anda.</p>
              <p className="text-[11px] mt-1 text-amber-500">Mulai bagikan link referral Anda sekarang!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="pb-3">User &amp; Tanggal</th>
                    <th className="pb-3">Paket</th>
                    <th className="pb-3">Komisi</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data?.rewards?.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3">
                        <p className="font-bold text-slate-900 dark:text-white">{r.referredUser?.name}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{r.planName}</span>
                      </td>
                      <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">
                        +Rp {r.commissionAmount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3">
                        {r.status === 'APPROVED' || r.status === 'PAID' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Disetujui
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse">
                            Menunggu Bayar
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Payout Requests History */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#0E2238] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Riwayat Penarikan Dana (Payout)</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
              {data?.payouts?.length || 0} Data
            </span>
          </h3>

          {data?.payouts?.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Belum ada riwayat penarikan dana.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.payouts?.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-black text-slate-900 dark:text-white">
                      Rp {p.amount.toLocaleString('id-ID')}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {p.bankName} • {p.accountNumber} ({p.accountHolder})
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div>
                    {p.status === 'COMPLETED' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Selesai / Ditransfer
                      </span>
                    ) : p.status === 'REJECTED' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                        Ditolak (Saldo Dikembalikan)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse">
                        Diproses Admin
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 5. PAYOUT MODAL */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Formulir Penarikan Saldo Komisi
                </h3>
              </div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300 block">
                Saldo Tersedia: {data?.walletBalanceFormatted || 'Rp 0'}
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Minimal penarikan adalah Rp 50.000. Transfer akan diproses oleh Admin dalam 1x24 jam.
              </p>
            </div>

            {payoutMessage.text && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-bold ${
                  payoutMessage.type === 'success'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {payoutMessage.text}
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nominal Penarikan (Rp)
                </label>
                <input
                  type="number"
                  required
                  min={50000}
                  max={data?.walletBalance || 50000}
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  placeholder="Contoh: 150000"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Bank / E-Wallet Tujuan
                </label>
                <select
                  value={payoutForm.bankName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="BCA">Bank BCA</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BRI">Bank BRI</option>
                  <option value="BNI">Bank BNI</option>
                  <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                  <option value="GoPay">GoPay</option>
                  <option value="DANA">DANA</option>
                  <option value="OVO">OVO</option>
                  <option value="ShopeePay">ShopeePay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nomor Rekening / No. HP E-Wallet
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.accountNumber}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                  placeholder="Contoh: 1234567890 / 081234567890"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nama Pemilik Rekening (Sesuai Buku Tabungan)
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.accountHolder}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountHolder: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  {isSubmittingPayout ? 'Memproses...' : 'Kirim Permohonan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
