import { useState } from "react";
import { Link } from "react-router-dom";
import HeroPreview from "../components/HeroPreview";

const topReviews = [
  { quote: "“tool ini sungguh luar biasa”" },
  { quote: "“closing terus-menerus”" },
  { quote: "“sangat user-friendly”" },
];

const waStats = [
  { value: "3x", label: "Lipat Omzet Meningkat", desc: "Konversi penjualan naik drastis dengan follow-up tepat waktu" },
  { value: "60%", label: "Promosi Lebih Hemat", desc: "Biaya iklan efisien dibanding broadcast konvensional berbayar" },
  { value: "80%", label: "Efektif Kelola Chat CS", desc: "Satu nomor WhatsApp untuk multi CS tanpa bentrok percakapan" },
];

const wabaPoints = [
  "Nomor terdaftar secara resmi & personalisasi pesan dengan menyebutkan nama customer.",
  "Pesan lebih interaktif dan konversi meningkat dengan memunculkan Button CTA saat broadcast.",
  "Migrasi tanpa ribet, tetap bisa chatting realtime, dan follow up customer sampai closing. Transisi mulus tanpa gangguan.",
  "Satu nomor, bisa akses pakai App dan API secara bersamaan tanpa perlu beli nomor baru."
];

// 28 FITUR CANGGIH LENGKAP ADMS BLAST
const allAdvancedFeatures = [
  {
    title: "WABA Official",
    desc: "Broadcast ke banyak nomor WhatsApp dengan button CTA secara resmi, 100% anti banned dan stabil.",
    icon: "🟢",
    category: "Broadcast & Pesan",
    tag: "Resmi"
  },
  {
    title: "Send Unlimited Messages",
    desc: "Kirim pesan ke ribuan kontak WhatsApp hanya dengan sekali klik, tanpa harus simpan nomor terlebih dahulu.",
    icon: "📢",
    category: "Broadcast & Pesan",
    tag: "Unlimited"
  },
  {
    title: "Smart Auto Reply (Chatbot AI)",
    desc: "Buat asisten virtual chatbot cerdas Anda sendiri untuk menjawab setiap pertanyaan prospek secara otomatis 24/7.",
    icon: "🤖",
    category: "Otomasi & Chatbot",
    tag: "Otomatis"
  },
  {
    title: "Fully Customizable Message",
    desc: "Buat isi pesan Anda menjadi dinamis dengan memanggil nama customer, nomor invoice, dan emoji personal.",
    icon: "💌",
    category: "Broadcast & Pesan",
    tag: "Dinamis"
  },
  {
    title: "Attach Media on Broadcast",
    desc: "Buat isi pesan promosi lebih menarik dengan melampirkan gambar produk, video, PDF katalog, atau dokumen.",
    icon: "🖼️",
    category: "Broadcast & Pesan",
    tag: "Media"
  },
  {
    title: "Automation n8n & Webhooks",
    desc: "Buat alur kerja otomatis di WhatsApp yang fleksibel dan terhubung dengan berbagai aplikasi tanpa perlu coding.",
    icon: "🔄",
    category: "Integrasi & Analitik",
    tag: "No-Code"
  },
  {
    title: '"Bad Words" Filter - Anti Banned',
    desc: 'Fitur canggih yang dapat mendeteksi kata/kalimat yang "dilarang" pada pesan Anda sebelum terkirim.',
    icon: "🛡️",
    category: "Broadcast & Pesan",
    tag: "Anti-Spam"
  },
  {
    title: 'Smart "Perfect Timing" Broadcast',
    desc: "Sistem cerdas mengirimkan pesan Anda secara otomatis pada jam dan waktu optimal dengan open-rate tertinggi.",
    icon: "💡",
    category: "Otomasi & Chatbot",
    tag: "Smart AI"
  },
  {
    title: "Custom Broadcast Scheduling",
    desc: "Buat kampanye pagi, kirim malam. Tentukan sendiri tanggal dan jam pengiriman otomatis sesuai target Anda.",
    icon: "⏰",
    category: "Broadcast & Pesan",
    tag: "Terjadwal"
  },
  {
    title: "Auto Follow Up Berjenjang",
    desc: "Pengingat & follow-up calon pembeli otomatis 1-7 hari membuat closing rate meningkat hingga 3x lipat.",
    icon: "📱",
    category: "Otomasi & Chatbot",
    tag: "Closing Booster"
  },
  {
    title: "Smart Bot Action Trigger",
    desc: 'Bot cerdas dengan trigger aksi instan berdasarkan kata kunci seperti "mau beli", "info promo", atau "cek ongkir".',
    icon: "⚡",
    category: "Otomasi & Chatbot",
    tag: "Trigger"
  },
  {
    title: "Daily Leads & Database Manager",
    desc: "Kelola database customer di WhatsApp jadi rapi, terstruktur, dan siap ditindaklanjuti tim sales kapan saja.",
    icon: "📋",
    category: "Manajemen CS & Kontak",
    tag: "Database"
  },
  {
    title: "Custom Domain & Custom Logo",
    desc: "Miliki portal WA Blast dengan branding nama domain dan logo bisnis Anda sendiri secara eksklusif (White-label).",
    icon: "🖥️",
    category: "Integrasi & Analitik",
    tag: "Branding"
  },
  {
    title: "Sync Contacts from WhatsApp",
    desc: "Impor seluruh riwayat kontak yang Anda miliki di WhatsApp ke dalam sistem ADMS BLAST secara otomatis.",
    icon: "🔄",
    category: "Manajemen CS & Kontak",
    tag: "Sinkronisasi"
  },
  {
    title: "Group Contacts Grabber",
    desc: "Ekstrak semua nomor kontak dari grup-grup WhatsApp target market Anda secara cepat dan otomatis.",
    icon: "👥",
    category: "Manajemen CS & Kontak",
    tag: "Grabber"
  },
  {
    title: "Spintax Replacement (Word-by-word)",
    desc: "Variasikan sinonim kata pada setiap kalimat pesan agar unik dan bebas dari risiko pemblokiran algoritma spam.",
    icon: "🔀",
    category: "Broadcast & Pesan",
    tag: "Anti-Banned"
  },
  {
    title: "WhatsApp Live Chat Widget",
    desc: "Pasang widget Live Chat interaktif di website yang dapat memuat lebih dari satu akun WhatsApp CS dalam 1 tombol.",
    icon: "💬",
    category: "Manajemen CS & Kontak",
    tag: "Widget Web"
  },
  {
    title: "WhatsApp Link Rotator (CS Generator)",
    desc: "Cukup satu link URL untuk membagi leads secara merata ke seluruh tim CS tanpa perlu duplikasi iklan.",
    icon: "🔄",
    category: "Manajemen CS & Kontak",
    tag: "Rotator"
  },
  {
    title: "Multiple User WhatsApp Web",
    desc: "Satu nomor WhatsApp resmi yang bisa digunakan bersama oleh banyak agent CS tanpa saling bentrok percakapan.",
    icon: "💻",
    category: "Manajemen CS & Kontak",
    tag: "Team Inbox"
  },
  {
    title: "Broadcast Status & Analytics Monitor",
    desc: "Pantau status broadcast secara realtime mulai dari terkirim, pending, hingga gagal lengkap dengan grafis analitik.",
    icon: "📊",
    category: "Integrasi & Analitik",
    tag: "Laporan"
  },
  {
    title: "A/B Testing Tool for Broadcast",
    desc: "Cari tahu & pelajari jenis broadcast seperti apa yang menghasilkan konversi dan interaksi paling optimal.",
    icon: "🅰️",
    category: "Integrasi & Analitik",
    tag: "A/B Test"
  },
  {
    title: "Meta Conversion API Direct",
    desc: "Lacak aktivitas customer di WhatsApp secara realtime & sinkronkan lebih akurat dengan Facebook/Instagram Ads.",
    icon: "🔌",
    category: "Integrasi & Analitik",
    tag: "Tracking"
  },
  {
    title: "Google Tag Manager Tracking",
    desc: "Koneksikan event interaksi WhatsApp ke Google Tag Manager untuk tracking performa traffic digital marketing.",
    icon: "🔷",
    category: "Integrasi & Analitik",
    tag: "GTM"
  },
  {
    title: "Import & Export Contacts",
    desc: "Impor dan ekspor ratusan ribu nomor kontak dari format Excel (.xlsx) atau CSV hanya dengan sekali klik.",
    icon: "📁",
    category: "Manajemen CS & Kontak",
    tag: "Excel/CSV"
  },
  {
    title: "Random Broadcast Sender",
    desc: "Kirim broadcast merata menggunakan multi-nomor WhatsApp dalam satu waktu kampanye untuk menjaga kesehatan nomor.",
    icon: "🔀",
    category: "Broadcast & Pesan",
    tag: "Multi-Sender"
  },
  {
    title: "Worldwide Scale Coverage",
    desc: "Kirim pesan WhatsApp ke seluruh nomor di Indonesia maupun ke mancanegara tanpa batasan jarak regional.",
    icon: "🌐",
    category: "Broadcast & Pesan",
    tag: "Global"
  },
  {
    title: "Simple REST API Endpoints",
    desc: "Kirim pesan WhatsApp otomatis dari sistem web, e-commerce, atau POS kasir Anda via REST API andal.",
    icon: "💻",
    category: "Integrasi & Analitik",
    tag: "REST API"
  },
  {
    title: "Social Proof Live Notification",
    desc: "Tingkatkan kepercayaan calon pembeli dengan notifikasi bukti pembelian terbaru secara realtime di website.",
    icon: "🔔",
    category: "Integrasi & Analitik",
    tag: "Social Proof",
    ribbon: "NEW"
  }
];

