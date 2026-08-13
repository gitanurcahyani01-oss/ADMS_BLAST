import { Link, useNavigate, useLocation } from "react-router-dom";
import { MapPin, Phone, Mail, Printer } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFiturClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/" || location.pathname === "") {
      const el = document.getElementById("fitur");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById("fitur");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  };
  return (
    <footer className="border-t border-slate-800 bg-[#06152B] text-slate-300">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1.5fr_1fr]">
          
          {/* Company Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="./logo_transparent.png"
                alt="ADMS BLAST Logo"
                className="h-11 w-auto brightness-0 invert object-contain"
              />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Official Partner <strong>PT. Armada Digital Marketing Syariah</strong>. Platform sistem broadcast &amp; WhatsApp Business API marketing terpercaya untuk bisnis Indonesia menjaga komunikasi pelanggan tetap cepat, aman, dan meningkatkan konversi closing.
            </p>
          </div>

          {/* CONTACT INFO / Bantuan & Konsultasi */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest font-bold text-[#FFC727]">
              CONTACT INFO &amp; KONSULTASI
            </p>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-md">
              You can always contact with us via email or phone. Get in touch with contact and get a quote form.
            </p>

            <ul className="mt-4 space-y-3.5 text-xs sm:text-sm text-slate-300">
              {/* Address */}
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#FFC727]" />
                </div>
                <span className="text-slate-300 leading-snug">
                  Cinunuk Kec, Cileunyi, Bandung, Jawa Barat 40626
                </span>
              </li>

              {/* Phone / WhatsApp */}
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#FFC727]" />
                </div>
                <a
                  href="https://wa.me/6281121191933"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-200 hover:text-[#FFC727] font-semibold transition"
                >
                  +6281121191933
                </a>
              </li>

              {/* Email */}
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#FFC727]" />
                </div>
                <a
                  href="mailto:Info@armadadigitalmarketing.top"
                  className="text-slate-200 hover:text-[#FFC727] font-semibold transition"
                >
                  Info@armadadigitalmarketing.top
                </a>
              </li>

              {/* FAX */}
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4 text-[#FFC727]" />
                </div>
                <span className="text-slate-300 font-mono">
                  FAX: (123) 123-4567
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest font-bold text-[#FFC727]">Navigasi Cepat</p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={handleFiturClick}
                  className="hover:text-[#FFC727] transition cursor-pointer text-left"
                >
                  Fitur Unggulan
                </button>
              </li>
              <li><Link to="/demo" className="hover:text-[#FFC727] transition">Demo Interaktif</Link></li>
              <li><Link to="/harga" className="hover:text-[#FFC727] transition">Harga &amp; Paket</Link></li>
              <li><Link to="/afiliasi" className="hover:text-[#FFC727] transition">Program Afiliasi</Link></li>
              <li><Link to="/testimoni" className="hover:text-[#FFC727] transition">Testimoni Pengguna</Link></li>
              <li><Link to="/syarat-ketentuan" className="hover:text-[#FFC727] transition">Syarat &amp; Ketentuan</Link></li>
              <li><Link to="/kebijakan-privasi" className="hover:text-[#FFC727] transition">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-slate-800/80 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 PT. Armada Digital Marketing Syariah (ADMS) — All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/syarat-ketentuan" className="hover:text-[#FFC727] transition">Syarat &amp; Ketentuan</Link>
            <span>•</span>
            <Link to="/kebijakan-privasi" className="hover:text-[#FFC727] transition">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
