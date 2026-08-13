import React from 'react';
import { Link } from 'react-router-dom';
import {
  Gift,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Share2,
  Users,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Zap,
  Clock,
  Award
} from 'lucide-react';

const commissionTiers = [
  {
    plan: 'Paket Bulanan (1 Bulan)',
    price: 'Rp 99.000',
    discount: 'Diskon Rp 10.000',
    buyerPays: 'Rp 89.000',
    commission: 'Rp 20.000',
    badge: 'Langganan Cepat',
  },
  {
    plan: 'Paket 3 Bulan',
    price: 'Rp 299.000',
    discount: 'Diskon Rp 25.000',
    buyerPays: 'Rp 274.000',
    commission: 'Rp 50.000',
    badge: 'Paling Populer',
    highlight: true,
  },
  {
    plan: 'Paket 1 Tahun (VIP)',
    price: 'Rp 888.000',
    discount: 'Diskon Rp 50.000',
    buyerPays: 'Rp 838.000',
    commission: 'Rp 150.000',
    badge: 'Komisi Tertinggi',
    gold: true,
  },
];

const payouts = [
  { name: 'Naufal Auzan Ramadagi', amount: '56.620.000', bank: 'BCA' },
  { name: 'Candra Gunawan', amount: '38.250.000', bank: 'Mandiri' },
  { name: 'Maulana Bayu Pratama', amount: '27.200.000', bank: 'BRI' },
  { name: 'Prayitno Sukses Mandiri', amount: '23.850.000', bank: 'BCA' },
  { name: 'Imanuel Kemur', amount: '21.400.000', bank: 'DANA' },
];

const steps = [
  {
    n: '01',
    title: 'Dapatkan Kode Referral',
    desc: 'Setiap akun yang terdaftar otomatis mendapatkan kode & link referral unik di menu Dashboard Afiliasi.',
    icon: Gift,
  },
  {
    n: '02',
    title: 'Bagikan Link & Kupon',
    desc: 'Sebarkan link referral Anda ke grup WhatsApp, komunitas UMKM, Telegram, atau media sosial.',
    icon: Share2,
  },
  {
    n: '03',
    title: 'Teman Dapatkan Diskon',
    desc: 'Calon pembeli yang mendaftar lewat link Anda langsung mendapatkan diskon potongan harga spesial.',
    icon: Users,
  },
  {
    n: '04',
    title: 'Terima Komisi & Tarik Saldo',
    desc: 'Dapatkan komisi instan hingga Rp 150.000 per transaksi yang bisa ditarik kapan saja ke rekening bank/e-wallet Anda.',
    icon: DollarSign,
  },
];

