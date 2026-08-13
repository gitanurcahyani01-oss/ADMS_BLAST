import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  User,
  Mail,
  Phone,
  ArrowRight,
  Download,
  MessageCircle,
  ExternalLink,
  Receipt,
  Lock,
  Sparkles,
  RefreshCw,
  Send,
  CreditCard,
  AlertTriangle,
  X
} from 'lucide-react';
import { getDynamicQRDataUrl } from '../utils/qrisHelper';

export default function Invoice() {
  const { invoiceNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialOrderData = location.state?.orderData;

  const [orderData, setOrderData] = useState(initialOrderData || null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!initialOrderData);

  // Dynamic QRIS State
  const [dynamicQrUrl, setDynamicQrUrl] = useState(null);
  const [dynamicQrPayload, setDynamicQrPayload] = useState('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(true);

  // CS Confirmation Form State
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS GoPay / DANA');
  const [notes, setNotes] = useState('');

  // Lock State: User cannot leave until confirming to WhatsApp
  const storageKey = `adms_wa_confirmed_${invoiceNumber || 'default'}`;
  const [hasConfirmedWa, setHasConfirmedWa] = useState(
    localStorage.getItem(storageKey) === 'true'
  );
  const [showExitWarningModal, setShowExitWarningModal] = useState(false);

  const CS_PHONE = '081121191933';
  const CS_WHATSAPP = '6281121191933';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!initialOrderData && invoiceNumber) {
      fetch(`${API_BASE_URL}/orders/invoice/${invoiceNumber}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            setOrderData({
              invoiceNumber,
              amount: res.data.totalAmount || 99000,
              amountFormatted: res.data.totalAmount
                ? `Rp ${res.data.totalAmount.toLocaleString('id-ID')}`
                : 'Rp 99.000',
              plan: { name: res.data.planName || 'Paket Langganan ADMS BLAST' },
              customer: res.data.customer,
              createdAt: res.data.createdAt,
              isPaid: res.data.isPaid,
            });
            if (res.data.customer?.name) setSenderName(res.data.customer.name);
            if (res.data.customer?.phone) setSenderPhone(res.data.customer.phone);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (initialOrderData?.customer) {
      if (initialOrderData.customer.name) setSenderName(initialOrderData.customer.name);
      if (initialOrderData.customer.phone) setSenderPhone(initialOrderData.customer.phone);
    }
  }, [invoiceNumber, initialOrderData]);

  // Generate dynamic QRIS with locked amount
  useEffect(() => {
    const amount = orderData?.amount || 99000;
    setIsGeneratingQr(true);
    getDynamicQRDataUrl(amount).then(({ dataUrl, dynamicString }) => {
      setDynamicQrUrl(dataUrl);
      setDynamicQrPayload(dynamicString);
      setIsGeneratingQr(false);
    });
  }, [orderData?.amount]);

  // Prevent leaving browser tab if unconfirmed
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!hasConfirmedWa && !orderData?.isPaid) {
        e.preventDefault();
        e.returnValue = 'Anda belum mengirim bukti konfirmasi pembayaran ke CS WhatsApp. Lanjutkan?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasConfirmedWa, orderData?.isPaid]);

  const handleCopyAmount = () => {
    const textToCopy = orderData?.amount?.toString() || '99000';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendConfirmation = (e) => {
    if (e) e.preventDefault();

    // Mark as confirmed in local storage
    setHasConfirmedWa(true);
    localStorage.setItem(storageKey, 'true');
    setShowExitWarningModal(false);

    const text =
      `Halo CS ADMS BLAST (${CS_PHONE}),\n\n` +
      `Saya telah melakukan pembayaran untuk tagihan:\n` +
      `• *No. Invoice:* ${invoiceNumber || '-'}\n` +
      `• *Paket:* ${orderData?.plan?.name || 'Paket Langganan'}\n` +
      `• *Total Tagihan:* ${orderData?.amountFormatted || 'Rp 99.000'}\n` +
      `• *Metode Bayar:* ${paymentMethod}\n` +
      `• *Nama Pengirim / Akun:* ${senderName || orderData?.customer?.name || '-'}\n` +
      `• *No. WhatsApp Pembayar:* ${senderPhone || orderData?.customer?.phone || '-'}\n` +
      `• *Tenant Workspace:* ${orderData?.customer?.workspaceName || '-'}\n` +
      (notes.trim() ? `• *Catatan:* ${notes.trim()}\n` : '') +
      `\nBerikut saya lampirkan struk / bukti transfer pembayaran. Mohon akun saya segera diaktifkan ya. Terima kasih! 🙏`;

    const url = `https://wa.me/${CS_WHATSAPP}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleAttemptExit = (e) => {
    if (!hasConfirmedWa && !orderData?.isPaid) {
      e.preventDefault();
      setShowExitWarningModal(true);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#06152B] text-slate-100 py-12 px-4 sm:px-6 relative overflow-hidden selection:bg-amber-400 selection:text-slate-950">
      {/* Background Orbs */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Exit Warning Modal (Prevents Leaving without WA Confirmation) */}
      {showExitWarningModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0A2540] border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
              <Lock className="w-8 h-8" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase mb-2">
              Konfirmasi WhatsApp Diperlukan
            </span>

            <h3 className="text-xl font-black text-white mt-1">
              Harap Konfirmasi ke WhatsApp CS Terlebih Dahulu!
            </h3>

            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              Agar akun workspace Anda dapat <strong>langsung diverifikasi dan diaktifkan</strong> oleh Admin, Anda wajib mengirimkan bukti transfer/scan QRIS ke nomor WhatsApp CS resmi <strong>{CS_PHONE}</strong>.
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleSendConfirmation}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Bukti ke CS Sekarang ({CS_PHONE})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExitWarningModal(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition"
              >
                Kembali ke Halaman Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Brand Top Link */}
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={handleAttemptExit}
            className="inline-flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              A
            </div>
            <span className="font-black text-2xl tracking-tight text-white">
              ADMS <span className="text-amber-400">BLAST</span>
            </span>
          </button>
        </div>

        {/* Main Invoice Container */}
        <div className="bg-[#0A2540]/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                  Tagihan Resmi (Invoice)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {invoiceNumber || '#INV-ADMS-PENDING'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Dibuat pada:{' '}
                {orderData?.createdAt
                  ? new Date(orderData.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : new Date().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
              </p>
            </div>

            <div>
              {orderData?.isPaid ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  LUNAS / AKTIF
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  <Clock className="w-4 h-4 text-amber-400" />
                  MENUNGGU PEMBAYARAN &amp; KONFIRMASI WA
                </span>
              )}
            </div>
          </div>

          {/* Customer & Package Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 p-5 rounded-2xl bg-[#06152B]/60 border border-slate-800 text-xs">
            <div className="space-y-2">
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Data Pelanggan &amp; Bisnis:</p>
              <div className="flex items-center gap-2 text-white font-semibold">
                <User className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>{orderData?.customer?.name || 'Pelanggan ADMS'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{orderData?.customer?.email || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Tenant Workspace: <strong>{orderData?.customer?.workspaceName || 'Utama'}</strong></span>
              </div>
            </div>

            <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800 md:pl-6 pt-4 md:pt-0">
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Paket yang Dipesan:</p>
              <p className="text-base font-extrabold text-white">{orderData?.plan?.name || 'Paket Langganan 1 Bulan'}</p>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-slate-400">Total Nominal:</span>
                <span className="text-2xl font-black text-amber-400">{orderData?.amountFormatted || 'Rp 99.000'}</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC QRIS PAYMENT BOX */}
          <div className="my-8 bg-gradient-to-b from-[#0E2A47] to-[#0A2540] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider mb-4 border border-emerald-500/40">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>QRIS Dinamis: Nominal Terkunci Otomatis</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              Scan &amp; Bayar Langsung ({orderData?.amountFormatted || 'Rp 99.000'})
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-lg mx-auto leading-relaxed">
              Saat Anda scan kode QR di bawah, nominal <strong>{orderData?.amountFormatted || 'Rp 99.000'}</strong> akan <strong>langsung otomatis terisi dan terkunci</strong> di aplikasi perbankan/e-wallet Anda tanpa perlu diketik manual!
            </p>

            {/* Official EMVCo Dynamic QRIS Card Graphic */}
            <div className="mt-6 inline-block bg-white p-5 sm:p-6 rounded-3xl shadow-2xl border-4 border-amber-400 max-w-sm mx-auto text-slate-900 text-left">
              
              {/* Header QRIS Brand Banner */}
              <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-tight text-red-600">QRIS</span>
                    <span className="text-[10px] font-bold text-slate-500">PEMBAYARAN NASIONAL</span>
                  </div>
                  <p className="text-[11px] font-extrabold text-[#0A2540] mt-0.5 leading-none">
                    PT. ARMADA DIGITAL MARKETING SYARIAH
                  </p>
                  <p className="text-[9px] font-mono text-slate-500 mt-0.5">
                    NMID: ID1025438297117
                  </p>
                </div>

                <div className="px-2 py-1 rounded bg-amber-50 border border-amber-300 text-[9px] font-black text-amber-700">
                  DINAMIS
                </div>
              </div>

              {/* QR Image Canvas / Loader */}
              <div className="my-4 flex items-center justify-center min-h-[260px] bg-slate-50 rounded-2xl p-2 border border-slate-200/80">
                {isGeneratingQr || !dynamicQrUrl ? (
                  <div className="flex flex-col items-center gap-2 py-10">
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                    <span className="text-xs font-bold text-slate-500">Mengunci Nominal QRIS...</span>
                  </div>
                ) : (
                  <img
                    src={dynamicQrUrl}
                    alt={`QRIS Dinamis ${orderData?.amountFormatted || 'Rp 99.000'} - PT ARMADA DIGITAL MARKETING SYARIAH`}
                    className="w-full max-w-[260px] sm:max-w-[280px] h-auto object-contain rounded-xl shadow-xs"
                  />
                )}
              </div>

              {/* Locked Amount Badge inside QR Card */}
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-amber-800 block leading-none">Nominal Pas Terkunci:</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{orderData?.amountFormatted || 'Rp 99.000'}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-1 rounded-lg">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Auto-Fill</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-medium">BCA, Mandiri, BRI, GoPay, DANA</span>
                {dynamicQrUrl && (
                  <a
                    href={dynamicQrUrl}
                    download={`QRIS-DINAMIS-${invoiceNumber || 'ADMS'}.png`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition shadow-sm"
                  >
                    <Download className="w-3 h-3" />
                    <span>Unduh QR</span>
                  </a>
                )}
              </div>
            </div>

            {/* Amount Summary and Copy Bar */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="px-5 py-3 rounded-2xl bg-[#06152B] border border-slate-700 flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block text-left uppercase font-bold">Total Pembayaran</span>
                  <span className="text-xl font-black text-amber-400">{orderData?.amountFormatted || 'Rp 99.000'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAmount}
                  className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition flex items-center gap-1.5 text-xs font-bold"
                  title="Salin Nominal"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* Alternatif Transfer Manual */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-300 flex flex-wrap items-center justify-center gap-4">
              <span>💳 Bisa discan dengan:</span>
              <span className="font-semibold text-white bg-[#06152B] px-3 py-1 rounded-xl border border-slate-700">
                BCA Mobile • Livin' Mandiri • BRImo • GoPay • DANA • OVO • ShopeePay
              </span>
            </div>
          </div>

          {/* FORMULIR KONFIRMASI PEMBAYARAN KE CS */}
          <div className="my-8 bg-[#06152B]/90 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    Formulir Konfirmasi Pembayaran ke CS
                  </h4>
                  <p className="text-xs text-slate-400">
                    WhatsApp CS Resmi: <strong className="text-emerald-400">{CS_PHONE}</strong>
                  </p>
                </div>
              </div>

              {hasConfirmedWa && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Konfirmasi Terkirim
                </span>
              )}
            </div>

            <form onSubmit={handleSendConfirmation} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Nama Pemilik Rekening / Akun Pembayar
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Nama di akun m-Banking / E-Wallet"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0A2540] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    No. WhatsApp Pembayar
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0A2540] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Metode Pembayaran
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0A2540] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="QRIS GoPay">QRIS GoPay</option>
                      <option value="QRIS DANA">QRIS DANA</option>
                      <option value="QRIS BCA Mobile">QRIS BCA Mobile</option>
                      <option value="QRIS Livin Mandiri">QRIS Livin' Mandiri</option>
                      <option value="QRIS BRImo">QRIS BRImo</option>
                      <option value="QRIS ShopeePay">QRIS ShopeePay</option>
                      <option value="QRIS OVO">QRIS OVO</option>
                      <option value="Transfer Bank / Lainnya">Transfer Bank / Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Nominal Ditransfer
                  </label>
                  <input
                    type="text"
                    disabled
                    value={orderData?.amountFormatted || 'Rp 99.000'}
                    className="w-full px-4 py-2.5 bg-[#0A2540]/60 border border-slate-700 rounded-xl text-sm text-amber-400 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Sudah transfer dari rekening BCA a.n Budi"
                  className="w-full px-4 py-2.5 bg-[#0A2540] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02]"
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Kirim Konfirmasi ke CS WhatsApp ({CS_PHONE})</span>
                  <Send className="w-4 h-4 flex-shrink-0" />
                </button>
              </div>
            </form>
          </div>

          {/* 3 Langkah Mudah */}
          <div className="my-6 p-6 rounded-2xl bg-[#06152B]/80 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Langkah Pembayaran &amp; Aktivasi Instan:
            </h4>
            <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside">
              <li>
                Buka aplikasi e-wallet atau mobile banking Anda (BCA, Mandiri, BRI, GoPay, DANA, dll).
              </li>
              <li>
                Pilih menu <strong>Scan QRIS</strong> dan arahkan kamera ke kode QR di atas.
              </li>
              <li>
                Nominal <strong>{orderData?.amountFormatted || 'Rp 99.000'}</strong> akan <strong>langsung muncul otomatis</strong>. Klik <strong>Bayar</strong> dan masukkan PIN Anda.
              </li>
              <li>
                Isi form di atas dan klik tombol <strong>"Kirim Konfirmasi ke CS WhatsApp"</strong> agar Admin dapat langsung memverifikasi dan mengaktifkan akun Anda.
              </li>
            </ol>
          </div>

          {/* Actions Bottom Bar with Lock Guard */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {hasConfirmedWa ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs sm:text-sm font-bold transition"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Konfirmasi Terkirim → Lanjut ke Dashboard</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAttemptExit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700 text-xs font-semibold transition"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Masuk ke Dashboard (Wajib Konfirmasi WA)</span>
              </button>
            )}

            <button
              onClick={handleSendConfirmation}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi CS Langsung ({CS_PHONE})</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
