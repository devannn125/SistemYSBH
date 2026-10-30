import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, StatCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  FileText, 
  Users, 
  CalendarCheck, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Eye,
  Plus,
  MapPin
} from 'lucide-react';

export function Dashboard() {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalModalDoc, setApprovalModalDoc] = useState(null);
  const [approvalComment, setApprovalComment] = useState('Disetujui. Lanjutkan kegiatan.');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickApprove = async () => {
    if (!approvalModalDoc) return;
    setActionLoading(true);
    try {
      await api.post(`/documents/${approvalModalDoc.id}/transition`, {
        action: 'approve',
        comments: approvalComment,
      });
      setApprovalModalDoc(null);
      fetchStats();
    } catch (err) {
      alert(err.message || 'Gagal menyetujui dokumen.');
    } finally {
      setActionLoading(false);
    }
  };

  const headerActions = (
    <>
      <Link to="/documents">
        <Button variant="tertiary" size="md">
          <FileText className="w-4 h-4 mr-1.5" /> Semua Dokumen
        </Button>
      </Link>
      <Link to="/letters">
        <Button variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" /> Minta Nomor Surat
        </Button>
      </Link>
    </>
  );

  const attendanceTotal = stats?.attendance?.total_employees || 1;
  const attendancePresent = stats?.attendance?.present || 0;
  const attendanceRate = Math.round((attendancePresent / attendanceTotal) * 100);

  return (
    <AppLayout 
      pageTitle="Dashboard Operasional" 
      pageSubtitle={`Selamat datang, ${user?.name || 'Pengguna'} · Divisi ${user?.division || 'YSBH'} (${user?.position || 'Staf'})`}
      pageActions={headerActions}
      breadcrumbs={['Dashboard']}
    >
      {/* Peringatan Kontrak Karyawan (< 60 Hari) */}
      {stats?.expiring_contracts?.length > 0 && (hasRole('direktur') || hasRole('hr_manager')) && (
        <div className="mb-6 p-4 rounded-[10px] bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FDE68A] dark:border-[#92400E] flex items-start justify-between gap-3 text-xs text-[#92400E] dark:text-[#FBBF24]">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#D97706]" strokeWidth={1.75} />
            <div>
              <p className="font-semibold text-sm">
                Peringatan: {stats.expiring_contracts.length} Kontrak Karyawan Mendekati Masa Berakhir (≤ 60 Hari)
              </p>
              <p className="mt-0.5 text-[#B45309] dark:text-[#FCD34D]">
                Karyawan terkait: {stats.expiring_contracts.map((c) => c.employee?.full_name).join(', ')}.
              </p>
            </div>
          </div>
          <Link to="/employees" className="font-bold underline shrink-0 mt-1 hover:text-[#78350F]">
            Tinjau di Modul HR &rarr;
          </Link>
        </div>
      )}

      {/* 4 Kartu Metrik Operasional Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Menunggu Persetujuan"
          value={stats?.pending_approvals_count ?? '0'}
          subtitle="Dokumen butuh tindakan segera"
          icon={Clock}
          badgeText={stats?.pending_approvals_count > 0 ? 'Perlu Respon' : 'Lengkap'}
        />
        <StatCard
          title="Presensi Hari Ini"
          value={`${stats?.attendance?.present ?? 0} / ${stats?.attendance?.total_employees ?? 0}`}
          subtitle={`${stats?.attendance?.not_present ?? 0} staf belum presensi`}
          icon={CalendarCheck}
          badgeText={`${attendanceRate}% Hadir`}
        />
        <StatCard
          title="Logbook Terkumpul"
          value={`${stats?.logbook?.submitted ?? 0} / ${stats?.attendance?.total_employees ?? 0}`}
          subtitle={`${stats?.logbook?.missing ?? 0} staf belum melapor`}
          icon={FileText}
          badgeText="Harian Posko"
        />
        <StatCard
          title="Program Malaria Aktif"
          value={stats?.active_programs_count ?? 1}
          subtitle="Wilayah Merauke & Jayapura"
          icon={Activity}
          badgeText="Operasional"
        />
      </div>

      {/* Grid Konten Utama: 2 Kolom (Antrean Dokumen) & 1 Kolom (Panel Ringkasan) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri (2/3): Antrean Persetujuan Dokumen */}
        <div className="lg:col-span-2">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-[8px] bg-[#F0FDF4] dark:bg-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80]">
                    <Clock className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#14201A] dark:text-white text-sm sm:text-base">Antrean Persetujuan Dokumen</h3>
                  </div>
                </div>
                <Link to="/documents" className="text-xs font-semibold text-[#15803D] dark:text-[#4ADE80] hover:underline flex items-center gap-1">
                  Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            }
            padding="p-0"
          >
            {stats?.pending_approvals?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F7FAF8] dark:bg-[#192821] text-[#586862] dark:text-[#8FA89B] text-xs uppercase font-semibold border-b border-[#E3EAE5] dark:border-[#22332A]">
                    <tr>
                      <th className="px-5 py-3">Dokumen</th>
                      <th className="px-5 py-3">Divisi</th>
                      <th className="px-5 py-3">Nomor Surat</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3EAE5] dark:divide-[#22332A]">
                    {stats.pending_approvals.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#F0FDF4]/50 dark:hover:bg-[#192821]/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-xs sm:text-sm text-[#14201A] dark:text-white">{doc.title}</p>
                          <p className="text-[11px] text-[#586862] dark:text-[#8FA89B]">Pengaju: {doc.creator?.name}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-medium text-[#14201A] dark:text-[#EDF7F1]">
                          {doc.division}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-[#15803D] dark:text-[#4ADE80] font-semibold">
                          {doc.document_number || '-'}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge status={doc.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {hasRole('direktur') && doc.status === 'pending_director' && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => setApprovalModalDoc(doc)}
                              >
                                Setujui
                              </Button>
                            )}
                            <Link to={`/documents?id=${doc.id}`}>
                              <Button size="sm" variant="tertiary">
                                <Eye className="w-3.5 h-3.5 mr-1" /> Detail
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-[#586862] dark:text-[#8FA89B]">
                <CheckCircle2 className="w-8 h-8 text-[#15803D] dark:text-[#4ADE80] mx-auto mb-2 opacity-80" strokeWidth={1.75} />
                <p className="font-semibold text-sm text-[#14201A] dark:text-white">Tidak ada antrean persetujuan dokumen</p>
                <p className="text-xs mt-1">Semua dokumen saat ini telah diproses sesuai alur kewenangan.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Kolom Kanan (1/3): 2 Panel Informasi Terstruktur */}
        <div className="space-y-6">
          {/* Panel 1: Posko Lapangan & Presensi Hari Ini */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-[8px] bg-[#F0FDF4] dark:bg-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80]">
                    <MapPin className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-bold text-[#14201A] dark:text-white text-sm sm:text-base">Posko Papua Hari Ini</h3>
                </div>
                <span className="text-[11px] font-mono text-[#15803D] dark:text-[#4ADE80] font-semibold bg-[#DCFCE7] dark:bg-[#15803D]/30 px-2 py-0.5 rounded-full">
                  WIT
                </span>
              </div>
            }
          >
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#586862] dark:text-[#8FA89B]">Tingkat Kehadiran Staf</span>
                  <span className="font-bold font-mono text-[#15803D] dark:text-[#4ADE80]">{attendanceRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E3EAE5] dark:bg-[#22332A] overflow-hidden">
                  <div 
                    className="h-full bg-[#15803D] rounded-full transition-all duration-300"
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-[8px] bg-[#F7FAF8] dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#22332A]">
                  <p className="text-base font-bold font-mono text-[#14201A] dark:text-white">{attendancePresent}</p>
                  <p className="text-[10px] text-[#586862] dark:text-[#8FA89B] mt-0.5">Sudah Clock-in</p>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#F7FAF8] dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#22332A]">
                  <p className="text-base font-bold font-mono text-[#D97706]">{stats?.attendance?.not_present ?? 0}</p>
                  <p className="text-[10px] text-[#586862] dark:text-[#8FA89B] mt-0.5">Belum Absen</p>
                </div>
              </div>

              <Link 
                to="/attendance-logbook" 
                className="w-full block text-center py-2 px-3 rounded-[8px] bg-[#F7FAF8] dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#22332A] hover:border-[#15803D] text-xs font-semibold text-[#15803D] dark:text-[#4ADE80] transition-colors"
              >
                Buka Presensi & Logbook &rarr;
              </Link>
            </div>
          </Card>

          {/* Panel 2: Rekap Status Dokumen */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-[8px] bg-[#F0FDF4] dark:bg-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80]">
                  <FileText className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <h3 className="font-bold text-[#14201A] dark:text-white text-sm sm:text-base">Rekap Status Dokumen</h3>
              </div>
            }
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#F7FAF8] dark:bg-[#192821]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                  <span className="text-[#586862] dark:text-[#8FA89B]">Draf Dokumen</span>
                </div>
                <span className="font-bold font-mono text-[#14201A] dark:text-white">{stats?.document_statuses?.draft ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#FEF3C7]/40 dark:bg-[#78350F]/20 text-[#D97706]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                  <span className="font-medium">Sedang Direview</span>
                </div>
                <span className="font-bold font-mono">{stats?.document_statuses?.in_review ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#B45309] dark:text-[#FBBF24]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B45309]" />
                  <span className="font-semibold">Menunggu Direktur</span>
                </div>
                <span className="font-bold font-mono">{stats?.document_statuses?.pending_director ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#DCFCE7] dark:bg-[#15803D]/25 text-[#15803D] dark:text-[#4ADE80]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                  <span className="font-semibold">Disetujui / Terbit</span>
                </div>
                <span className="font-bold font-mono">{stats?.document_statuses?.approved ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#FFEDD5] dark:bg-[#7C2D12]/20 text-[#EA580C]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                  <span>Perlu Revisi</span>
                </div>
                <span className="font-bold font-mono">{stats?.document_statuses?.revision_needed ?? 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Persetujuan Cepat Direktur */}
      <Modal
        isOpen={Boolean(approvalModalDoc)}
        onClose={() => setApprovalModalDoc(null)}
        title="Persetujuan Dokumen & Penerbitan Nomor"
        subtitle={`Dokumen: ${approvalModalDoc?.title}`}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setApprovalModalDoc(null)}>
              Batal
            </Button>
            <Button variant="primary" loading={actionLoading} onClick={handleQuickApprove}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Konfirmasi Persetujuan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-[10px] bg-[#F0FDF4] dark:bg-[#15803D]/20 border border-[#DCFCE7] dark:border-[#15803D]/30 text-xs text-[#15803D] dark:text-[#4ADE80]">
            <p className="font-semibold">Catatan Sistem:</p>
            <p className="mt-0.5">
              Menyetujui dokumen ini akan secara otomatis mengubah status nomor surat{' '}
              <span className="font-mono font-bold">{approvalModalDoc?.document_number || 'Terkait'}</span>{' '}
              menjadi <strong>Terbit (Issued)</strong> di buku register nomor surat terpusat.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-white mb-1.5">
              Catatan Persetujuan Direktur:
            </label>
            <textarea
              rows={3}
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              className="w-full p-3 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#22332A] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] resize-none"
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
