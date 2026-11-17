import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { CalendarCheck, FileText, CheckCircle2, AlertTriangle, Clock, MapPin, Activity } from 'lucide-react';

export function FieldStaffCharts({ myStats }) {
  const attendanceList = myStats?.attendance_7days || [];
  const complianceRate = myStats?.compliance_rate ?? 100;
  const logbooksCount = myStats?.logbooks_count ?? 1;
  const presentDays = myStats?.present_days ?? attendanceList.filter(a => a.status === 'hadir' || a.status === 'terlambat').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Grafik Tren Kehadiran Mandiri 7 Hari */}
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <CardTitle>Tren Kehadiran Saya (7 Hari Terakhir)</CardTitle>
              </div>
              <CardDescription>Catatan presensi harian di posko lapangan Merauke</CardDescription>
            </div>
            <Badge variant="success" dot>
              {presentDays} / 7 Hari Hadir
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-2 items-end h-36 px-1 pt-2">
            {attendanceList.map((day, idx) => {
              const isPresent = day.status === 'hadir';
              const isLate = day.status === 'terlambat';
              const isAbsent = !isPresent && !isLate;

              const heightPercent = isPresent ? 85 : isLate ? 60 : 20;

              return (
                <div key={day.date || idx} className="flex flex-col items-center h-full justify-end group cursor-default">
                  {/* Floating Tooltip info on hover */}
                  <span className="text-[10px] font-mono font-bold text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity mb-1 truncate max-w-full text-center">
                    {day.clock_in ? day.clock_in.substring(0, 5) : '-'}
                  </span>

                  {/* Capsule Bar */}
                  <div className="w-full max-w-[32px] h-24 bg-black/[0.04] dark:bg-white/[0.06] rounded-full p-1 flex flex-col justify-end">
                    <div
                      className={`w-full rounded-full transition-all duration-500 ${
                        isPresent
                          ? 'bg-gradient-to-t from-[#047857] to-[#10B981]'
                          : isLate
                          ? 'bg-gradient-to-t from-[#D97706] to-[#F59E0B]'
                          : 'bg-black/[0.1] dark:bg-white/[0.1]'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className="mt-2 text-[11px] font-medium text-[#1C1C1E] dark:text-neutral-300">
                    {day.day}
                  </span>
                  <span className="text-[9px] text-[#8E8E93] font-mono">
                    {day.short_date?.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/[0.05] dark:border-white/[0.06] text-[11px] text-[#8E8E93]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Hadir Tepat Waktu
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Terlambat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black/20 dark:bg-white/20" /> Belum Clock In
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Grafik Kepatuhan Logbook & Distribusi Tugas Lapangan */}
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#007AFF]" />
                <CardTitle>Kepatuhan Pelaporan & Tugas Lapangan</CardTitle>
              </div>
              <CardDescription>Rasio penyampaian logbook kegiatan penanganan malaria</CardDescription>
            </div>
            <Badge variant="info">
              {logbooksCount} Terkirim
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar Kepatuhan Logbook */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#8E8E93]">Kepatuhan Pengisian Logbook Harian</span>
              <span className="font-mono text-[#059669] dark:text-[#34D399]">{complianceRate}% Patuh</span>
            </div>
            <div className="w-full h-3 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#059669] to-[#34D399] transition-all duration-500"
                style={{ width: `${Math.min(100, complianceRate)}%` }}
              />
            </div>
          </div>

          {/* Segmented Bar Distribusi Aktivitas Lapangan */}
          <div className="space-y-2.5 pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
            <span className="text-xs font-bold text-[#1C1C1E] dark:text-white block">
              Fokus Kegiatan Operasional Lapangan:
            </span>

            <div className="w-full h-3 rounded-full flex overflow-hidden gap-0.5">
              <div className="bg-[#059669] h-full" style={{ width: '50%' }} title="Survei Jentik: 50%" />
              <div className="bg-[#007AFF] h-full" style={{ width: '30%' }} title="Distribusi Kelambu: 30%" />
              <div className="bg-[#FF9500] h-full" style={{ width: '20%' }} title="Penyuluhan Warga: 20%" />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                <div className="flex items-center gap-1.5 text-[#059669] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#059669]" /> Survei Jentik
                </div>
                <p className="text-[10px] text-[#8E8E93] mt-0.5">12 Titik Rawa (50%)</p>
              </div>

              <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                <div className="flex items-center gap-1.5 text-[#007AFF] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#007AFF]" /> Kelambu LLIN
                </div>
                <p className="text-[10px] text-[#8E8E93] mt-0.5">50 Pcs Diterima (30%)</p>
              </div>

              <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                <div className="flex items-center gap-1.5 text-[#FF9500] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#FF9500]" /> Edukasi Warga
                </div>
                <p className="text-[10px] text-[#8E8E93] mt-0.5">Kader Kampung (20%)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
