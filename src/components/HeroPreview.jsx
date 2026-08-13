import { useState } from "react";

const codeSnippets = {
  Java: `:ENTER_ADMS_API_KEY' \\
api.admsblast.id/v1/send_message \\
Broadcast <+628123456789>' \\
Pengirim <ADMS-OFFICIAL>' \\
'Promo Spesial Diskon 50% untuk Anda kak!' \\
'09 Agu 2026 - 11.00 WIB' \\

// Pesan otomatis terkirim via ADMS Business API
// Anti Banned & Enkripsi End-to-End
// Terintegrasi langsung dengan database CRM Anda`,
  Ruby: `require 'net/http'
require 'json'

uri = URI('https://api.admsblast.id/v1/send_message')
headers = { 
  'Authorization' => 'Bearer :ADMS_API_KEY',
  'Content-Type' => 'application/json' 
}
payload = {
  phone: '+628123456789',
  message: 'Halo Kak! Pesanan Anda sedang kami proses.',
  template: 'adms_order_notif'
}
response = Net::HTTP.post(uri, payload.to_json, headers)`,
  PHP: `<?php
$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.admsblast.id/v1/send_message",
  CURLOPT_HTTPHEADER => ["Authorization: Bearer :ADMS_API_KEY"],
  CURLOPT_POSTFIELDS => [
    "phone" => "+628123456789",
    "message" => "Halo Kak! Pembayaran Anda telah terverifikasi.",
    "button_cta" => "https://admsblast.id/invoice/123"
  ]
]);
$response = curl_exec($curl);`,
  cURL: `curl -X POST https://api.admsblast.id/v1/send_message \\
  -H "Authorization: Bearer YOUR_ADMS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+628123456789",
    "template_id": "broadcast_promo_gold",
    "parameters": ["Budi Santoso", "Diskon 50%"]
  }'`
};

