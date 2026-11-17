import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { FileCheck, ShieldCheck, Clock, FileEdit, AlertCircle } from 'lucide-react';

export function DocumentLifecycleChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Alur Siklus Dokumen</CardTitle>
          <CardDescription>Belum ada rekaman dokumen dalam sistem</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalDocs = data.reduce((sum, item) => sum + (item.count || 0), 0);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />;
      case 'pending_director':
        return <Clock className="w-3.5 h-3.5 text-[#007AFF]" />;
      case 'in_review':
        return <FileCheck className="w-3.5 h-3.5 text-[#FF9500]" />;
      case 'revision_needed':
        return <AlertCircle className="w-3.5 h-3.5 text-[#FF3B30]" />;
      default:
        return <FileEdit className="w-3.5 h-3.5 text-[#8E8E93]" />;
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34C759]" />
              <CardTitle>Siklus Alur Dokumen</CardTitle>
            </div>
            <CardDescription>Status dokumen legal & operasional yayasan</CardDescription>
          </div>
          <Badge variant="outline" className="font-mono">
            {totalDocs} Dokumen
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Multi-Segmented Progress Bar (Apple Battery / Storage Bar) */}
        <div className="space-y-2">
          <div className="w-full h-3.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full flex overflow-hidden p-0.5 gap-0.5">
            {totalDocs > 0 ? (
              data.map((item) => {
                if (item.count === 0) return null;
                const pct = (item.count / totalDocs) * 100;
                return (
                  <div
                    key={item.status}
                    className="h-full rounded-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.color,
                    }}
                    title={`${item.label}: ${item.count} (${Math.round(pct)}%)`}
                  />
                );
              })
            ) : (
              <div className="w-full h-full rounded-full bg-[#8E8E93]/20" />
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
            <span>Tahap Awal (Draf)</span>
            <span>Finalisasi (Sah & Diterbitkan)</span>
          </div>
        </div>

        {/* Detailed Stages List */}
        <div className="space-y-2">
          {data.map((item) => {
            const pct = totalDocs > 0 ? Math.round((item.count / totalDocs) * 100) : 0;
            return (
              <div
                key={item.status}
                className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between hover:bg-black/[0.035] dark:hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    {getStatusIcon(item.status)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1C1C1E] dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-[#8E8E93]">
                      {item.status === 'approved' && 'Nomor resmi terbit & terkunci'}
                      {item.status === 'pending_director' && 'Menunggu tanda tangan direktur'}
                      {item.status === 'in_review' && 'Pemeriksaan kepala divisi'}
                      {item.status === 'draft' && 'Penyusunan awal oleh pembuat'}
                      {item.status === 'revision_needed' && 'Perbaikan dokumen'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-[#1C1C1E] dark:text-white">
                    {item.count}
                  </span>
                  <span className="text-[10px] font-mono text-[#8E8E93] ml-1.5">
                    ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
