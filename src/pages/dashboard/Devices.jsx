import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Smartphone,
  CheckCircle2,
  XCircle,
  Battery,
  RefreshCw,
  QrCode,
  Wifi,
  WifiOff,
  Clock,
  Plus,
  Send,
  Trash2,
  LogOut,
  AlertTriangle,
  X,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function Devices() {
  const { authFetch, hasPermission, isSuperAdmin, isAdmin, user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [maxAllowed, setMaxAllowed] = useState(5);
  const [planName, setPlanName] = useState('Paket 1 Bulan');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Form states
  const [newDeviceName, setNewDeviceName] = useState('');
  const [qrData, setQrData] = useState({ qrCode: null, status: 'PAIRING', phoneNumber: '' });
  const [qrPollingInterval, setQrPollingInterval] = useState(null);

  const [testPayload, setTestPayload] = useState({ phoneNumber: '', message: 'Halo! Ini adalah pesan uji coba dari ADMS Blast Multi-Device Engine.' });
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchDevices = async () => {
    try {
      const { data, ok } = await authFetch('/whatsapp/devices');
      if (ok && data.success) {
        setDevices(data.data.devices);
        if (data.data.maxAllowed !== undefined) setMaxAllowed(data.data.maxAllowed);
        if (data.data.planName) setPlanName(data.data.planName);
      }
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Poll QR status when QR modal is open
  useEffect(() => {
    let interval = null;
    if (showQRModal && selectedDevice) {
      const checkQR = async () => {
        try {
          const { data, ok } = await authFetch(`/whatsapp/devices/${selectedDevice.id}/qr`);
          if (ok && data.success) {
            setQrData(data.data);
            if (data.data.status === 'CONNECTED') {
              showToast(`WhatsApp ${selectedDevice.name} (${data.data.phoneNumber}) berhasil terhubung!`);
              setShowQRModal(false);
              fetchDevices();
            }
          }
        } catch (e) {}
      };

      checkQR();
      interval = setInterval(checkQR, 2500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showQRModal, selectedDevice]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDevices();
  };

  // 1. Create Device & Open QR Modal
  const handleCreateDevice = async (e) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    try {
      const { data, ok } = await authFetch('/whatsapp/devices', {
        method: 'POST',
        body: JSON.stringify({ name: newDeviceName.trim() }),
      });

      if (ok && data.success) {
        showToast('Perangkat dibuat. Silakan scan QR Code.');
        setShowAddModal(false);
        setNewDeviceName('');
        setSelectedDevice(data.data.device);
        setQrData({
          qrCode: data.data.device.qrCode,
          status: 'PAIRING',
          phoneNumber: '',
        });
        setShowQRModal(true);
        fetchDevices();
      } else {
        showToast(data.message || 'Gagal menambahkan perangkat', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  // 2. Open QR Modal for existing device
  const handleOpenQR = (device) => {
    setSelectedDevice(device);
    setQrData({ qrCode: null, status: device.status, phoneNumber: device.phoneNumber });
    setShowQRModal(true);
  };

  // 3. Disconnect Device
  const handleDisconnect = async (device) => {
    if (!window.confirm(`Yakin ingin memutuskan koneksi WhatsApp "${device.name}"?`)) return;

    try {
      const { data, ok } = await authFetch(`/whatsapp/devices/${device.id}/disconnect`, {
        method: 'POST',
      });

      if (ok && data.success) {
        showToast(`Koneksi ${device.name} telah diputuskan.`);
        fetchDevices();
      } else {
        showToast(data.message || 'Gagal memutuskan koneksi', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  // 4. Delete Device
  const handleDeleteDevice = async (device) => {
    if (!window.confirm(`Hapus permanen perangkat "${device.name}"?`)) return;

    try {
      const { data, ok } = await authFetch(`/whatsapp/devices/${device.id}`, {
        method: 'DELETE',
      });

      if (ok && data.success) {
        showToast(`Perangkat ${device.name} berhasil dihapus.`);
        fetchDevices();
      } else {
        showToast(data.message || 'Gagal menghapus perangkat', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  // 5. Send Test WhatsApp Message
  const handleSendTestMessage = async (e) => {
    e.preventDefault();
    if (!selectedDevice || !testPayload.phoneNumber || !testPayload.message) return;

    setIsSendingTest(true);
    try {
      const { data, ok } = await authFetch('/whatsapp/send-test', {
        method: 'POST',
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          phoneNumber: testPayload.phoneNumber,
          message: testPayload.message,
        }),
      });

      if (ok && data.success) {
        showToast(`Pesan uji coba berhasil terkirim ke ${testPayload.phoneNumber}!`);
        setShowTestModal(false);
        setTestPayload({ phoneNumber: '', message: 'Halo! Ini adalah pesan uji coba dari ADMS Blast Multi-Device Engine.' });
      } else {
        showToast(data.message || 'Gagal mengirim pesan uji coba', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan pengiriman.', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between shadow-lg transition-all animate-fadeIn ${
            notification.type === 'error'
              ? 'bg-red-950/90 border-red-800 text-red-200'
              : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Perangkat WhatsApp (Self-Hosted)
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-500 border border-emerald-500/40">
              Multi-Device Engine
            </span>

            {/* Quota Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Kuota: <strong>{devices.length}</strong> / <strong>{isSuperAdmin ? '∞ VIP Unlimited' : `${maxAllowed} Nomor`}</strong>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 font-extrabold text-amber-600 dark:text-amber-200">
                {planName}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hubungkan nomor WhatsApp Anda via Scan QR Code untuk mulai broadcast dan otomasi pesan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={() => {
              if (!isSuperAdmin && devices.length >= maxAllowed) {
                showToast(`Batas kuota ${maxAllowed} perangkat untuk ${planName} telah penuh. Silakan upgrade paket Anda untuk menambah hingga 20 nomor.`, 'error');
                return;
              }
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Perangkat Baru</span>
          </button>
        </div>
      </div>

      {/* NUMBER WARMING & SAFETY GUIDE BANNER */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-3xl p-5 shadow-sm text-slate-800 dark:text-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span>Tips Pemanasan Nomor WhatsApp Baru (*Number Warming Guide*)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 font-bold uppercase tracking-wider">
                  Rekomendasi
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Jika Anda menggunakan nomor baru yang belum pernah aktif lama, ikuti langkah berikut agar tidak langsung terblokir:
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-emerald-500/20 text-xs">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-emerald-500/20 space-y-1">
            <p className="font-bold text-emerald-600 dark:text-emerald-400">
              1. Pemanasan 7 Hari Pertama
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Gunakan nomor untuk chat biasa dengan keluarga/teman & masuk 2-3 grup WhatsApp selama seminggu pertama.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-emerald-500/20 space-y-1">
            <p className="font-bold text-emerald-600 dark:text-emerald-400">
              2. Batasi Volume Bertahap
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Hari 1-3: maks 30 pesan. Hari 4-7: maks 70 pesan. Setelah 14 hari: aman broadcast hingga ratusan pesan.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-emerald-500/20 space-y-1">
            <p className="font-bold text-emerald-600 dark:text-emerald-400">
              3. Pasang Foto Profil & Bio
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Lengkapi foto profil bisnis dan info bio WhatsApp agar nomor tidak dicurigai sebagai bot bodong oleh sistem.
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Memuat perangkat WhatsApp...</p>
        </div>
      ) : devices.length === 0 ? (
        /* Empty State Card */
        <div className="bg-white dark:bg-[#0A2540] border-2 border-dashed border-slate-300 dark:border-slate-700/80 rounded-3xl p-10 sm:p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <Smartphone className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Belum Ada Nomor WhatsApp Terhubung
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            Hubungkan nomor WhatsApp bisnis Anda sekarang via Scan QR Code untuk mulai broadcast pesan massal, follow-up otomatis, dan chatbot 24/7.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Hubungkan Nomor WhatsApp Sekarang</span>
          </button>
        </div>
      ) : (
        /* Device Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => {
            const isConnected = device.status === 'CONNECTED';
            const isPairing = device.status === 'PAIRING';

            return (
              <div
                key={device.id}
                className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-amber-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isConnected
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                            : isPairing
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                            : 'bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400 border border-red-300 dark:border-red-800'
                        }`}
                      >
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {device.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {device.phoneNumber || 'Belum Terhubung'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isConnected
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : isPairing
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isConnected ? 'bg-emerald-500 animate-pulse' : isPairing ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                        }`}
                      ></span>
                      {isConnected ? 'Terhubung' : isPairing ? 'Menunggu Scan' : 'Offline'}
                    </span>
                  </div>

                  <div className="mt-6 space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Platform Mesin:</span>
                      <span className="font-semibold">{device.platform}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Status Daya Baterai:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {device.battery}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Aktivitas Terakhir:</span>
                      <span className="font-medium">
                        {new Date(device.lastActive || device.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {isConnected ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedDevice(device);
                          setShowTestModal(true);
                        }}
                        className="py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Test Kirim</span>
                      </button>

                      <button
                        onClick={() => handleDisconnect(device)}
                        className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenQR(device)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Scan QR Code Sekarang</span>
                    </button>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleDeleteDevice(device)}
                      className="text-[11px] text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Perangkat</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Tambah Perangkat Baru */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Tambah Nomor WhatsApp
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDevice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Label / Nama Perangkat
                </label>
                <input
                  type="text"
                  required
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="Contoh: CS Marketing Promo #01"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Beri nama untuk memudahkan identifikasi nomor blast pengiriman.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md"
                >
                  Generate QR Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Scan QR Code Interaktif */}
      {showQRModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Scan QR Code WhatsApp
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Perangkat: <strong>{selectedDevice.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#06152B] rounded-2xl border border-slate-200 dark:border-slate-800 my-4">
              {qrData.qrCode ? (
                <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
                  <img
                    src={qrData.qrCode}
                    alt="WhatsApp QR Code"
                    className="w-56 h-56 object-contain"
                  />
                </div>
              ) : (
                <div className="w-56 h-56 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-semibold text-center">Menghubungkan ke Socket Baileys & Menyiapkan QR...</p>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Menunggu scan dari aplikasi WhatsApp HP...</span>
              </div>
            </div>

            {/* Step-by-Step Scan Instructions */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
              <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Cara Scan QR Code di WhatsApp HP:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                <li>Buka aplikasi WhatsApp di HP Anda.</li>
                <li>Pilih <strong>Menu (titik 3)</strong> di Android atau <strong>Pengaturan</strong> di iPhone.</li>
                <li>Pilih <strong>Perangkat Tertaut (Linked Devices)</strong> → Tekan <strong>Tautkan Perangkat</strong>.</li>
                <li>Arahkan kamera HP ke QR Code di atas.</li>
              </ol>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Uji Coba Kirim Pesan Langsung */}
      {showTestModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Uji Kirim Pesan WA
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pengirim: <strong>{selectedDevice.name}</strong> ({selectedDevice.phoneNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTestMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp Penerima
                </label>
                <input
                  type="text"
                  required
                  value={testPayload.phoneNumber}
                  onChange={(e) => setTestPayload({ ...testPayload, phoneNumber: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Isi Pesan WhatsApp
                </label>
                <textarea
                  rows={4}
                  required
                  value={testPayload.message}
                  onChange={(e) => setTestPayload({ ...testPayload, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSendingTest ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
