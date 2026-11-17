import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Calendar, TrendingUp, Users } from 'lucide-react';

export function AttendanceChart({ data = [] }) {
  const [activeBar, setActiveBar] = useState(null);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tren Presensi 7 Hari Terakhir</CardTitle>
          <CardDescription>Belum ada rekaman riwayat presensi</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate average attendance rate
  const totalRates = data.reduce((sum, item) => sum + (item.rate || 0), 0);
  const avgRate = Math.round(totalRates / data.length);
  const totalEmployees = data[data.length - 1]?.total || 8;

  // Selected item (either hovered or default to the most recent day)
  const currentItem = activeBar !== null ? data[activeBar] : data[data.length - 1];

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              <CardTitle>Tren Kehadiran Pegawai (7 Hari)</CardTitle>
            </div>
            <CardDescription>Tingkat kedisiplinan & presensi seluruh staf YSBH</CardDescription>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#059669]/10 text-[#059669] dark:text-[#34D399]">
              <TrendingUp className="w-3 h-3" />
              {avgRate}% Rata-rata
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Inspection Pill */}
        <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between transition-all">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#059669]/15 text-[#059669] dark:text-[#34D399] flex items-center justify-center font-bold text-xs">
              {currentItem?.day}
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C1C1E] dark:text-white">
                {currentItem?.short_date} ({currentItem?.day})
              </p>
              <p className="text-[11px] text-[#8E8E93]">
                {currentItem?.present} dari {currentItem?.total} pegawai hadir
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-base font-extrabold text-[#059669] dark:text-[#34D399]">
              {currentItem?.rate}%
            </span>
            <p className="text-[10px] text-[#8E8E93]">Tingkat Kehadiran</p>
          </div>
        </div>

        {/* 7-Day Capsule Bars (Apple Health style) */}
        <div className="pt-2 pb-1">
          <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-36 px-1">
            {data.map((item, index) => {
              const isSelected = activeBar === index || (activeBar === null && index === data.length - 1);
              const barHeightPercent = Math.max(14, item.rate);

              return (
                <div
                  key={item.date || index}
                  className="flex flex-col items-center h-full justify-end cursor-pointer group"
                  onMouseEnter={() => setActiveBar(index)}
                  onMouseLeave={() => setActiveBar(null)}
                  onClick={() => setActiveBar(index)}
                >
                  {/* Floating percentage label on hover */}
                  <span
                    className={`text-[10px] font-mono font-bold transition-all duration-200 mb-1.5 ${
                      isSelected
                        ? 'text-[#059669] dark:text-[#34D399] scale-110'
                        : 'text-[#8E8E93] opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {item.present}
                  </span>

                  {/* Outer Capsule Track */}
                  <div className="w-full max-w-[32px] h-24 bg-black/[0.04] dark:bg-white/[0.06] rounded-full p-1 flex flex-col justify-end transition-all duration-300 relative overflow-hidden group-hover:bg-black/[0.07] dark:group-hover:bg-white/[0.1]">
                    {/* Filled Bar */}
                    <div
                      className={`w-full rounded-full transition-all duration-500 ${
                        isSelected
                          ? 'bg-gradient-to-t from-[#047857] to-[#10B981] shadow-md shadow-[#059669]/30'
                          : 'bg-gradient-to-t from-[#059669]/70 to-[#34D399]/70 group-hover:from-[#059669] group-hover:to-[#10B981]'
                      }`}
                      style={{ height: `${barHeightPercent}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`mt-2 text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'font-bold text-[#1C1C1E] dark:text-white'
                        : 'text-[#8E8E93]'
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-2 border-t border-black/[0.05] dark:border-white/[0.06] text-[11px] text-[#8E8E93]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> Hadir di Lapangan / Kantor
          </span>
          <span>Kapasitas: {totalEmployees} Staf</span>
        </div>
      </CardContent>
    </Card>
  );
}
