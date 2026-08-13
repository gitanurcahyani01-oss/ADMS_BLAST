import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const plans = [
  {
    name: "Bulanan",
    code: "bulanan",
    badge: null,
    price: "99.000",
    per: "/ bulan",
    note: "Ditagih bulanan",
  },
  {
    name: "3 Bulan",
    code: "3bulan",
    badge: "Pilihan Populer",
    price: "99.000",
    per: "/ bulan",
    note: "Rp 299.000 per 3 bulan",
  },
  {
    name: "1 Tahun",
    code: "1tahun",
    badge: "Diskon 60% (Best Value)",
    price: "74.000",
    per: "/ bulan",
    note: "Rp 888.000 per 1 tahun",
    highlight: true,
  },
];

const crmFeatures = [
  "Shared team inbox & manajemen kontak pelanggan",
  "Pipeline CRM, assign chat ke customer service",
  "Label & filter percakapan otomatis",
  "SLA tracking & analitik performa closing tim",
];

const addOns = [
  { label: "Smart Auto Reply (Chatbot AI)", value: "Unlimited WA" },
  { label: "Link Rotator CS", value: "30 Website" },
  { label: "Live Chat Widget Website", value: "Termasuk" },
  { label: "Team Member Agent", value: "Unlimited CS" },
];

const integrations = [
  "OrderOnline.id", "Berdu.id", "TokoTalk", "Google Spreadsheet", "Gmail", "Zapier",
  "Google Form", "WPForms", "Contact Form 7", "WooCommerce", "LandingPress",
  "Elementor Form", "KIRIM.EMAIL", "Sejoli", "Themefood.id",
];

export default function Harga() {
  const [active, setActive] = useState(2);
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const checkoutUrl = `/checkout?plan=${plans[active].code}${refCode ? `&ref=${encodeURIComponent(refCode)}` : ''}`;

  const tierIncludes = [
    { label: "WABA Official Multi-Device API", value: "Termasuk (100% Anti Banned)" },
    {
      label: "Nomor WhatsApp Terhubung",
      value: active === 0 ? "1–5 Nomor WhatsApp" : active === 1 ? "5–10 Nomor WhatsApp" : "10–20 Nomor WhatsApp",
    },
    {
      label: "Database Kontak Leads",
      value: active === 0 ? "50.000 Kontak Leads" : active === 1 ? "100.000 Kontak Leads" : "200.000 Kontak Leads",
    },
    { label: "Slot REST API & Webhook", value: "Unlimited API Keys" },
    { label: "Kirim Pesan Broadcast Massal", value: "Unlimited / Tanpa Batas Harian" },
    { label: "Multi Device & Team Inbox CS", value: "Unlimited Agent CS" },
  ];

  return (
    <div className="bg-gradient-to-b from-white via-amber-50/20 to-white dark:from-[#07101E] dark:via-[#0A182E] dark:to-[#07101E] text-slate-800 dark:text-slate-100 py-10 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest font-bold text-[#D4AF37]">
            Investasi Terbaik Bisnis Anda
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-[#0A2540] dark:text-white md:text-4xl">
            Pilih Paket Sesuai Kebutuhan Bisnis Anda
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
            Otomatiskan broadcast, chatbot, dan follow-up WhatsApp dengan fitur terlengkap dari ADMS BLAST.
          </p>
        </div>

        {/* Plan Switcher */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E2238] p-1 shadow-xs">
            {plans.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setActive(i)}
                className={`relative rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all ${
                  active === i
                    ? "bg-[#0E2A47] dark:bg-[#FFC727] text-[#FFC727] dark:text-slate-950 shadow-sm scale-105"
                    : "text-slate-600 dark:text-slate-300 hover:text-[#0E2A47] dark:hover:text-white"
                }`}
              >
                Paket {p.name}
                {p.badge && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[8.5px] font-extrabold ${
                    active === i ? "bg-[#FFC727] text-slate-950" : "bg-amber-100 dark:bg-amber-950/60 text-[#B8860B] dark:text-amber-300"
                  }`}>
                    {p.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Price Card */}
        <div className="mx-auto mt-7 max-w-md rounded-2xl border-2 border-[#FFC727] bg-gradient-to-br from-[#0A2540] to-[#0E2A47] dark:from-[#06152B] dark:to-[#0A2540] p-7 text-center text-white shadow-xl">
          <span className="font-mono text-[11px] uppercase tracking-widest font-extrabold text-[#FFC727]">
            Rekomendasi Terbaik — Hemat Hingga 60%
          </span>
          <p className="mt-3 flex items-end justify-center gap-1">
            <span className="font-display text-xl font-bold">Rp</span>
            <span className="font-display text-4xl font-black tracking-tight">{plans[active].price}</span>
            <span className="pb-1 text-xs text-slate-300">{plans[active].per}</span>
          </p>
          <p className="mt-1 text-xs text-amber-300">{plans[active].note}</p>
          <Link
            to={checkoutUrl}
            className="mt-6 inline-block w-full rounded-full bg-gradient-to-r from-[#FFC727] to-[#D4AF37] hover:from-[#F5B800] hover:to-[#B8860B] px-6 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 uppercase tracking-wider shadow-md transition duration-200 hover:scale-105"
          >
            Daftar Sekarang &amp; Bayar QRIS →
          </Link>
        </div>

        {/* Features breakdown */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E2238] p-6 shadow-xs">
            <h3 className="font-display text-lg font-bold text-[#0A2540] dark:text-white">Termasuk di Setiap Paket</h3>
            <ul className="mt-4 space-y-3">
              {tierIncludes.map((t) => (
                <li key={t.label} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2 text-xs sm:text-sm">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{t.label}</span>
                  <span className="font-bold text-[#0A2540] dark:text-[#FFC727]">{t.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E2238] p-6 shadow-xs">
              <h3 className="font-display text-lg font-bold text-[#0A2540] dark:text-white">ADMS BLAST CRM &amp; Team Inbox</h3>
              <ul className="mt-3.5 space-y-2.5">
                {crmFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C853]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E2238] p-6 shadow-xs">
              <h3 className="font-display text-lg font-bold text-[#0A2540] dark:text-white">Add-on Otomasi &amp; Tool Tambahan</h3>
              <ul className="mt-3.5 space-y-2.5">
                {addOns.map((a) => (
                  <li key={a.label} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{a.label}</span>
                    <span className="font-bold text-[#0A2540] dark:text-[#FFC727]">{a.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="mt-10 rounded-2xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-[#0E2238] p-7 shadow-xs text-center">
          <h3 className="font-display text-lg font-bold text-[#0A2540] dark:text-white">Terhubung Otomatis dengan 15+ Aplikasi Bisnis</h3>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {integrations.map((i) => (
              <span key={i} className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1 font-mono text-[11px] font-bold text-[#0E2A47] dark:text-amber-300 hover:border-amber-400 transition">
                {i}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
