import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
  CreditCard,
  Tag,
  Check,
  X,
  Gift
} from 'lucide-react';

const PLANS = {
  bulanan: {
    code: 'bulanan',
    name: 'Paket 1 Bulan',
    price: 99000,
    priceFormatted: 'Rp 99.000',
    duration: '/ bulan',
    badge: null,
    features: [
      '1–5 Nomor WhatsApp Multi-Device',
      'Database Kontak 50.000 Leads',
      'Unlimited Pesan Broadcast',
      'Smart Auto-Reply Chatbot 24/7',
      'Shared Team Inbox & Multi CS',
    ],
  },
  '3bulan': {
    code: '3bulan',
    name: 'Paket 3 Bulan',
    price: 299000,
    priceFormatted: 'Rp 299.000',
    duration: '/ 3 bulan',
    badge: 'Pilihan Populer',
    features: [
      '5–10 Nomor WhatsApp Multi-Device',
      'Database Kontak 100.000 Leads',
      'Unlimited Pesan Broadcast',
      'Smart Auto-Reply Chatbot 24/7',
      'Shared Team Inbox & Multi CS',
      'Prioritas Antrean Blast',
    ],
  },
  '1tahun': {
    code: '1tahun',
    name: 'Paket 1 Tahun',
    price: 888000,
    priceFormatted: 'Rp 888.000',
    duration: '/ 1 tahun',
    badge: 'Diskon 60% (Best Value)',
    highlight: true,
    features: [
      '10–20 Nomor WhatsApp Multi-Device',
      'Database Kontak 200.000 Leads',
      'Unlimited Pesan Broadcast',
      'Smart Auto-Reply Chatbot 24/7',
      'Shared Team Inbox & Multi CS',
      'Prioritas Customer Care & Setup',
      'Gratis Konsultasi Strategi Blast',
    ],
  },
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const planParam = searchParams.get('plan')?.toLowerCase();
  const refParam = searchParams.get('ref')?.trim().toUpperCase() || '';

  const [selectedPlan, setSelectedPlan] = useState(
    PLANS[planParam] ? planParam : '1tahun'
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    workspaceName: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Referral Code States
  const [referralInput, setReferralInput] = useState(refParam);
  const [appliedReferral, setAppliedReferral] = useState(null);
  const [isCheckingRef, setIsCheckingRef] = useState(false);
  const [refFeedback, setRefFeedback] = useState({ type: '', text: '' });

  const currentPlan = PLANS[selectedPlan] || PLANS['1tahun'];
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Validate referral code function
  const checkReferral = async (codeToVerify, plan) => {
    if (!codeToVerify) return;
    setIsCheckingRef(true);
    setRefFeedback({ type: '', text: '' });

    try {
      const res = await fetch(
        `${API_BASE_URL}/referrals/validate/${codeToVerify}?planCode=${plan}`
      );
      const result = await res.json();
      setIsCheckingRef(false);

      if (result.success && result.valid && result.data) {
        setAppliedReferral(result.data);
        setRefFeedback({
          type: 'success',
          text: `Kode referral dari ${result.data.referrerName} berhasil diterapkan! Anda hemat ${result.data.discountFormatted}.`,
        });
      } else {
        setAppliedReferral(null);
        setRefFeedback({
          type: 'error',
          text: result.message || 'Kode referral tidak valid atau tidak aktif.',
        });
      }
    } catch (err) {
      setIsCheckingRef(false);
      setRefFeedback({
        type: 'error',
        text: 'Gagal memverifikasi kode referral.',
      });
    }
  };

  // Auto-verify referral if provided in query param
  useEffect(() => {
    if (refParam) {
      checkReferral(refParam, selectedPlan);
    }
  }, [refParam]);

  // Re-calculate referral discount if user switches plan
  useEffect(() => {
    if (appliedReferral?.referralCode) {
      checkReferral(appliedReferral.referralCode, selectedPlan);
    }
  }, [selectedPlan]);

  const handleApplyReferral = (e) => {
    e.preventDefault();
    if (!referralInput.trim()) {
      setRefFeedback({ type: 'error', text: 'Masukkan kode referral Anda.' });
      return;
    }
    checkReferral(referralInput.trim().toUpperCase(), selectedPlan);
  };

  const handleRemoveReferral = () => {
    setAppliedReferral(null);
    setReferralInput('');
    setRefFeedback({ type: '', text: '' });
  };

  const calculateFinalPrice = () => {
    if (!appliedReferral) return currentPlan.price;
    return appliedReferral.finalPrice || currentPlan.price - appliedReferral.buyerDiscount;
  };

  const finalAmount = calculateFinalPrice();
  const finalAmountFormatted = `Rp ${finalAmount.toLocaleString('id-ID')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          planCode: selectedPlan,
          referralCode: appliedReferral?.referralCode || referralInput || null,
        }),
      });

      const result = await response.json();
      setIsLoading(false);

      if (result.success && result.data) {
        // Navigate to Invoice page
        navigate(`/invoice/${result.data.invoiceNumber}`, {
          state: { orderData: result.data },
        });
      } else {
        setErrorMessage(result.message || 'Gagal memproses pesanan.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Terjadi kesalahan koneksi ke server. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#06152B] text-slate-100 py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              A
            </div>
            <span className="font-black text-2xl tracking-tight">
              ADMS <span className="text-amber-400">BLAST</span>
            </span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Checkout &amp; Aktivasi Akun
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Satu langkah lagi untuk mengotomatiskan broadcast, chatbot, dan follow-up pelanggan WhatsApp bisnis Anda.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-8 max-w-2xl mx-auto p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-200 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Registration Form */}
          <div className="lg:col-span-7 bg-[#0A2540]/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">Data Akun &amp; Workspace Bisnis</h2>
                <p className="text-xs text-slate-400">Isi data akun baru untuk mengelola broadcast WhatsApp</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Pemilik Akun
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#06152B] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Aktif
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="budi@tokoonline.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-[#06152B] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-[#06152B] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Bisnis / Brand / Workspace
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Toko Busana Muslim Budi"
                    value={formData.workspaceName}
                    onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#06152B] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password Akun
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#06152B] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Plan Switcher Pills inside form */}
              <div className="pt-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Pilihan Paket Langganan:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {Object.values(PLANS).map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setSelectedPlan(p.code)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedPlan === p.code
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                          : 'bg-[#06152B] border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <p className="font-bold text-xs">{p.name}</p>
                      <p className="text-sm font-black text-white mt-1">{p.priceFormatted}</p>
                      {p.badge && (
                        <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                          {p.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Lanjut ke Pembayaran QRIS ({finalAmountFormatted})</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-1">
                Dengan melanjutkan, Anda menyetujui{' '}
                <Link to="/syarat-ketentuan" target="_blank" className="text-amber-400 hover:underline font-bold">
                  Syarat &amp; Ketentuan
                </Link>{' '}
                serta{' '}
                <Link to="/kebijakan-privasi" target="_blank" className="text-amber-400 hover:underline font-bold">
                  Kebijakan Privasi
                </Link>{' '}
                ADMS BLAST.
              </p>
            </form>
          </div>

          {/* RIGHT: Order Summary Card & Referral Box */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Order Summary */}
            <div className="bg-[#0A2540]/80 backdrop-blur-xl border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                    Ringkasan Pesanan
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">{currentPlan.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400">{currentPlan.priceFormatted}</div>
                  <div className="text-[10px] text-slate-400">{currentPlan.duration}</div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Termasuk Fitur Unggulan:
                </p>
                <ul className="space-y-2.5">
                  {currentPlan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* REFERRAL CODE INPUT BOX */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Punya Kode Referral / Kupon Diskon?</span>
                </label>

                {appliedReferral ? (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Kode Aktif: {appliedReferral.referralCode}</span>
                      </div>
                      <p className="text-[11px] text-emerald-400/90 mt-0.5">
                        {appliedReferral.discountFormatted} potongan harga khusus
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveReferral}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition"
                      title="Hapus Kode"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Contoh: ANGGITA8023"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3.5 py-2.5 bg-[#06152B] border border-slate-700 rounded-xl text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyReferral}
                      disabled={isCheckingRef}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50"
                    >
                      {isCheckingRef ? 'Cek...' : 'Terapkan'}
                    </button>
                  </div>
                )}

                {refFeedback.text && (
                  <p
                    className={`text-[11px] mt-2 ${
                      refFeedback.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {refFeedback.text}
                  </p>
                )}
              </div>

              {/* Total Calculation Breakdown */}
              <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Harga Normal Paket:</span>
                  <span>{currentPlan.priceFormatted}</span>
                </div>

                {appliedReferral && (
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                    <span>Diskon Kode Referral:</span>
                    <span>{appliedReferral.discountFormatted}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between font-bold text-sm">
                  <span className="text-slate-200">Total Pembayaran:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400">{finalAmountFormatted}</span>
                    {appliedReferral && (
                      <span className="block text-[10px] text-emerald-400 font-bold">
                        Hemat {appliedReferral.discountFormatted}
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Trust Badges */}
            <div className="bg-[#0A2540]/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 text-xs text-slate-300">
              <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Garansi 100% Data Terisolasi &amp; Aman</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Multi-tenant workspace terenkripsi dan bebas biaya tambahan tersembunyi.
                </p>
              </div>
            </div>

            {/* Affiliate teaser */}
            <div className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-xs">
              <Gift className="w-7 h-7 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Program Afiliasi ADMS BLAST</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Setelah aktif, bagikan kode referral Anda dan dapatkan komisi hingga <strong>Rp 150.000 / transaksi</strong>!
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
