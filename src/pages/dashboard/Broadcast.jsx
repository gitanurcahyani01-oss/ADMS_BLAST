import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Send,
  Radio,
  Layers,
  Users,
  Smartphone,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Tag,
  Eye,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
  HelpCircle,
  Sliders,
  ChevronRight,
  ChevronDown,
  ListFilter,
  Check,
  Image as ImageIcon,
  FileSpreadsheet,
  Paperclip,
  Calendar,
  X,
  Info,
  ShieldAlert
} from 'lucide-react';

export default function Broadcast() {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'history'
  
  // Data sources
  const [devices, setDevices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [lists, setLists] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [targetType, setTargetType] = useState('ALL_CONTACTS'); // ALL_CONTACTS, LIST, MANUAL
  const [selectedListId, setSelectedListId] = useState('');
  const [manualText, setManualText] = useState('');
  const [message, setMessage] = useState('{Halo|Hai|Selamat Pagi} Kak {{name}},\n\nDapatkan diskon spesial 30% untuk produk pilihan hari ini dengan kode voucher: PROMO30.\n\nKunjungi katalog kami sekarang!\n\n*(Balas STOP jika tidak ingin menerima pesan ini)*');
  const [minDelay, setMinDelay] = useState(5);
  const [maxDelay, setMaxDelay] = useState(12);

  // Media Attachment State
  const [mediaAttachment, setMediaAttachment] = useState(null); // { fileUrl, mediaType, fileName }
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const mediaInputRef = useRef(null);

  // Scheduling State
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // Live Tracker State
  const [activeCampaignId, setActiveCampaignId] = useState(null);
  const [activeProgress, setActiveProgress] = useState(null);
  const [campaignLogs, setCampaignLogs] = useState([]);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedCampaignForLogs, setSelectedCampaignForLogs] = useState(null);

  // Expandable Safety Guide
  const [showSafetyGuide, setShowSafetyGuide] = useState(true);

  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchData = async () => {
    try {
      const [devRes, contRes, listRes, campRes] = await Promise.all([
        authFetch('/whatsapp/devices'),
        authFetch('/contacts?limit=100'),
        authFetch('/contacts/lists'),
        authFetch('/broadcasts'),
      ]);

      if (devRes.ok && devRes.data.success) {
        setDevices(devRes.data.data.devices);
        const connected = devRes.data.data.devices.filter((d) => d.status === 'CONNECTED').map((d) => d.id);
        if (connected.length > 0 && selectedDeviceIds.length === 0) {
          setSelectedDeviceIds(connected);
        }
      }

      if (contRes.ok && contRes.data.success) {
        setContacts(contRes.data.data.contacts);
      }

      if (listRes.ok && listRes.data.success) {
        setLists(listRes.data.data.lists);
      }

      if (campRes.ok && campRes.data.success) {
        setCampaigns(campRes.data.data.campaigns);
        const running = campRes.data.data.campaigns.find((c) => c.status === 'RUNNING' || c.status === 'PAUSED');
        if (running && !activeCampaignId) {
          setActiveCampaignId(running.id);
        }
      }
    } catch (err) {
      console.error('Failed to load broadcast data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Live progress polling
  useEffect(() => {
    let interval = null;
    if (activeCampaignId) {
      const checkProgress = async () => {
        try {
          const { data, ok } = await authFetch(`/broadcasts/${activeCampaignId}/progress`);
          if (ok && data.success) {
            setActiveProgress(data.data);
            if (data.data.status === 'COMPLETED' || data.data.status === 'CANCELLED') {
              fetchData();
            }
          }
        } catch (e) {}
      };

      checkProgress();
      interval = setInterval(checkProgress, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCampaignId]);

  // Insert Variable
  const insertVariable = (varCode) => {
    setMessage((prev) => prev + ` {{${varCode}}}`);
  };

  // Insert Spintax
  const insertSpintax = () => {
    setMessage((prev) => `{Halo|Hai|Selamat Siang} ` + prev);
  };

  // Toggle Device Selection
  const toggleDevice = (devId) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(devId) ? prev.filter((id) => id !== devId) : [...prev, devId]
    );
  };

  // Handle Media File Upload (Image / PDF)
  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('adms_auth_token') || localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/media/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setMediaAttachment({
          fileUrl: json.data.fileUrl,
          mediaType: json.data.mediaType,
          fileName: json.data.fileName,
        });
        showToast(`Lampiran ${json.data.fileName} berhasil diunggah.`);
      } else {
        showToast(json.message || 'Gagal mengunggah file media.', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan unggah media.', 'error');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Handle Launch or Schedule Broadcast
  const handleLaunchBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Judul kampanye dan pesan wajib diisi.', 'error');
      return;
    }

    if (selectedDeviceIds.length === 0) {
      showToast('Pilih setidaknya 1 nomor WhatsApp pengirim yang terhubung.', 'error');
      return;
    }

    if (isScheduled && !scheduledDateTime) {
      showToast('Pilih tanggal dan jam pengiriman terjadwal.', 'error');
      return;
    }

    let manualRecipients = [];
    if (targetType === 'MANUAL') {
      const lines = manualText.split('\n');
      manualRecipients = lines
        .map((l) => {
          const parts = l.split(/[,;\t]/).map((p) => p.trim());
          if (parts.length >= 2) return { phone: parts[0], name: parts[1] };
          if (parts.length === 1 && parts[0]) return { phone: parts[0], name: 'Pelanggan' };
          return null;
        })
        .filter((r) => r && r.phone);

      if (manualRecipients.length === 0) {
        showToast('Tidak ada nomor manual yang valid.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const { data, ok } = await authFetch('/broadcasts', {
        method: 'POST',
        body: JSON.stringify({
          title,
          message,
          deviceIds: selectedDeviceIds,
          targetType,
          listId: targetType === 'LIST' ? selectedListId : undefined,
          manualRecipients,
          minDelay: parseInt(minDelay),
          maxDelay: parseInt(maxDelay),
          mediaUrl: mediaAttachment?.fileUrl || null,
          mediaType: mediaAttachment?.mediaType || null,
          fileName: mediaAttachment?.fileName || null,
          scheduledAt: isScheduled ? scheduledDateTime : null,
          autoStart: !isScheduled,
        }),
      });

      if (ok && data.success) {
        showToast(data.message || `Kampanye "${title}" berhasil diproses!`);
        if (!isScheduled) {
          setActiveCampaignId(data.data.campaign.id);
        }
        setActiveTab('history');
        fetchData();
      } else {
        showToast(data.message || 'Gagal memulai broadcast', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan pengiriman broadcast.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Control Actions
  const handlePause = async (id) => {
    const { data, ok } = await authFetch(`/broadcasts/${id}/pause`, { method: 'POST' });
    if (ok) showToast(data.message);
  };

  const handleResume = async (id) => {
    const { data, ok } = await authFetch(`/broadcasts/${id}/resume`, { method: 'POST' });
    if (ok) showToast(data.message);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Yakin ingin membatalkan pengiriman kampanye ini?')) return;
    const { data, ok } = await authFetch(`/broadcasts/${id}/cancel`, { method: 'POST' });
    if (ok) showToast(data.message);
  };

  // Open Log Details Modal
  const handleViewLogs = async (camp) => {
    setSelectedCampaignForLogs(camp);
    try {
      const { data, ok } = await authFetch(`/broadcasts/${camp.id}/logs?limit=100`);
      if (ok && data.success) {
        setCampaignLogs(data.data.logs);
        setShowLogsModal(true);
      }
    } catch (e) {}
  };

  // Live Simulated Preview Text
  const simulatedPreview = message
    .replace(/\{([^{}]+)\}/g, (match, p1) => p1.split('|')[0])
    .replace(/\{\{\s*name\s*\}\}/gi, 'Budi Santoso')
    .replace(/\{\{\s*phone\s*\}\}/gi, '081234567890');

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
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Broadcast & Pengiriman Massal
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-500 border border-amber-500/40">
              Media & Jadwal Otomatis
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kirim pesan promosi dengan gambar produk/PDF, jeda acak, Spintax, dan jadwal otomatis.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="p-1.5 bg-slate-200 dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-1 self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            + Buat Broadcast Baru
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Riwayat & Pelacak Live</span>
            {activeProgress?.status === 'RUNNING' && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {/* ANTI-BANNED SAFETY ALERT BANNER */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-5 shadow-sm text-slate-800 dark:text-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-bold shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <span>Panduan Keamanan Anti-Banned WhatsApp (Wajib Dibaca)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 font-bold uppercase tracking-wider">
                  Sangat Penting
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Patuhi 4 aturan emas berikut agar nomor pengirim WhatsApp Anda tetap aman dan terhindar dari blokir algoritma WhatsApp:
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSafetyGuide(!showSafetyGuide)}
            className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1 flex-shrink-0"
          >
            <span>{showSafetyGuide ? 'Sembunyikan' : 'Buka Panduan'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showSafetyGuide ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showSafetyGuide && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-amber-500/20 text-xs">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-amber-500/20 space-y-1">
              <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span>1. Jeda Acak (Random Delay)</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Gunakan rentang jeda <strong>5 – 15 detik</strong>. Jangan kirim ratusan pesan dalam 1 detik.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-amber-500/20 space-y-1">
              <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span>2. Gunakan Spintax & Nama</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Gunakan <code>{'{Halo|Hai}'}</code> dan <code>{'{{name}}'}</code> agar kombinasi kalimat tiap orang selalu berbeda.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-amber-500/20 space-y-1">
              <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span>3. Rotasi Multi-Nomor</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Centang 2-3 nomor pengirim sekaligus agar beban pengiriman terbagi rata (*Round-Robin*).
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-amber-500/20 space-y-1">
              <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span>4. Beri Opsi Berhenti (Opt-Out)</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Tulis di akhir pesan: <em>"Balas STOP jika tidak ingin menerima promo"</em> agar penerima tidak menekan tombol Report/Blokir.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: BUAT BROADCAST BARU */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleLaunchBroadcast} className="space-y-6">
              
              {/* STEP 1: Info & Nomor Pengirim */}
              <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs">
                    1
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Nama Kampanye & Nomor Pengirim
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Judul Kampanye
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Flash Sale Ramadhan Promo 2026"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Pilih Nomor Pengirim WhatsApp (Dukungan Rotasi Multi-Nomor)</span>
                    <span className="text-[10px] text-amber-500 font-semibold lowercase">
                      {selectedDeviceIds.length} dipilih
                    </span>
                  </label>
                  
                  {devices.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
                      Belum ada perangkat WhatsApp yang terhubung. Buka menu <strong>Perangkat WhatsApp</strong> untuk scan QR terlebih dahulu.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {devices.map((dev) => {
                        const isConnected = dev.status === 'CONNECTED';
                        const isSelected = selectedDeviceIds.includes(dev.id);

                        return (
                          <div
                            key={dev.id}
                            onClick={() => isConnected && toggleDevice(dev.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              !isConnected
                                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                                : isSelected
                                ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white shadow-sm'
                                : 'bg-slate-50 dark:bg-[#06152B] border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Smartphone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate">{dev.name}</p>
                                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                                  {dev.phoneNumber}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isConnected ? (
                                <div
                                  className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                                    isSelected
                                      ? 'bg-amber-500 border-amber-500 text-slate-950'
                                      : 'border-slate-300 dark:border-slate-600'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                              ) : (
                                <span className="text-[10px] text-red-500 font-bold">Offline</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 2: Target Audiens */}
              <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs">
                    2
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Pilih Target Penerima Pesan
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTargetType('ALL_CONTACTS')}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 text-center ${
                      targetType === 'ALL_CONTACTS'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                        : 'bg-slate-50 dark:bg-[#06152B] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400/50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Semua Kontak ({contacts.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('LIST')}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 text-center ${
                      targetType === 'LIST'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                        : 'bg-slate-50 dark:bg-[#06152B] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400/50'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Pilih Grup List ({lists.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('MANUAL')}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 text-center ${
                      targetType === 'MANUAL'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                        : 'bg-slate-50 dark:bg-[#06152B] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400/50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Input Manual / Paste</span>
                  </button>
                </div>

                {targetType === 'LIST' && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Pilih Grup Segmentasi Kontak
                    </label>
                    <select
                      value={selectedListId}
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="">-- Pilih Grup --</option>
                      {lists.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l._count?.contacts || 0} kontak)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {targetType === 'MANUAL' && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Tempel Nomor Penerima (Format: <code>08123456789, Nama</code> per baris)
                    </label>
                    <textarea
                      rows={4}
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      placeholder="081234567801, Budi Santoso&#10;081398765402, Siti Aisyah"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* STEP 3: Pesan, Lampiran Media & Spintax */}
              <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs">
                    3
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Penyusun Pesan WhatsApp, Media & Spintax
                  </h3>
                </div>

                {/* Variable & Spintax Quick Action Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 font-semibold">Sisipkan:</span>
                  <button
                    type="button"
                    onClick={() => insertVariable('name')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors"
                  >
                    + {'{{name}}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('phone')}
                    className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold transition-colors"
                  >
                    + {'{{phone}}'}
                  </button>
                  <button
                    type="button"
                    onClick={insertSpintax}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>+ Spintax {'{Halo|Hai}'}</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 leading-relaxed resize-none"
                />

                {/* MEDIA ATTACHMENT UPLOAD ZONE */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Lampiran Media (Foto Produk / Brosur / Dokumen PDF)
                  </label>

                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*, application/pdf"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />

                  {mediaAttachment ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                          {mediaAttachment.mediaType === 'image' ? <ImageIcon className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {mediaAttachment.fileName}
                          </p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                            {mediaAttachment.mediaType} Siap Terkirim
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMediaAttachment(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isUploadingMedia}
                      onClick={() => mediaInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isUploadingMedia ? (
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Paperclip className="w-4 h-4 text-amber-500" />
                          <span>Pilih Foto (JPG/PNG) atau Dokumen (PDF) untuk Dilampirkan</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* STEP 4: Kecepatan & Jadwal Pengiriman */}
              <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs">
                    4
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Kecepatan & Jadwal Pengiriman
                  </h3>
                </div>

                {/* Random Delay */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Jeda Minimum (Detik)
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={minDelay}
                      onChange={(e) => setMinDelay(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Jeda Maksimum (Detik)
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={120}
                      value={maxDelay}
                      onChange={(e) => setMaxDelay(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Scheduled Toggle */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span>Jadwalkan Pengiriman Otomatis (Scheduled)</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Atur jam dan tanggal tertentu. Server akan mengirimkan blast otomatis di waktu tersebut.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isScheduled}
                        onChange={(e) => setIsScheduled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {isScheduled && (
                    <div className="mt-3">
                      <input
                        type="datetime-local"
                        required={isScheduled}
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-amber-500 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || selectedDeviceIds.length === 0}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>
                      {isScheduled ? 'Jadwalkan Kampanye Broadcast' : 'Luncurkan Kampanye Broadcast Sekarang'}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Smartphone Simulator Preview (1 Col) */}
          <div className="space-y-4">
            <div className="sticky top-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-500" />
                <span>Simulasi Layar WhatsApp Penerima</span>
              </p>

              {/* Phone Frame */}
              <div className="w-full max-w-sm mx-auto bg-slate-900 border-4 border-slate-800 rounded-[40px] p-3 shadow-2xl overflow-hidden">
                <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-3"></div>

                {/* WhatsApp Chat UI Mockup */}
                <div className="bg-[#EFEAE2] dark:bg-[#0B141A] rounded-[28px] overflow-hidden min-h-[460px] flex flex-col justify-between border border-slate-700/50">
                  {/* Top Bar */}
                  <div className="bg-[#008069] dark:bg-[#202C33] px-3.5 py-2.5 flex items-center gap-2.5 text-white shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                      WA
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs truncate">ADMS Blast Official</p>
                      <p className="text-[10px] text-emerald-200 truncate">Online</p>
                    </div>
                  </div>

                  {/* Chat Message Bubble with Image/PDF preview */}
                  <div className="p-4 flex-1 flex flex-col justify-end">
                    <div className="bg-[#E7FFDB] dark:bg-[#005C4B] text-slate-900 dark:text-slate-100 p-3 rounded-2xl rounded-tr-none shadow-sm text-xs leading-relaxed max-w-[92%] self-end space-y-2">
                      
                      {/* Attached Image Preview */}
                      {mediaAttachment?.mediaType === 'image' && (
                        <div className="rounded-xl overflow-hidden border border-emerald-600/30">
                          <img
                            src={mediaAttachment.fileUrl}
                            alt="Media Preview"
                            className="w-full h-36 object-cover"
                          />
                        </div>
                      )}

                      {/* Attached PDF Preview */}
                      {mediaAttachment?.mediaType === 'document' && (
                        <div className="p-2.5 rounded-xl bg-white/60 dark:bg-black/30 border border-emerald-600/30 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[11px] truncate">{mediaAttachment.fileName}</p>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400">Dokumen PDF</p>
                          </div>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{simulatedPreview}</p>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-1">
                        <span>10:30</span>
                        <Check className="w-3 h-3 text-blue-500 stroke-[3]" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="p-2 bg-slate-100 dark:bg-[#202C33] border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-400 px-3">
                    <span>Ketik pesan...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT & PELACAK REAL-TIME */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Active Campaign Live Progress Tracker Banner */}
          {activeProgress && activeProgress.status !== 'COMPLETED' && activeProgress.status !== 'CANCELLED' && (
            <div className="bg-gradient-to-r from-[#0A2540] to-[#0E355B] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Proses Antrean Broadcast Sedang Berjalan</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {activeProgress.title}
                  </h2>
                </div>

                {/* Live Controls */}
                <div className="flex items-center gap-2">
                  {activeProgress.status === 'RUNNING' ? (
                    <button
                      onClick={() => handlePause(activeProgress.id)}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Jeda Sementara (Pause)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleResume(activeProgress.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Lanjutkan (Resume)</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCancel(activeProgress.id)}
                    className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Batalkan</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">
                    Terkirim: {activeProgress.sentCount} dari {activeProgress.totalTarget} kontak
                  </span>
                  <span className="text-amber-400 font-mono text-sm font-black">
                    {activeProgress.percentage}%
                  </span>
                </div>
                <div className="w-full h-3.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-300 rounded-full transition-all duration-500"
                    style={{ width: `${activeProgress.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-700/60 text-center text-xs">
                <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-700/40">
                  <p className="text-emerald-400 font-black text-lg font-mono">{activeProgress.sentCount}</p>
                  <p className="text-slate-400 text-[11px]">Berhasil Terkirim</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-700/40">
                  <p className="text-red-400 font-black text-lg font-mono">{activeProgress.failedCount}</p>
                  <p className="text-slate-400 text-[11px]">Gagal</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-700/40">
                  <p className="text-amber-400 font-black text-lg font-mono">{activeProgress.pendingCount}</p>
                  <p className="text-slate-400 text-[11px]">Antrean Sisa</p>
                </div>
              </div>
            </div>
          )}

          {/* Campaigns History Table */}
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Daftar Seluruh Kampanye Broadcast
              </h3>
              <button
                onClick={fetchData}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#06152B] border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Nama Kampanye</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Target / Terkirim</th>
                    <th className="py-3.5 px-4">Tingkat Sukses</th>
                    <th className="py-3.5 px-4">Jadwal / Tanggal</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                        Belum ada riwayat kampanye broadcast.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((camp) => {
                      const total = camp.totalTarget || camp._count?.logs || 0;
                      const percent = total > 0 ? Math.round((camp.sentCount / total) * 100) : 0;
                      const isRunning = camp.status === 'RUNNING';

                      return (
                        <tr key={camp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-900 dark:text-white">{camp.title}</p>
                            <p className="text-xs text-slate-400 truncate max-w-xs">{camp.message}</p>
                          </td>

                          <td className="py-4 px-4">
                            {isRunning ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Sedang Mengirim
                              </span>
                            ) : camp.status === 'SCHEDULED' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                                <Calendar className="w-3.5 h-3.5" />
                                Terjadwal
                              </span>
                            ) : camp.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Selesai
                              </span>
                            ) : camp.status === 'PAUSED' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                                <Pause className="w-3.5 h-3.5" />
                                Dijeda
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                                {camp.status}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                            <strong>{camp.sentCount}</strong> / {total}
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-xs font-bold">{percent}%</span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-xs text-slate-400">
                            {camp.scheduledAt
                              ? new Date(camp.scheduledAt).toLocaleString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : new Date(camp.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleViewLogs(camp)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              Lihat Rincian
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Detail Log Pengiriman Kampanye */}
      {showLogsModal && selectedCampaignForLogs && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl animate-scaleUp max-h-[85vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Rincian Log Penerima
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kampanye: <strong>{selectedCampaignForLogs.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto my-4 space-y-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#06152B] border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="py-2.5 px-3">Penerima</th>
                    <th className="py-2.5 px-3">Nomor WA</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Waktu Kirim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {campaignLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {log.name || 'Pelanggan'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                        +{log.recipient}
                      </td>
                      <td className="py-2.5 px-3">
                        {log.status === 'SENT' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                            Terkirim
                          </span>
                        ) : log.status === 'FAILED' ? (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-[10px]" title={log.errorReason}>
                            Gagal
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 font-bold text-[10px]">
                            Dalam Antrean
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {log.sentAt ? new Date(log.sentAt).toLocaleTimeString('id-ID') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
