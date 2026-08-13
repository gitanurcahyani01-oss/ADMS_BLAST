import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const navLinks = [
  { to: "/", label: "FITUR", hash: "fitur" },
  { to: "/demo", label: "DEMO" },
  { to: "/harga", label: "HARGA" },
  { to: "/afiliasi", label: "AFILIASI" },
  { to: "/testimoni", label: "TESTIMONI" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e, item) => {
    if (item.hash) {
      e.preventDefault();
      if (location.pathname === "/" || location.pathname === "") {
        const el = document.getElementById(item.hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById(item.hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-[#07101E]/95 backdrop-blur-md shadow-md border-b border-slate-100 dark:border-slate-800/80 py-3"
          : "bg-white/90 dark:bg-[#07101E]/90 backdrop-blur-sm py-4"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        
        {/* LOGO ADMS (PT. ARMADA DIGITAL MARKETING SYARIAH) */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="./logo_transparent.png"
            alt="ADMS - PT. ARMADA DIGITAL MARKETING SYARIAH"
            className="h-10 sm:h-12 w-auto max-w-[220px] sm:max-w-[280px] object-contain transition-transform duration-200 group-hover:scale-[1.02] dark:drop-shadow-[0_2px_12px_rgba(255,199,39,0.15)]"
          />
        </Link>

        {/* DESKTOP NAV LINKS */}
        <ul className="hidden items-center gap-6 lg:gap-8 md:flex">
          {navLinks.map((l) => (
            <li key={l.label}>
              {l.hash ? (
                <button
                  type="button"
                  onClick={(e) => handleNavClick(e, l)}
                  className="font-display text-xs lg:text-sm font-bold text-[#0E2A47] dark:text-slate-200 tracking-wider transition-colors hover:text-[#D4AF37] dark:hover:text-[#FFC727] cursor-pointer"
                >
                  {l.label}
                </button>
              ) : (
                <Link
                  to={l.to}
                  className="font-display text-xs lg:text-sm font-bold text-[#0E2A47] dark:text-slate-200 tracking-wider transition-colors hover:text-[#D4AF37] dark:hover:text-[#FFC727]"
                >
                  {l.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* DESKTOP ACTIONS + THEME SWITCHER BUTTON */}
        <div className="hidden items-center gap-4 lg:gap-5 md:flex">
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-display text-xs lg:text-sm font-bold text-[#0E2A47] dark:text-slate-200 tracking-wider hover:text-[#D4AF37] dark:hover:text-[#FFC727] transition hover:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            <span>PORTAL MASUK</span>
          </Link>
          
          <Link
            to="/harga"
            className="rounded-full bg-gradient-to-r from-[#FFC727] via-[#F5B800] to-[#D4AF37] hover:from-[#F5B800] hover:to-[#B8860B] px-6 lg:px-7 py-2.5 font-display text-xs lg:text-sm font-extrabold text-[#0A2540] uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            DAFTAR SEKARANG
          </Link>

          {/* THEME TOGGLE BUTTON (POSITIONED RIGHT BESIDE DAFTAR SEKARANG) */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Ganti ke Mode Terang (Light Mode)" : "Ganti ke Mode Gelap (Dark Mode)"}
            title={isDark ? "Ganti ke Mode Terang (Light Mode)" : "Ganti ke Mode Gelap (Dark Mode)"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-[#0E2A47] dark:text-[#FFC727] shadow-sm hover:scale-110 active:scale-90 hover:border-amber-400 dark:hover:border-amber-400 transition-all duration-200 cursor-pointer"
          >
            {isDark ? (
              /* Sun Icon for Light mode switch */
              <svg className="w-5 h-5 fill-current animate-in zoom-in duration-200" viewBox="0 0 24 24">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
              </svg>
            ) : (
              /* Moon Icon for Dark mode switch */
              <svg className="w-4.5 h-4.5 fill-current text-[#0E2A47] animate-in zoom-in duration-200" viewBox="0 0 24 24">
                <path d="M12.3 2a10 10 0 0 0-.19 14 10 10 0 0 0 11.89 4.09 1 1 0 0 0 .5-1.35 1 1 0 0 0-1-.6 8 8 0 0 1-5.18-1.73 8 8 0 0 1-2.9-5.17A8 8 0 0 1 16.2 6.1a1 1 0 0 0-.38-1.61A10 10 0 0 0 12.3 2z"/>
              </svg>
            )}
          </button>
        </div>

        {/* MOBILE CONTROLS (THEME TOGGLE + HAMBURGER) */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0E2A47] dark:text-[#FFC727] shadow-sm"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Buka Menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0E2A47] dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <div className="relative h-3.5 w-5">
              <span
                className={`absolute left-0 top-0 h-[2px] w-5 rounded bg-[#0E2A47] dark:bg-white transition-all duration-300 ${
                  open ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[6px] h-[2px] w-5 rounded bg-[#0E2A47] dark:bg-white transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 bottom-0 h-[2px] w-5 rounded bg-[#0E2A47] dark:bg-white transition-all duration-300 ${
                  open ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {open && (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#07101E] px-6 pb-6 pt-3 md:hidden animate-in slide-in-from-top duration-200">
          <ul className="flex flex-col gap-2">
            {navLinks.map((l) => (
              <li key={l.label}>
                {l.hash ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      setOpen(false);
                      handleNavClick(e, l);
                    }}
                    className="block w-full text-left rounded-xl px-4 py-2.5 font-display text-sm font-bold text-[#0E2A47] dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-[#D4AF37] dark:hover:text-[#FFC727] transition cursor-pointer"
                  >
                    {l.label}
                  </button>
                ) : (
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-2.5 font-display text-sm font-bold text-[#0E2A47] dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-[#D4AF37] dark:hover:text-[#FFC727] transition"
                  >
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="w-full text-center py-2.5 font-display text-sm font-bold text-[#0E2A47] dark:text-slate-200 hover:text-[#D4AF37] transition"
            >
              PORTAL MASUK
            </Link>
            <Link
              to="/harga"
              onClick={() => setOpen(false)}
              className="w-full rounded-full bg-gradient-to-r from-[#FFC727] to-[#D4AF37] py-3 text-center font-display text-sm font-extrabold uppercase tracking-wider text-[#0A2540] shadow-md"
            >
              DAFTAR SEKARANG
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
