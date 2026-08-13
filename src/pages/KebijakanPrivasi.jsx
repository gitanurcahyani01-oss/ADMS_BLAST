import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, Eye, Server, ArrowLeft, Database, Key } from "lucide-react";

export default function KebijakanPrivasi() {
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
            <ShieldCheck className="w-7 h-7" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest font-extrabold text-[#FFC727]">
            PRIVACY &amp; SECURITY
          </p>
          <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight">
            Kebijakan Privasi
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Komitmen kami untuk melindungi data pribadi, privasi kontak pelanggan, dan keamanan sesi WhatsApp Anda di <strong>ADMS BLAST</strong>.
          </p>
        </div>

        {/* Content Document */}
        <div className="space-y-8 text-xs sm:text-sm leading-relaxed bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Database className="w-5 h-5 text-amber-500" />
              <span>1. Informasi yang Kami Kumpulkan</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Ketika Anda menggunakan layanan ADMS BLAST, kami mengumpulkan jenis informasi berikut untuk keperluan penyediaan layanan:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-600 dark:text-slate-300">
              <li><strong>Informasi Akun</strong>: Nama, alamat email, nomor WhatsApp bisnis, dan kata sandi yang dienkripsi secara aman dengan algoritma bcrypt.</li>
              <li><strong>Database Kontak Workspace</strong>: Nomor telepon, nama pelanggan, dan label segmentasi yang Anda unggah ke dalam workspace bisnis Anda.</li>
              <li><strong>Log Pengiriman &amp; Riwayat Audit</strong>: Waktu pengiriman pesan, status terkirim/gagal, dan riwayat aktivitas autentikasi untuk pemantauan keamanan.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Lock className="w-5 h-5 text-amber-500" />
              <span>2. Keamanan &amp; Penyimpanan Sesi WhatsApp</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Sesi koneksi WhatsApp (kunci autentikasi Baileys) disimpan dalam direktori penyimpanan server yang terenkripsi dan terisolasi secara multi-tenant (*tenant-isolated*). 
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              ADMS BLAST menerapkan enkripsi end-to-end standar protokol WhatsApp. Kami tidak membaca, merekam, atau memantau pesan pribadi di luar kata kunci yang Anda atur secara eksplisit pada modul <strong>Chatbot Auto-Reply</strong>.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Eye className="w-5 h-5 text-amber-500" />
              <span>3. Jaminan Perlindungan Data (Zero Selling Policy)</span>
            </h2>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200 text-xs leading-relaxed">
              <strong>Prinsip Kerahasiaan Utama:</strong> Kami berkomitmen 100% untuk TIDAK PERNAH menjual, menyewakan, memperdagangkan, atau membagikan nomor kontak pelanggan atau data audiens Anda kepada pihak ketiga atau pengiklan manapun. Data Anda adalah aset milik Anda seutuhnya.
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Key className="w-5 h-5 text-amber-500" />
              <span>4. Hak Pengguna &amp; Penghapusan Data</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Anda memiliki hak penuh untuk mengakses, memperbarui, mengekspor, atau menghapus kontak dan sesi perangkat Anda kapan saja melalui panel dashboard. Apabila Anda memutuskan untuk menghapus akun, seluruh data kontak dan sesi terkait akan dihapus secara permanen dari server aktif kami.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Server className="w-5 h-5 text-amber-500" />
              <span>5. Hubungi Tim Perlindungan Data</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Untuk pertanyaan atau permintaan terkait data pribadi Anda, silakan hubungi tim kami:
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
