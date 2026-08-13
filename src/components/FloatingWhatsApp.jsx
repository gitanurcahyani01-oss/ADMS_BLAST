export default function FloatingWhatsApp() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href="https://wa.me/6281121191933?text=Halo%20ADMS%20BLAST,%20saya%20tertarik%20dengan%20layanan%20ini"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 bg-gradient-to-r from-[#0E2A47] to-[#0A2540] hover:from-[#13385E] hover:to-[#0E2A47] text-white px-5 py-3 rounded-full shadow-[0_10px_25px_-5px_rgba(14,42,71,0.5)] border border-amber-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Chat WhatsApp CS ADMS"
      >
        <span className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-[#FFC727] transition">
          Ada pertanyaan? Chat di sini.
        </span>
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00C853] text-white shadow-sm group-hover:scale-110 transition">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.11 7.07C8.94 7.07 8.67 7.13 8.44 7.38C8.21 7.63 7.56 8.24 7.56 9.47C7.56 10.7 8.46 11.89 8.58 12.06C8.71 12.22 10.36 14.77 12.88 15.86C13.48 16.12 13.95 16.28 14.31 16.4C14.91 16.59 15.46 16.56 15.89 16.5C16.37 16.43 17.37 15.9 17.58 15.32C17.78 14.74 17.78 14.25 17.72 14.15C17.66 14.05 17.5 13.98 17.26 13.86C17.02 13.74 15.83 13.16 15.61 13.08C15.39 13 15.22 12.96 15.06 13.21C14.89 13.45 14.42 14.05 14.28 14.21C14.14 14.37 14 14.39 13.76 14.27C13.52 14.15 12.75 13.9 11.83 13.08C11.12 12.44 10.63 11.66 10.49 11.42C10.35 11.17 10.48 11.04 10.6 10.92C10.71 10.81 10.85 10.63 10.97 10.48C11.09 10.34 11.13 10.23 11.21 10.07C11.29 9.91 11.25 9.77 11.19 9.65C11.13 9.53 10.64 8.32 10.44 7.82C10.24 7.34 10.04 7.4 9.89 7.39C9.75 7.39 9.58 7.39 9.42 7.39C9.25 7.39 9.11 7.07 9.11 7.07Z"/>
          </svg>
        </div>
      </a>
    </div>
  );
}
