import { Link } from "react-router-dom";

const testimonials = [
  {
    name: "Ahmad Rizky",
    role: "Founder Hijab Official",
    rating: 5,
    text: "Sejak pakai ADMS BLAST, konversi follow up keranjang belanja naik sampai 350%. Fitur Spintax-nya beneran bikin nomor WhatsApp aman dan gak pernah kena banned.",
    avatar: "AR",
    industry: "Fashion Muslim",
  },
  {
    name: "Siti Rahmawati",
    role: "Head of Marketing Skincare",
    rating: 5,
    text: "Fitur Multi-CS dan Shared Team Inbox sangat membantu 12 CS kami melayani ribuan pesan tiap hari tanpa bentrok atau berebut chat customer. Sangat direkomendasikan!",
    avatar: "SR",
    industry: "Kecantikan & Skincare",
  },
  {
    name: "Hendro Wibowo",
    role: "Owner Toko Elektronik",
    rating: 5,
    text: "Integrasi ke OrderOnline dan Google Sheet sangat mulus! Resi terkirim otomatis, pelanggan puas, repeat order meningkat pesat.",
    avatar: "HW",
    industry: "Retail & Elektronik",
  },
  {
    name: "Dian Permata",
    role: "Agency Lead",
    rating: 5,
    text: "Sistem rotasi link CS dan broadcast terjadwalnya sangat menghemat budget iklan Meta Ads kami. Omzet klien kami naik berkali-kali lipat.",
    avatar: "DP",
    industry: "Digital Agency",
  },
  {
    name: "Fajar Maulana",
    role: "Course Creator",
    rating: 5,
    text: "Dukungan API dan Webhook-nya sangat lengkap. Kirim notifikasi invoice ke ribuan peserta webinar cuma butuh hitungan detik.",
    avatar: "FM",
    industry: "Edukasi Online",
  },
  {
    name: "Budi Santoso",
    role: "Distributor Herbal",
    rating: 5,
    text: "Fitur Auto Follow Up 1-7 hari bener-bener gila hasilnya. Prospek yang tadinya cuek jadi transfer setelah dikirimin kupon promo otomatis.",
    avatar: "BS",
    industry: "Kesehatan Herbal",
  },
];

export default function Testimoni() {
  return (
    <div className="bg-gradient-to-b from-white via-amber-50/15 to-white dark:from-[#07101E] dark:via-[#0A182E] dark:to-[#07101E] text-slate-800 dark:text-slate-100 py-10 transition-colors duration-300">
      <section className="mx-auto max-w-6xl px-4 text-center">
        <p className="font-mono text-xs uppercase tracking-widest font-bold text-[#D4AF37]">
          Kisah Sukses Pengguna ADMS BLAST
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-[#0A2540] dark:text-white md:text-4xl">
          Dipercaya oleh 10.000+ Pebisnis Indonesia
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-600 dark:text-slate-300 text-sm">
          Lihat bagaimana ADMS BLAST membantu bisnis dari berbagai industri meningkatkan penjualan dan
          efisiensi operasional dengan WhatsApp Marketing otomatis.
        </p>
      </section>

      {/* Testimonials Grid (Compact) */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E2238] p-6 shadow-xs transition-all duration-200 hover:border-amber-400 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#F59E0B] text-xs">
                    {"★".repeat(t.rating)}
                  </div>
                  <span className="rounded-full bg-amber-50 dark:bg-slate-800 px-2 py-0.5 font-mono text-[9px] font-bold text-[#B8860B] dark:text-[#FFC727]">
                    {t.industry}
                  </span>
                </div>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2.5 border-t border-slate-100 dark:border-slate-700/60 pt-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E2A47] dark:bg-amber-400 font-display text-xs font-bold text-[#FFC727] dark:text-slate-950 shadow-xs">
                  {t.avatar}
                </div>
                <div>
                  <h3 className="font-display text-xs sm:text-sm font-bold text-[#0A2540] dark:text-white">{t.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box (Compact) */}
      <section className="mx-auto max-w-5xl px-4 pb-10">
        <div className="rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#0E2A47] dark:from-[#06152B] dark:to-[#0A2540] p-7 sm:p-9 text-center text-white shadow-xl border border-amber-500/20">
          <h2 className="font-display text-2xl font-extrabold md:text-3xl">
            Siap Menggandakan Omzet Bisnis Anda?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-300 text-xs sm:text-sm leading-relaxed">
            Bergabunglah dengan ribuan pebisnis yang sudah merasakan kemudahan dan lonjakan omzet bersama ADMS BLAST.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/harga"
              className="rounded-full bg-gradient-to-r from-[#FFC727] to-[#D4AF37] hover:from-[#F5B800] hover:to-[#B8860B] px-7 py-3 text-xs sm:text-sm font-extrabold text-slate-950 uppercase tracking-wider shadow-md transition duration-200 hover:scale-105"
            >
              Mulai Sekarang — Coba Gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
