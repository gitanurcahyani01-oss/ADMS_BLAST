import { Link } from "react-router-dom";

const platforms = [
  "OrderOnline.id", "Scalev.id", "Berdu.id", "WooCommerce", "KIRIM.EMAIL",
  "Sejoli.co.id", "LandingPress", "Elementor", "WPForms", "Contact Form 7",
  "Google Forms", "Themefood.id", "Gmail", "Google Spreadsheet", "Zapier",
];

export default function Demo() {
  return (
    <div className="bg-gradient-to-b from-white via-amber-50/15 to-white dark:from-[#07101E] dark:via-[#0A182E] dark:to-[#07101E] text-slate-800 dark:text-slate-100 py-10 transition-colors duration-300">
      <section className="mx-auto max-w-6xl px-4 text-center">
        <p className="font-mono text-xs uppercase tracking-widest font-bold text-[#D4AF37]">
          Live Demo Integrasi ADMS BLAST
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-[#0A2540] dark:text-white md:text-4xl">
          Cara Kirim Broadcast di ADMS BLAST
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-600 dark:text-slate-300 text-sm">
          Pilih platform yang ingin Anda coba — setelah itu Anda akan menerima notifikasi WhatsApp yang
          dikirim otomatis lewat ADMS BLAST secara instan dan anti banned.
        </p>
      </section>

      {/* Grid of Platforms (Compact) */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((p) => (
            <div
              key={p}
              className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E2238] px-5 py-3.5 shadow-xs transition-all hover:border-amber-400 hover:shadow-md"
            >
              <span className="font-display text-sm font-bold text-[#0A2540] dark:text-white">{p}</span>
              <a
                href="https://wa.me/6281121191933?text=Halo%20ADMS%20BLAST,%20saya%20mau%20mencoba%20demo%20"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-slate-800 px-3.5 py-1 text-xs font-bold text-[#0E2A47] dark:text-[#FFC727] transition hover:bg-[#0E2A47] hover:text-[#FFC727] dark:hover:bg-amber-400 dark:hover:text-slate-950"
              >
                Lihat Demo
              </a>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border-2 border-[#FFC727] bg-gradient-to-r from-amber-50 to-amber-100/60 dark:from-slate-800 dark:to-slate-900 px-5 py-3.5 shadow-xs">
            <span className="font-display text-sm font-bold text-[#0A2540] dark:text-white">REST API &amp; Webhook</span>
            <a
              href="https://wa.me/6281121191933?text=Halo%20ADMS%20BLAST,%20saya%20mau%20melihat%20dokumentasi%20API"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-[#0A2540] dark:bg-[#FFC727] px-3.5 py-1 text-xs font-bold text-[#FFC727] dark:text-slate-950 hover:bg-[#13385E]"
            >
              Lihat Docs
            </a>
          </div>
        </div>
      </section>

      {/* CTA Box (Compact) */}
      <section className="mx-auto max-w-5xl px-4 pb-10">
        <div className="rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#0E2A47] dark:from-[#06152B] dark:to-[#0A2540] p-7 sm:p-9 text-center text-white shadow-xl border border-amber-500/20">
          <h2 className="font-display text-2xl font-extrabold md:text-3xl">
            Tingkatkan Omzet Bisnis dengan WhatsApp — Kerja 24 Jam Nonstop.
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-300 text-xs sm:text-sm leading-relaxed">
            Otomatiskan bisnis Anda menggunakan sistem broadcast pesan paling powerful dan smart chatbot
            yang sudah kami sediakan. Tanpa batasan pengiriman pesan harian — full unlimited.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/harga"
              className="rounded-full bg-gradient-to-r from-[#FFC727] to-[#D4AF37] hover:from-[#F5B800] hover:to-[#B8860B] px-7 py-3 text-xs sm:text-sm font-extrabold text-slate-950 uppercase tracking-wider shadow-md transition duration-200 hover:scale-105"
            >
              Tingkatkan Konversi Penjualan Saya
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
