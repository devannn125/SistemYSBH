import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  Upload, 
  AlertCircle,
  Users,
  Calendar
} from 'lucide-react';

export function AttendanceLogbook() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('presensi_logbook_saya'); // 'presensi_logbook_saya' | 'monitoring_tim'

  // Presensi State
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [locationNote, setLocationNote] = useState('');

  // Logbook State
  const [logbookDate, setLogbookDate] = useState(new Date().toISOString().slice(0, 10));
  const [activitySummary, setActivitySummary] = useState('');
  const [challenges, setChallenges] = useState('');
  const [nextDayPlan, setNextDayPlan] = useState('');
  const [logbookFiles, setLogbookFiles] = useState([]);
  const [logbookLoading, setLogbookLoading] = useState(false);
  const [myLogbooks, setMyLogbooks] = useState([]);

  // Monitoring State
  const [missingUsers, setMissingUsers] = useState([]);
  const [teamLogbooks, setTeamLogbooks] = useState([]);
  const [attendanceRecap, setAttendanceRecap] = useState([]);

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

  const fetchMonitoringData = async () => {
    try {
      const missing = await api.get('/logbooks/missing-today');
      setMissingUsers(missing.users || []);

      const recap = await api.get('/attendances/recap');
      setAttendanceRecap(recap.data || []);

      const teamLogs = await api.get('/logbooks');
      setTeamLogbooks(teamLogs.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
    fetchMyLogbooks();
    if (hasRole('direktur') || hasRole('hr_manager') || hasRole('program_manager')) {
      fetchMonitoringData();
    }
  }, []);

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      const res = await api.post('/attendances/clock-in', {
        location_note: locationNote,
      });
      setTodayAttendance(res.data);
      alert('Presensi masuk berhasil dicatat!');
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
    } catch (err) {
      alert(err.message || 'Gagal menyimpan logbook.');
    } finally {
      setLogbookLoading(false);
    }
  };

  return (
    <AppLayout 
      pageTitle="Presensi Mandiri & Logbook Harian" 
      pageSubtitle="Pencatatan kehadiran clock-in/out, pelaporan logbook aktivitas harian, dan monitoring tim posko Papua."
      breadcrumbs={['Presensi & Logbook']}
    >
      {/* Top Tabs */}
      <div className="mb-6 border-b border-[#E3EAE5] dark:border-[#22332A] flex items-center gap-6">
        <button
          onClick={() => setActiveTab('presensi_logbook_saya')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'presensi_logbook_saya'
              ? 'border-[#15803D] dark:border-[#22C55E] text-[#15803D] dark:text-[#4ADE80]'
              : 'border-transparent text-[#586862] dark:text-[#8FA89B] hover:text-[#14201A] dark:hover:text-white'
          }`}
        >
          Presensi & Logbook Saya
        </button>

        {(hasRole('direktur') || hasRole('hr_manager') || hasRole('program_manager')) && (
          <button
            onClick={() => setActiveTab('monitoring_tim')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'monitoring_tim'
                ? 'border-[#15803D] dark:border-[#22C55E] text-[#15803D] dark:text-[#4ADE80]'
                : 'border-transparent text-[#586862] dark:text-[#8FA89B] hover:text-[#14201A] dark:hover:text-white'
            }`}
          >
            Monitoring Presensi & Logbook Tim
          </button>
        )}
      </div>

      {activeTab === 'presensi_logbook_saya' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kartu Presensi Hari Ini */}
          <div className="lg:col-span-1 space-y-6">
            <Card
              header={
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#15803D] dark:text-[#4ADE80]" strokeWidth={1.75} />
                  <h3 className="font-bold text-[#14201A] dark:text-white text-base">Presensi Hari Ini</h3>
                </div>
              }
            >
              <div className="text-center py-2 space-y-4">
                <div className="inline-block p-4 rounded-full bg-[#F0FDF4] dark:bg-[#15803D]/20 border border-[#DCFCE7] dark:border-[#15803D]/40 text-[#15803D] dark:text-[#4ADE80]">
                  <CalendarCheck className="w-10 h-10" strokeWidth={1.75} />
                </div>

                <div>
                  <p className="text-xs text-[#586862] dark:text-[#8FA89B] uppercase font-semibold tracking-wider">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm font-bold text-[#14201A] dark:text-white mt-1">
                    Zona Waktu: Papua (WIT) / Kantor Utama (WIB)
                  </p>
                </div>

                {todayAttendance ? (
                  <div className="p-3.5 rounded-[10px] bg-[#F7FAF8] dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#2A3F33] text-left text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#586862] dark:text-[#8FA89B]">Masuk:</span>
                      <span className="font-mono font-bold text-[#15803D] dark:text-[#4ADE80]">
                        {todayAttendance.clock_in || '-'} WIT
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#586862] dark:text-[#8FA89B]">Pulang:</span>
                      <span className="font-mono font-bold text-[#14201A] dark:text-white">
                        {todayAttendance.clock_out ? `${todayAttendance.clock_out} WIT` : 'Belum absen pulang'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#586862] dark:text-[#8FA89B]">Lokasi:</span>
                      <span className="font-medium text-[#14201A] dark:text-[#EDF7F1]">{todayAttendance.location_note || 'Merauke'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-[10px] bg-[#FEF3C7] dark:bg-[#D97706]/20 border border-[#FDE68A] dark:border-[#D97706]/30 text-xs text-[#D97706] dark:text-[#FBBF24]">
                    Anda belum mencatat presensi masuk hari ini.
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  {!todayAttendance?.clock_in ? (
                    <>
                      <input
                        type="text"
                        placeholder="Catatan lokasi (mis. Pos Merauke)"
                        value={locationNote}
                        onChange={(e) => setLocationNote(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-[#192821] rounded-[8px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] mb-2"
                      />
                      <Button
                        variant="primary"
                        loading={clockLoading}
                        onClick={handleClockIn}
                        className="w-full justify-center"
                      >
                        Catat Masuk (Clock In)
                      </Button>
                    </>
                  ) : !todayAttendance?.clock_out ? (
                    <Button
                      variant="secondary"
                      loading={clockLoading}
                      onClick={handleClockOut}
                      className="w-full justify-center"
                    >
                      Catat Pulang (Clock Out)
                    </Button>
                  ) : (
                    <div className="p-2.5 rounded-[8px] bg-[#DCFCE7] dark:bg-[#15803D]/30 text-[#15803D] dark:text-[#4ADE80] text-xs font-semibold">
                      Presensi hari ini telah lengkap. Terima kasih atas kerja keras Anda!
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Formulir Pengisian Logbook Harian */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              header={
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#15803D] dark:text-[#4ADE80]" strokeWidth={1.75} />
                  <h3 className="font-bold text-[#14201A] dark:text-white text-base">Isi Logbook Aktivitas Harian</h3>
                </div>
              }
            >
              <form onSubmit={handleSubmitLogbook} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="date"
                    required
                    value={logbookDate}
                    onChange={(e) => setLogbookDate(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
                    Uraian Aktivitas yang Diselesaikan (Wajib)
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Jelaskan secara terperinci apa yang Anda kerjakan hari ini (misal: survei jentik di 8 titik, distribusi logistik, koordinasi puskesmas, dll.)..."
                    value={activitySummary}
                    onChange={(e) => setActivitySummary(e.target.value)}
                    className="w-full p-3 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
                      Kendala / Hambatan di Lapangan
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Kendala cuaca, transportasi, atau logistik..."
                      value={challenges}
                      onChange={(e) => setChallenges(e.target.value)}
                      className="w-full p-3 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
                      Rencana Kerja Hari Berikutnya
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Target aktivitas besok..."
                      value={nextDayPlan}
                      onChange={(e) => setNextDayPlan(e.target.value)}
                      className="w-full p-3 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E] resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
                    Lampirkan Foto Bukti / Berkas Kegiatan (Opsional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.docx"
                    onChange={(e) => setLogbookFiles(e.target.files)}
                    className="w-full text-xs text-[#586862] dark:text-[#8FA89B] file:mr-4 file:py-2 file:px-4 file:rounded-[8px] file:border-0 file:text-xs file:font-semibold file:bg-[#DCFCE7] dark:file:bg-[#15803D]/30 file:text-[#15803D] dark:file:text-[#4ADE80]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" loading={logbookLoading}>
                    Kirim Logbook Harian
                  </Button>
                </div>
              </form>
            </Card>

            {/* Riwayat Logbook Pribadi */}
            <Card
              header={
                <h4 className="font-bold text-sm text-[#14201A] dark:text-white">Riwayat Pengisian Logbook Saya</h4>
              }
              padding="p-0"
            >
              <div className="divide-y divide-[#E3EAE5] dark:divide-[#22332A]">
                {myLogbooks.length > 0 ? (
                  myLogbooks.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-[#F0FDF4] dark:hover:bg-[#192821] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-xs text-[#15803D] dark:text-[#4ADE80]">
                          {log.date}
                        </span>
                        <Badge status="submitted" label="Terkirim" />
                      </div>
                      <p className="text-xs text-[#14201A] dark:text-[#EDF7F1] line-clamp-2">{log.activity_summary}</p>
                      {log.challenges && (
                        <p className="text-[11px] text-[#D97706] dark:text-[#FBBF24] mt-1 italic">
                          Kendala: {log.challenges}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="p-6 text-center text-xs text-[#586862] dark:text-[#8FA89B]">Belum ada logbook tersimpan.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Tab Monitoring Tim bagi Direktur & Manager (FR-LOG-03 & 04) */
        <div className="space-y-6">
          {/* Missing Logbooks Alert (FR-LOG-04) */}
          {missingUsers.length > 0 && (
            <Card
              header={
                <div className="flex items-center gap-2 text-[#D97706] dark:text-[#FBBF24]">
                  <AlertCircle className="w-5 h-5" strokeWidth={1.75} />
                  <h3 className="font-bold text-base">Staf Belum Mengisi Logbook Hari Ini ({missingUsers.length} Orang)</h3>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {missingUsers.map((u) => (
                  <div key={u.id} className="p-2.5 rounded-[8px] bg-[#FEF3C7]/40 dark:bg-[#D97706]/15 border border-[#FDE68A] dark:border-[#D97706]/30 text-xs">
                    <p className="font-bold text-[#14201A] dark:text-white">{u.name}</p>
                    <p className="text-[#586862] dark:text-[#8FA89B] text-[11px]">{u.position} · {u.division}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Rekap Presensi Seluruh Staf */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <h3 className="font-bold text-[#14201A] dark:text-white text-base">Rekap Presensi Karyawan</h3>
                <span className="text-xs text-[#586862] dark:text-[#8FA89B]">Bulan Berjalan</span>
              </div>
            }
            padding="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F7FAF8] dark:bg-[#192821] text-[#586862] dark:text-[#8FA89B] text-xs uppercase font-semibold border-b border-[#E3EAE5] dark:border-[#22332A]">
                  <tr>
                    <th className="px-5 py-3.5">Tanggal</th>
                    <th className="px-5 py-3.5">Nama Pegawai</th>
                    <th className="px-5 py-3.5">Masuk</th>
                    <th className="px-5 py-3.5">Pulang</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Lokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE5] dark:divide-[#22332A]">
                  {attendanceRecap.map((att) => (
                    <tr key={att.id} className="hover:bg-[#F0FDF4] dark:hover:bg-[#192821]/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-[#14201A] dark:text-[#EDF7F1]">{att.date}</td>
                      <td className="px-5 py-3.5 font-medium text-xs text-[#14201A] dark:text-[#EDF7F1]">{att.user?.name}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[#15803D] dark:text-[#4ADE80]">{att.clock_in || '-'}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[#14201A] dark:text-[#EDF7F1]">{att.clock_out || '-'}</td>
                      <td className="px-5 py-3.5"><Badge status={att.status} /></td>
                      <td className="px-5 py-3.5 text-xs text-[#586862] dark:text-[#8FA89B]">{att.location_note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}

