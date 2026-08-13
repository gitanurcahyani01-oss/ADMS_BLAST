import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Smartphone,
  ScrollText,
  Users,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ExternalLink,
  Crown,
  Shield,
  UserCheck,
  Building2,
  ChevronDown,
  Sparkles,
  Layers,
  Radio,
  ChevronRight,
  Lock,
  Send,
  Bot,
  Clock,
  MessageSquare,
  RefreshCw,
  Gift,
  Settings as SettingsIcon
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, isSuperAdmin, isAdmin, isUser, activeWorkspace, workspaces, switchWorkspace, logout, hasPermission } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamic Navigation Sections based on Role & Permissions
  const navSections = [
    {
      title: 'UTAMA & RINGKASAN',
      items: [
        {
          name: 'Dashboard Overview',
          to: '/dashboard',
          icon: LayoutDashboard,
          end: true,
          show: true,
        },
        {
          name: 'Perangkat WhatsApp',
          to: '/dashboard/devices',
          icon: Smartphone,
          show: true,
          badge: isUser ? 'Siap Pakai' : 'Gateway',
        },
      ],
    },
    {
      title: 'MARKETING & BROADCAST',
      items: [
        {
          name: 'Kontak & Audiens',
          to: '/dashboard/contacts',
          icon: Users,
          show: true,
        },
        {
          name: 'Kirim Broadcast Massal',
          to: '/dashboard/broadcast',
          icon: Send,
          show: true,
          badge: 'Anti-Ban',
        },
        {
          name: 'Otomasi & Auto-Reply Bot',
          to: '/dashboard/auto-reply',
          icon: Bot,
          show: true,
          badge: 'Bot 24/7',
        },
        {
          name: 'Log Pengiriman Pesan',
          to: '/dashboard/logs',
          icon: ScrollText,
          show: true,
        },
      ],
    },
    {
      title: isSuperAdmin ? 'KONTROL SISTEM GLOBAL' : 'MANAJEMEN TIM WORKSPACE',
      show: isSuperAdmin || isAdmin,
      items: [
        {
          name: isSuperAdmin ? 'Manajemen Pengguna & Tenant' : 'Manajemen Anggota Tim',
          to: '/dashboard/users',
          icon: Shield,
          show: isSuperAdmin || isAdmin,
          badge: isSuperAdmin ? 'Global' : 'Tim',
        },
        {
          name: isSuperAdmin ? 'Audit Trail Keamanan Sistem' : 'Log Aktivitas Workspace',
          to: '/dashboard/audit',
          icon: ShieldCheck,
          show: isSuperAdmin || isAdmin,
          badge: isSuperAdmin ? 'Full Log' : 'Workspace',
        },
      ],
    },
    {
      title: 'PENGATURAN & AKUN',
      items: [
        {
          name: 'Afiliasi & Komisi Referral',
          to: '/dashboard/referral',
          icon: Gift,
          show: true,
          badge: 'Komisi',
        },
        {
          name: 'Pengaturan Akun & Profil',
          to: '/dashboard/settings',
          icon: SettingsIcon,
          show: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07101E] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-300">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0A2540] border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-40">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
            A
          </div>
          <span className="font-extrabold text-base tracking-tight">
            ADMS <span className="text-amber-500">BLAST</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:white"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white dark:bg-[#0A2540] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between z-50 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Workspace Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
                A
              </div>
              <div>
                <div className="font-extrabold text-lg tracking-tight flex items-center gap-1">
                  ADMS <span className="text-amber-500">BLAST</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Multi-Tenant RBAC
                </div>
              </div>
            </Link>
          </div>

          {/* Active Workspace Selector */}
          {activeWorkspace && (
            <div className="relative mt-4">
              <button
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/20 text-left transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-amber-300 truncate">
                      {activeWorkspace.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Workspace Tenant
                    </p>
                  </div>
                </div>
                {workspaces.length > 1 && <ChevronDown className="w-4 h-4 text-amber-500 flex-shrink-0" />}
              </button>

              {/* Workspace Switcher Dropdown */}
              {isWorkspaceMenuOpen && workspaces.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#07192F] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                  <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilih Workspace
                  </p>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        switchWorkspace(ws.id);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all ${
                        ws.id === activeWorkspace.id
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{ws.name}</span>
                      {ws.id === activeWorkspace.id && <span className="text-[10px]">Aktif</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Profile Card */}
          <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-[#06152B]/80 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Hak Akses:</span>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                  <Crown className="w-3 h-3 text-amber-500" />
                  Super Admin
                </span>
              ) : isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
                  <Shield className="w-3 h-3 text-blue-500" />
                  Admin Operasional
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  User Klien
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {navSections
            .filter((section) => section.show !== false)
            .map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  {section.title}
                </p>
                {section.items
                  .filter((item) => item.show !== false)
                  .map((item) => {
                    const Icon = item.icon;

                    const hasActivePlan =
                      isSuperAdmin ||
                      (user?.status === 'ACTIVE' &&
                        (activeWorkspace?.status === 'ACTIVE' || !activeWorkspace) &&
                        (!activeWorkspace?.subscription ||
                          activeWorkspace?.subscription?.status === 'ACTIVE' ||
                          (activeWorkspace?.subscription?.expiresAt &&
                            new Date(activeWorkspace.subscription.expiresAt) > new Date())));
                    const isLocked = !hasActivePlan;

                    return (
                      <NavLink
                        key={item.to}
                        to={isLocked ? '#' : item.to}
                        end={item.end}
                        onClick={(e) => {
                          if (isLocked) {
                            e.preventDefault();
                            return;
                          }
                          setIsSidebarOpen(false);
                        }}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isLocked
                              ? 'opacity-40 cursor-not-allowed text-slate-400'
                              : isActive
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          {isLocked ? <Lock className="w-4 h-4 flex-shrink-0 text-slate-400" /> : <Icon className="w-4 h-4 flex-shrink-0" />}
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
              </div>
            ))}
        </div>

        {/* Sidebar Bottom Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2 bg-slate-50/50 dark:bg-[#06152B]/40">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Website Utama
            </span>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span>Mode Gelap</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Notification / Role Info Bar */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex flex-wrap items-center justify-between text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 font-medium">
            <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>
              Login sebagai: <strong>{user?.name}</strong> • Role: <strong className="text-amber-600 dark:text-amber-400">{user?.role}</strong>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Tenant: <strong>{activeWorkspace?.name || 'Default'}</strong></span>
            <span>•</span>
            <span>RBAC: Multi-Role Active</span>
          </div>
        </div>

        {/* Page Outlet or Locked Account Screen */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          {(() => {
            const hasActivePlan = 
              isSuperAdmin ||
              (user?.status === 'ACTIVE' &&
                (activeWorkspace?.status === 'ACTIVE' || !activeWorkspace) &&
                (!activeWorkspace?.subscription ||
                  activeWorkspace?.subscription?.status === 'ACTIVE' ||
                  (activeWorkspace?.subscription?.expiresAt &&
                    new Date(activeWorkspace.subscription.expiresAt) > new Date())));

            if (!hasActivePlan) {
              return (
                <div className="max-w-2xl mx-auto my-8 bg-white dark:bg-[#0A2540] border-2 border-amber-500/50 rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-5 border border-amber-500/30">
                    <Lock className="w-8 h-8" />
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-wider mb-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Menunggu Konfirmasi Aktivasi</span>
                  </span>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Fitur Masih Terkunci
                  </h2>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    Halo <strong>{user?.name}</strong>, terima kasih telah mendaftar untuk workspace <strong>{activeWorkspace?.name || 'Bisnis Anda'}</strong>. 
                    Saat ini seluruh fitur broadcast, kontak, dan WhatsApp Gateway Anda <strong>masih terkunci</strong> hingga pembayaran paket Anda dikonfirmasi dan diaktifkan oleh <strong>Admin / Super Admin</strong>.
                  </p>

                  <div className="my-6 p-4 rounded-2xl bg-amber-50 dark:bg-[#06152B] border border-amber-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 text-left space-y-2">
                    <p className="font-bold text-amber-600 dark:text-amber-400">💡 Langkah Cepat Aktivasi:</p>
                    <p>1. Lakukan pembayaran via <strong>Scan QRIS Resmi</strong> (GoPay / DANA Bisnis).</p>
                    <p>2. Kirimkan bukti pembayaran Anda melalui tombol WhatsApp di bawah.</p>
                    <p>3. Admin akan mengaktifkan akun Anda dan seluruh fitur langsung terbuka otomatis.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <a
                      href="https://wa.me/6281121191933?text=Halo%20Admin%20ADMS%20BLAST,%20saya%20sudah%20membayar%20langganan%20dan%20ingin%20mengaktifkan%20akun%20saya."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition hover:scale-105"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Kirim Bukti Pembayaran ke CS (0811-2119-1933)</span>
                    </a>

                    <button
                      onClick={() => window.location.reload()}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:border-amber-400 text-slate-700 dark:text-slate-300 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Cek Status Aktivasi</span>
                    </button>
                  </div>
                </div>
              );
            }

            return <Outlet />;
          })()}
        </div>
      </main>
    </div>
  );
}