const faqs = [
  {
    q: "Apakah ADMS BLAST aman dan anti banned?",
    a: "Ya, ADMS BLAST menggunakan integrasi resmi WhatsApp Business API yang mematuhi kebijakan Meta. Dilengkapi juga dengan algoritma Spintax (variasi kata dinamis) dan delay pengiriman pintar sehingga nomor WhatsApp Anda tetap aman dan terhindar dari pemblokiran."
  },
  {
    q: "Apakah saya perlu membeli nomor baru untuk menggunakan ADMS BLAST?",
    a: "Tidak perlu. Anda dapat menggunakan nomor WhatsApp yang sudah Anda miliki saat ini, atau menggunakan nomor baru khusus untuk operasional bisnis."
  },
  {
    q: "Berapa banyak CS yang bisa mengakses satu nomor WhatsApp?",
    a: "Satu nomor WhatsApp di ADMS BLAST dapat diakses oleh banyak agent/CS secara bersamaan tanpa batasan login (unlimited agent tergantung paket yang dipilih)."
  },
  {
    q: "Bagaimana cara menghubungkan ADMS BLAST dengan website saya?",
    a: "ADMS BLAST menyediakan REST API, Webhook, dan integrasi siap pakai untuk berbagai platform seperti OrderOnline, WooCommerce, LandingPress, Google Sheets, dan Zapier."
  },
  {
    q: "Apakah ada pelatihan atau panduan setelah mendaftar?",
    a: "Tentu! Kami menyediakan dokumentasi lengkap, video tutorial langkah demi langkah, serta dukungan tim Customer Support 24/7 via WhatsApp untuk membantu proses setup Anda."
  }
];

