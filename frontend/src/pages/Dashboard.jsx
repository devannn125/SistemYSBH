import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '../components/ui/dialog';
import { TabsList, TabTrigger } from '../components/ui/tabs';
import { AttendanceChart } from '../components/dashboard/AttendanceChart';
import { BudgetChart } from '../components/dashboard/BudgetChart';
import { DocumentLifecycleChart } from '../components/dashboard/DocumentLifecycleChart';
import { DivisionChart } from '../components/dashboard/DivisionChart';
import { LetterStatusChart } from '../components/dashboard/LetterStatusChart';
import { LogbookDetailModal } from '../components/dashboard/LogbookDetailModal';
import { FieldStaffCharts } from '../components/dashboard/FieldStaffCharts';
import { HRContractChart } from '../components/dashboard/HRContractChart';
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
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Server,
  Database,
  RefreshCw,
  Sparkles,
  Receipt,
  UserCheck,
  UserX,
  Send,
  Upload,
  Check,
  ChevronRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export function Dashboard() {
  const { user, hasRole, login } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive Modals State
  const [approvalModalDoc, setApprovalModalDoc] = useState(null);
  const [approvalComment, setApprovalComment] = useState('Disetujui. Lanjutkan kegiatan sesuai SOP.');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Staf Lapangan interactive quick clock-in/out
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockSuccess, setClockSuccess] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Posko Lapangan Distrik Semangga, Merauke');
  
  // Logbook interactive composer state
  const [logbookSummary, setLogbookSummary] = useState('');
  const [logbookChallenges, setLogbookChallenges] = useState('');
  const [logbookSaving, setLogbookSaving] = useState(false);
  const [logbookSaved, setLogbookSaved] = useState(false);

  // Digital clock for field staff
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('id-ID'));

  // Superadmin & Direktur interactive state
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardLogbooks, setDashboardLogbooks] = useState([]);
  const [selectedDashLogbook, setSelectedDashLogbook] = useState(null);
  const [dashModalOpen, setDashModalOpen] = useState(false);
  const [workSchedule, setWorkSchedule] = useState({ work_start_time: '08:00', work_end_time: '17:00', late_tolerance_minutes: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res);

      if (hasRole('superadmin')) {
        const empRes = await api.get('/employees?per_page=20');
        setAllUsers(empRes.data || []);
      }

      if (hasRole('direktur') || hasRole('superadmin')) {
        const logRes = await api.get('/logbooks?per_page=6');
        setDashboardLogbooks(logRes.data || []);
        const schedRes = await api.get('/attendances/schedule');
        if (schedRes.schedule) {
          setWorkSchedule(schedRes.schedule);
        }
      }
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

  const handleFieldClockIn = async () => {
    setClockInLoading(true);
    setClockSuccess('');
    try {
      const res = await api.post('/attendances/clock-in', {
        location_note: selectedLocation,
        notes: 'Presensi mandiri melalui aplikasi seluler SIMSBH.',
      });
      setClockSuccess(res.message || 'Presensi masuk berhasil dicatat!');
      fetchStats();
    } catch (err) {
      setClockSuccess(err.message || 'Presensi masuk gagal dicatat.');
    } finally {
      setClockInLoading(false);
    }
  };

  const handleSaveLogbook = async (e) => {
    e.preventDefault();
    if (!logbookSummary) return;
    setLogbookSaving(true);
    setLogbookSaved(false);
    try {
      await api.post('/logbooks', {
        date: new Date().toISOString().split('T')[0],
        activity_summary: logbookSummary,
        challenges: logbookChallenges,
        next_day_plan: 'Melanjutkan pemantauan larva dan koordinasi puskesmas.',
      });
      setLogbookSaved(true);
      setTimeout(() => setLogbookSaved(false), 3000);
      fetchStats();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan logbook.');
    } finally {
      setLogbookSaving(false);
    }
  };

  const attendanceTotal = stats?.attendance?.total_employees || 8;
  const attendancePresent = stats?.attendance?.present || 0;
  const attendanceRate = Math.round((attendancePresent / attendanceTotal) * 100);

  const primaryRole = user?.roles?.[0] || 'pengguna';

  return (
    <AppLayout 
      pageTitle="Dashboard Interaktif" 
      pageSubtitle={`Selamat datang kembali, ${user?.name || 'Pengguna'} · ${user?.position || 'Staf'} (${user?.division || 'YSBH Papua'})`}
      pageActions={
        <div className="flex items-center gap-2">
          <Link to="/documents">
            <Button variant="outline" size="sm">
              <FileText className="w-3.5 h-3.5 mr-1" /> Dokumen
            </Button>
          </Link>
          <Link to="/letters">
            <Button variant="default" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" /> Buat Surat
            </Button>
          </Link>
        </div>
      }
      breadcrumbs={['Dashboard']}
    >
      <div className="space-y-6">
        {/* Peringatan Kontrak Mendekati Berakhir (Khusus Direktur, HR, Superadmin) */}
        {stats?.expiring_contracts?.length > 0 && (hasRole('superadmin') || hasRole('direktur') || hasRole('hr_manager')) && (
          <div className="p-4 sm:p-5 rounded-3xl bg-[#FF9500]/10 border border-[#FF9500]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FF9500]/20 flex items-center justify-center text-[#B26A00] dark:text-[#FF9F0A] shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="font-bold text-sm text-[#1C1C1E] dark:text-white">
                  Peringatan: {stats.expiring_contracts.length} Kontrak Karyawan Mendekati Masa Berakhir (≤ 60 Hari)
                </p>
                <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                  Pegawai: {stats.expiring_contracts.map((c) => `${c.employee?.full_name} (${c.employee?.division})`).join(', ')}.
                </p>
              </div>
            </div>
            <Link to="/employees" className="shrink-0">
              <Button variant="outline" size="sm" className="bg-white/90 dark:bg-[#2C2C2E]/90 text-xs font-semibold">
                Tinjau Kontrak <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* 4 Apple-Style Stat Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8E8E93]">Persetujuan</span>
              <div className="w-8 h-8 rounded-xl bg-[#FF9500]/10 flex items-center justify-center text-[#FF9500]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] dark:text-white">
                {stats?.pending_approvals_count ?? 0}
              </div>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">Menunggu tindakan</p>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8E8E93]">Presensi Hari Ini</span>
              <div className="w-8 h-8 rounded-xl bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] dark:text-white">
                {attendancePresent} <span className="text-sm font-normal text-[#8E8E93]">/ {attendanceTotal}</span>
              </div>
              <p className="text-[11px] text-[#059669] dark:text-[#34D399] font-medium mt-0.5">{attendanceRate}% Hadir</p>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8E8E93]">Logbook Lapangan</span>
              <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] dark:text-white">
                {stats?.logbook?.submitted ?? 0}
              </div>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">{stats?.logbook?.missing ?? 0} belum melapor</p>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8E8E93]">Program Malaria</span>
              <div className="w-8 h-8 rounded-xl bg-[#34C759]/10 flex items-center justify-center text-[#34C759]">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] dark:text-white">
                {stats?.active_programs_count ?? 1}
              </div>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">Merauke & Jayapura</p>
            </div>
          </Card>
        </div>

        {/* =========================================================================
            GRAFIK & VISUALISASI ANALITIK REAL-TIME (DISESUAIKAN BERDASARKAN PERAN)
        ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                <h3 className="font-bold text-base text-[#1C1C1E] dark:text-white">
                  {hasRole('staf_lapangan') && 'Analitik Kinerja Lapangan & Kehadiran Saya'}
                  {hasRole('direktur') && 'Analitik Eksekutif, Anggaran & Tata Kelola Yayasan'}
                  {hasRole('superadmin') && 'Analitik Tata Kelola Sistem, Pengguna & Integritas Dokumen'}
                  {(hasRole('hr_manager') || hasRole('staf_hr')) && 'Analitik SDM, Presensi & Siklus Masa Kontrak Kerja'}
                  {hasRole('finance_manager') && 'Analitik Keuangan, Realisasi Anggaran (RAB) & LPJ'}
                  {(hasRole('program_manager') || hasRole('program_officer')) && 'Analitik Operasional Program Eliminasi Malaria Papua'}
                </h3>
              </div>
              <p className="text-xs text-[#8E8E93]">
                {hasRole('staf_lapangan')
                  ? 'Catatan presensi pribadi dan rekap kepatuhan pengisian logbook posko Merauke'
                  : 'Visualisasi analitik berbasis query langsung ke basis data MySQL sinarbhaktihusada'}
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#059669]/10 text-[#059669] dark:text-[#34D399]">
              Live Data
            </span>
          </div>

          {/* 1. KHUSUS STAF LAPANGAN (FAJAR) */}
          {hasRole('staf_lapangan') && (
            <FieldStaffCharts myStats={stats?.charts?.my_stats} />
          )}

          {/* 2. KHUSUS DIREKTUR (KADEK) */}
          {hasRole('direktur') && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BudgetChart budgetData={stats?.charts?.budget} />
                <AttendanceChart data={stats?.charts?.attendance_trend || []} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocumentLifecycleChart data={stats?.charts?.document_lifecycle || []} />
                <LetterStatusChart letters={stats?.charts?.letters || []} />
              </div>
            </div>
          )}

          {/* 3. KHUSUS SUPERADMIN */}
          {hasRole('superadmin') && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DivisionChart divisions={stats?.charts?.divisions || []} />
                <AttendanceChart data={stats?.charts?.attendance_trend || []} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocumentLifecycleChart data={stats?.charts?.document_lifecycle || []} />
                <LetterStatusChart letters={stats?.charts?.letters || []} />
              </div>
            </div>
          )}

          {/* 4. KHUSUS HR MANAGER & STAF HR (AYU & BUDI) */}
          {(hasRole('hr_manager') || hasRole('staf_hr')) && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceChart data={stats?.charts?.attendance_trend || []} />
                <HRContractChart contractStats={stats?.charts?.contracts} expiringList={stats?.expiring_contracts} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DivisionChart divisions={stats?.charts?.divisions || []} />
                <LetterStatusChart letters={stats?.charts?.letters || []} />
              </div>
            </div>
          )}

          {/* 5. KHUSUS FINANCE MANAGER (CITRA) */}
          {hasRole('finance_manager') && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BudgetChart budgetData={stats?.charts?.budget} />
                <DocumentLifecycleChart data={stats?.charts?.document_lifecycle || []} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LetterStatusChart letters={stats?.charts?.letters?.filter(l => l.code === 'KEU' || l.code === 'DIR' || l.code === 'UMUM') || stats?.charts?.letters || []} />
                <DivisionChart divisions={stats?.charts?.divisions || []} />
              </div>
            </div>
          )}

          {/* 6. KHUSUS PROGRAM MANAGER & PROGRAM OFFICER (DODI & EKA) */}
          {(hasRole('program_manager') || hasRole('program_officer')) && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BudgetChart budgetData={stats?.charts?.budget} />
                <DocumentLifecycleChart data={stats?.charts?.document_lifecycle || []} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LetterStatusChart letters={stats?.charts?.letters?.filter(l => l.code === 'PRG' || l.code === 'DIR') || stats?.charts?.letters || []} />
                <AttendanceChart data={stats?.charts?.attendance_trend || []} />
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION KHUSUS: DASHBOARD SESUAI PERAN (INTERAKTIF)
        ========================================================================= */}

        {/* 1. VIEW SUPERADMIN: KONTROL SISTEM & USER MANAGEMENT */}
        {hasRole('superadmin') && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#34D399]" /> Pusat Kontrol Super Administrator
                </div>
                <h2 className="text-xl font-bold tracking-tight">Kesehatan Sistem & Basis Data MySQL</h2>
                <p className="text-xs text-neutral-300">Database: <span className="font-mono text-[#34D399]">sinarbhaktihusada</span> · 8 Akun Terverifikasi · Audit Logging Aktif</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/audit-trail">
                  <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Jejak Audit
                  </Button>
                </Link>
                <Link to="/employees">
                  <Button variant="default" size="sm" className="bg-[#059669] hover:bg-[#047857]">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Akun
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tabel Akun Pengguna Langsung di Dashboard Superadmin */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Daftar Pengguna Aktif Sistem</CardTitle>
                    <CardDescription>Seluruh 8 akun terdaftar dengan peran RBAC di database</CardDescription>
                  </div>
                  <Badge variant="default">{allUsers.length} Terdaftar</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#8E8E93] border-b border-black/[0.05] dark:border-white/[0.06] font-semibold">
                      <tr>
                        <th className="px-5 py-3">Nama & NIK</th>
                        <th className="px-5 py-3">Divisi & Jabatan</th>
                        <th className="px-5 py-3">Peran (Role)</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                      {allUsers.map((emp) => (
                        <tr key={emp.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02]">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-[#1C1C1E] dark:text-white">{emp.full_name}</p>
                            <p className="text-[11px] font-mono text-[#8E8E93]">{emp.nik} · @{emp.user?.username}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-[#1C1C1E] dark:text-white">{emp.division}</p>
                            <p className="text-[11px] text-[#8E8E93]">{emp.position}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant="info">
                              {emp.user?.roles?.[0]?.name || 'user'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant="success" dot>Aktif</Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Link to={`/employees`}>
                              <Button variant="ghost" size="sm">
                                Kelola
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIEW DIREKTUR EKSEKUTIF: MONITORING LOGBOOK & JAM KERJA PEGAWAI */}
        {(hasRole('direktur') || hasRole('superadmin')) && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#059669]/15 via-[#007AFF]/10 to-transparent border border-[#059669]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#059669]/20 text-[#059669] dark:text-[#34D399] text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Pengawasan Direksi Eksekutif
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#1C1C1E] dark:text-white">
                  Kebijakan Jam Kerja & Logbook Aktivitas Karyawan
                </h3>
                <p className="text-xs text-[#8E8E93]">
                  Jadwal Aktif: Masuk pukul <strong className="text-[#1C1C1E] dark:text-white font-mono">{workSchedule.work_start_time} WIT</strong> (Toleransi {workSchedule.late_tolerance_minutes} mnt) · Pulang <strong className="text-[#1C1C1E] dark:text-white font-mono">{workSchedule.work_end_time} WIT</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to="/attendance-logbook">
                  <Button variant="default" size="sm" className="bg-[#059669] hover:bg-[#047857] text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 mr-1.5" /> Atur Jam Masuk & Pulang
                  </Button>
                </Link>
              </div>
            </div>

            {/* Rekap Logbook Terkini Staf */}
            <Card className="p-0 overflow-hidden">
              <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <CardTitle>Logbook Harian Terbaru Staf</CardTitle>
                  <CardDescription>Direktur dapat melihat detail lengkap laporan kegiatan lapangan dan memberi ulasan</CardDescription>
                </div>
                <Link to="/attendance-logbook">
                  <Button variant="ghost" size="sm" className="text-xs text-[#059669]">
                    Semua Logbook <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                {dashboardLogbooks.length > 0 ? (
                  dashboardLogbooks.slice(0, 4).map((log) => (
                    <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#059669] dark:text-[#34D399]">
                            {log.date}
                          </span>
                          <Badge variant="info">{log.user?.division || 'Operasional'}</Badge>
                          <Badge variant={log.status === 'approved' ? 'success' : 'warning'} dot>
                            {log.status === 'approved' ? 'Disetujui Direktur' : 'Menunggu Review'}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm text-[#1C1C1E] dark:text-white">
                          {log.user?.name} · <span className="font-normal text-xs text-[#8E8E93]">{log.user?.position}</span>
                        </h4>
                        <p className="text-xs text-[#8E8E93] line-clamp-1">
                          {log.activity_summary}
                        </p>
                      </div>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedDashLogbook(log);
                          setDashModalOpen(true);
                        }}
                        className="shrink-0 text-xs font-semibold px-4 rounded-xl bg-[#059669] hover:bg-[#047857]"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Lihat Detail
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="p-6 text-center text-xs text-[#8E8E93]">Belum ada logbook pegawai.</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* 2. VIEW STAF LAPANGAN: WIDGET 1-SENTUH PRESENSI & LOGBOOK */}
        {hasRole('staf_lapangan') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Widget Presensi Cepat Mandiri */}
            <Card className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-black/[0.05] dark:border-white/[0.06]">
                  <div>
                    <h3 className="font-bold text-base text-[#1C1C1E] dark:text-white">Presensi Masuk Cepat</h3>
                    <p className="text-xs text-[#8E8E93]">Waktu Server Merauke (WIT)</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xl font-extrabold text-[#059669] dark:text-[#34D399]">
                      {currentTime}
                    </span>
                    <p className="text-[10px] text-[#8E8E93] font-semibold">WIT</p>
                  </div>
                </div>

                <div className="py-5 space-y-4">
                  {clockSuccess && (
                    <div className="p-3.5 rounded-2xl bg-[#059669]/10 border border-[#059669]/25 text-xs text-[#059669] dark:text-[#34D399] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{clockSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                      Pilih Posko / Lokasi Lapangan:
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                    >
                      <option value="Posko Lapangan Distrik Semangga, Merauke">Posko Lapangan Distrik Semangga, Merauke</option>
                      <option value="Koleksi Larva Rawa Merauke">Koleksi Larva Rawa Merauke</option>
                      <option value="Puskesmas Pembantu Distrik Naukenjerai">Puskesmas Pembantu Distrik Naukenjerai</option>
                      <option value="Posko Lapangan Jayapura">Posko Lapangan Jayapura</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button
                variant="default"
                size="lg"
                loading={clockInLoading}
                onClick={handleFieldClockIn}
                className="w-full text-base font-semibold py-4 rounded-2xl shadow-lg shadow-[#059669]/25"
              >
                <Check className="w-5 h-5 mr-2" /> Catat Jam Masuk Sekarang
              </Button>
            </Card>

            {/* Quick Logbook Composer */}
            <Card>
              <CardHeader>
                <CardTitle>Logbook Aktivitas Hari Ini</CardTitle>
                <CardDescription>Kirimkan ringkasan hasil kegiatan lapangan dan kendala di lokasi</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveLogbook} className="space-y-3">
                  {logbookSaved && (
                    <div className="p-3 rounded-2xl bg-[#34C759]/10 text-xs text-[#248A3D] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Logbook berhasil dilaporkan ke koordinator program!
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Aktivitas Utama:</label>
                    <textarea
                      rows={2}
                      required
                      value={logbookSummary}
                      onChange={(e) => setLogbookSummary(e.target.value)}
                      placeholder="Contoh: Mengambil sampel larva di 8 titik rawa Semangga..."
                      className="w-full p-3 rounded-2xl text-xs bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Kendala / Tantangan Lapangan:</label>
                    <input
                      type="text"
                      value={logbookChallenges}
                      onChange={(e) => setLogbookChallenges(e.target.value)}
                      placeholder="Contoh: Jalan berlumpur setelah hujan..."
                      className="w-full px-3 py-2.5 rounded-2xl text-xs bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="default"
                    size="default"
                    loading={logbookSaving}
                    className="w-full text-xs font-semibold rounded-2xl"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Kirim Logbook Harian
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIEW DIREKTUR EKSEKUTIF: MONITORING LOGBOOK & JAM KERJA PEGAWAI */}
        {(hasRole('direktur') || hasRole('superadmin')) && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#059669]/15 via-[#007AFF]/10 to-transparent border border-[#059669]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#059669]/20 text-[#059669] dark:text-[#34D399] text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Pengawasan Direksi Eksekutif
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#1C1C1E] dark:text-white">
                  Kebijakan Jam Kerja & Logbook Aktivitas Karyawan
                </h3>
                <p className="text-xs text-[#8E8E93]">
                  Jadwal Aktif: Masuk pukul <strong className="text-[#1C1C1E] dark:text-white font-mono">{workSchedule.work_start_time} WIT</strong> (Toleransi {workSchedule.late_tolerance_minutes} mnt) · Pulang <strong className="text-[#1C1C1E] dark:text-white font-mono">{workSchedule.work_end_time} WIT</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to="/attendance-logbook">
                  <Button variant="default" size="sm" className="bg-[#059669] hover:bg-[#047857] text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 mr-1.5" /> Atur Jam Masuk & Pulang
                  </Button>
                </Link>
              </div>
            </div>

            {/* Rekap Logbook Terkini Staf */}
            <Card className="p-0 overflow-hidden">
              <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <CardTitle>Logbook Harian Terbaru Staf</CardTitle>
                  <CardDescription>Direktur dapat melihat detail lengkap laporan kegiatan lapangan dan memberi ulasan</CardDescription>
                </div>
                <Link to="/attendance-logbook">
                  <Button variant="ghost" size="sm" className="text-xs text-[#059669]">
                    Semua Logbook <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                {dashboardLogbooks.length > 0 ? (
                  dashboardLogbooks.slice(0, 4).map((log) => (
                    <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#059669] dark:text-[#34D399]">
                            {log.date}
                          </span>
                          <Badge variant="info">{log.user?.division || 'Operasional'}</Badge>
                          <Badge variant={log.status === 'approved' ? 'success' : 'warning'} dot>
                            {log.status === 'approved' ? 'Disetujui Direktur' : 'Menunggu Review'}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm text-[#1C1C1E] dark:text-white">
                          {log.user?.name} · <span className="font-normal text-xs text-[#8E8E93]">{log.user?.position}</span>
                        </h4>
                        <p className="text-xs text-[#8E8E93] line-clamp-1">
                          {log.activity_summary}
                        </p>
                      </div>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedDashLogbook(log);
                          setDashModalOpen(true);
                        }}
                        className="shrink-0 text-xs font-semibold px-4 rounded-xl bg-[#059669] hover:bg-[#047857]"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Lihat Detail
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="p-6 text-center text-xs text-[#8E8E93]">Belum ada logbook pegawai.</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* 3. VIEW UTAMA: ANTREAN PERSETUJUAN & STATUS DOKUMEN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Antrean Dokumen */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#1C1C1E] dark:text-white">
                    Antrean Persetujuan Dokumen
                  </h3>
                  <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                    Dokumen aktif yang memerlukan tindakan review atau persetujuan
                  </p>
                </div>
                <Link to="/documents">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-[#059669]">
                    Semua Dokumen <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              {stats?.pending_approvals?.length > 0 ? (
                <div className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                  {stats.pending_approvals.map((doc) => (
                    <div key={doc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="warning">
                            {doc.division}
                          </Badge>
                          <span className="text-xs font-mono font-semibold text-[#059669] dark:text-[#34D399]">
                            {doc.document_number || 'Belum Bernomor'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#1C1C1E] dark:text-white leading-snug">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-[#8E8E93]">
                          Pengaju: {doc.creator?.name || 'Staf'} · Versi v{doc.current_version || 1}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {(hasRole('direktur') || hasRole('superadmin')) && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setApprovalModalDoc(doc)}
                            className="text-xs font-semibold px-4"
                          >
                            Tinjau & Setujui
                          </Button>
                        )}
                        <Link to={`/documents?id=${doc.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Eye className="w-3.5 h-3.5 mr-1" /> Detail
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#34C759]/10 text-[#34C759] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-[#1C1C1E] dark:text-white">Tidak ada dokumen tertunda</h4>
                  <p className="text-xs text-[#8E8E93]">Semua dokumen yang diajukan telah diproses atau disetujui.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Kolom Kanan: Rekap Status & Aksi Cepat */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rekap Status Dokumen</CardTitle>
                <CardDescription>Distribusi status seluruh berkas terdaftar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04]">
                  <span className="text-xs text-[#8E8E93]">Draf Dokumen</span>
                  <span className="text-xs font-bold font-mono text-[#1C1C1E] dark:text-white">{stats?.document_statuses?.draft ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FF9500]/10 text-[#B26A00] dark:text-[#FF9F0A]">
                  <span className="text-xs font-medium">Dalam Review</span>
                  <span className="text-xs font-bold font-mono">{stats?.document_statuses?.in_review ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#007AFF]/10 text-[#0062CC] dark:text-[#0A84FF]">
                  <span className="text-xs font-medium">Menunggu Direktur</span>
                  <span className="text-xs font-bold font-mono">{stats?.document_statuses?.pending_director ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#059669]/10 text-[#059669] dark:text-[#34D399]">
                  <span className="text-xs font-bold">Disetujui / Terbit</span>
                  <span className="text-xs font-bold font-mono">{stats?.document_statuses?.approved ?? 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Navigation Card */}
            <Card className="bg-gradient-to-br from-[#059669]/10 to-transparent border border-[#059669]/20">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#059669] dark:text-[#34D399]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Akses Pintar SIMSBH</span>
                </div>
                <p className="text-xs text-[#8E8E93] dark:text-[#98989D] leading-relaxed">
                  Semua penomoran surat yang disetujui otomatis terbit tanpa resiko duplikat nomor.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link to="/letters">
                    <Button variant="default" size="sm" className="w-full text-xs font-semibold justify-between">
                      <span>Buku Register Nomor Surat</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/attendance-logbook">
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold justify-between">
                      <span>Rekapitulasi Kehadiran & Logbook</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Dialog Persetujuan Cepat Dokumen */}
      <Dialog open={Boolean(approvalModalDoc)} onClose={() => setApprovalModalDoc(null)}>
        <DialogHeader
          title="Persetujuan Dokumen & Penerbitan Nomor"
          description={`Judul: ${approvalModalDoc?.title}`}
          onClose={() => setApprovalModalDoc(null)}
        />
        <DialogBody>
          <div className="p-4 rounded-2xl bg-[#059669]/10 border border-[#059669]/20 text-xs text-[#059669] dark:text-[#34D399] space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Alur Persetujuan Resmi Yayasan
            </p>
            <p className="text-[#1C1C1E] dark:text-neutral-300">
              Dengan menyetujui berkas ini, status nomor surat resmi{' '}
              <span className="font-mono font-bold text-[#059669] dark:text-[#34D399]">
                {approvalModalDoc?.document_number || 'Terkait'}
              </span>{' '}
              akan secara otomatis diubah menjadi <strong>Terbit (Issued)</strong> dan terkunci permanen.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
              Catatan Persetujuan:
            </label>
            <textarea
              rows={3}
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              className="w-full p-3 text-sm rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setApprovalModalDoc(null)}>
            Batal
          </Button>
          <Button variant="default" size="sm" loading={actionLoading} onClick={handleQuickApprove}>
            <Check className="w-4 h-4 mr-1.5" /> Konfirmasi Setujui
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Modal Detail Logbook untuk Direktur & Superadmin */}
      <LogbookDetailModal
        logbook={selectedDashLogbook}
        open={dashModalOpen}
        onClose={() => setDashModalOpen(false)}
        canReview={hasRole('direktur') || hasRole('superadmin')}
        onReviewed={(updated) => {
          setSelectedDashLogbook(updated);
          fetchStats();
        }}
      />
    </AppLayout>
  );
}
