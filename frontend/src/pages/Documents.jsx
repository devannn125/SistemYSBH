import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Select } from '../components/common/Select';
import { 
  FileText, 
  Search, 
  Plus, 
  Upload, 
  Download, 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  Clock, 
  History,
  FileCheck,
  Send,
  Eye
} from 'lucide-react';

export function Documents() {
  const { user, hasRole } = useAuth();
  const [searchParams] = useSearchParams();
  const [documents, setDocuments] = useState([]);
  const [lettersReserved, setLettersReserved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Detail Modal
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Upload New Doc Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('surat_keluar');
  const [docDivision, setDocDivision] = useState(user?.division || 'HR');
  const [docLetterNumberId, setDocLetterNumberId] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [submitImmediately, setSubmitImmediately] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);

  // New Version Modal
  const [newVersionModalOpen, setNewVersionModalOpen] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');
  const [versionFile, setVersionFile] = useState(null);
  const [versionLoading, setVersionLoading] = useState(false);

  // Transition Action Modal
  const [transitionAction, setTransitionAction] = useState(null); // 'review' | 'forward_director' | 'approve' | 'reject' | 'request_revision'
  const [transitionComment, setTransitionComment] = useState('');
  const [transitionLoading, setTransitionLoading] = useState(false);

  const fetchDocuments = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (search) params.append('search', search);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedDivision) params.append('division', selectedDivision);

      const res = await api.get(`/documents?${params.toString()}`);
      setDocuments(res.data);
      setPagination({
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total,
      });

      // Jika ada id di query params, langsung buka detailnya
      const directId = searchParams.get('id');
      if (directId) {
        openDetail(directId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservedLetters = async () => {
    try {
      const res = await api.get('/letters?status=reserved');
      setLettersReserved(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocuments(1);
    fetchReservedLetters();
  }, [search, selectedStatus, selectedDivision]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/documents/${id}`);
      setSelectedDoc(res);
    } catch (e) {
      alert(e.message || 'Gagal memuat detail dokumen');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!docFile) {
      alert('Pilih berkas dokumen terlebih dahulu.');
      return;
    }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', docTitle);
      formData.append('category', docCategory);
      formData.append('division', docDivision);
      formData.append('file', docFile);
      formData.append('submit_immediately', submitImmediately ? '1' : '0');
      if (docLetterNumberId) {
        formData.append('letter_number_id', docLetterNumberId);
      }

      await api.post('/documents', formData);
      setUploadModalOpen(false);
      setDocTitle('');
      setDocFile(null);
      fetchDocuments(1);
      fetchReservedLetters();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan dokumen.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUploadNewVersion = async (e) => {
    e.preventDefault();
    if (!versionFile || !selectedDoc) return;
    setVersionLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', versionFile);
      formData.append('changelog_notes', versionNotes);
      formData.append('resubmit', '1');

      await api.post(`/documents/${selectedDoc.id}/versions`, formData);
      setNewVersionModalOpen(false);
      setVersionFile(null);
      setVersionNotes('');
      openDetail(selectedDoc.id);
      fetchDocuments(pagination.current_page);
    } catch (err) {
      alert(err.message || 'Gagal mengunggah versi baru.');
    } finally {
      setVersionLoading(false);
    }
  };

  const handleTransition = async () => {
    if (!selectedDoc || !transitionAction) return;
    setTransitionLoading(true);
    try {
      await api.post(`/documents/${selectedDoc.id}/transition`, {
        action: transitionAction,
        comments: transitionComment,
      });
      setTransitionAction(null);
      setTransitionComment('');
      openDetail(selectedDoc.id);
      fetchDocuments(pagination.current_page);
    } catch (err) {
      alert(err.message || 'Gagal memperbarui status dokumen.');
    } finally {
      setTransitionLoading(false);
    }
  };

  const pageActions = (
    <Button variant="primary" size="md" onClick={() => setUploadModalOpen(true)}>
      <Upload className="w-4 h-4 mr-1.5" /> Unggah Dokumen Baru
    </Button>
  );

  return (
    <AppLayout 
      pageTitle="Manajemen Dokumen & Persetujuan" 
      pageSubtitle="Pengelolaan terpusat dokumen resmi, riwayat versi otomatis (v1, v2), dan alur persetujuan berjenjang."
      pageActions={pageActions}
      breadcrumbs={['Dokumen']}
    >

      {/* Filter and Search Bar */}
      <Card className="mb-6" padding="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#586862] dark:text-[#8FA89B]" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Cari judul atau nomor dokumen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
            />
          </div>

          <div>
            <Select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              placeholder="Semua Bagian / Divisi"
              options={[
                { value: '', label: 'Semua Bagian / Divisi' },
                { value: 'HR', label: 'HR / Kepegawaian' },
                { value: 'Keuangan', label: 'Keuangan' },
                { value: 'Program', label: 'Program Malaria' },
                { value: 'Direksi', label: 'Direksi' },
              ]}
            />
          </div>

          <div>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              placeholder="Semua Status Dokumen"
              options={[
                { value: '', label: 'Semua Status Dokumen' },
                { value: 'draft', label: 'Draf' },
                { value: 'submitted', label: 'Diajukan' },
                { value: 'in_review', label: 'Direview Manager' },
                { value: 'pending_director', label: 'Menunggu Direktur' },
                { value: 'approved', label: 'Disetujui' },
                { value: 'revision_needed', label: 'Perlu Revisi' },
                { value: 'rejected', label: 'Ditolak' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Documents Table */}
      <Card padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7FAF8] dark:bg-[#192821] text-[#586862] dark:text-[#8FA89B] text-xs uppercase font-semibold border-b border-[#E3EAE5] dark:border-[#22332A]">
              <tr>
                <th className="px-5 py-3.5">Judul Dokumen</th>
                <th className="px-5 py-3.5">Nomor Surat</th>
                <th className="px-5 py-3.5">Divisi</th>
                <th className="px-5 py-3.5">Versi</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Pengaju</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE5] dark:divide-[#22332A]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#586862] dark:text-[#8FA89B]">
                    Memuat dokumen...
                  </td>
                </tr>
              ) : documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F0FDF4] dark:hover:bg-[#192821]/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-xs sm:text-sm text-[#14201A] dark:text-white">{doc.title}</p>
                      <p className="text-xs text-[#586862] dark:text-[#8FA89B] capitalize">Kategori: {doc.category?.replace(/_/g, ' ')}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-[#15803D] dark:text-[#4ADE80]">
                      {doc.document_number || '-'}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-[#14201A] dark:text-[#EDF7F1]">
                      {doc.division}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-[#F0FDF4] dark:bg-[#15803D]/25 text-[#15803D] dark:text-[#4ADE80] border border-[#DCFCE7] dark:border-[#15803D]/40">
                        v{doc.current_version}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={doc.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-[#586862] dark:text-[#8FA89B]">
                      {doc.creator?.name}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button size="sm" variant="tertiary" onClick={() => openDetail(doc.id)}>
                        <Eye className="w-3.5 h-3.5 mr-1" /> Detail & Alur
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[#586862] dark:text-[#8FA89B]">
                    <FileText className="w-8 h-8 text-[#586862] dark:text-[#8FA89B] mx-auto mb-2 opacity-50" strokeWidth={1.75} />
                    <p className="font-semibold text-sm text-[#14201A] dark:text-white">Belum ada dokumen yang sesuai</p>
                    <p className="text-xs mt-1">Unggah dokumen baru untuk memulai alur persetujuan terintegrasi.</p>
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
              Menampilkan {documents.length} dari {pagination.total} dokumen
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="tertiary"
                disabled={pagination.current_page <= 1}
                onClick={() => fetchDocuments(pagination.current_page - 1)}
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
                onClick={() => fetchDocuments(pagination.current_page + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Unggah Dokumen Baru (FR-DOC-01) */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Unggah Dokumen Baru"
        subtitle="Dokumen akan disimpan terpusat dan diberi versi awal (v1)"
      >
        <form onSubmit={handleCreateDocument} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
              Judul Dokumen
            </label>
            <input
              type="text"
              required
              placeholder="Misal: Surat Pengantar Laporan Eliminasi Malaria"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Kategori Dokumen"
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              options={[
                { value: 'surat_keluar', label: 'Surat Keluar' },
                { value: 'rab', label: 'Rencana Anggaran (RAB)' },
                { value: 'pertanggungjawaban', label: 'Pertanggungjawaban (SPJ)' },
                { value: 'laporan_kegiatan', label: 'Laporan Kegiatan' },
                { value: 'kebijakan', label: 'Kebijakan / SOP' },
              ]}
            />

            <Select
              label="Divisi Pemilik"
              value={docDivision}
              onChange={(e) => setDocDivision(e.target.value)}
              options={[
                { value: 'HR', label: 'HR' },
                { value: 'Keuangan', label: 'Keuangan' },
                { value: 'Program', label: 'Program Malaria' },
                { value: 'Direksi', label: 'Direksi' },
              ]}
            />
          </div>

          <Select
            label="Sematkan Nomor Surat yang Sudah Dicadangkan (Opsional)"
            value={docLetterNumberId}
            onChange={(e) => setDocLetterNumberId(e.target.value)}
            placeholder="-- Tanpa Nomor Surat --"
            options={[
              { value: '', label: '-- Tanpa Nomor Surat --' },
              ...lettersReserved.map((l) => ({
                value: l.id,
                label: l.full_number,
                sublabel: l.subject,
              })),
            ]}
          />

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
              Pilih Berkas Dokumen (PDF, DOCX, XLSX maks 10 MB)
            </label>
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
              onChange={(e) => setDocFile(e.target.files[0])}
              className="w-full text-xs text-[#586862] dark:text-[#8FA89B] file:mr-4 file:py-2 file:px-4 file:rounded-[8px] file:border-0 file:text-xs file:font-semibold file:bg-[#DCFCE7] dark:file:bg-[#15803D]/30 file:text-[#15803D] dark:file:text-[#4ADE80] hover:file:bg-[#BBF7D0]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="submitImmediately"
              checked={submitImmediately}
              onChange={(e) => setSubmitImmediately(e.target.checked)}
              className="rounded text-[#15803D] focus:ring-[#15803D]"
            />
            <label htmlFor="submitImmediately" className="text-xs text-[#14201A] dark:text-[#EDF7F1] font-medium">
              Langsung ajukan dokumen ke alur persetujuan (status: Diajukan)
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <Button variant="tertiary" onClick={() => setUploadModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={uploadLoading}>
              Simpan Dokumen (v1)
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Dokumen, Versi & Riwayat Persetujuan (FR-DOC-02 s/d 05) */}
      <Modal
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.title || 'Detail Dokumen'}
        subtitle={`Nomor: ${selectedDoc?.document_number || 'Belum Terbit'} · Divisi: ${selectedDoc?.division}`}
        maxWidth="max-w-3xl"
      >
        {selectedDoc && (
          <div className="space-y-6">
            {/* Status Card & Action Bar */}
            <div className="p-4 rounded-[10px] bg-[#F7FAF8] dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#22332A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-[#586862] dark:text-[#8FA89B] font-medium">Status Dokumen Saat Ini:</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge status={selectedDoc.status} />
                  <span className="font-mono text-xs font-semibold text-[#15803D] dark:text-[#4ADE80]">
                    Versi Terkini: v{selectedDoc.current_version}
                  </span>
                </div>
              </div>

              {/* Action Buttons based on Role & Status */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Aksi untuk Staf Pengaju saat revisi */}
                {selectedDoc.status === 'revision_needed' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setNewVersionModalOpen(true)}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" /> Unggah Versi Baru (v{selectedDoc.current_version + 1})
                  </Button>
                )}

                {/* Aksi Review untuk Manager Bagian */}
                {selectedDoc.status === 'submitted' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { setTransitionAction('review'); setTransitionComment('Dokumen telah direview.'); }}
                  >
                    Mulai Review
                  </Button>
                )}

                {selectedDoc.status === 'in_review' && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => { setTransitionAction('forward_director'); setTransitionComment('Dokumen siap diajukan ke Direktur.'); }}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> Ajukan ke Direktur
                    </Button>
                    <Button
                      size="sm"
                      variant="tertiary"
                      className="text-[#EA580C] dark:text-[#FB923C]"
                      onClick={() => { setTransitionAction('request_revision'); setTransitionComment(''); }}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Minta Revisi
                    </Button>
                  </>
                )}

                {/* Aksi Final untuk Direktur */}
                {hasRole('direktur') && selectedDoc.status === 'pending_director' && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => { setTransitionAction('approve'); setTransitionComment('Disetujui.'); }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Setujui Dokumen
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => { setTransitionAction('reject'); setTransitionComment(''); }}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Tolak
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Riwayat Versi Dokumen (FR-DOC-02) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14201A] dark:text-white mb-2.5 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" strokeWidth={1.75} />
                Riwayat Versi Berkas (Versioning)
              </h4>
              <div className="space-y-2">
                {selectedDoc.versions?.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3 rounded-[8px] border border-[#E3EAE5] dark:border-[#22332A] bg-white dark:bg-[#192821] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#15803D] dark:text-[#4ADE80] bg-[#DCFCE7] dark:bg-[#15803D]/25 px-2 py-0.5 rounded-full mr-2">
                        v{ver.version_number}
                      </span>
                      <span className="font-semibold text-[#14201A] dark:text-white">{ver.file_name}</span>
                      <span className="text-[#586862] dark:text-[#8FA89B] ml-2">
                        ({Math.round(ver.file_size / 1024)} KB) · Diunggah oleh {ver.uploader?.name}
                      </span>
                      {ver.changelog_notes && (
                        <p className="text-[#586862] dark:text-[#8FA89B] mt-1 italic">Catatan: {ver.changelog_notes}</p>
                      )}
                    </div>
                    <a
                      href={`/api/documents/${selectedDoc.id}/versions/${ver.id}/download`}
                      download
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] bg-[#F7FAF8] dark:bg-[#14201A] hover:bg-[#F0FDF4] dark:hover:bg-[#22332A] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#15803D] dark:text-[#4ADE80] font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" strokeWidth={1.75} /> Unduh
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Riwayat Persetujuan Append-Only (FR-DOC-05 & M3) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14201A] dark:text-white mb-2.5 flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" strokeWidth={1.75} />
                Jejak Alur & Keputusan Persetujuan (Immutable History)
              </h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E3EAE5] dark:before:bg-[#22332A]">
                {selectedDoc.approvals?.map((appr) => (
                  <div key={appr.id} className="relative text-xs">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#14201A] border-2 border-[#15803D] dark:border-[#4ADE80]" />
                    <p className="font-semibold text-[#14201A] dark:text-white">
                      {appr.actor?.name}{' '}
                      <span className="font-normal text-[#586862] dark:text-[#8FA89B]">({appr.action_role})</span>
                    </p>
                    <p className="text-[11px] text-[#586862] dark:text-[#8FA89B] font-mono mt-0.5">
                      {new Date(appr.created_at).toLocaleString('id-ID')} · Status:{' '}
                      <span className="font-bold uppercase text-[#15803D] dark:text-[#4ADE80]">{appr.from_status} &rarr; {appr.to_status}</span>
                    </p>
                    {appr.comments && (
                      <p className="mt-1 p-2 rounded-[6px] bg-[#F7FAF8] dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#22332A] text-[#14201A] dark:text-[#EDF7F1]">
                        &quot;{appr.comments}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Unggah Versi Baru (v2, v3...) */}
      <Modal
        isOpen={newVersionModalOpen}
        onClose={() => setNewVersionModalOpen(false)}
        title={`Unggah Versi Baru Dokumen (v${(selectedDoc?.current_version || 1) + 1})`}
        subtitle="Versi lama tetap tersimpan dan dapat diaudit"
      >
        <form onSubmit={handleUploadNewVersion} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
              Catatan Perubahan (Changelog Notes)
            </label>
            <input
              type="text"
              required
              placeholder="Misal: Perbaikan lampiran anggaran kegiatan Merauke"
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
              Pilih Berkas Versi Baru
            </label>
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
              onChange={(e) => setVersionFile(e.target.files[0])}
              className="w-full text-xs text-[#586862] dark:text-[#8FA89B] file:mr-4 file:py-2 file:px-4 file:rounded-[8px] file:border-0 file:text-xs file:font-semibold file:bg-[#DCFCE7] dark:file:bg-[#15803D]/30 file:text-[#15803D] dark:file:text-[#4ADE80]"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <Button variant="tertiary" onClick={() => setNewVersionModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={versionLoading}>
              Unggah & Ajukan Kembali
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Transisi / Aksi (Review, Approve, Reject, Revisi) */}
      <Modal
        isOpen={Boolean(transitionAction)}
        onClose={() => setTransitionAction(null)}
        title={`Konfirmasi Aksi: ${transitionAction?.toUpperCase()}`}
        subtitle={`Dokumen: ${selectedDoc?.title}`}
        variant={transitionAction === 'reject' ? 'danger' : 'default'}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setTransitionAction(null)}>
              Batal
            </Button>
            <Button
              variant={transitionAction === 'reject' ? 'danger' : 'primary'}
              loading={transitionLoading}
              onClick={handleTransition}
            >
              Simpan Keputusan
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-[#586862] dark:text-[#8FA89B]">
            Tindakan ini akan tercatat permanen dalam riwayat dokumen dan audit log sistem.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
              Komentar / Alasan {inArray(transitionAction, ['reject', 'request_revision']) && '(Wajib Diisi)'}:
            </label>
            <textarea
              required={inArray(transitionAction, ['reject', 'request_revision'])}
              rows={3}
              value={transitionComment}
              onChange={(e) => setTransitionComment(e.target.value)}
              placeholder="Berikan catatan, arahan, atau alasan penolakan/revisi..."
              className="w-full p-3 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E] resize-none"
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

function inArray(needle, haystack) {
  return haystack.includes(needle);
}

