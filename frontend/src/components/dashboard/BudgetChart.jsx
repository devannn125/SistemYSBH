import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Receipt, PieChart, ArrowUpRight, CheckCircle2, Wallet } from 'lucide-react';

const formatIDR = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export function BudgetChart({ budgetData }) {
  if (!budgetData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Realisasi Anggaran Program (RAB vs LPJ)</CardTitle>
          <CardDescription>Belum ada data anggaran yang tercatat</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const {
    total_rab = 0,
    total_lpj = 0,
    variance = 0,
    realization_rate = 0,
    categories = [],
  } = budgetData;

  const categoryColors = [
    { bg: 'bg-[#059669]', text: 'text-[#059669]', border: 'border-[#059669]/30' },
    { bg: 'bg-[#007AFF]', text: 'text-[#007AFF]', border: 'border-[#007AFF]/30' },
    { bg: 'bg-[#FF9500]', text: 'text-[#FF9500]', border: 'border-[#FF9500]/30' },
    { bg: 'bg-[#AF52DE]', text: 'text-[#AF52DE]', border: 'border-[#AF52DE]/30' },
  ];

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#007AFF]" />
              <CardTitle>Realisasi Anggaran & LPJ</CardTitle>
            </div>
            <CardDescription>Perbandingan alokasi rencana anggaran vs laporan belanja riil</CardDescription>
          </div>
          <Badge variant={realization_rate <= 100 ? 'success' : 'danger'}>
            {realization_rate}% Terserap
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Metric Overview Comparison Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-black/[0.025] dark:bg-white/[0.035] border border-black/[0.05] dark:border-white/[0.06]">
            <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block">
              Total RAB Disetujui
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#1C1C1E] dark:text-white mt-1 block">
              {formatIDR(total_rab)}
            </span>
            <span className="text-[10px] text-[#8E8E93] mt-0.5 block">Kebutuhan Operasional</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#059669]/10 border border-[#059669]/20">
            <span className="text-[11px] font-semibold text-[#059669] dark:text-[#34D399] uppercase tracking-wider block">
              Total LPJ Terealisasi
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#059669] dark:text-[#34D399] mt-1 block">
              {formatIDR(total_lpj)}
            </span>
            <span className="text-[10px] text-[#059669]/80 dark:text-[#34D399]/80 mt-0.5 block">Bukti Pengeluaran Sah</span>
          </div>
        </div>

        {/* Realization Progress Bar (Apple Battery/Health style) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#8E8E93]">Tingkat Penyerapan Anggaran</span>
            <span className="font-mono text-[#1C1C1E] dark:text-white">{realization_rate}%</span>
          </div>
          <div className="w-full h-3.5 bg-black/[0.05] dark:bg-white/[0.07] rounded-full p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#059669] to-[#10B981] transition-all duration-700 shadow-sm shadow-[#059669]/30"
              style={{ width: `${Math.min(100, realization_rate)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8E8E93] pt-0.5">
            <span>Sisa Anggaran: <strong className="font-mono text-[#1C1C1E] dark:text-white">{formatIDR(variance)}</strong></span>
            <span>Status: Efisien</span>
          </div>
        </div>

        {/* Category Breakdown */}
        {categories.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
            <span className="text-xs font-bold text-[#1C1C1E] dark:text-white flex items-center justify-between">
              <span>Alokasi Biaya per Komponen RAB:</span>
              <span className="text-[11px] font-normal text-[#8E8E93]">{categories.length} Komponen</span>
            </span>

            {/* Segmented Combined Bar */}
            <div className="w-full h-3 rounded-full flex overflow-hidden gap-0.5">
              {categories.map((cat, idx) => {
                const color = categoryColors[idx % categoryColors.length];
                const pct = total_rab > 0 ? (cat.budget / total_rab) * 100 : 0;
                return (
                  <div
                    key={cat.category}
                    className={`${color.bg} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                    title={`${cat.category}: ${formatIDR(cat.budget)} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>

            {/* Category Items List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {categories.map((cat, idx) => {
                const color = categoryColors[idx % categoryColors.length];
                const pct = total_rab > 0 ? Math.round((cat.budget / total_rab) * 100) : 0;
                return (
                  <div
                    key={cat.category}
                    className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] space-y-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                      <span className="text-xs font-semibold text-[#1C1C1E] dark:text-white truncate">
                        {cat.category}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-mono text-[#8E8E93]">
                        {formatIDR(cat.budget)}
                      </span>
                      <span className="text-[10px] font-bold font-mono text-[#059669]">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
