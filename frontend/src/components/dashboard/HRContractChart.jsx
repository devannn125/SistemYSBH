import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { Users, AlertTriangle, ShieldCheck, ArrowRight, Clock } from 'lucide-react';

export function HRContractChart({ contractStats, expiringList = [] }) {
  const total = contractStats?.total ?? 8;
  const active = contractStats?.active ?? 8;
  const expiringSoon = expiringList.length > 0 ? expiringList.length : (contractStats?.expiring_soon ?? 0);
  const safe = Math.max(0, active - expiringSoon);

  const safePercent = active > 0 ? Math.round((safe / active) * 100) : 100;
  const expiringPercent = active > 0 ? Math.round((expiringSoon / active) * 100) : 0;

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#007AFF]" />
              <CardTitle>Status Masa Berlaku Kontrak Pegawai</CardTitle>
            </div>
            <CardDescription>Pemantauan siklus masa kerja seluruh staf yayasan (FR-HR-03)</CardDescription>
          </div>
          <Badge variant={expiringSoon > 0 ? 'warning' : 'success'}>
            {expiringSoon > 0 ? `${expiringSoon} Perlu Perpanjangan` : 'Semua Aman'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-black/[0.025] dark:bg-white/[0.035] border border-black/[0.05] dark:border-white/[0.06]">
            <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block">
              Masa Kerja Aman (&gt; 60 Hari)
            </span>
            <span className="text-xl font-bold font-mono text-[#059669] dark:text-[#34D399] mt-1 block">
              {safe} <span className="text-xs font-normal text-[#8E8E93]">Pegawai</span>
            </span>
            <span className="text-[10px] text-[#8E8E93] mt-0.5 block">{safePercent}% dari total aktif</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FF9500]/10 border border-[#FF9500]/20">
            <span className="text-[11px] font-semibold text-[#FF9500] uppercase tracking-wider block">
              Mendekati Berakhir (≤ 60 Hari)
            </span>
            <span className="text-xl font-bold font-mono text-[#FF9500] mt-1 block">
              {expiringSoon} <span className="text-xs font-normal text-[#8E8E93]">Pegawai</span>
            </span>
            <span className="text-[10px] text-[#FF9500]/80 mt-0.5 block">Perlu evaluasi perpanjangan</span>
          </div>
        </div>

        {/* Visual Segmented Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full flex overflow-hidden gap-0.5 bg-black/[0.04] dark:bg-white/[0.06] p-0.5">
            <div
              className="bg-[#059669] h-full rounded-l-full transition-all duration-500"
              style={{ width: `${safePercent}%` }}
              title={`Aman: ${safe} orang`}
            />
            {expiringPercent > 0 && (
              <div
                className="bg-[#FF9500] h-full rounded-r-full transition-all duration-500"
                style={{ width: `${expiringPercent}%` }}
                title={`Mendekati Berakhir: ${expiringSoon} orang`}
              />
            )}
          </div>
        </div>

        {/* Expiring List Preview */}
        {expiringList.length > 0 ? (
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] text-xs space-y-1.5">
            <span className="text-[11px] font-bold text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FF9500]" /> Karyawan Mendekati Batas Kontrak:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {expiringList.map((c, i) => (
                <span key={i} className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#2C2C2E]/80 text-[11px] font-semibold text-[#1C1C1E] dark:text-white border border-black/[0.06] dark:border-white/[0.08]">
                  {c.employee?.full_name} ({c.employee?.division})
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-[#059669]/10 text-xs text-[#059669] dark:text-[#34D399] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Seluruh kontrak kerja staf saat ini berada dalam periode aman.</span>
          </div>
        )}

        <div className="pt-1 flex justify-end">
          <Link to="/employees">
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              Kelola Data Kontrak <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
