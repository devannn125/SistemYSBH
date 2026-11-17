import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { FileText, CheckCircle2, Clock, Ban } from 'lucide-react';

export function LetterStatusChart({ letters = [] }) {
  if (!letters || letters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Buku Register Nomor Surat</CardTitle>
          <CardDescription>Belum ada data penomoran surat terdaftar</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalIssued = letters.reduce((sum, item) => sum + (item.issued || 0), 0);
  const totalReserved = letters.reduce((sum, item) => sum + (item.reserved || 0), 0);
  const totalVoid = letters.reduce((sum, item) => sum + (item.void || 0), 0);
  const totalLetters = letters.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
              <CardTitle>Register Penomoran Surat Resmi</CardTitle>
            </div>
            <CardDescription>Aktivitas penerbitan nomor surat per klasifikasi (FR-LTR)</CardDescription>
          </div>
          <Badge variant="outline" className="font-mono">
            {totalLetters} Terdaftar
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Counter Pills */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-2xl bg-[#059669]/10 border border-[#059669]/20 text-center">
            <span className="text-[10px] uppercase font-bold text-[#059669] dark:text-[#34D399] tracking-wider block">
              Terbit
            </span>
            <span className="font-mono text-base font-extrabold text-[#059669] dark:text-[#34D399]">
              {totalIssued}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#007AFF]/10 border border-[#007AFF]/20 text-center">
            <span className="text-[10px] uppercase font-bold text-[#007AFF] dark:text-[#0A84FF] tracking-wider block">
              Dipesan
            </span>
            <span className="font-mono text-base font-extrabold text-[#007AFF] dark:text-[#0A84FF]">
              {totalReserved}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-center">
            <span className="text-[10px] uppercase font-bold text-[#FF3B30] tracking-wider block">
              Batal
            </span>
            <span className="font-mono text-base font-extrabold text-[#FF3B30]">
              {totalVoid}
            </span>
          </div>
        </div>

        {/* Classification Breakdown Table / Rows */}
        <div className="space-y-2 pt-1">
          {letters.map((item) => (
            <div
              key={item.code}
              className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between hover:bg-black/[0.035] dark:hover:bg-white/[0.05] transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-black/[0.05] dark:bg-white/[0.08] text-[#1C1C1E] dark:text-white">
                    {item.code}
                  </span>
                  <span className="text-xs font-semibold text-[#1C1C1E] dark:text-white">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#8E8E93] font-mono">
                  <span>Terbit: <strong className="text-[#059669]">{item.issued}</strong></span>
                  <span>Dipesan: <strong className="text-[#007AFF]">{item.reserved}</strong></span>
                  {item.void > 0 && <span>Batal: <strong className="text-[#FF3B30]">{item.void}</strong></span>}
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-sm font-bold text-[#1C1C1E] dark:text-white">
                  {item.total}
                </span>
                <span className="text-[10px] text-[#8E8E93] block">Nomor</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
