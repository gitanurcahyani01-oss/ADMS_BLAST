import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Search,
  Filter,
  Trash2,
  Tag,
  Plus,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Mail,
  FolderPlus,
  Layers,
  Sparkles,
  Download,
  Upload,
  FileText,
  FileCheck,
  ArrowRight,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

export default function Contacts() {
  const { authFetch } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedList, setSelectedList] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);

  // Single Add Form
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    tags: '',
    listId: '',
  });

  const [newList, setNewList] = useState({ name: '', description: '' });

  // Import Modal State
  const [importMode, setImportMode] = useState('file'); // 'file' or 'paste'
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [fileColumns, setFileColumns] = useState([]);
  const [columnMap, setColumnMap] = useState({ name: '', phone: '', email: '', tags: '' });
  const [importListName, setImportListName] = useState('');
  const [defaultTags, setDefaultTags] = useState('Pelanggan');
  const [pasteText, setPasteText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchContacts = async () => {
    try {
      let url = '/contacts?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (selectedList) url += `listId=${selectedList}&`;

      const { data, ok } = await authFetch(url);
      if (ok && data.success) {
        setContacts(data.data.contacts);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLists = async () => {
    try {
      const { data, ok } = await authFetch('/contacts/lists');
      if (ok && data.success) {
        setLists(data.data.lists);
      }
    } catch (err) {
      console.error('Failed to load lists:', err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, selectedList]);

  useEffect(() => {
    fetchLists();
  }, []);

  // 1. Handle File Upload & Parsing (.xlsx, .xls, .csv)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!rawData || rawData.length === 0) {
          showToast('File Excel/CSV kosong.', 'error');
          return;
        }

        const headers = (rawData[0] || []).map((h) => String(h).trim());
        setFileColumns(headers);

        // Auto-detect columns
        let nameCol = headers.find((h) => /nama|name|customer|nama_pelanggan/i.test(h)) || '';
        let phoneCol = headers.find((h) => /no|hp|wa|phone|telepon|whatsapp|nomor/i.test(h)) || '';
        let emailCol = headers.find((h) => /email|surel/i.test(h)) || '';
        let tagsCol = headers.find((h) => /tag|kategori|label/i.test(h)) || '';

        // Default fallbacks if not matched
        if (!phoneCol && headers.length > 0) phoneCol = headers[1] || headers[0];
        if (!nameCol && headers.length > 0) nameCol = headers[0];

        setColumnMap({ name: nameCol, phone: phoneCol, email: emailCol, tags: tagsCol });

        // Convert data rows to object array
        const rows = rawData.slice(1).map((row) => {
          const rowObj = {};
          headers.forEach((h, idx) => {
            rowObj[h] = row[idx] !== undefined ? String(row[idx]).trim() : '';
          });
          return rowObj;
        }).filter((r) => Object.values(r).some((v) => v !== ''));

        setParsedRows(rows);
      } catch (err) {
        console.error('Error parsing file:', err);
        showToast('Gagal membaca file Excel/CSV. Pastikan format file valid.', 'error');
      }
    };

    reader.readAsBinaryString(file);
  };

  // 2. Download Sample Excel Template (.xlsx)
  const handleDownloadTemplate = () => {
    const templateData = [
      { 'Nama Pelanggan': 'Ahmad Dahlan', 'Nomor WhatsApp': '081234567801', 'Email': 'ahmad@gmail.com', 'Tag': 'VIP, Jabodetabek' },
      { 'Nama Pelanggan': 'Siti Aisyah', 'Nomor WhatsApp': '081398765402', 'Email': 'siti@gmail.com', 'Tag': 'Repeat Order' },
      { 'Nama Pelanggan': 'Rudi Hartono', 'Nomor WhatsApp': '081511223303', 'Email': 'rudi@gmail.com', 'Tag': 'Promo' },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Kontak');
    XLSX.writeFile(wb, 'template_kontak_adms_blast.xlsx');
  };

  // 3. Process Import (File or Paste)
  const handleSubmitImport = async (e) => {
    e.preventDefault();
    setIsImporting(true);

    try {
      let finalContacts = [];

      if (importMode === 'file') {
        if (!parsedRows || parsedRows.length === 0) {
          showToast('Tidak ada baris data yang ditemukan dalam file.', 'error');
          setIsImporting(false);
          return;
        }

        finalContacts = parsedRows.map((row) => ({
          name: row[columnMap.name] || 'Pelanggan',
          phone: row[columnMap.phone] || '',
          email: row[columnMap.email] || '',
          tags: row[columnMap.tags] ? row[columnMap.tags].split(',').map((t) => t.trim()) : [defaultTags],
        })).filter((c) => c.phone);
      } else {
        // Paste mode
        const lines = pasteText.split('\n');
        finalContacts = lines
          .map((line) => {
            const parts = line.split(/[,;\t]/).map((p) => p.trim());
            if (parts.length >= 2) {
              const isFirstPhone = /^[0-9+]+$/.test(parts[0].replace(/[\s-]/g, ''));
              return {
                phone: isFirstPhone ? parts[0] : parts[1],
                name: isFirstPhone ? parts[1] : parts[0],
                tags: [defaultTags],
              };
            } else if (parts.length === 1 && parts[0]) {
              return { phone: parts[0], name: `Pelanggan ${parts[0].slice(-4)}`, tags: [defaultTags] };
            }
            return null;
          })
          .filter((c) => c && c.phone);
      }

      if (finalContacts.length === 0) {
        showToast('Tidak ada nomor telepon yang valid untuk diimport.', 'error');
        setIsImporting(false);
        return;
      }

      const { data, ok } = await authFetch('/contacts/import', {
        method: 'POST',
        body: JSON.stringify({
          contacts: finalContacts,
          listName: importListName || undefined,
        }),
      });

      if (ok && data.success) {
        showToast(data.message || `Berhasil mengimpor ${finalContacts.length} kontak!`);
        setShowImportModal(false);
        setSelectedFile(null);
        setParsedRows([]);
        setPasteText('');
        setImportListName('');
        fetchContacts();
        fetchLists();
      } else {
        showToast(data.message || 'Gagal import data kontak', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan proses import.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // 4. Add Single Contact
  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = newContact.tags
        ? newContact.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const { data, ok } = await authFetch('/contacts', {
        method: 'POST',
        body: JSON.stringify({
          name: newContact.name,
          phone: newContact.phone,
          email: newContact.email,
          tags: tagsArray,
          listId: newContact.listId || undefined,
        }),
      });

      if (ok && data.success) {
        showToast(`Kontak ${newContact.name} berhasil disimpan.`);
        setShowAddModal(false);
        setNewContact({ name: '', phone: '', email: '', tags: '', listId: '' });
        fetchContacts();
        fetchLists();
      } else {
        showToast(data.message || 'Gagal menambahkan kontak', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  // 5. Create List
  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      const { data, ok } = await authFetch('/contacts/lists', {
        method: 'POST',
        body: JSON.stringify(newList),
      });

      if (ok && data.success) {
        showToast(`Grup kontak ${newList.name} berhasil dibuat.`);
        setShowListModal(false);
        setNewList({ name: '', description: '' });
        fetchLists();
      } else {
        showToast(data.message || 'Gagal membuat grup kontak', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  // 6. Delete Contact
  const handleDeleteContact = async (contact) => {
    if (!window.confirm(`Hapus kontak "${contact.name}" (${contact.phone})?`)) return;

    try {
      const { data, ok } = await authFetch(`/contacts/${contact.id}`, {
        method: 'DELETE',
      });

      if (ok && data.success) {
        showToast(`Kontak ${contact.name} berhasil dihapus.`);
        fetchContacts();
      } else {
        showToast(data.message || 'Gagal menghapus kontak', 'error');
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
              Manajemen Kontak & Audiens
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-500 border border-amber-500/40">
              {contacts.length} Kontak
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simpan data pelanggan, upload file Excel/CSV, dan kelompokkan ke dalam grup target broadcast.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
            title="Download Template Excel Kosong"
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>Unduh Template Excel</span>
          </button>

          <button
            onClick={() => setShowListModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
          >
            <FolderPlus className="w-4 h-4 text-blue-500" />
            <span>Buat Grup List</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Upload File Excel / CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* AUDIENCE QUALITY & ANTI-BANNED SAFETY BANNER */}
      <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 rounded-3xl p-5 shadow-sm text-slate-800 dark:text-slate-200">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-md">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <span>Tips Kualitas Database Kontak (Penting untuk Menghindari Report/Blokir)</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              80% penyebab nomor di-banned adalah karena penerima menekan tombol <strong>"Laporkan Spam / Blokir"</strong>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-blue-500/20 text-xs">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-blue-500/20 space-y-1">
            <p className="font-bold text-blue-600 dark:text-blue-400">
              1. Gunakan Kontak yang Relevan
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Utamakan kirim ke pelanggan yang pernah bertransaksi atau mengenal brand Anda sebelumnya.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-blue-500/20 space-y-1">
            <p className="font-bold text-blue-600 dark:text-blue-400">
              2. Hindari Beli Database Bodong
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Database acak dari internet memiliki persentase nomor mati tinggi dan pasti menghasilkan banyak report spam.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-blue-500/20 space-y-1">
            <p className="font-bold text-blue-600 dark:text-blue-400">
              3. Kelompokkan dengan Grup List
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Bagi kontak Anda ke beberapa Grup List (misal: Pelanggan VIP, Leads Baru) agar pesan promo lebih tepat sasaran.
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, nomor WhatsApp, atau email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">Semua Grup List ({lists.length})</option>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l._count?.contacts || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white dark:bg-[#0A2540] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#06152B] border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Nama Pelanggan</th>
                <th className="py-3.5 px-4">Nomor WhatsApp</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Tag / Label</th>
                <th className="py-3.5 px-4">Grup List</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-600 dark:text-slate-300">Belum ada kontak tersimpan</p>
                    <p className="text-xs text-slate-400 mt-0.5">Klik tombol "Upload File Excel / CSV" untuk memasukkan ribuan kontak sekaligus.</p>
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {c.name}
                    </td>
                    <td className="py-4 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                      +{c.phone}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {c.email || '-'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {c.tags && c.tags.length > 0 ? (
                          c.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {c.listMembers && c.listMembers.length > 0 ? (
                          c.listMembers.map((lm, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20"
                            >
                              {lm.list?.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteContact(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Hapus Kontak"
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

      {/* MODAL: Upload File Excel / CSV / Copy-Paste */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl animate-scaleUp max-h-[90vh] flex flex-col justify-between overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Import Kontak dari Excel & CSV
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload file spreadsheet atau tempel data langsung
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setParsedRows([]);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
              
              {/* Import Mode Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-[#06152B] rounded-xl">
                <button
                  type="button"
                  onClick={() => setImportMode('file')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    importMode === 'file'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Upload File Excel (.xlsx / .csv)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('paste')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    importMode === 'paste'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Copy-Paste Teks Cepat</span>
                </button>
              </div>

              {/* TAB 1: FILE UPLOAD DRAG & DROP */}
              {importMode === 'file' && (
                <div className="space-y-4">
                  {/* File Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-[#06152B]/50 transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 flex items-center justify-center mx-auto mb-3 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>

                    {selectedFile ? (
                      <div>
                        <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                          <FileCheck className="w-4 h-4" />
                          <span>{selectedFile.name}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {(selectedFile.size / 1024).toFixed(1)} KB • {parsedRows.length} baris terdeteksi
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          Klik untuk memilih file Excel atau drag & drop di sini
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Mendukung format <strong>.xlsx, .xls, .csv</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Column Mapping Selectors (If file loaded) */}
                  {fileColumns.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-800 space-y-3">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <ArrowRight className="w-4 h-4 text-emerald-500" />
                        <span>Pemetaan Kolom Spreadsheet:</span>
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            Kolom Nama Pelanggan
                          </label>
                          <select
                            value={columnMap.name}
                            onChange={(e) => setColumnMap({ ...columnMap, name: e.target.value })}
                            className="w-full p-2 bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none"
                          >
                            <option value="">-- Lewati / Otomatis --</option>
                            {fileColumns.map((col) => (
                              <option key={col} value={col}>
                                {col}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            Kolom Nomor WhatsApp *
                          </label>
                          <select
                            value={columnMap.phone}
                            onChange={(e) => setColumnMap({ ...columnMap, phone: e.target.value })}
                            className="w-full p-2 bg-white dark:bg-[#0A2540] border border-emerald-500 dark:border-emerald-500 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none"
                          >
                            {fileColumns.map((col) => (
                              <option key={col} value={col}>
                                {col}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Parsed Rows Preview Table */}
                  {parsedRows.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-400">
                          Pratinjau Data ({parsedRows.length} kontak):
                        </span>
                        <span className="text-emerald-500">5 baris pertama</span>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 dark:bg-[#06152B] text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="py-2 px-3">Nama</th>
                              <th className="py-2 px-3">Nomor WA</th>
                              <th className="py-2 px-3">Email</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {parsedRows.slice(0, 5).map((r, i) => (
                              <tr key={i}>
                                <td className="py-2 px-3 font-semibold">{r[columnMap.name] || '-'}</td>
                                <td className="py-2 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                                  {r[columnMap.phone] || '-'}
                                </td>
                                <td className="py-2 px-3 text-slate-400">{r[columnMap.email] || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: COPY PASTE TEXT */}
              {importMode === 'paste' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Tempel / Paste Data (Format: <code>08123456789, Budi Santoso</code> per baris)
                  </label>
                  <textarea
                    rows={6}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={`081234567801, Ahmad Dahlan\n081398765402, Siti Aisyah\n081511223303, Rudi Hartono`}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              )}

              {/* Extra Settings: Grup List & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Simpan ke Grup List Baru (Opsional)
                  </label>
                  <input
                    type="text"
                    value={importListName}
                    onChange={(e) => setImportListName(e.target.value)}
                    placeholder="Contoh: Database Excel Promo Ramadhan"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Beri Tag Otomatis
                  </label>
                  <input
                    type="text"
                    value={defaultTags}
                    onChange={(e) => setDefaultTags(e.target.value)}
                    placeholder="Contoh: ImportExcel, Leads"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setParsedRows([]);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitImport}
                disabled={isImporting || (importMode === 'file' && parsedRows.length === 0)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isImporting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {importMode === 'file' && parsedRows.length > 0
                        ? `Import ${parsedRows.length} Kontak Excel`
                        : 'Mulai Import Kontak'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Kontak Manual */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Tambah Kontak Baru
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Nama Kontak
                </label>
                <input
                  type="text"
                  required
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Nomor WhatsApp (Otomatis format +62)
                </label>
                <input
                  type="text"
                  required
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="budi@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Tag / Label (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={newContact.tags}
                  onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                  placeholder="VIP, Repeat Order, Jabodetabek"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Grup List Kontak (Opsional)
                </label>
                <select
                  value={newContact.listId}
                  onChange={(e) => setNewContact({ ...newContact, listId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Tanpa Grup --</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex gap-3">
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
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Buat Grup List Baru */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Buat Grup List Baru
                </h3>
              </div>
              <button
                onClick={() => setShowListModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateList} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Nama Grup List
                </label>
                <input
                  type="text"
                  required
                  value={newList.name}
                  onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                  placeholder="Contoh: Pelanggan VIP Gold"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Deskripsi (Opsional)
                </label>
                <input
                  type="text"
                  value={newList.description}
                  onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                  placeholder="Pelanggan dengan total transaksi > 1 juta"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06152B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowListModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  Simpan Grup List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
