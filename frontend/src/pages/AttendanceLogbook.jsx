import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LogbookDetailModal } from '../components/dashboard/LogbookDetailModal';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  Upload, 
  AlertCircle,
  Users,
  Calendar,
  Settings,
  ShieldCheck,
  Eye,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sliders,
  Send,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const formatDateId = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    const d = new Date(dateStr);
    return !isNaN(d.getTime())
      ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : dateStr;
  } catch (e) {
    return String(dateStr);
  }
};

export function AttendanceLogbook() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('presensi_logbook_saya'); // 'presensi_logbook_saya' | 'monitoring_tim'

  // Presensi State Pribadi
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [locationNote, setLocationNote] = useState('');

  // Logbook State Pribadi
  const [logbookDate, setLogbookDate] = useState(new Date().toISOString().slice(0, 10));
  const [activitySummary, setActivitySummary] = useState('');
  const [challenges, setChallenges] = useState('');
  const [nextDayPlan, setNextDayPlan] = useState('');
  const [logbookFiles, setLogbookFiles] = useState([]);
  const [logbookLoading, setLogbookLoading] = useState(false);
  const [myLogbooks, setMyLogbooks] = useState([]);

  // Monitoring State (Khusus Direktur & Manager)
  const [missingUsers, setMissingUsers] = useState([]);

  // Rekapitulasi Presensi State & Pagination (Khusus Direktur)
  const [attendanceRecap, setAttendanceRecap] = useState([]);
  const [recapPage, setRecapPage] = useState(1);
  const [recapPerPage, setRecapPerPage] = useState(10);
  const [recapPagination, setRecapPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
    per_page: 10,
  });
  const [recapMonth, setRecapMonth] = useState(new Date().getMonth() + 1);
  const [recapYear, setRecapYear] = useState(new Date().getFullYear());
  const [recapStatusFilter, setRecapStatusFilter] = useState('all'); // 'all' | 'hadir' | 'terlambat'
  const [recapSearch, setRecapSearch] = useState('');
  const [recapLoading, setRecapLoading] = useState(false);
  const [recapSummary, setRecapSummary] = useState({ total_records: 0, total_late: 0, total_on_time: 0 });

  // Logbook Tim State & Pagination
  const [teamLogbooks, setTeamLogbooks] = useState([]);
  const [teamLogbookPage, setTeamLogbookPage] = useState(1);
  const [teamLogbookPerPage, setTeamLogbookPerPage] = useState(10);
  const [teamLogbookPagination, setTeamLogbookPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
    per_page: 10,
  });
  const [teamLogbookLoading, setTeamLogbookLoading] = useState(false);

  // Kebijakan Jam Kerja Direktur
  const [workSchedule, setWorkSchedule] = useState({
    work_start_time: '08:00',
    work_end_time: '17:00',
    late_tolerance_minutes: 15,
    notes: '',
  });
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  // Detail Modal Logbook
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTodayAttendance = async () => {
    try {
      const res = await api.get('/attendances/today');
      setTodayAttendance(res.attendance);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMyLogbooks = async () => {
    try {
      const res = await api.get('/logbooks');
      setMyLogbooks(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSchedule = async () => {
    try {
      const res = await api.get('/attendances/schedule');
      if (res.schedule) {
        setWorkSchedule({
          work_start_time: res.schedule.work_start_time || '08:00',
          work_end_time: res.schedule.work_end_time || '17:00',
          late_tolerance_minutes: res.schedule.late_tolerance_minutes ?? 15,
          notes: res.schedule.notes || '',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAttendanceRecap = async (page = 1, perPage = recapPerPage, status = recapStatusFilter, search = recapSearch, month = recapMonth, year = recapYear) => {
    setRecapLoading(true);
    try {
      let url = `/attendances/recap?page=${page}&per_page=${perPage}&month=${month}&year=${year}`;
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const recap = await api.get(url);
      setAttendanceRecap(recap.data || []);
      setRecapPage(recap.current_page || page);
      setRecapPagination({
        current_page: recap.current_page || 1,
        last_page: recap.last_page || 1,
        total: recap.total || 0,
        from: recap.from || 0,
        to: recap.to || 0,
        per_page: recap.per_page || perPage,
      });
      if (recap.summary) {
        setRecapSummary(recap.summary);
      }
      if (recap.schedule) {
        setWorkSchedule({
          work_start_time: recap.schedule.work_start_time || '08:00',
          work_end_time: recap.schedule.work_end_time || '17:00',
          late_tolerance_minutes: recap.schedule.late_tolerance_minutes ?? 15,
          notes: recap.schedule.notes || '',
        });
      }
    } catch (e) {
      console.error('Gagal mengambil rekapitulasi presensi:', e);
    } finally {
      setRecapLoading(false);
    }
  };

  const fetchTeamLogbooks = async (page = 1, perPage = teamLogbookPerPage) => {
    setTeamLogbookLoading(true);
    try {
      const teamLogs = await api.get(`/logbooks?page=${page}&per_page=${perPage}`);
      setTeamLogbooks(teamLogs.data || []);
      setTeamLogbookPage(teamLogs.current_page || page);
      setTeamLogbookPagination({
        current_page: teamLogs.current_page || 1,
        last_page: teamLogs.last_page || 1,
        total: teamLogs.total || 0,
        from: teamLogs.from || 0,
        to: teamLogs.to || 0,
        per_page: teamLogs.per_page || perPage,
      });
    } catch (e) {
      console.error('Gagal mengambil logbook tim:', e);
    } finally {
      setTeamLogbookLoading(false);
    }
  };

  const fetchMonitoringData = async () => {
    try {
      const missing = await api.get('/logbooks/missing-today');
      setMissingUsers(missing.users || []);
    } catch (e) {
      console.error(e);
    }
    fetchAttendanceRecap(1, recapPerPage, recapStatusFilter, recapSearch, recapMonth, recapYear);
    fetchTeamLogbooks(1, teamLogbookPerPage);
  };

  useEffect(() => {
    fetchTodayAttendance();
    fetchMyLogbooks();
    fetchSchedule();
    if (hasRole('direktur') || hasRole('hr_manager') || hasRole('program_manager') || hasRole('superadmin')) {
      fetchMonitoringData();
    }
  }, []);

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setScheduleSaving(true);
    setScheduleSuccess('');
    try {
      const res = await api.post('/attendances/schedule', workSchedule);
      setScheduleSuccess(res.message || 'Kebijakan jam kerja berhasil diperbarui.');
      // Refresh rekap agar kalkulasi keterlambatan terupdate langsung
      fetchMonitoringData();
      setTimeout(() => setScheduleSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan jam kerja.');
    } finally {
      setScheduleSaving(false);
    }
  };

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      const res = await api.post('/attendances/clock-in', {
        location_note: locationNote,
      });
      setTodayAttendance(res.data);
      alert('Presensi masuk berhasil dicatat!');
      fetchTodayAttendance();
      if (hasRole('direktur') || hasRole('hr_manager') || hasRole('superadmin')) {
        fetchMonitoringData();
      }
    } catch (err) {
      alert(err.message || 'Gagal mencatat presensi masuk.');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      const res = await api.post('/attendances/clock-out');
      setTodayAttendance(res.data);
      alert('Presensi pulang berhasil dicatat!');
      fetchTodayAttendance();
      if (hasRole('direktur') || hasRole('hr_manager') || hasRole('superadmin')) {
        fetchMonitoringData();
      }
    } catch (err) {
      alert(err.message || 'Gagal mencatat presensi pulang.');
    } finally {
      setClockLoading(false);
    }
  };

  const handleSubmitLogbook = async (e) => {
    e.preventDefault();
    setLogbookLoading(true);
    try {
      const formData = new FormData();
      formData.append('date', logbookDate);
      formData.append('activity_summary', activitySummary);
      formData.append('challenges', challenges);
      formData.append('next_day_plan', nextDayPlan);

      for (let i = 0; i < logbookFiles.length; i++) {
        formData.append('files[]', logbookFiles[i]);
      }

      await api.post('/logbooks', formData);
      alert('Logbook harian berhasil disimpan!');
      setActivitySummary('');
      setChallenges('');
      setNextDayPlan('');
      setLogbookFiles([]);
      fetchMyLogbooks();
      if (hasRole('direktur') || hasRole('hr_manager') || hasRole('program_manager') || hasRole('superadmin')) {
        fetchMonitoringData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menyimpan logbook.');
    } finally {
      setLogbookLoading(false);
    }
  };

  const handleOpenDetail = (log) => {
    setSelectedLogbook(log);
    setIsModalOpen(true);
  };

  const isDirectorOrAdmin = hasRole('direktur') || hasRole('superadmin');
  const canMonitor = isDirectorOrAdmin || hasRole('hr_manager') || hasRole('program_manager');

  return (
    <AppLayout 
      pageTitle="Presensi & Logbook Terintegrasi" 
      pageSubtitle="Pencatatan jam kerja, monitoring kedisiplinan keterlambatan, dan verifikasi detail logbook staf lapangan Papua."
      breadcrumbs={['Presensi & Logbook']}
    >
      {/* Top Segmented Navigation Tabs */}
      <div className="mb-6 flex items-center gap-3 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] w-fit">
        <button
          onClick={() => setActiveTab('presensi_logbook_saya')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'presensi_logbook_saya'
              ? 'bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-white shadow-sm'
              : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
          }`}
        >
          Presensi & Logbook Saya
        </button>

        {canMonitor && (
          <button
            onClick={() => setActiveTab('monitoring_tim')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'monitoring_tim'
                ? 'bg-white dark:bg-[#1C1C1E] text-[#059669] dark:text-[#34D399] shadow-sm font-bold'
                : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Monitoring Tim & Kebijakan Jam Kerja
          </button>
        )}
      </div>

      {activeTab === 'presensi_logbook_saya' ? (
        <div className="space-y-6">
          {/* Top Section: Dua Kartu Seimbang Berdampingan (Presensi Hari Ini & Formulir Logbook) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Kolom Kiri: Presensi Masuk / Pulang Hari Ini (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col">
              <Card className="h-full flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#059669]/10 text-[#059669] dark:text-[#34D399] flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle>Presensi Hari Ini</CardTitle>
                      <CardDescription>Waktu Indonesia Timur (WIT)</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-center my-auto">
                  <div className="inline-block p-4 rounded-3xl bg-[#059669]/10 border border-[#059669]/20 text-[#059669] dark:text-[#34D399]">
                    <CalendarCheck className="w-10 h-10" />
                  </div>

                  <div>
                    <p className="text-xs text-[#8E8E93] uppercase font-semibold tracking-wider">
                      {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm font-bold text-[#1C1C1E] dark:text-white mt-1">
                      Jadwal Masuk: <span className="font-mono text-[#059669] dark:text-[#34D399]">{workSchedule.work_start_time}</span> WIT
                    </p>
                  </div>

                  {todayAttendance ? (
                    <div className="p-3.5 rounded-2xl bg-black/[0.025] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] text-left text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[#8E8E93]">Jam Masuk:</span>
                        <span className="font-mono font-bold text-[#059669] dark:text-[#34D399]">
                          {todayAttendance.clock_in || '-'} WIT
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8E8E93]">Jam Pulang:</span>
                        <span className="font-mono font-bold text-[#1C1C1E] dark:text-white">
                          {todayAttendance.clock_out ? `${todayAttendance.clock_out} WIT` : 'Belum clock out'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8E8E93]">Status:</span>
                        <Badge variant={todayAttendance.status === 'terlambat' ? 'danger' : 'success'} dot>
                          {todayAttendance.status === 'terlambat' ? 'Terlambat' : 'Hadir Tepat Waktu'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-black/[0.04] dark:border-white/[0.05]">
                        <span className="text-[#8E8E93]">Lokasi:</span>
                        <span className="font-medium text-[#1C1C1E] dark:text-white truncate max-w-[160px]">
                          {todayAttendance.location_note || 'Pos Lapangan Merauke'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-[#FF9500]/10 border border-[#FF9500]/25 text-xs text-[#B26A00] dark:text-[#FF9F0A] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Anda belum mencatat presensi masuk hari ini.</span>
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    {!todayAttendance?.clock_in ? (
                      <>
                        <input
                          type="text"
                          placeholder="Catatan lokasi (mis. Posko Distrik Semangga)"
                          value={locationNote}
                          onChange={(e) => setLocationNote(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 mb-2"
                        />
                        <Button
                          variant="default"
                          size="lg"
                          loading={clockLoading}
                          onClick={handleClockIn}
                          className="w-full font-semibold rounded-2xl shadow-md shadow-[#059669]/25"
                        >
                          <Clock className="w-4 h-4 mr-2" /> Catat Masuk (Clock In)
                        </Button>
                      </>
                    ) : !todayAttendance?.clock_out ? (
                      <Button
                        variant="secondary"
                        size="lg"
                        loading={clockLoading}
                        onClick={handleClockOut}
                        className="w-full font-semibold rounded-2xl bg-black/[0.05] dark:bg-white/[0.08]"
                      >
                        Catat Pulang (Clock Out)
                      </Button>
                    ) : (
                      <div className="p-3 rounded-2xl bg-[#34C759]/10 text-[#248A3D] dark:text-[#34D399] text-xs font-semibold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Presensi hari ini telah lengkap.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kolom Kanan: Formulir Pengisian Logbook Harian (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col">
              <Card className="h-full flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle>Isi Logbook Aktivitas Harian</CardTitle>
                      <CardDescription>Kirimkan rincian hasil kerja harian untuk ditinjau oleh pimpinan</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSubmitLogbook} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                        Tanggal Kegiatan
                      </label>
                      <input
                        type="date"
                        required
                        value={logbookDate}
                        onChange={(e) => setLogbookDate(e.target.value)}
                        className="w-full sm:w-64 px-3.5 py-2.5 text-xs bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                        Uraian Aktivitas yang Diselesaikan (Wajib)
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Jelaskan secara terperinci apa yang Anda kerjakan hari ini (misal: pemetaan 12 titik larva di Semangga, sosialisasi kelambu, rekapitulasi data puskesmas)..."
                        value={activitySummary}
                        onChange={(e) => setActivitySummary(e.target.value)}
                        className="w-full p-3.5 text-xs bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                          Kendala / Hambatan Lapangan
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Kendala cuaca hujan, jalan berlumpur, jaringan seluler..."
                          value={challenges}
                          onChange={(e) => setChallenges(e.target.value)}
                          className="w-full p-3 text-xs bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                          Rencana Tindak Lanjut Esok Hari
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Rencana kegiatan hari berikutnya..."
                          value={nextDayPlan}
                          onChange={(e) => setNextDayPlan(e.target.value)}
                          className="w-full p-3 text-xs bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 resize-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button type="submit" variant="default" size="default" loading={logbookLoading} className="rounded-2xl">
                        <Send className="w-3.5 h-3.5 mr-1.5" /> Kirim Logbook Harian
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Section: Riwayat Pengisian Logbook Saya (FULL WIDTH EDGE-TO-EDGE, NO GAP!) */}
          <Card className="w-full p-0 overflow-hidden">
            <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#059669]/10 text-[#059669] dark:text-[#34D399] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle>Riwayat Pengisian Logbook Saya</CardTitle>
                  <CardDescription>Seluruh catatan aktivitas harian yang telah Anda laporkan ke yayasan</CardDescription>
                </div>
              </div>
              <Badge variant="outline">{myLogbooks.length} Laporan Terdaftar</Badge>
            </div>

            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
              {myLogbooks.length > 0 ? (
                myLogbooks.map((log) => {
                  const formattedDate = formatDateId(log.date);

                  return (
                    <div key={log.id} className="p-5 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#059669] dark:text-[#34D399]">
                            {formattedDate}
                          </span>
                          <Badge variant={log.status === 'approved' ? 'success' : 'outline'} dot>
                            {log.status === 'approved' ? 'Disetujui Direktur' : 'Terkirim'}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-[#1C1C1E] dark:text-neutral-200 line-clamp-2 leading-relaxed">
                          {log.activity_summary}
                        </p>
                        {log.challenges && (
                          <p className="text-[11px] text-[#FF9500] font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" /> Kendala: {log.challenges}
                          </p>
                        )}
                        {log.feedback && (
                          <p className="text-[11px] text-[#059669] dark:text-[#34D399] font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 shrink-0" /> Ulasan Direktur: "{log.feedback}"
                          </p>
                        )}
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleOpenDetail(log)}
                        className="shrink-0 text-xs font-semibold px-4 rounded-xl bg-[#059669] hover:bg-[#047857]"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" /> Detail
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="p-8 text-center text-xs text-[#8E8E93]">Belum ada logbook tersimpan.</p>
              )}
            </div>
          </Card>
        </div>
      ) : (
        /* =========================================================================
            TAB KHUSUS: MONITORING TIM, KEBIJAKAN JAM KERJA & DETAIL LOGBOOK DIREKSI
        ========================================================================= */
        <div className="space-y-6">
          
          {/* 1. Pengaturan Kebijakan Jam Kerja Direktur (FR-ABS) */}
          {isDirectorOrAdmin && (
            <Card className="border-2 border-[#059669]/30 bg-gradient-to-br from-[#059669]/5 via-transparent to-transparent">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-[#059669]/20 text-[#059669] dark:text-[#34D399] flex items-center justify-center">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle>Kebijakan Jam Kerja Yayasan (Aturan Masuk & Pulang)</CardTitle>
                      <CardDescription>Diatur oleh Direktur Eksekutif untuk pendeteksian otomatis keterlambatan staf</CardDescription>
                    </div>
                  </div>
                  <Badge variant="success">Otoritas Direksi</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSaveSchedule} className="space-y-4">
                  {scheduleSuccess && (
                    <div className="p-3.5 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/25 text-xs text-[#248A3D] dark:text-[#34D399] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{scheduleSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                        Jam Masuk Kerja (WIT)
                      </label>
                      <input
                        type="time"
                        required
                        value={workSchedule.work_start_time}
                        onChange={(e) => setWorkSchedule({ ...workSchedule, work_start_time: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm font-mono font-bold bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                      />
                      <span className="text-[10px] text-[#8E8E93] mt-1 block">Waktu mulai jam operasional</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                        Toleransi Keterlambatan (Menit)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        required
                        value={workSchedule.late_tolerance_minutes}
                        onChange={(e) => setWorkSchedule({ ...workSchedule, late_tolerance_minutes: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 text-sm font-mono font-bold bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                      />
                      <span className="text-[10px] text-[#8E8E93] mt-1 block">Toleransi batas bebas sanksi</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                        Jam Pulang Kerja (WIT)
                      </label>
                      <input
                        type="time"
                        required
                        value={workSchedule.work_end_time}
                        onChange={(e) => setWorkSchedule({ ...workSchedule, work_end_time: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm font-mono font-bold bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                      />
                      <span className="text-[10px] text-[#8E8E93] mt-1 block">Waktu minimum presensi pulang</span>
                    </div>
                  </div>

                  {/* Informational Guidance Box */}
                  <div className="p-3.5 rounded-2xl bg-black/[0.025] dark:bg-white/[0.035] border border-black/[0.05] dark:border-white/[0.06] text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#059669]" />
                      <span className="text-[#1C1C1E] dark:text-neutral-200">
                        Aturan Aktif: Karyawan yang clock-in setelah pukul{' '}
                        <strong className="text-[#FF3B30] font-mono">
                          {workSchedule.work_start_time} (+{workSchedule.late_tolerance_minutes} mnt toleransi)
                        </strong>{' '}
                        otomatis ditandai <strong>Terlambat</strong> dan dihitung menit keterlambatannya.
                      </span>
                    </div>
                    <Button type="submit" variant="default" size="sm" loading={scheduleSaving} className="rounded-xl shrink-0">
                      Simpan Kebijakan Jam Kerja
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Missing Logbooks Alert */}
          {missingUsers.length > 0 && (
            <div className="p-4 rounded-3xl bg-[#FF9500]/10 border border-[#FF9500]/25 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FF9500]/20 flex items-center justify-center text-[#B26A00] dark:text-[#FF9F0A] shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#1C1C1E] dark:text-white">
                  Peringatan: {missingUsers.length} Pegawai Belum Mengisi Logbook Hari Ini
                </h4>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {missingUsers.map((u) => (
                    <span key={u.id} className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#2C2C2E]/80 text-[11px] font-semibold text-[#1C1C1E] dark:text-neutral-200 border border-black/[0.05] dark:border-white/[0.06]">
                      {u.name} ({u.division})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Rekapitulasi Presensi & Deteksi Karyawan Telat (Dengan Pagination & Filter Direktur) */}
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Rekapitulasi Presensi Karyawan & Status Keterlambatan</CardTitle>
                <CardDescription>Ketepatan waktu presensi dihitung otomatis terhadap batas jam masuk {workSchedule.work_start_time} WIT</CardDescription>
              </div>

              {/* Summary Counter Badges */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#34C759]/15 text-[#248A3D] dark:text-[#34D399]">
                  {recapSummary.total_on_time} Tepat Waktu
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FF3B30]/15 text-[#FF3B30]">
                  {recapSummary.total_late} Terlambat
                </span>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="p-4 bg-black/[0.015] dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.06] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Left: Quick Search & Status Pills */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
                  <input
                    type="text"
                    placeholder="Cari pegawai, jabatan, atau divisi..."
                    value={recapSearch}
                    onChange={(e) => setRecapSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchAttendanceRecap(1, recapPerPage, recapStatusFilter, recapSearch, recapMonth, recapYear);
                      }
                    }}
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-white dark:bg-[#2C2C2E] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setRecapStatusFilter('all');
                      fetchAttendanceRecap(1, recapPerPage, 'all', recapSearch, recapMonth, recapYear);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      recapStatusFilter === 'all'
                        ? 'bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-white shadow-sm font-bold'
                        : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                    }`}
                  >
                    Semua ({recapSummary.total_records})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecapStatusFilter('hadir');
                      fetchAttendanceRecap(1, recapPerPage, 'hadir', recapSearch, recapMonth, recapYear);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      recapStatusFilter === 'hadir'
                        ? 'bg-white dark:bg-[#1C1C1E] text-[#059669] dark:text-[#34D399] shadow-sm font-bold'
                        : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                    }`}
                  >
                    Tepat Waktu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecapStatusFilter('terlambat');
                      fetchAttendanceRecap(1, recapPerPage, 'terlambat', recapSearch, recapMonth, recapYear);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      recapStatusFilter === 'terlambat'
                        ? 'bg-white dark:bg-[#1C1C1E] text-[#FF3B30] shadow-sm font-bold'
                        : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                    }`}
                  >
                    Terlambat
                  </button>
                </div>
              </div>

              {/* Right: Month & Year Selector + Refresh */}
              <div className="flex items-center gap-2 self-end lg:self-auto">
                <select
                  value={recapMonth}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setRecapMonth(m);
                    fetchAttendanceRecap(1, recapPerPage, recapStatusFilter, recapSearch, m, recapYear);
                  }}
                  className="px-3 py-2 text-xs font-semibold bg-white dark:bg-[#2C2C2E] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30 cursor-pointer"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  value={recapYear}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    setRecapYear(y);
                    fetchAttendanceRecap(1, recapPerPage, recapStatusFilter, recapSearch, recapMonth, y);
                  }}
                  className="px-3 py-2 text-xs font-semibold bg-white dark:bg-[#2C2C2E] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30 cursor-pointer"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchAttendanceRecap(recapPagination.current_page, recapPerPage, recapStatusFilter, recapSearch, recapMonth, recapYear)}
                  loading={recapLoading}
                  className="h-9 px-3 rounded-xl"
                  title="Segarkan Rekapitulasi"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto relative">
              {recapLoading && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-lg border border-black/[0.08] dark:border-white/[0.1] text-xs font-semibold text-[#059669] dark:text-[#34D399]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memuat data presensi...</span>
                  </div>
                </div>
              )}

              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#8E8E93] border-b border-black/[0.05] dark:border-white/[0.06] font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Tanggal</th>
                    <th className="px-5 py-3.5">Nama Pegawai & Divisi</th>
                    <th className="px-5 py-3.5">Jam Masuk</th>
                    <th className="px-5 py-3.5">Jam Pulang</th>
                    <th className="px-5 py-3.5">Status Kedisiplinan</th>
                    <th className="px-5 py-3.5">Lokasi / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                  {attendanceRecap.length > 0 ? (
                    attendanceRecap.map((att) => {
                      const isLate = att.is_late || att.status === 'terlambat';
                      return (
                        <tr key={att.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xs text-[#1C1C1E] dark:text-neutral-200">
                            {formatDateId(att.date)}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-[#1C1C1E] dark:text-white">{att.user?.name}</p>
                            <p className="text-[11px] text-[#8E8E93]">{att.user?.position} · {att.user?.division}</p>
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-xs text-[#1C1C1E] dark:text-white">
                            {att.clock_in ? `${att.clock_in} WIT` : '-'}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs text-[#8E8E93]">
                            {att.clock_out ? `${att.clock_out} WIT` : 'Belum absen'}
                          </td>
                          <td className="px-5 py-3.5">
                            {isLate ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FF3B30]/15 text-[#FF3B30]">
                                <AlertTriangle className="w-3 h-3" />
                                Terlambat {att.late_minutes > 0 ? `(+${att.late_minutes} mnt)` : ''}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#34C759]/15 text-[#248A3D] dark:text-[#34D399]">
                                <CheckCircle2 className="w-3 h-3" />
                                Tepat Waktu
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[#8E8E93]">
                            <p className="text-[#1C1C1E] dark:text-neutral-300 font-medium">{att.location_note || 'Kantor Utama'}</p>
                            {att.notes && <p className="text-[10px] text-[#8E8E93] italic line-clamp-1">{att.notes}</p>}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-[#8E8E93]">
                        Belum ada rekaman presensi tim pada periode atau kriteria pencarian ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Apple iOS Pagination Footer for Rekapitulasi Presensi */}
            <div className="p-4 bg-black/[0.015] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8E8E93]">
              <div className="flex items-center gap-3">
                <span>
                  Menampilkan <strong className="text-[#1C1C1E] dark:text-white font-mono">{recapPagination.from || 0}</strong> - <strong className="text-[#1C1C1E] dark:text-white font-mono">{recapPagination.to || 0}</strong> dari <strong className="text-[#1C1C1E] dark:text-white font-mono">{recapPagination.total || 0}</strong> presensi
                </span>
                <span className="text-black/15 dark:text-white/15">|</span>
                <div className="flex items-center gap-1.5">
                  <span>Per hal:</span>
                  <select
                    value={recapPerPage}
                    onChange={(e) => {
                      const newPerPage = Number(e.target.value);
                      setRecapPerPage(newPerPage);
                      fetchAttendanceRecap(1, newPerPage, recapStatusFilter, recapSearch, recapMonth, recapYear);
                    }}
                    className="px-2 py-1 bg-white dark:bg-[#2C2C2E] border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-xs font-semibold text-[#1C1C1E] dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={recapPagination.current_page <= 1 || recapLoading}
                  onClick={() => fetchAttendanceRecap(recapPagination.current_page - 1, recapPerPage, recapStatusFilter, recapSearch, recapMonth, recapYear)}
                  className="rounded-xl px-2.5 h-8 text-xs font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Sebelumnya
                </Button>

                {/* Numbered Page Pills */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: recapPagination.last_page || 1 }, (_, i) => i + 1)
                    .filter(page => {
                      if (recapPagination.last_page <= 7) return true;
                      return page === 1 || page === recapPagination.last_page || Math.abs(page - recapPagination.current_page) <= 1;
                    })
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      const isActive = recapPagination.current_page === page;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className="px-1 text-[#8E8E93] select-none">…</span>}
                          <button
                            type="button"
                            onClick={() => fetchAttendanceRecap(page, recapPerPage, recapStatusFilter, recapSearch, recapMonth, recapYear)}
                            disabled={recapLoading || isActive}
                            className={`h-8 min-w-[32px] px-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#059669] text-white shadow-sm shadow-[#059669]/30 scale-105 pointer-events-none'
                                : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#1C1C1E] dark:text-neutral-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={recapPagination.current_page >= recapPagination.last_page || recapLoading}
                  onClick={() => fetchAttendanceRecap(recapPagination.current_page + 1, recapPerPage, recapStatusFilter, recapSearch, recapMonth, recapYear)}
                  className="rounded-xl px-2.5 h-8 text-xs font-semibold"
                >
                  Berikutnya <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* 3. Daftar & Detail Logbook Harian Pegawai (FR-LOG dengan Pagination) */}
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <CardTitle>Logbook Harian Pegawai (Daftar & Peninjauan)</CardTitle>
                <CardDescription>Klik "Lihat Detail" untuk membaca seluruh laporan aktivitas, kendala lapangan, serta memberi persetujuan direktur</CardDescription>
              </div>
              <Badge variant="outline">{teamLogbookPagination.total || teamLogbooks.length} Laporan</Badge>
            </div>

            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.05] relative">
              {teamLogbookLoading && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-lg border border-black/[0.08] dark:border-white/[0.1] text-xs font-semibold text-[#059669] dark:text-[#34D399]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memuat logbook tim...</span>
                  </div>
                </div>
              )}

              {teamLogbooks.length > 0 ? (
                teamLogbooks.map((log) => (
                  <div key={log.id} className="p-5 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#059669] dark:text-[#34D399]">
                          {formatDateId(log.date)}
                        </span>
                        <Badge variant="info">
                          {log.user?.division || 'Operasional'}
                        </Badge>
                        <Badge variant={log.status === 'approved' ? 'success' : 'warning'} dot>
                          {log.status === 'approved' ? 'Disetujui Direktur' : 'Menunggu Review'}
                        </Badge>
                      </div>

                      <h4 className="font-bold text-sm text-[#1C1C1E] dark:text-white">
                        {log.user?.name} · <span className="font-normal text-xs text-[#8E8E93]">{log.user?.position}</span>
                      </h4>

                      <p className="text-xs text-[#1C1C1E] dark:text-neutral-300 line-clamp-2 leading-relaxed">
                        {log.activity_summary}
                      </p>

                      {log.challenges && (
                        <p className="text-[11px] text-[#FF9500] font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" /> Kendala: {log.challenges}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleOpenDetail(log)}
                        className="text-xs font-semibold px-4 rounded-xl bg-[#059669] hover:bg-[#047857]"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" /> Lihat Detail & Ulas
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-8 text-center text-xs text-[#8E8E93]">Belum ada logbook staf yang tercatat.</p>
              )}
            </div>

            {/* Apple iOS Pagination Footer for Team Logbooks */}
            <div className="p-4 bg-black/[0.015] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8E8E93]">
              <div className="flex items-center gap-3">
                <span>
                  Menampilkan <strong className="text-[#1C1C1E] dark:text-white font-mono">{teamLogbookPagination.from || 0}</strong> - <strong className="text-[#1C1C1E] dark:text-white font-mono">{teamLogbookPagination.to || 0}</strong> dari <strong className="text-[#1C1C1E] dark:text-white font-mono">{teamLogbookPagination.total || 0}</strong> laporan
                </span>
                <span className="text-black/15 dark:text-white/15">|</span>
                <div className="flex items-center gap-1.5">
                  <span>Per hal:</span>
                  <select
                    value={teamLogbookPerPage}
                    onChange={(e) => {
                      const newPerPage = Number(e.target.value);
                      setTeamLogbookPerPage(newPerPage);
                      fetchTeamLogbooks(1, newPerPage);
                    }}
                    className="px-2 py-1 bg-white dark:bg-[#2C2C2E] border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-xs font-semibold text-[#1C1C1E] dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={teamLogbookPagination.current_page <= 1 || teamLogbookLoading}
                  onClick={() => fetchTeamLogbooks(teamLogbookPagination.current_page - 1, teamLogbookPerPage)}
                  className="rounded-xl px-2.5 h-8 text-xs font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Sebelumnya
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: teamLogbookPagination.last_page || 1 }, (_, i) => i + 1)
                    .filter(page => {
                      if (teamLogbookPagination.last_page <= 7) return true;
                      return page === 1 || page === teamLogbookPagination.last_page || Math.abs(page - teamLogbookPagination.current_page) <= 1;
                    })
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      const isActive = teamLogbookPagination.current_page === page;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className="px-1 text-[#8E8E93] select-none">…</span>}
                          <button
                            type="button"
                            onClick={() => fetchTeamLogbooks(page, teamLogbookPerPage)}
                            disabled={teamLogbookLoading || isActive}
                            className={`h-8 min-w-[32px] px-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#059669] text-white shadow-sm shadow-[#059669]/30 scale-105 pointer-events-none'
                                : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#1C1C1E] dark:text-neutral-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={teamLogbookPagination.current_page >= teamLogbookPagination.last_page || teamLogbookLoading}
                  onClick={() => fetchTeamLogbooks(teamLogbookPagination.current_page + 1, teamLogbookPerPage)}
                  className="rounded-xl px-2.5 h-8 text-xs font-semibold"
                >
                  Berikutnya <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </div>
            </div>
          </Card>

        </div>
      )}

      {/* Modal Dialog Detail Logbook Pegawai */}
      <LogbookDetailModal
        logbook={selectedLogbook}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        canReview={isDirectorOrAdmin || hasRole('program_manager')}
        onReviewed={(updated) => {
          setSelectedLogbook(updated);
          fetchMonitoringData();
          fetchMyLogbooks();
        }}
      />
    </AppLayout>
  );
}
