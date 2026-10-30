import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  Activity, 
  MapPin, 
  Calendar, 
  Upload, 
  CheckCircle2, 
  RotateCcw, 
  Users, 
  FileText,
  DollarSign
} from 'lucide-react';

export function Programs() {
  const { user, hasRole } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [activities, setActivities] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit Field Report Modal (Staf Lapangan)
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportDesc, setReportDesc] = useState('');
  const [reportFindings, setReportFindings] = useState('');
  const [reportChallenges, setReportChallenges] = useState('');
  const [reportFiles, setReportFiles] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  // Verification Modal (Program Officer / Manager)
  const [verifyModalReport, setVerifyModalReport] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState('verified');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const progs = await api.get('/programs');
      setPrograms(progs);

      const acts = await api.get('/activities');
      setActivities(acts);
      if (acts.length > 0 && !selectedActivityId) {
        setSelectedActivityId(acts[0].id);
      }

      const reps = await api.get('/reports');
      setReports(reps.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      const formData = new FormData();
      formData.append('activity_id', selectedActivityId);
      formData.append('report_date', reportDate);
      formData.append('title', reportTitle);
      formData.append('description', reportDesc);
      formData.append('findings', reportFindings);
      formData.append('challenges', reportChallenges);

      for (let i = 0; i < reportFiles.length; i++) {
        formData.append('files[]', reportFiles[i]);
      }

      await api.post('/reports', formData);
      alert('Laporan kegiatan lapangan berhasil dikirim!');
      setReportModalOpen(false);
      setReportTitle('');
      setReportDesc('');
      setReportFindings('');
      setReportChallenges('');
      setReportFiles([]);
      fetchData();
    } catch (err) {
      alert(err.message || 'Gagal mengirimkan laporan kegiatan.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyModalReport) return;
    setVerifyLoading(true);
    try {
      await api.post(`/reports/${verifyModalReport.id}/verify`, {
        status: verifyStatus,
        verification_notes: verifyNotes,
      });
      alert(`Laporan berhasil di-verifikasi (${verifyStatus})`);
      setVerifyModalReport(null);
      fetchData();
    } catch (err) {
      alert(err.message || 'Gagal memverifikasi laporan.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const pageActions = (
    <Button variant="primary" size="md" onClick={() => setReportModalOpen(true)}>
      <Upload className="w-4 h-4 mr-1.5" /> Buat Laporan Lapangan Baru
    </Button>
  );

  return (
    <AppLayout 
      pageTitle="Program & Laporan Lapangan Papua" 
      pageSubtitle="Pengelolaan kegiatan penanggulangan & eliminasi malaria, penugasan staf, dan pelaporan bukti foto lapangan."
      pageActions={pageActions}
      breadcrumbs={['Program & Lapangan']}
    >

      {/* Program Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {programs.map((prog) => (
          <Card key={prog.id} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#15803D] dark:text-[#4ADE80] bg-[#DCFCE7] dark:bg-[#15803D]/25 px-2.5 py-1 rounded-full">
                  {prog.code}
                </span>
                <h3 className="text-lg font-bold text-[#14201A] dark:text-white mt-2">{prog.name}</h3>
                <p className="text-xs text-[#586862] dark:text-[#8FA89B] mt-1">{prog.description}</p>
              </div>
              <Badge status="aktif" label="Berjalan" />
            </div>

            <div className="mt-4 pt-3 border-t border-[#E3EAE5] dark:border-[#22332A] grid grid-cols-2 gap-2 text-xs text-[#586862] dark:text-[#8FA89B]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
                <span>{prog.target_location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
                <span>Manager: {prog.manager?.name}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Laporan Kegiatan Lapangan Masuk */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#15803D] dark:text-[#4ADE80]" strokeWidth={1.75} />
              <h3 className="font-bold text-[#14201A] dark:text-white text-base">Laporan Kegiatan & Bukti Foto Lapangan</h3>
            </div>
            <span className="text-xs text-[#586862] dark:text-[#8FA89B]">Terintegrasi untuk Program & Keuangan</span>
          </div>
        }
        padding="p-0"
      >
        <div className="divide-y divide-[#E3EAE5] dark:divide-[#22332A]">
          {reports.length > 0 ? (
            reports.map((rep) => (
              <div key={rep.id} className="p-5 hover:bg-[#F0FDF4] dark:hover:bg-[#192821]/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#14201A] dark:text-white">{rep.title}</h4>
                    <p className="text-xs text-[#586862] dark:text-[#8FA89B]">
                      Kegiatan: <span className="font-semibold text-[#14201A] dark:text-white">{rep.activity?.name}</span> ({rep.activity?.location})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={rep.status} />
                    <span className="text-xs font-mono text-[#586862] dark:text-[#8FA89B]">{rep.report_date}</span>
                  </div>
                </div>

                <p className="text-xs text-[#14201A] dark:text-[#EDF7F1] mb-2">{rep.description}</p>

                {rep.findings && (
                  <div className="p-2.5 rounded-[8px] bg-[#F7FAF8] dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#22332A] text-xs text-[#14201A] dark:text-[#EDF7F1] mb-2">
                    <span className="font-semibold text-[#15803D] dark:text-[#4ADE80]">Temuan Lapangan:</span> {rep.findings}
                  </div>
                )}

                {/* Bukti Foto / Berkas */}
                {rep.attachments?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rep.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#22332A] text-xs flex items-center gap-1.5 text-[#15803D] dark:text-[#4ADE80] font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{att.file_name}</span>
                        <span className="text-[10px] text-[#586862] dark:text-[#8FA89B]">({Math.round(att.file_size / 1024)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-[#E3EAE5] dark:border-[#22332A] flex items-center justify-between text-xs text-[#586862] dark:text-[#8FA89B]">
                  <span>Dilaporkan oleh: <strong className="text-[#14201A] dark:text-white">{rep.submitter?.name}</strong></span>
                  {(hasRole('program_manager') || hasRole('program_officer') || hasRole('direktur')) && rep.status === 'submitted' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => { setVerifyModalReport(rep); setVerifyNotes(''); }}
                    >
                      Verifikasi Laporan
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="p-8 text-center text-xs text-[#586862] dark:text-[#8FA89B]">Belum ada laporan kegiatan lapangan tercatat.</p>
          )}
        </div>
      </Card>

      {/* Modal Buat Laporan Lapangan Baru (FR-PRG-03 s/d 05) */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Kirim Laporan Kegiatan Lapangan"
        subtitle="Bukti foto dan laporan ini akan langsung dapat diakses oleh Program dan Keuangan"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Pilih Kegiatan yang Dilaksanakan
              </label>
              <select
                required
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              >
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.code} — {act.name} ({act.location})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                required
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
              Judul Laporan
            </label>
            <input
              type="text"
              required
              placeholder="Misal: Laporan Survei Vektor Anopheles Distrik Semangga"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
              Uraian Hasil Kegiatan (Deskripsi)
            </label>
            <textarea
              required
              rows={3}
              placeholder="Jelaskan pelaksanaan kegiatan, jumlah titik survei, atau jumlah kelambu yang dibagikan..."
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              className="w-full p-3 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
              Temuan Penting Lapangan
            </label>
            <textarea
              rows={2}
              placeholder="Misal: Ditemukan kepadatan larva tinggi pada parit persawahan kampung A..."
              value={reportFindings}
              onChange={(e) => setReportFindings(e.target.value)}
              className="w-full p-3 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
              Unggah Foto Dokumentasi & Bukti Lapangan (Maks 10 MB per foto)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={(e) => setReportFiles(e.target.files)}
              className="w-full text-xs text-[#586862] dark:text-[#8FA89B] file:mr-4 file:py-2 file:px-4 file:rounded-[8px] file:border-0 file:text-xs file:font-semibold file:bg-[#DCFCE7] dark:file:bg-[#15803D]/30 file:text-[#15803D] dark:file:text-[#4ADE80]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="tertiary" onClick={() => setReportModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={reportLoading}>
              Kirim Laporan Lapangan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Verifikasi Laporan */}
      <Modal
        isOpen={Boolean(verifyModalReport)}
        onClose={() => setVerifyModalReport(null)}
        title="Verifikasi Laporan Kegiatan"
        subtitle={`Laporan: ${verifyModalReport?.title}`}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setVerifyModalReport(null)}>
              Batal
            </Button>
            <Button variant="primary" loading={verifyLoading} onClick={handleVerify}>
              Simpan Verifikasi
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
              Keputusan Verifikasi
            </label>
            <select
              value={verifyStatus}
              onChange={(e) => setVerifyStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white"
            >
              <option value="verified">Diterima & Terverifikasi</option>
              <option value="revision_needed">Perlu Perbaikan / Revisi</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
              Catatan Verifikasi (Umpan Balik Staf):
            </label>
            <textarea
              rows={3}
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              placeholder="Berikan catatan evaluasi..."
              className="w-full p-3 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E] resize-none"
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

