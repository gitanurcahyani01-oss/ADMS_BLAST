import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bot,
  Plus,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  HelpCircle,
  Tag,
  Paperclip,
  Image as ImageIcon,
  Smartphone,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export default function AutoReply() {
  const { authFetch } = useAuth();
  const [rules, setRules] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Form
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formKeyword, setFormKeyword] = useState('');
  const [formMatchType, setFormMatchType] = useState('CONTAINS'); // EXACT, CONTAINS, STARTS_WITH, DEFAULT
  const [formResponse, setFormResponse] = useState('');
  const [formDeviceId, setFormDeviceId] = useState('');
  const [formMedia, setFormMedia] = useState(null); // { fileUrl, mediaType, fileName }
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const mediaInputRef = useRef(null);

  // Safety Guide State
  const [showSafetyGuide, setShowSafetyGuide] = useState(true);

  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchData = async () => {
    try {
      const [ruleRes, devRes] = await Promise.all([
        authFetch('/auto-reply'),
        authFetch('/whatsapp/devices'),
      ]);

      if (ruleRes.ok && ruleRes.data.success) {
        setRules(ruleRes.data.data.rules);
      }

      if (devRes.ok && devRes.data.success) {
        setDevices(devRes.data.data.devices);
      }
    } catch (err) {
      console.error('Failed to load auto-reply data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Media Upload
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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setFormMedia({
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

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingRule(null);
    setFormKeyword('');
    setFormMatchType('CONTAINS');
    setFormResponse('{Halo|Hai} Kak {{name}},\n\nTerima kasih sudah menghubungi kami. Berikut adalah informasi yang Anda butuhkan:\n\nKatalog lengkap: https://toko.com/katalog\n\nAda yang bisa kami bantu kembali?');
    setFormDeviceId('');
    setFormMedia(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setFormKeyword(rule.keyword);
    setFormMatchType(rule.matchType);
    setFormResponse(rule.responseMessage);
    setFormDeviceId(rule.deviceId || '');
    setFormMedia(rule.mediaUrl ? { fileUrl: rule.mediaUrl, mediaType: rule.mediaType, fileName: rule.fileName } : null);
    setShowModal(true);
  };

  // Save Rule (Create or Update)
  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (formMatchType !== 'DEFAULT' && !formKeyword.trim()) {
      showToast('Kata kunci pemicu wajib diisi.', 'error');
      return;
    }
    if (!formResponse.trim()) {
      showToast('Pesan balasan bot tidak boleh kosong.', 'error');
      return;
    }

    try {
      const payload = {
        keyword: formMatchType === 'DEFAULT' ? 'DEFAULT_FALLBACK' : formKeyword.trim(),
        matchType: formMatchType,
        responseMessage: formResponse,
        deviceId: formDeviceId || null,
        mediaUrl: formMedia?.fileUrl || null,
        mediaType: formMedia?.mediaType || null,
        fileName: formMedia?.fileName || null,
      };

      let url = '/auto-reply';
      let method = 'POST';

      if (editingRule) {
        url = `/auto-reply/${editingRule.id}`;
        method = 'PUT';
      }

      const { data, ok } = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (ok && data.success) {
        showToast(editingRule ? 'Aturan bot berhasil diperbarui.' : 'Aturan bot baru berhasil disimpan.');
        setShowModal(false);
        fetchData();
      } else {
        showToast(data.message || 'Gagal menyimpan aturan bot.', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (rule) => {
    try {
      const { data, ok } = await authFetch(`/auto-reply/${rule.id}/toggle`, {
        method: 'PATCH',
      });

      if (ok && data.success) {
        showToast(`Aturan "${rule.keyword}" ${data.data.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
        fetchData();
      } else {
        showToast('Gagal mengubah status aturan.', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  // Delete Rule
  const handleDeleteRule = async (rule) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus aturan auto-reply "${rule.keyword}"?`)) {
      return;
    }

    try {
      const { data, ok } = await authFetch(`/auto-reply/${rule.id}`, {
        method: 'DELETE',
      });

      if (ok && data.success) {
        showToast(`Aturan "${rule.keyword}" berhasil dihapus.`);
        fetchData();
      } else {
        showToast('Gagal menghapus aturan.', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Auto-Reply Chatbot 24/7
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/40">
              Otomasi Respon Cepat
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Balas pesan pelanggan secara otomatis tanpa henti berdasarkan kata kunci (*keywords*) atau fallback umum.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aturan Bot</span>
          </button>
        </div>
      </div>

      {/* SAFETY & ANTI-BAN GUIDELINES FOR CHATBOT */}
      <div className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/30 rounded-3xl p-5 shadow-sm text-slate-800 dark:text-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <span>Tips Keamanan Chatbot WhatsApp (*Anti-Spam AI Guide*)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 font-bold uppercase tracking-wider">
                  Rekomendasi
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Chatbot merespon pesan yang diinisiasi oleh pelanggan, sehingga jauh lebih aman. Namun, terapkan praktik terbaik ini:
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSafetyGuide(!showSafetyGuide)}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 flex-shrink-0"
          >
            <span>{showSafetyGuide ? 'Sembunyikan' : 'Lihat Tips'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSafetyGuide ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showSafetyGuide && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-purple-500/20 text-xs">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-purple-500/20 space-y-1">
              <p className="font-bold text-purple-600 dark:text-purple-400">
                1. Gunakan Variasi Spintax
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Tulis salam pembuka dengan <code>{'{Halo|Hai|Selamat datang}'}</code> agar balasan otomatis tidak terdeteksi identik oleh bot WhatsApp.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-purple-500/20 space-y-1">
              <p className="font-bold text-purple-600 dark:text-purple-400">
                2. Hindari Link Pendek Mencurigakan
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Gunakan link domain resmi website Anda langsung, hindari pemendek link gratisan (*bit.ly/tinyurl*) yang sering diblokir WhatsApp.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-purple-500/20 space-y-1">
              <p className="font-bold text-purple-600 dark:text-purple-400">
                3. Tambahkan Nama Pelanggan
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Gunakan tag <code>{'{{name}}'}</code> agar sapaan terasa lebih personal dan akrab seperti CS manusia.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Rules Table (Full Width Professional View) */}
      <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Daftar Aturan Balasan Otomatis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total {rules.length} aturan aktif dan siap menjawab pesan masuk pelanggan
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
            title="Segarkan Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#06152B] border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Kata Kunci (Trigger)</th>
                <th className="py-3.5 px-4">Jenis Pencocokan</th>
                <th className="py-3.5 px-4">Pesan Balasan</th>
                <th className="py-3.5 px-4">Gateway Perangkat</th>
                <th className="py-3.5 px-4 text-center">Terpicu</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-sm">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-400" />
                    <p className="font-bold text-base text-slate-700 dark:text-slate-300">Belum ada aturan auto-reply</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Klik tombol <strong>"Tambah Aturan Bot"</strong> di atas untuk membuat respon otomatis cerdas bagi pelanggan Anda.
                    </p>
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white font-mono text-xs">
                      {rule.matchType === 'DEFAULT' ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold">
                          Semua Pesan Masuk (Default)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 font-bold">
                          "{rule.keyword}"
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {rule.matchType === 'EXACT'
                          ? 'Persis Sama'
                          : rule.matchType === 'CONTAINS'
                          ? 'Mengandung Kata'
                          : rule.matchType === 'STARTS_WITH'
                          ? 'Awalan Kata'
                          : 'Fallback Umum'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {rule.mediaUrl && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 mr-1.5 inline-flex items-center gap-0.5">
                          <Paperclip className="w-3 h-3" />
                          [Media]
                        </span>
                      )}
                      <span>{rule.responseMessage}</span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {rule.device?.name || 'Semua Perangkat'}
                    </td>

                    <td className="py-4 px-4 text-center font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                      {rule.triggerCount}x
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className="cursor-pointer inline-flex items-center gap-1.5"
                        title={rule.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                      >
                        {rule.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-xs">
                            <ToggleRight className="w-6 h-6" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-xs">
                            <ToggleLeft className="w-6 h-6" />
                            <span>Nonaktif</span>
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="p-2 rounded-xl text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Aturan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Hapus Aturan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah / Edit Aturan Auto-Reply */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-scaleUp max-h-[90vh] flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingRule ? 'Edit Aturan Auto-Reply' : 'Tambah Aturan Auto-Reply'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Atur pemicu pesan dan respon bot otomatis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 my-4 overflow-y-auto pr-1">
              {/* Match Type */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Jenis Pencocokan Pesan Masuk
                </label>
                <select
                  value={formMatchType}
                  onChange={(e) => setFormMatchType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="CONTAINS">Mengandung Kata Kunci (CONTAINS) — Rekomendasi</option>
                  <option value="EXACT">Sama Persis Kata (EXACT MATCH)</option>
                  <option value="STARTS_WITH">Diawali dengan Kata (STARTS WITH)</option>
                  <option value="DEFAULT">Default Fallback (Semua Pesan yang Tidak Cocok)</option>
                </select>
              </div>

              {/* Keyword (Hidden if DEFAULT) */}
              {formMatchType !== 'DEFAULT' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Kata Kunci Pemicu (*Keyword*)
                  </label>
                  <input
                    type="text"
                    required
                    value={formKeyword}
                    onChange={(e) => setFormKeyword(e.target.value)}
                    placeholder="Contoh: info harga, promo, jadwal"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              {/* Specific Device */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Berlaku Untuk Perangkat
                </label>
                <select
                  value={formDeviceId}
                  onChange={(e) => setFormDeviceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Semua Perangkat WhatsApp Terhubung</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phoneNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Response Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Pesan Balasan Bot
                  </label>
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                    Dukung Spintax & {'{{name}}'}
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={formResponse}
                  onChange={(e) => setFormResponse(e.target.value)}
                  placeholder="Ketik balasan otomatis di sini..."
                  className="w-full p-3 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              {/* Media Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Lampiran Media (Foto Produk / Brosur PDF)
                </label>
                <input
                  type="file"
                  ref={mediaInputRef}
                  onChange={handleMediaUpload}
                  accept="image/*,.pdf,.docx,.xlsx"
                  className="hidden"
                />

                {formMedia ? (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-300">
                      <Paperclip className="w-4 h-4" />
                      <span className="truncate max-w-[220px]">{formMedia.fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormMedia(null)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => mediaInputRef.current?.click()}
                    disabled={isUploadingMedia}
                    className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-purple-500" />
                    <span>{isUploadingMedia ? 'Mengunggah...' : 'Unggah Gambar atau PDF'}</span>
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  {editingRule ? 'Simpan Perubahan' : 'Buat Aturan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
