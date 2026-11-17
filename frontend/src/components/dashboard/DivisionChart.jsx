import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, Briefcase, HeartHandshake, Shield, MapPin, DollarSign, Sparkles, Building2 } from 'lucide-react';

export function DivisionChart({ divisions = [] }) {
  const [hoveredDiv, setHoveredDiv] = useState(null);

  if (!divisions || divisions.length === 0) {
    return (
      <Card className="h-full flex flex-col justify-between">
        <CardHeader>
          <CardTitle>Distribusi Pegawai per Divisi</CardTitle>
          <CardDescription>Belum ada rekaman data divisi pegawai</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalStaff = divisions.reduce((sum, item) => sum + (item.count || 0), 0);

  const getDivisionMeta = (divName = '') => {
    const lower = divName.toLowerCase();
    if (lower.includes('direksi')) {
      return {
        icon: <Shield className="w-4 h-4 text-[#AF52DE]" />,
        iconBg: 'bg-[#AF52DE]/15',
        barColor: 'from-[#AF52DE] to-[#BF5AF2]',
        solidBg: 'bg-[#AF52DE]',
        textColor: 'text-[#AF52DE]',
        subtitle: 'Manajemen Eksekutif & Pengambilan Kebijakan',
      };
    }
    if (lower.includes('hr') || lower.includes('sdm')) {
      return {
        icon: <Users className="w-4 h-4 text-[#007AFF]" />,
        iconBg: 'bg-[#007AFF]/15',
        barColor: 'from-[#007AFF] to-[#0A84FF]',
        solidBg: 'bg-[#007AFF]',
        textColor: 'text-[#007AFF]',
        subtitle: 'Pengelolaan SDM, Rekrutmen & Kontrak Staf',
      };
    }
    if (lower.includes('keuangan')) {
      return {
        icon: <DollarSign className="w-4 h-4 text-[#34C759]" />,
        iconBg: 'bg-[#34C759]/15',
        barColor: 'from-[#34C759] to-[#30D158]',
        solidBg: 'bg-[#34C759]',
        textColor: 'text-[#34C759]',
        subtitle: 'Perencanaan Anggaran (RAB) & Verifikasi LPJ',
      };
    }
    if (lower.includes('lapangan')) {
      return {
        icon: <MapPin className="w-4 h-4 text-[#FF9500]" />,
        iconBg: 'bg-[#FF9500]/15',
        barColor: 'from-[#FF9500] to-[#FF9F0A]',
        solidBg: 'bg-[#FF9500]',
        textColor: 'text-[#FF9500]',
        subtitle: 'Survei Vektor Jentik & Posko Distrik Merauke',
      };
    }
    return {
      icon: <Briefcase className="w-4 h-4 text-[#059669]" />,
      iconBg: 'bg-[#059669]/15',
      barColor: 'from-[#059669] to-[#10B981]',
      solidBg: 'bg-[#059669]',
      textColor: 'text-[#059669]',
      subtitle: 'Operasional Program Malaria & Distribusi Kelambu',
    };
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#AF52DE]" />
                <CardTitle>Distribusi Pegawai per Divisi</CardTitle>
              </div>
              <CardDescription>Sebaran SDM di kantor operasional & posko lapangan Papua</CardDescription>
            </div>
            <Badge variant="outline" className="font-mono">
              {totalStaff} Total Pegawai
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Top Multi-Segmented Storage Bar (Apple Style) */}
          <div className="space-y-1.5">
            <div className="w-full h-3.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full flex overflow-hidden p-0.5 gap-0.5 shadow-inner">
              {divisions.map((item) => {
                const meta = getDivisionMeta(item.division);
                const pct = totalStaff > 0 ? (item.count / totalStaff) * 100 : 0;
                const isHovered = hoveredDiv === item.division;
                return (
                  <div
                    key={item.division}
                    className={`h-full rounded-full transition-all duration-300 ${meta.solidBg} ${
                      isHovered ? 'scale-y-125 brightness-110 z-10' : 'opacity-90 hover:opacity-100'
                    }`}
                    style={{ width: `${pct}%` }}
                    title={`${item.division}: ${item.count} orang (${Math.round(pct)}%)`}
                    onMouseEnter={() => setHoveredDiv(item.division)}
                    onMouseLeave={() => setHoveredDiv(null)}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
              <span>Komposisi Ketenagakerjaan</span>
              <span>100% Terverifikasi</span>
            </div>
          </div>

          {/* Division Item Cards */}
          <div className="space-y-2.5">
            {divisions.map((item) => {
              const meta = getDivisionMeta(item.division);
              const pct = totalStaff > 0 ? Math.round((item.count / totalStaff) * 100) : 0;
              const isHovered = hoveredDiv === item.division;

              return (
                <div
                  key={item.division}
                  onMouseEnter={() => setHoveredDiv(item.division)}
                  onMouseLeave={() => setHoveredDiv(null)}
                  className={`p-3 rounded-2xl border transition-all duration-200 space-y-2 ${
                    isHovered
                      ? 'bg-black/[0.04] dark:bg-white/[0.06] border-black/[0.1] dark:border-white/[0.15] shadow-sm translate-x-0.5'
                      : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.04] dark:border-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${meta.iconBg} flex items-center justify-center shrink-0`}>
                        {meta.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1C1C1E] dark:text-white leading-tight">
                          {item.division}
                        </p>
                        <p className="text-[10px] text-[#8E8E93] mt-0.5 leading-tight">
                          {meta.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="font-mono text-sm font-bold text-[#1C1C1E] dark:text-white">
                          {item.count}
                        </span>
                        <span className="text-[10px] text-[#8E8E93]">orang</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold ${meta.textColor}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Individual Animated Progress Bar */}
                  <div className="w-full h-1.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${meta.barColor} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </div>

      {/* Bottom Anchoring Footer (Eliminates Container Gap) */}
      <div className="p-4 mx-6 mb-6 rounded-2xl bg-black/[0.025] dark:bg-white/[0.035] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between text-xs text-[#8E8E93]">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-[#059669]" />
          <span>Fokus Penempatan:</span>
        </div>
        <span className="font-semibold text-[#1C1C1E] dark:text-white">
          Merauke, Jayapura & Kantor Utama
        </span>
      </div>
    </Card>
  );
}