export default function HeroPreview() {
  const [activeTab, setActiveTab] = useState("Java");

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none">
      
      {/* Floating Badges */}
      {/* 1. Top-Left: Gold verified Shield */}
      <div className="absolute -top-5 -left-4 z-30 animate-float-slow hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-amber-100 dark:border-slate-700 p-1.5">
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-[#D4AF37] font-bold text-base shadow-inner">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
        </div>
      </div>

      {/* 2. Top-Center: Mint/Emerald WhatsApp pulse */}
      <div className="absolute -top-7 left-1/3 z-30 animate-float-reverse hidden sm:flex items-center justify-center w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-emerald-100 dark:border-slate-700 p-2">
        <div className="w-full h-full rounded-xl bg-emerald-50 dark:bg-slate-700 flex items-center justify-center text-[#00C853]">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.11 7.07C8.94 7.07 8.67 7.13 8.44 7.38C8.21 7.63 7.56 8.24 7.56 9.47C7.56 10.7 8.46 11.89 8.58 12.06C8.71 12.22 10.36 14.77 12.88 15.86C13.48 16.12 13.95 16.28 14.31 16.4C14.91 16.59 15.46 16.56 15.89 16.5C16.37 16.43 17.37 15.9 17.58 15.32C17.78 14.74 17.78 14.25 17.72 14.15C17.66 14.05 17.5 13.98 17.26 13.86C17.02 13.74 15.83 13.16 15.61 13.08C15.39 13 15.22 12.96 15.06 13.21C14.89 13.45 14.42 14.05 14.28 14.21C14.14 14.37 14 14.39 13.76 14.27C13.52 14.15 12.75 13.9 11.83 13.08C11.12 12.44 10.63 11.66 10.49 11.42C10.35 11.17 10.48 11.04 10.6 10.92C10.71 10.81 10.85 10.63 10.97 10.48C11.09 10.34 11.13 10.23 11.21 10.07C11.29 9.91 11.25 9.77 11.19 9.65C11.13 9.53 10.64 8.32 10.44 7.82C10.24 7.34 10.04 7.4 9.89 7.39C9.75 7.39 9.58 7.39 9.42 7.39C9.25 7.39 9.11 7.07 9.11 7.07Z"/>
          </svg>
        </div>
      </div>

      {/* 3. Top-Right: Navy Badge */}
      <div className="absolute -top-5 right-10 z-30 animate-float-slow hidden sm:flex items-center justify-center w-11 h-11 rounded-2xl bg-[#0E2A47] dark:bg-slate-800 text-amber-400 shadow-xl border border-amber-500/30 p-1">
        <div className="font-bold text-xs tracking-wider">
          ADMS
        </div>
      </div>

      {/* 4. Bottom-Left: Zapier orange badge */}
      <div className="absolute -bottom-4 -left-3 z-30 animate-float-reverse hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-amber-100 dark:border-slate-700">
        <span className="w-3.5 h-3.5 rounded-full bg-[#FF4F00] flex items-center justify-center text-white text-[9px] font-bold">✱</span>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">Zapier / Webhook</span>
      </div>

      {/* 5. Bottom-Center: Gold API Node */}
      <div className="absolute -bottom-5 left-[42%] z-30 animate-float-slow hidden sm:flex items-center justify-center w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-amber-200 dark:border-slate-700">
        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-slate-700 flex items-center justify-center text-[#D4AF37]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <circle cx="19" cy="6" r="2" />
            <circle cx="5" cy="6" r="2" />
            <circle cx="19" cy="18" r="2" />
            <circle cx="5" cy="18" r="2" />
            <path d="M12 9V6m0 6v6m0-6h7m-7 0H5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 6. Middle-Right: Google Sheets green badge */}
      <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-30 animate-float-slow hidden sm:flex items-center justify-center w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-emerald-100 dark:border-slate-700">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-slate-700 flex items-center justify-center text-emerald-600">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z" />
          </svg>
        </div>
      </div>

      {/* Main Container Card (Navy & Gold) */}
      <div className="relative rounded-3xl bg-white dark:bg-[#0E2238] shadow-[0_25px_60px_-15px_rgba(14,42,71,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-200/80 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row transition-all duration-300">
        
        {/* LEFT PANE: Dashboard Mockup */}
        <div className="w-full md:w-[54%] bg-slate-50/70 dark:bg-[#0A182E] p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
          <div>
            {/* Top Mockup Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-[#0E2A47] dark:bg-amber-400 flex items-center justify-center text-[#FFC727] dark:text-[#0A2540] text-[10px] font-black shadow-sm">
                  AD
                </div>
                <span className="text-xs font-bold text-[#0E2A47] dark:text-slate-100 tracking-tight">ADMS BLAST</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 mr-1 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>

              <a
                href="https://wa.me/6281121191933"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-[#0A2540] dark:bg-slate-800 hover:bg-[#13385E] text-[#FFC727] text-[10px] font-bold px-3 py-1 rounded-full shadow-sm transition"
              >
                <span>WhatsApp API Resmi</span>
              </a>
            </div>

            {/* Sub-layout: Mini Sidebar + Content */}
            <div className="grid grid-cols-[85px_1fr] sm:grid-cols-[105px_1fr] gap-3 pt-3">
              
              {/* Mini Sidebar */}
              <div className="space-y-2 text-[9px] font-medium text-slate-600 dark:text-slate-400 pr-1 border-r border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Audiences</div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-slate-800 text-[#0E2A47] dark:text-amber-300 font-bold border-l-2 border-[#D4AF37]">
                    <span>👥</span> Kontak Pelanggan
                  </div>
                  <div className="px-1.5 py-0.5 hover:text-[#0E2A47] dark:hover:text-white">
                    Daftar Segmentasi
                  </div>
                </div>

                <div>
                  <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Broadcast</div>
                  <div className="px-1.5 py-0.5 hover:text-[#0E2A47] dark:hover:text-white">
                    Kirim Sekaligus
                  </div>
                  <div className="px-1.5 py-0.5 hover:text-[#0E2A47] dark:hover:text-white">
                    Jadwal Otomatis
                  </div>
                </div>

                <div>
                  <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Otomasi Cerdas</div>
                  <div className="px-1.5 py-0.5 text-emerald-700 dark:text-emerald-400 font-bold">⚡ Auto Follow Up</div>
                  <div className="px-1.5 py-0.5 hover:text-[#0E2A47] dark:hover:text-white">🤖 AI Chatbot CS</div>
                  <div className="px-1.5 py-0.5 hover:text-[#0E2A47] dark:hover:text-white">📋 Lead Pipeline</div>
                </div>
              </div>

              {/* Mini Dashboard Content */}
              <div className="space-y-2.5">
                {/* Contacts Metric Card */}
                <div className="rounded-xl bg-gradient-to-r from-[#0A2540] via-[#0E2A47] to-[#13385E] p-3 text-white shadow-md border border-amber-500/20">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-200">Kuota Broadcast</span>
                    <span className="text-[9px] bg-[#FFC727] text-slate-950 font-extrabold px-1.5 py-0.5 rounded shadow-sm">
                      UNLIMITED
                    </span>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between text-xs font-extrabold tracking-tight">
                    <span className="text-[#FFC727]">24.850 Pesan</span>
                    <span className="text-slate-300 text-[10px]">/ 100% Terkirim</span>
                  </div>
                  <div className="mt-1 w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#FFC727] via-[#F5B800] to-[#00C853] rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  <p className="mt-1 text-[8px] text-slate-300 leading-tight">
                    Kecepatan stabil &amp; anti banned dengan sistem Spintax cerdas.
                  </p>
                </div>

                {/* Latest Broadcasts List */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#0E2A47] dark:text-slate-200 mb-1.5">
                    <span className="flex items-center gap-1">
                      <span className="text-[#D4AF37]">✦</span> Riwayat Kampanye Terkini
                    </span>
                    <span className="text-[8px] text-[#D4AF37] font-semibold hover:underline cursor-pointer">Live Report</span>
                  </div>

                  <div className="space-y-1">
                    {[
                      { name: "Promo Flash Sale Akhir Pekan", time: "Baru saja", badge: "100% Sukses", bg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
                      { name: "Pengingat Jadwal Webinar Bisnis", time: "1 jam lalu", badge: "Terkirim", bg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
                      { name: "Auto Follow Up - Calon Buyer", time: "Sedang jalan", badge: "Proses Otomatis", bg: "bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800" },
                      { name: "Notifikasi Invoice Pembayaran", time: "Hari ini", badge: "Terkirim", bg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[9px] shadow-sm">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0"></span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0 border ${item.bg}`}>
                          {item.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* CENTER SPLIT HANDLE */}
        <div className="relative z-20 hidden md:flex items-center justify-center">
          <div className="absolute inset-y-0 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
          <div className="relative -ml-3.5 -mr-3.5 w-7 h-7 rounded-full bg-gradient-to-r from-[#FFC727] to-[#D4AF37] text-[#0A2540] flex items-center justify-center shadow-lg shadow-amber-500/30 text-[11px] font-black ring-2 ring-white dark:ring-slate-800">
            &lt;&gt;
          </div>
        </div>

        {/* RIGHT PANE: Code Editor */}
        <div className="w-full md:w-[46%] bg-[#06152B] dark:bg-[#040C1A] text-slate-200 p-4 flex flex-col font-mono">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFC727] inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C853] inline-block"></span>
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              {["Java", "Ruby", "PHP", "cURL"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={`px-2.5 py-1 rounded-md transition font-medium ${
                    activeTab === lang
                      ? "bg-[#0E2A47] text-[#FFC727] font-bold border-b-2 border-[#FFC727]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex-1 flex flex-col justify-between text-[11px] leading-relaxed custom-scrollbar overflow-x-auto">
            <div className="space-y-1 font-mono whitespace-pre-wrap">
              <div className="text-amber-300 font-bold">:ENTER_ADMS_API_KEY' \</div>
              <div className="text-sky-300 font-semibold">api.admsblast.id/v1/send_message \</div>
              <div className="text-slate-300">
                <span className="text-emerald-400">Broadcast</span> &lt;<span className="text-[#FFC727]">+628123456789</span>&gt;' \
              </div>
              <div className="text-slate-300">
                <span className="text-indigo-300">Sender</span> &lt;<span className="text-amber-200">ADMS-OFFICIAL</span>&gt;' \
              </div>
              <div className="text-[#FFE082]">
                'Promo Spesial Diskon 50% untuk Anda kak!' \
              </div>
              <div className="text-slate-400">
                '09 Agu 2026 - 11.00 WIB' \
              </div>
              <div className="pt-2 text-slate-500 italic text-[10px]">
                // Pesan otomatis terkirim via ADMS Business API<br/>
                // Anti Banned &amp; Enkripsi End-to-End<br/>
                // Terintegrasi langsung dengan database CRM Anda
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>API Status: 200 OK (Official WABA)</span>
              </div>
              <span className="text-amber-400/90 font-sans font-semibold">Latensi: 19ms</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