const categories = ["Semua Fitur", "Broadcast & Pesan", "Otomasi & Chatbot", "Manajemen CS & Kontak", "Integrasi & Analitik"];

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Semua Fitur");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFeatures = allAdvancedFeatures.filter((item) => {
    const matchesCat = activeCategory === "Semua Fitur" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-[#07101E] text-[#1E293B] dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      
      {/* 1. TOP SOCIAL PROOF BAR (COMPACT) */}
      <section className="py-2.5 bg-gradient-to-r from-amber-50/50 via-white to-sky-50/40 dark:from-[#0B1A2E] dark:via-[#07101E] dark:to-[#0B1A2E] border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
            {topReviews.map((rev, i) => (
              <div key={i} className="flex items-center justify-center gap-2">
                <div className="flex items-center text-[#F59E0B] text-xs">
                  {"★".repeat(5)}
                </div>
                <p className="font-display italic text-xs font-bold text-[#0E2A47] dark:text-amber-200 tracking-tight">
                  {rev.quote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. HERO SECTION */}
      <section className="relative pt-6 pb-10 lg:pt-10 lg:pb-12 bg-gradient-to-b from-white via-[#F8FAFC] to-white dark:from-[#07101E] dark:via-[#0A192F] dark:to-[#07101E]">
        <div className="absolute top-6 left-6 -z-10 w-72 h-72 bg-amber-200/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-6 -z-10 w-72 h-72 bg-sky-200/25 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            
            {/* HERO LEFT COLUMN */}
            <div className="lg:col-span-6 space-y-4 reveal">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/60 text-[#059669] dark:text-emerald-300 text-xs font-bold shadow-xs">
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#00C853] text-white shrink-0">
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.11 7.07C8.94 7.07 8.67 7.13 8.44 7.38C8.21 7.63 7.56 8.24 7.56 9.47C7.56 10.7 8.46 11.89 8.58 12.06C8.71 12.22 10.36 14.77 12.88 15.86C13.48 16.12 13.95 16.28 14.31 16.4C14.91 16.59 15.46 16.56 15.89 16.5C16.37 16.43 17.37 15.9 17.58 15.32C17.78 14.74 17.78 14.25 17.72 14.15C17.66 14.05 17.5 13.98 17.26 13.86C17.02 13.74 15.83 13.16 15.61 13.08C15.39 13 15.22 12.96 15.06 13.21C14.89 13.45 14.42 14.05 14.28 14.21C14.14 14.37 14 14.39 13.76 14.27C13.52 14.15 12.75 13.9 11.83 13.08C11.12 12.44 10.63 11.66 10.49 11.42C10.35 11.17 10.48 11.04 10.6 10.92C10.71 10.81 10.85 10.63 10.97 10.48C11.09 10.34 11.13 10.23 11.21 10.07C11.29 9.91 11.25 9.77 11.19 9.65C11.13 9.53 10.64 8.32 10.44 7.82C10.24 7.34 10.04 7.4 9.89 7.39C9.75 7.39 9.58 7.39 9.42 7.39C9.25 7.39 9.11 7.07 9.11 7.07Z"/>
                  </svg>
                </div>
                <span>100% Anti Banned &amp; WhatsApp Business API Resmi</span>
              </div>

              {/* Main Heading */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-[38px] font-extrabold text-[#0A2540] dark:text-white leading-[1.16] tracking-tight">
                Kirim Banyak Pesan WhatsApp<br className="hidden sm:inline" />
                Hanya dengan Sekali Klik
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Tingkatkan Penjualanmu{" "}
                <span className="relative inline-block px-2.5 py-0.5 mx-0.5 font-extrabold text-[#0A2540] dark:text-[#FFC727] border border-[#D4AF37] rounded-full shadow-xs bg-gradient-to-r from-amber-100/80 to-amber-50 dark:from-amber-950/60 dark:to-[#0A2540]">
                  Hingga 300%
                </span>{" "}
                dengan berinteraksi langsung dan otomatis bersama pelangganmu menggunakan WhatsApp resmi ADMS BLAST.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/harga"
                  className="rounded-xl bg-gradient-to-r from-[#FFC727] via-[#F5B800] to-[#D4AF37] hover:from-[#F5B800] hover:to-[#B8860B] px-6 py-3 font-display text-sm font-extrabold text-[#0A2540] shadow-md shadow-amber-500/20 flex items-center gap-2 transition duration-200 hover:scale-[1.02] active:scale-95"
                >
                  <span>Coba Sekarang</span>
                  <svg className="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <a
                  href="#crm-dashboard"
                  className="rounded-xl border-2 border-[#0E2A47] dark:border-amber-400/60 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-3 font-display text-sm font-bold text-[#0E2A47] dark:text-[#FFC727] flex items-center gap-2 transition duration-200 hover:scale-[1.02] active:scale-95 shadow-xs"
                >
                  <span>Lihat Demo</span>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M4 6.5A2.5 2.5 0 016.5 4h8A2.5 2.5 0 0117 6.5v2.793l3.146-3.147A1.5 1.5 0 0122.5 7.207v9.586a1.5 1.5 0 01-2.354 1.061L17 14.707v2.793a2.5 2.5 0 01-2.5 2.5h-8A2.5 2.5 0 014 17.5v-11z" />
                  </svg>
                </a>
              </div>

              {/* Supported Platforms */}
              <div className="pt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">Terhubung:</span>
                {["OrderOnline", "Google Sheets", "WooCommerce", "REST API", "Zapier"].map((i) => (
                  <span key={i} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[#0E2A47] dark:text-amber-300 font-mono text-[10px] font-bold">
                    {i}
                  </span>
                ))}
              </div>

            </div>

            {/* HERO RIGHT COLUMN */}
            <div className="lg:col-span-6 reveal reveal-delay-1">
              <HeroPreview />
            </div>

          </div>

        </div>
      </section>

      {/* 3. SECTION CRM & TEAM INBOX DASHBOARD */}
      <section id="crm-dashboard" className="py-12 lg:py-14 bg-gradient-to-b from-white via-amber-50/20 to-slate-50/70 dark:from-[#07101E] dark:via-[#0B1B30] dark:to-[#07101E] scroll-mt-14 border-t border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center reveal">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0E2A47] dark:bg-slate-800 text-[#FFC727] text-[11px] font-extrabold uppercase tracking-wider shadow-xs border border-amber-400/30">
            <span>⚡ CRM &amp; Team Inbox</span>
          </div>

          <h2 className="mt-2.5 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A2540] dark:text-white tracking-tight">
            Kelola Semua <span className="text-[#D4AF37] underline decoration-amber-300 decoration-wavy underline-offset-4">Chat Pelanggan</span> Di Satu Dashboard
          </h2>
          
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto">
            Gak perlu pindah aplikasi. Kelola chat, atur kontak, dan pantau performa tim customer service Anda secara realtime.
          </p>

          <div className="mt-6 max-w-4xl mx-auto relative group reveal">
            <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-amber-400/30 via-[#0E2A47]/30 to-amber-400/30 opacity-70 blur-lg group-hover:opacity-100 transition duration-300" />
            
            <div className="relative rounded-2xl bg-white dark:bg-[#0E2238] p-1.5 sm:p-2.5 shadow-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-t-xl border-b border-slate-200 dark:border-slate-800 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-0.5 rounded-full text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <span className="text-emerald-500 text-[9px]">🔒</span> https://app.admsblast.id/crm-inbox
                </div>
                <div className="text-[11px] font-bold text-[#0E2A47] dark:text-[#FFC727]">ADMS Live Web</div>
              </div>

              <div className="relative cursor-pointer" onClick={() => setShowDemoModal(true)}>
                <img
                  src="./adms_crm_dashboard.png"
                  alt="ADMS BLAST CRM & Team Inbox Dashboard"
                  className="w-full h-auto rounded-lg shadow-inner object-cover transition-transform duration-200 group-hover:scale-[1.003]"
                />

                <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950/85 backdrop-blur-xs text-white px-5 py-2.5 rounded-xl font-display font-bold text-xs shadow-xl border border-amber-400 flex items-center gap-2">
                    <span>✨ Klik untuk Buka Demo Interaktif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-bold text-[#0E2A47] dark:text-slate-200 reveal">
            <span className="flex items-center gap-1.5 bg-white dark:bg-[#0E2238] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-emerald-500">✔</span> Shared Team Inbox
            </span>
            <span className="flex items-center gap-1.5 bg-white dark:bg-[#0E2238] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-emerald-500">✔</span> Assign Chat ke Agent CS
            </span>
            <span className="flex items-center gap-1.5 bg-white dark:bg-[#0E2238] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-emerald-500">✔</span> Quick Reply &amp; Label Kontak
            </span>
            <span className="flex items-center gap-1.5 bg-white dark:bg-[#0E2238] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-emerald-500">✔</span> Integrasi WhatsApp Web Resmi
            </span>
          </div>

        </div>
      </section>

      {/* 4. WABA OFFICIAL PARTNER & 4-STEP FLOW SECTION */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#07101E] py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-center mb-8 reveal">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-full shadow-xs text-xs font-bold text-[#0E2A47] dark:text-slate-200">
              <span className="px-2.5 py-0.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">Connect</span>
              <span className="text-[#D4AF37] font-black text-xs">➔</span>
              <span className="px-2.5 py-0.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">Template</span>
              <span className="text-[#D4AF37] font-black text-xs">➔</span>
              <span className="px-2.5 py-0.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">Broadcast</span>
              <span className="text-[#D4AF37] font-black text-xs">➔</span>
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#FFC727] to-[#D4AF37] text-[#0A2540] rounded-full shadow-xs">Closing 🎯</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Phone Mockup */}
            <div className="lg:col-span-5 flex justify-center reveal">
              <div className="relative w-full max-w-xs sm:max-w-sm">
                
                <div className="rounded-3xl bg-slate-900 p-3 shadow-xl border-2 border-slate-800 relative">
                  <div className="bg-[#0E2A47] text-white p-2.5 rounded-xl flex items-center gap-2 border-b border-amber-500/30">
                    <div className="w-7 h-7 rounded-full bg-[#FFC727] text-[#0A2540] font-black text-xs flex items-center justify-center">
                      AD
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1">
                        <span>Busana Toko Anda</span>
                        <span className="text-[#00C853] text-[10px]">✔</span>
                      </div>
                      <span className="text-[8.5px] text-amber-300 font-mono">Official Business Account</span>
                    </div>
                  </div>

                  <div className="bg-[#EFEAE2] dark:bg-slate-800 p-2.5 rounded-xl mt-1.5 space-y-1.5 text-[10.5px] text-slate-800 dark:text-slate-100">
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg shadow-xs space-y-1 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-slate-900 dark:text-white text-[11px]">🎉 TAHUN BARU, GAYA BARU!</div>
                      <p className="text-[9.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Dapatkan koleksi hijab &amp; busana muslim diskon 50% khusus pembeli setia.
                      </p>
                      <div className="p-1 bg-amber-50 dark:bg-amber-950/60 rounded border border-amber-200 dark:border-amber-700 font-mono text-[8.5px] font-bold text-[#0E2A47] dark:text-amber-300">
                        KODE KUPON: GAYA2026
                      </div>
                      <div className="space-y-1 pt-1">
                        <button className="w-full py-1 bg-[#0E2A47] dark:bg-slate-800 text-[#FFC727] font-bold rounded text-[9.5px] shadow-xs flex items-center justify-center gap-1 border border-amber-500/30">
                          <span>🌐 Kunjungi Website</span>
                        </button>
                        <button className="w-full py-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-bold rounded text-[9.5px] border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-1">
                          <span>📋 Salin Kupon</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-slate-800 rounded-lg text-[9px] font-bold text-[#0E2A47] dark:text-slate-200 shadow-xs border border-slate-100 dark:border-slate-700">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[7.5px]">✔</span>
                      100% Anti Banned &amp; Resmi
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-slate-800 rounded-lg text-[9px] font-bold text-[#0E2A47] dark:text-slate-200 shadow-xs border border-slate-100 dark:border-slate-700">
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-100 text-[#B8860B] flex items-center justify-center text-[7.5px]">🚀</span>
                      Send Unlimited Broadcast
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-slate-800 rounded-lg text-[9px] font-bold text-[#0E2A47] dark:text-slate-200 shadow-xs border border-slate-100 dark:border-slate-700">
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[7.5px]">🔘</span>
                      Support Interactive Button CTA
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: WABA Copywriting */}
            <div className="lg:col-span-7 space-y-4 reveal reveal-delay-1">
              
              <div className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-widest text-[#D4AF37]">
                <svg className="w-3.5 h-3.5 fill-current text-[#2563EB]" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                </svg>
                <span>Official Partner — PT. Armada Digital Marketing Syariah</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2540] dark:text-white leading-tight">
                WhatsApp Business API Resmi,<br />
                <span className="text-[#D4AF37]">Stabil, Aman, 100% Anti Banned</span>
              </h2>

              <div className="space-y-2.5 pt-1">
                {wabaPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-xs">
                      ✔
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {point}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-black text-[#0A2540] dark:text-white">
                    <span className="text-[#D4AF37]">3x</span>
                  </p>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">Lipat Omzet Meningkat</p>
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-black text-[#0A2540] dark:text-white">
                    <span className="text-[#D4AF37]">60%</span>
                  </p>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">Promosi Lebih Hemat</p>
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-black text-[#0A2540] dark:text-white">
                    <span className="text-[#D4AF37]">80%</span>
                  </p>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">Efektif Kelola Chat CS</p>
                </div>
              </div>

              <div className="pt-1">
                <Link
                  to="/harga"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC727] via-[#F5B800] to-[#D4AF37] hover:from-[#F5B800] hover:to-[#B8860B] px-6 py-3 font-display text-sm font-extrabold text-[#0A2540] shadow-md shadow-amber-500/20 transition hover:scale-105"
                >
                  <span>Coba Sekarang</span>
                  <svg className="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 5. 28 FITUR CANGGIH MATRIX */}
      <section id="fitur" className="py-12 lg:py-14 bg-slate-50/70 dark:bg-[#0A182E] border-t border-slate-200/80 dark:border-slate-800 scroll-mt-14 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto reveal">
            <div className="inline-flex items-center justify-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse"></span>
              <span className="h-0.5 w-10 bg-gradient-to-r from-[#00C853] to-amber-400"></span>
            </div>
            
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A2540] dark:text-white tracking-tight">
              Apa Saja <span className="text-[#D4AF37]">Fitur Canggih</span> di ADMS BLAST?
            </h2>
            
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              <strong>ADMS BLAST</strong> adalah tool berbasis web untuk Anda sebagai pebisnis online yang dapat membantu penjualan di bisnis Anda jadi jauh lebih efektif &amp; efisien.
            </p>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-3 reveal">
            
            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? "bg-[#0E2A47] dark:bg-[#FFC727] text-[#FFC727] dark:text-slate-950 shadow-xs scale-105"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Live Search */}
            <div className="w-full md:w-56 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari fitur..."
                className="w-full px-3.5 py-1.5 pl-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 shadow-xs"
              />
              <span className="absolute left-2.5 top-2 text-[11px] text-slate-400">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

          </div>

          {/* 28 Features Cards Grid */}
          <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredFeatures.map((feat, idx) => (
              <div
                key={feat.title + idx}
                className="reveal group relative rounded-2xl bg-white dark:bg-[#0E2238] p-4.5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 transition-all duration-200 hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                {feat.ribbon && (
                  <span className="absolute top-2.5 right-2.5 rounded-full bg-red-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 shadow-xs">
                    {feat.ribbon}
                  </span>
                )}

                <div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-amber-50/50 dark:from-slate-800 dark:to-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xl mb-3 group-hover:scale-105 group-hover:border-amber-200 transition-transform duration-200 shadow-xs">
                    <span>{feat.icon}</span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-[#0A2540] dark:text-white group-hover:text-[#D4AF37] transition leading-tight">
                    {feat.title}
                  </h3>

                  <p className="mt-1.5 text-[11.5px] text-slate-600 dark:text-slate-300 leading-snug font-normal">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                    {feat.tag}
                  </span>
                  <span className="text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    Pelajari →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Callout */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-[#0A2540] to-[#0E2A47] dark:from-[#091C35] dark:to-[#0A2540] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-amber-400/20 reveal">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Siap mencoba semua 28+ fitur canggih ADMS BLAST?
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Akses instan tanpa instalasi ribet, langsung pakai dari browser laptop dan smartphone Anda.
              </p>
            </div>
            <Link
              to="/harga"
              className="shrink-0 rounded-full bg-gradient-to-r from-[#FFC727] to-[#D4AF37] hover:from-[#F5B800] hover:to-[#B8860B] px-6 py-2.5 font-display text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-xs hover:scale-105 transition"
            >
              Lihat Paket &amp; Mulai Sekarang
            </Link>
          </div>

        </div>
      </section>

      {/* 6. AUTO ENGAGE & WORKFLOW SECTION */}
      <section className="py-12 lg:py-14 bg-white dark:bg-[#07101E] transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4 reveal">
              <p className="font-mono text-xs uppercase tracking-widest font-bold text-[#D4AF37]">
                Solusi Cerdas — Auto Engage
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2540] dark:text-white">
                Follow-Up Otomatis Tanpa Repot, Closing Naik Berlipat Ganda.
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Biarkan robot cerdas ADMS BLAST yang bekerja merawat calon pelanggan Anda. Sistem akan mengirimkan pesan pengingat terjadwal, edukasi produk, hingga diskon terbatas secara otomatis.
              </p>

              <div className="space-y-2.5 pt-1">
                {[
                  { title: "Day 1: Salam Hangat & Konfirmasi Order", desc: "Kirim pesan ucapan terima kasih beserta link tagihan resmi." },
                  { title: "Day 3: Manfaat Produk & Testimoni Pembeli", desc: "Edukasi prospek yang belum checkout dengan bukti kepuasan pelanggan." },
                  { title: "Day 7: Kupon Promo Terakhir (Closing Booster)", desc: "Trigger keputusan beli dengan kupon diskon terbatas yang otomatis kedaluwarsa." },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0E2238] border border-slate-200 dark:border-slate-700">
                    <span className="w-7 h-7 rounded-full bg-[#0E2A47] dark:bg-slate-800 text-[#FFC727] font-bold flex items-center justify-center text-xs shrink-0 border border-amber-500/20">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-[#0A2540] dark:text-white">{step.title}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center reveal reveal-delay-1">
              <div className="relative group w-full max-w-md">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400 to-[#0E2A47] opacity-25 blur-md"></div>
                <img
                  src="./adms_workflow_mockup.png"
                  alt="ADMS Automation Workflow"
                  className="relative w-full h-auto object-contain rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. PRICING & PACKAGES TABLE */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0A182E] py-12 lg:py-14 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto reveal">
            <p className="font-mono text-xs uppercase tracking-widest font-bold text-[#D4AF37]">
              Investasi Terbaik Bisnis Anda
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#0A2540] dark:text-white">
              Pilih Paket Sesuai Kebutuhan Bisnis Anda
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
              Semua paket sudah termasuk WhatsApp Business API resmi, broadcast unlimited, dan dukungan tim CS 24/7.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3 items-center">
            
            {/* Paket Bulanan */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E2238] p-6 shadow-xs reveal">
              <h3 className="font-display text-lg font-bold text-[#0A2540] dark:text-white">Paket Bulanan</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Cocok untuk coba-coba fitur</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-400">Rp</span>
                <span className="font-display text-3xl font-extrabold text-[#0A2540] dark:text-white">99.000</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ bulan</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5"><span>✔</span> Broadcast Unlimited</li>
                <li className="flex items-center gap-1.5"><span>✔</span> 1–5 Nomor WhatsApp</li>
                <li className="flex items-center gap-1.5"><span>✔</span> AI Smart Bot Action</li>
                <li className="flex items-center gap-1.5"><span>✔</span> 3 Slot REST API</li>
              </ul>
              <Link
                to="/harga"
                className="mt-6 block w-full rounded-full border-2 border-[#0E2A47] dark:border-slate-600 py-2.5 text-center font-display text-xs font-bold text-[#0E2A47] dark:text-slate-200 hover:bg-[#0E2A47] dark:hover:bg-slate-700 hover:text-white transition"
              >
                Pilih Bulanan
              </Link>
            </div>

            {/* Paket 1 Tahun (BEST VALUE GOLD) */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#0E2A47] dark:from-[#06152B] dark:to-[#0A2540] p-6 text-white shadow-xl border-2 border-[#FFC727] md:-translate-y-2 reveal reveal-delay-1">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FFC727] to-[#D4AF37] px-3.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-950 shadow-xs">
                Paling Hemat - Hemat 60%
              </span>
              <h3 className="font-display text-xl font-extrabold text-[#FFC727]">Paket 1 Tahun</h3>
              <p className="mt-0.5 text-xs text-slate-300">Pilihan favorit pebisnis sukses</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-300">Rp</span>
                <span className="font-display text-4xl font-black text-white">74.000</span>
                <span className="text-xs text-slate-300">/ bulan</span>
              </div>
              <p className="text-[9.5px] text-amber-300 mt-0.5">Ditagih Rp 888.000 per tahun</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-1.5"><span className="text-[#FFC727]">✔</span> <strong>Semua Fitur VIP Unlimited</strong></li>
                <li className="flex items-center gap-1.5"><span className="text-[#FFC727]">✔</span> Up to 20 Nomor WhatsApp</li>
                <li className="flex items-center gap-1.5"><span className="text-[#FFC727]">✔</span> Database Kontak 200.000 Leads</li>
                <li className="flex items-center gap-1.5"><span className="text-[#FFC727]">✔</span> Prioritas Bantuan CS 24/7</li>
                <li className="flex items-center gap-1.5"><span className="text-[#FFC727]">✔</span> Gratis Konsultasi Setup</li>
              </ul>
              <Link
                to="/harga"
                className="mt-6 block w-full rounded-full bg-gradient-to-r from-[#FFC727] to-[#D4AF37] py-2.5 text-center font-display text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-md transition hover:scale-105"
              >
                Ambil Promo 1 Tahun Sekarang
              </Link>
            </div>

            {/* Paket 3 Bulan */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E2238] p-6 shadow-xs reveal reveal-delay-2">
              <span className="inline-block mb-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[9px] font-extrabold text-[#B8860B] dark:text-amber-300">
                Pilihan Populer
              </span>
              <h3 className="font-display text-lg font-bold text-[#0A2540] dark:text-white">Paket 3 Bulan</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Pilihan pas untuk scale-up</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-400">Rp</span>
                <span className="font-display text-3xl font-extrabold text-[#0A2540] dark:text-white">99.000</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ bulan</span>
              </div>
              <p className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-0.5">Ditagih Rp 299.000 per 3 bulan</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5"><span>✔</span> Broadcast Unlimited</li>
                <li className="flex items-center gap-1.5"><span>✔</span> 10 Nomor WhatsApp</li>
                <li className="flex items-center gap-1.5"><span>✔</span> Auto Follow Up 1-7 Hari</li>
                <li className="flex items-center gap-1.5"><span>✔</span> Multi User Team Inbox</li>
              </ul>
              <Link
                to="/harga"
                className="mt-6 block w-full rounded-full border-2 border-[#0E2A47] dark:border-slate-600 py-2.5 text-center font-display text-xs font-bold text-[#0E2A47] dark:text-slate-200 hover:bg-[#0E2A47] dark:hover:bg-slate-700 hover:text-white transition"
              >
                Pilih 3 Bulan
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION SECTION */}
      <section className="py-12 lg:py-14 bg-white dark:bg-[#07101E] transition-colors duration-300">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 reveal">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-widest font-bold text-[#D4AF37]">
              Pertanyaan Umum
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#0A2540] dark:text-white">
              Frequently Asked Questions (F.A.Q)
            </h2>
          </div>

          <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
            {faqs.map((f, idx) => (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-display text-sm sm:text-base font-bold text-[#0A2540] dark:text-slate-100 hover:text-[#D4AF37] dark:hover:text-[#FFC727] transition"
                >
                  <span>{f.q}</span>
                  <span className="text-lg text-[#D4AF37] font-extrabold ml-3">
                    {openFaq === idx ? "−" : "+"}
                  </span>
                </button>
                {openFaq === idx && (
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA BANNER */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-12 text-center reveal">
        <div className="rounded-3xl bg-gradient-to-r from-[#0A2540] via-[#0E2A47] to-[#13385E] dark:from-[#06152B] dark:via-[#091D38] dark:to-[#06152B] p-8 sm:p-10 text-white shadow-xl border border-amber-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <h2 className="mx-auto max-w-2xl font-display text-2xl sm:text-3xl font-extrabold text-white">
            Siap Tingkatkan Omzet Bisnis Anda dengan WhatsApp Otomatis?
          </h2>
          <p className="mx-auto mt-2.5 max-w-lg text-slate-300 text-sm leading-relaxed">
            Bergabunglah bersama ribuan pebisnis Indonesia yang telah meningkatkan konversi penjualan menggunakan sistem resmi ADMS BLAST.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/harga"
              className="rounded-full bg-gradient-to-r from-[#FFC727] to-[#D4AF37] hover:from-[#F5B800] hover:to-[#B8860B] px-7 py-3 font-display text-xs sm:text-sm font-extrabold text-slate-950 uppercase tracking-wider shadow-md transition duration-200 hover:scale-105"
            >
              Mulai Sekarang — Coba Gratis
            </Link>
            <a
              href="https://wa.me/6281121191933"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-slate-400 dark:border-slate-600 bg-white/10 hover:bg-white/20 px-6 py-3 font-display text-xs sm:text-sm font-bold text-white transition"
            >
              Chat Konsultasi CS
            </a>
          </div>
        </div>
      </section>

      {/* DEMO INTERACTIVE MODAL OVERLAY */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0E2238] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-[#D4AF37] relative text-center">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E2A47] to-[#0A2540] text-[#FFC727] flex items-center justify-center mx-auto text-2xl shadow-md border border-amber-400/40 mb-3">
              ✨
            </div>

            <h3 className="font-display text-xl font-extrabold text-[#0A2540] dark:text-white">
              Coba dan Rasakan Kekuatan ADMS.Blast
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Kelola chat WhatsApp bareng tim, balas cepat, jualan makin deres. Dapatkan akses live demo interaktif tanpa ribet pendaftaran.
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              <a
                href="https://wa.me/6281121191933?text=Halo%20ADMS%20BLAST,%20saya%20mau%20mencoba%20demo%20interaktif%20langsung"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#FFC727] to-[#D4AF37] text-slate-950 font-extrabold uppercase tracking-wider text-xs sm:text-sm shadow-sm hover:scale-[1.02] transition"
              >
                🚀 Buka Interactive Live Tour
              </a>
              <button
                onClick={() => setShowDemoModal(false)}
                className="w-full py-2 rounded-full text-slate-500 dark:text-slate-400 font-bold text-xs hover:text-slate-800 dark:hover:text-slate-200"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
