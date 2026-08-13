import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, FileText, AlertTriangle, CheckCircle, ArrowLeft, Lock, RefreshCw, Scale } from "lucide-react";

export default function SyaratKetentuan() {
  return (
    <div className="bg-gradient-to-b from-white via-amber-50/20 to-white dark:from-[#07101E] dark:via-[#0A182E] dark:to-[#07101E] text-slate-800 dark:text-slate-200 py-12 transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-xs text-slate-400 font-mono">
            Terakhir Diperbarui: 10 Agustus 2026
          </span>
        </div>

        {/* Header Title */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0A2540] via-[#0E2A47] to-[#0A2540] p-8 sm:p-10 text-white shadow-xl border border-amber-500/30 text-center relative overflow-hidden mb-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-[#FFC727] flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <Scale className="w-7 h-7" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest font-extrabold text-[#FFC727]">
            LEGAL &amp; COMPLIANCE
          </p>
          <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight">
            Syarat &amp; Ketentuan Layanan
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Harap baca syarat dan ketentuan ini dengan saksama sebelum menggunakan platform otomasi WhatsApp dan broadcast <strong>ADMS BLAST</strong> (PT. Armada Digital Marketing Syariah).
          </p>
        </div>

        {/* Content Document */}
        <div className="space-y-8 text-xs sm:text-sm leading-relaxed bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-black">1</span>
              <span>Ketentuan Umum &amp; Definisi Layanan</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Dengan mendaftar, mengakses, atau menggunakan layanan <strong>ADMS BLAST</strong>, Anda menyatakan bahwa Anda telah berusia minimal 18 tahun, cakap secara hukum, dan menyetujui seluruh ketentuan yang tercantum dalam dokumen ini.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              ADMS BLAST adalah penyedia platform perangkat lunak (SaaS) independen untuk otomasi pesan, WhatsApp gateway, chatbot auto-reply, dan manajemen kontak pelanggan untuk kebutuhan operasional bisnis yang sah.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-black">2</span>
              <span>Kebijakan Penggunaan Wajar &amp; Anti-Spam (WhatsApp &amp; Meta Policy)</span>
            </h2>
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>Larangan Keras Terhadap Konten Ilegal &amp; Spam Brutal:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-700 dark:text-slate-300">
                <li>Dilarang mengirim pesan yang memuat penipuan, judi online, pornografi, pinjaman ilegal, obat terlarang, atau ujaran kebencian.</li>
                <li>Dilarang membombardir nomor penerima secara acak tanpa izin/persetujuan (*opt-in consent*).</li>
                <li>Pengguna bertanggung jawab penuh 100% atas seluruh isi materi pesan yang dikirimkan.</li>
              </ul>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              ADMS BLAST menyediakan teknologi <strong>Spintax cerdas</strong>, <strong>jeda pengiriman acak (random delay)</strong>, dan filter validasi nomor untuk melindungi reputasi nomor Anda. Namun, risiko penangguhan (*banned/block*) oleh pihak Meta Platforms Inc. yang diakibatkan oleh laporan penerima (*user report/spam*) merupakan risiko operasional pengguna di luar tanggung jawab penyedia SaaS.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-black">3</span>
              <span>Paket Langganan, Pembayaran &amp; Kebijakan Pengembalian Dana (Refund)</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
              <li><strong>Paket Layanan</strong>: Terdiri atas Paket Bulanan (Rp 99.000), Paket 3 Bulan (Rp 299.000), dan Paket 1 Tahun (Rp 888.000).</li>
              <li><strong>Masa Aktif</strong>: Dihitung secara presisi sejak akun pengguna diverifikasi dan diaktifkan oleh Super Admin platform.</li>
              <li><strong>Kebijakan Refund</strong>: Biaya langganan yang telah dibayarkan bersifat final. Pengembalian dana (*refund*) hanya dapat diproses apabila sistem mengalami kegagalan fungsi total yang tidak dapat diperbaiki dalam waktu 3x24 jam kerja sejak laporan diterima CS.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-black">4</span>
              <span>Program Afiliasi, Komisi &amp; Ketentuan Penarikan Dana (Payout)</span>
            </h2>
            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <p>Setiap pengguna yang terdaftar berhak mengikuti program kemitraan afiliasi dengan ketentuan:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-1">
                <li>Komisi diberikan untuk setiap transaksi baru yang sah dari pengguna yang mendaftar melalui link/kode referral Anda.</li>
                <li><strong>Minimal Penarikan Dana (Payout)</strong> adalah sebesar <strong>Rp 50.000</strong>.</li>
                <li>Pencairan saldo ditransfer ke rekening bank nasional (BCA, Mandiri, BRI, BNI, BSI) atau e-wallet (GoPay, DANA, OVO, ShopeePay) dalam waktu 1x24 jam kerja setelah permohonan disetujui.</li>
                <li>Tindakan manipulasi, pembuatan akun fiktif sendiri untuk mendapatkan komisi (*self-referral fraud*), dapat mengakibatkan pembekuan saldo komisi secara permanen.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-black">5</span>
              <span>Kerahasiaan Database Kontak &amp; Privasi Data</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Kami menjamin bahwa seluruh database nomor telepon, kontak pelanggan, dan log percakapan yang diunggah ke workspace Anda adalah milik eksklusif Anda. ADMS BLAST tidak akan pernah menjual, menyewakan, atau membagikan database kontak Anda kepada pihak ketiga manapun.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-black">6</span>
              <span>Hubungi Kami</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Jika Anda memiliki pertanyaan mengenai Syarat &amp; Ketentuan Layanan ini, silakan hubungi tim legal dan bantuan kami:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 text-xs space-y-1 font-mono">
              <p><strong>PT. Armada Digital Marketing Syariah</strong></p>
              <p>Alamat: Cinunuk Kec, Cileunyi, Bandung, Jawa Barat 40626</p>
              <p>Email: Info@armadadigitalmarketing.top / halo@admsblast.id</p>
              <p>WhatsApp CS: 0811-2119-1933</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