export default function Afiliasi() {
  return (
    <div className="bg-gradient-to-b from-white via-amber-50/15 to-white dark:from-[#07101E] dark:via-[#0A182E] dark:to-[#07101E] text-slate-800 dark:text-slate-100 py-12 transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0E2A47] dark:bg-slate-800 text-[#FFC727] text-xs font-black uppercase tracking-wider mb-3 border border-amber-400/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Program Afiliasi &amp; Kemitraan ADMS BLAST</span>
        </div>

        <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0A2540] dark:text-white leading-tight">
          Hasilkan <span className="text-[#D4AF37]">Komisi Hingga Rp 150.000</span> Per Closing Transaksi!
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          Rekomendasikan software WhatsApp Marketing &amp; Automation resmi nomor #1 di Indonesia ke rekan bisnis dan komunitas Anda.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/harga"
            className="rounded-full bg-gradient-to-r from-[#FFC727] via-[#F5B800] to-[#D4AF37] hover:from-[#F5B800] hover:to-[#B8860B] px-8 py-3.5 text-xs sm:text-sm font-black text-slate-950 uppercase tracking-wider shadow-lg shadow-amber-500/25 transition duration-200 hover:scale-105 flex items-center gap-2"
          >
            <span>Daftar &amp; Dapatkan Link Referral</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/login"
            className="rounded-full border-2 border-[#0E2A47] dark:border-amber-400/60 bg-white dark:bg-slate-900 px-6 py-3 text-xs sm:text-sm font-bold text-[#0E2A47] dark:text-[#FFC727] hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Login ke Dashboard Afiliasi
          </Link>
        </div>
      </section>

      {/* 2. COMMISSION MATRIX TABLE */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 my-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37]">
            Skema Komisi Transparan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] dark:text-white mt-1">
            Berapa Komisi yang Anda Dapatkan?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {commissionTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-6 sm:p-7 transition-all flex flex-col justify-between relative shadow-xl ${
                tier.gold
                  ? 'bg-gradient-to-b from-[#0E2A47] to-[#0A2540] text-white border-2 border-amber-400 md:-translate-y-2'
                  : tier.highlight
                  ? 'bg-white dark:bg-[#0E2238] border-2 border-amber-500/50 text-slate-800 dark:text-slate-100'
                  : 'bg-white dark:bg-[#0E2238] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
              }`}
            >
              {tier.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm ${
                    tier.gold
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  }`}
                >
                  {tier.badge}
                </span>
              )}

              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${tier.gold ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {tier.plan}
                </p>

                <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Komisi Bersih Anda:
                  </span>
                  <span className="text-3xl font-black text-amber-500 dark:text-[#FFC727] block mt-1">
                    {tier.commission}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    per pelanggan aktif
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Harga Normal Paket:</span>
                    <span className="font-bold">{tier.price}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Diskon untuk Pembeli:</span>
                    <span>{tier.discount}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 font-bold">
                    <span>Total yang Dibayar Pembeli:</span>
                    <span className="text-amber-600 dark:text-amber-400">{tier.buyerPays}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Link
                  to="/harga"
                  className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    tier.gold
                      ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white'
                  }`}
                >
                  <span>Mulai Promosikan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 4 SIMPLE STEPS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37]">
            Cara Kerja
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] dark:text-white mt-1">
            4 Langkah Mudah Memulai Penghasilan Afiliasi
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0E2238] p-6 shadow-sm hover:border-amber-400 transition"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-black text-[#D4AF37]">{s.n}</span>
                <h3 className="mt-1 font-display text-base font-bold text-[#0A2540] dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. REALTIME PAYOUT PROOF LEADERBOARD */}
      <section className="mt-10 border-y border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0A182E] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37]">
              Bukti Pembayaran Komisi
            </span>
            <p className="text-xl sm:text-2xl font-black text-[#0A2540] dark:text-white mt-1">
              Komisi sejumlah <span className="text-[#D4AF37]">Rp 276.575.000</span> telah dicairkan kepada 1.200+ partner affiliate
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E2238] shadow-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] gap-4 bg-slate-100/80 dark:bg-slate-900 px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold text-[#0E2A47] dark:text-[#FFC727]">
              <span>Nama Partner Affiliate</span>
              <span>Total Komisi Dicairkan</span>
            </div>
            {payouts.map((p, idx) => (
              <div
                key={p.name}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 hover:bg-amber-50/30 dark:hover:bg-slate-800/60 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0E2A47] dark:bg-slate-700 font-mono text-xs font-bold text-[#FFC727]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      {p.name}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">Transfer via {p.bank}</span>
                  </div>
                </div>
                <span className="font-mono text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                  Rp {p.amount}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Penarikan dana diproses cepat via BCA, Mandiri, BRI, BNI, GoPay, dan DANA.
          </p>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-[#0A2540] via-[#0E2A47] to-[#0A2540] p-8 sm:p-12 text-white shadow-2xl border border-amber-400/30">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Siap Menikmati Penghasilan Pasif dari ADMS BLAST?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-slate-300 text-xs sm:text-sm leading-relaxed">
            Daftar sekarang, dapatkan kode referral eksklusif Anda, dan mulai hasilkan jutaan rupiah setiap bulan!
          </p>
          <div className="mt-6">
            <Link
              to="/harga"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FFC727] to-[#D4AF37] px-8 py-3.5 font-display text-xs sm:text-sm font-black text-slate-950 uppercase tracking-wider shadow-lg hover:scale-105 transition"
            >
              <span>Daftar &amp; Ambil Link Afiliasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
