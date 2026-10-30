import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Select } from '../components/common/Select';
import { 
  Hash, 
  Search, 
  Plus, 
  Ban, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';

export function Letters() {
  const { user } = useAuth();
  const [letters, setLetters] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClassification, setSelectedClassification] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestClassificationId, setRequestClassificationId] = useState('');
  const [requestSubject, setRequestSubject] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [newlyCreatedLetter, setNewlyCreatedLetter] = useState(null);

  // Void Modal State
  const [voidModalLetter, setVoidModalLetter] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidLoading, setVoidLoading] = useState(false);

  const fetchClassifications = async () => {
    try {
      const data = await api.get('/letters/classifications');
      setClassifications(data);
      if (data.length > 0 && !requestClassificationId) {
        setRequestClassificationId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLetters = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (search) params.append('search', search);
      if (selectedClassification) params.append('classification_id', selectedClassification);
      if (selectedStatus) params.append('status', selectedStatus);

      const res = await api.get(`/letters?${params.toString()}`);
      setLetters(res.data);
      setPagination({
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassifications();
    fetchLetters(1);
  }, [search, selectedClassification, selectedStatus]);

  const handleRequestNumber = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
      const res = await api.post('/letters/request', {
        classification_id: requestClassificationId,
        subject: requestSubject,
      });
      setNewlyCreatedLetter(res.data);
      setRequestSubject('');
      fetchLetters(1);
    } catch (err) {
      alert(err.message || 'Gagal mencadangkan nomor surat.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleVoidNumber = async () => {
    if (!voidModalLetter || !voidReason) return;
    setVoidLoading(true);
    try {
      await api.post(`/letters/${voidModalLetter.id}/void`, {
        reason: voidReason,
      });
      setVoidModalLetter(null);
      setVoidReason('');
      fetchLetters(pagination.current_page);
    } catch (err) {
      alert(err.message || 'Gagal membatalkan nomor surat.');
    } finally {
      setVoidLoading(false);
    }
  };

  const exportToCSV = () => {
    if (letters.length === 0) return;
    const headers = ['Nomor Surat', 'Perihal', 'Klasifikasi', 'Pemohon', 'Status', 'Tanggal'];
    const rows = letters.map((l) => [
      l.full_number,
      `"${l.subject.replace(/"/g, '""')}"`,
      l.classification?.code,
      l.requester?.name,
      l.status,
      l.created_at,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Register_Nomor_Surat_YSBH_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pageActions = (
    <>
      <Button variant="tertiary" size="md" onClick={exportToCSV}>
        <Download className="w-4 h-4 mr-1.5" /> Ekspor CSV
      </Button>
      <Button variant="primary" size="md" onClick={() => { setNewlyCreatedLetter(null); setRequestModalOpen(true); }}>
        <Plus className="w-4 h-4 mr-1.5" /> Minta Nomor Baru
      </Button>
    </>
  );

  return (
    <AppLayout 
      pageTitle="Register Nomor Surat Terpusat" 
      pageSubtitle="Penomoran otomatis terpadu bebas duplikat dengan mekanisme pencadangan atomik per divisi dan tahun."
      pageActions={pageActions}
      breadcrumbs={['Nomor Surat']}
    >

      {/* Filter and Search Bar */}
      <Card className="mb-6" padding="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#586862] dark:text-[#8FA89B]" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Cari nomor atau perihal surat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
            />
          </div>

          <div>
            <Select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              placeholder="Semua Klasifikasi (Kode)"
              options={[
                { value: '', label: 'Semua Klasifikasi (Kode)' },
                ...classifications.map((c) => ({
                  value: c.id,
                  badge: c.code,
                  label: `${c.code} — ${c.name}`,
                })),
              ]}
            />
          </div>

          <div>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              placeholder="Semua Status"
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'reserved', label: 'Dicadangkan (Reserved)' },
                { value: 'issued', label: 'Terbit (Issued)' },
                { value: 'void', label: 'Batal (Void)' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Letter Numbers Table */}
      <Card padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7FAF8] dark:bg-[#192821] text-[#586862] dark:text-[#8FA89B] text-xs uppercase font-semibold border-b border-[#E3EAE5] dark:border-[#22332A]">
              <tr>
                <th className="px-5 py-3.5">Nomor Surat</th>
                <th className="px-5 py-3.5">Perihal & Klasifikasi</th>
                <th className="px-5 py-3.5">Pemohon</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Tanggal Reservasi</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE5] dark:divide-[#22332A]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#586862] dark:text-[#8FA89B]">
                    Memuat data register nomor surat...
                  </td>
                </tr>
              ) : letters.length > 0 ? (
                letters.map((l) => (
                  <tr key={l.id} className="hover:bg-[#F0FDF4] dark:hover:bg-[#192821]/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-sm text-[#15803D] dark:text-[#4ADE80]">
                        {l.full_number}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-xs sm:text-sm text-[#14201A] dark:text-white">{l.subject}</p>
                      <p className="text-xs text-[#586862] dark:text-[#8FA89B]">
                        Kode: <span className="font-mono">{l.classification?.code}</span> ({l.classification?.name})
                      </p>
                      {l.status === 'void' && (
                        <p className="text-xs text-[#DC2626] dark:text-[#F87171] mt-0.5 italic">
                          Alasan batal: {l.void_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-[#14201A] dark:text-[#EDF7F1]">
                      {l.requester?.name}
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={l.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-[#586862] dark:text-[#8FA89B] font-mono">
                      {new Date(l.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {l.status === 'reserved' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#DC2626] dark:text-[#F87171] hover:bg-[#FEE2E2] dark:hover:bg-[#DC2626]/20"
                          onClick={() => { setVoidReason(''); setVoidModalLetter(l); }}
                        >
                          <Ban className="w-3.5 h-3.5 mr-1" /> Batalkan
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#586862] dark:text-[#8FA89B]">
                    <Hash className="w-8 h-8 text-[#586862] dark:text-[#8FA89B] mx-auto mb-2 opacity-50" strokeWidth={1.75} />
                    <p className="font-semibold text-sm text-[#14201A] dark:text-white">Belum ada nomor surat tercatat</p>
                    <p className="text-xs mt-1">Gunakan tombol &quot;Minta Nomor Baru&quot; untuk mencadangkan nomor pertama.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.total > 0 && (
          <div className="px-5 py-3.5 bg-[#F7FAF8] dark:bg-[#192821] border-t border-[#E3EAE5] dark:border-[#22332A] flex items-center justify-between text-xs text-[#586862] dark:text-[#8FA89B]">
            <span>
              Menampilkan {letters.length} dari {pagination.total} nomor terdaftar
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="tertiary"
                disabled={pagination.current_page <= 1}
                onClick={() => fetchLetters(pagination.current_page - 1)}
              >
                Sebelumnya
              </Button>
              <span className="px-3 py-1 font-semibold text-[#14201A] dark:text-white">
                {pagination.current_page} / {pagination.last_page}
              </span>
              <Button
                size="sm"
                variant="tertiary"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => fetchLetters(pagination.current_page + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Minta Nomor Baru (FR-NOM-01 & 04) */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Minta Nomor Surat Otomatis"
        subtitle="Nomor akan langsung dicadangkan secara atomik dan terdaftar di buku register"
      >
        {newlyCreatedLetter ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-[#586862] dark:text-[#8FA89B] uppercase tracking-wider font-semibold">
                Nomor Surat Anda Berhasil Dicadangkan
              </p>
              <p className="text-2xl font-mono font-bold text-[#15803D] dark:text-[#4ADE80] mt-1 select-all">
                {newlyCreatedLetter.full_number}
              </p>
              <p className="text-xs text-[#14201A] dark:text-white mt-2 font-medium">
                Perihal: {newlyCreatedLetter.subject}
              </p>
            </div>
            <p className="text-xs text-[#586862] dark:text-[#8FA89B] bg-[#F7FAF8] dark:bg-[#192821] p-3 rounded-[8px] border border-[#E3EAE5] dark:border-[#22332A]">
              Anda dapat menyematkan nomor ini pada dokumen yang diajukan. Status akan otomatis berubah menjadi <strong>Terbit (Issued)</strong> setelah dokumen disetujui Direktur.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <Button variant="primary" onClick={() => setRequestModalOpen(false)}>
                Tutup & Lihat di Tabel
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRequestNumber} className="space-y-4">
            <Select
              label="Klasifikasi Divisi / Jenis Surat"
              required
              value={requestClassificationId}
              onChange={(e) => setRequestClassificationId(e.target.value)}
              placeholder="-- Pilih Klasifikasi Surat --"
              options={classifications.map((c) => ({
                value: c.id,
                badge: c.code,
                label: `${c.code} — ${c.name}`,
                sublabel: `Contoh format: 001/YSBH/${c.code}/X/2026`,
              }))}
            />

            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
                Perihal Surat (Subject)
              </label>
              <input
                type="text"
                required
                placeholder="Misal: Surat Tugas Lapangan Survei Vektor Malaria"
                value={requestSubject}
                onChange={(e) => setRequestSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="tertiary" onClick={() => setRequestModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" loading={requestLoading}>
                Cadangkan Nomor Sekarang
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Batalkan Nomor Surat (FR-NOM-06) */}
      <Modal
        isOpen={Boolean(voidModalLetter)}
        onClose={() => setVoidModalLetter(null)}
        variant="danger"
        title="Batalkan Nomor Surat"
        subtitle={`Nomor: ${voidModalLetter?.full_number}`}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setVoidModalLetter(null)}>
              Tutup
            </Button>
            <Button variant="danger" loading={voidLoading} onClick={handleVoidNumber}>
              Konfirmasi Batalkan
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-[#DC2626] dark:text-[#F87171] bg-[#FEE2E2] dark:bg-[#DC2626]/20 p-3 rounded-[8px] border border-[#FECACA] dark:border-[#DC2626]/40">
            <strong>Perhatian:</strong> Sesuai aturan PRD Bab 5.2, nomor surat yang telah dibatalkan <strong>tidak akan pernah digunakan kembali</strong> agar integritas register audit tetap terjaga.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
              Alasan Pembatalan (Wajib):
            </label>
            <textarea
              required
              rows={3}
              placeholder="Misal: Kegiatan dibatalkan oleh pihak mitra donor"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              className="w-full p-3 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626] resize-none"
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

