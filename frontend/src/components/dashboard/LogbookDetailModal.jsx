import React, { useState } from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../api/client';
import { 
  FileText, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  Paperclip,
  Check
} from 'lucide-react';

export function LogbookDetailModal({ logbook, open, onClose, onReviewed, canReview = false }) {
  const [feedback, setFeedback] = useState(logbook?.feedback || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!logbook) return null;

  const handleReview = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.post(`/logbooks/${logbook.id}/review`, {
        feedback: feedback || 'Laporan telah ditinjau dan disetujui oleh Direktur.',
        status: 'approved',
      });
      setSuccessMsg(res.message || 'Logbook berhasil ditinjau!');
      if (onReviewed) onReviewed(res.data);
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Gagal mereview logbook.');
    } finally {
      setSaving(false);
    }
  };

  const isApproved = logbook.status === 'approved';

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader
        title="Detail Logbook Harian Pegawai"
        description={`Laporan aktivitas kerja ${logbook.user?.name || 'Karyawan'} · ${logbook.date || ''}`}
        onClose={onClose}
      />
      <DialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        
        {/* Identitas Pengisi */}
        <div className="p-4 rounded-2xl bg-black/[0.025] dark:bg-white/[0.035] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#059669]/15 text-[#059669] dark:text-[#34D399] flex items-center justify-center font-bold text-sm">
              {logbook.user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-bold text-sm text-[#1C1C1E] dark:text-white">
                {logbook.user?.name}
              </p>
              <p className="text-xs text-[#8E8E93]">
                {logbook.user?.position || 'Staf'} · Divisi {logbook.user?.division || 'Operasional'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={isApproved ? 'success' : 'warning'} dot>
              {isApproved ? 'Disetujui Direktur' : 'Menunggu Review'}
            </Badge>
            <p className="text-[11px] font-mono text-[#8E8E93] mt-1">{logbook.date}</p>
          </div>
        </div>

        {/* 1. Uraian Aktivitas Utama */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#059669]" /> Uraian Kegiatan yang Dilaksanakan:
          </label>
          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] text-xs sm:text-sm text-[#1C1C1E] dark:text-neutral-200 leading-relaxed whitespace-pre-line">
            {logbook.activity_summary}
          </div>
        </div>

        {/* 2. Kendala / Tantangan Lapangan */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#FF9500] uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Kendala / Hambatan Lapangan:
          </label>
          <div className="p-3.5 rounded-2xl bg-[#FF9500]/10 border border-[#FF9500]/20 text-xs sm:text-sm text-[#B26A00] dark:text-[#FF9F0A] leading-relaxed">
            {logbook.challenges || 'Tidak ada kendala yang dilaporkan.'}
          </div>
        </div>

        {/* 3. Rencana Kerja Hari Berikutnya */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#007AFF] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Rencana Tindak Lanjut Esok Hari:
          </label>
          <div className="p-3.5 rounded-2xl bg-[#007AFF]/10 border border-[#007AFF]/20 text-xs sm:text-sm text-[#0062CC] dark:text-[#0A84FF] leading-relaxed">
            {logbook.next_day_plan || 'Sesuai dengan target kerja bulanan program.'}
          </div>
        </div>

        {/* 4. Lampiran Berkas / Foto Kegiatan jika ada */}
        {logbook.attachments && logbook.attachments.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" /> Lampiran Bukti Lapangan ({logbook.attachments.length}):
            </label>
            <div className="space-y-1.5">
              {logbook.attachments.map((att) => (
                <div key={att.id} className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1C1C1E] dark:text-white truncate">{att.file_name}</span>
                  <span className="text-[10px] text-[#8E8E93] font-mono">{Math.round((att.file_size || 0) / 1024)} KB</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Catatan Review / Persetujuan Direktur */}
        <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06] space-y-2">
          {successMsg && (
            <div className="p-3 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/25 text-xs text-[#248A3D] dark:text-[#34D399] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {canReview ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#059669]" /> Beri Catatan / Ulasan Direktur:
              </label>
              <textarea
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tuliskan arahan, tindak lanjut, atau apresiasi untuk staf..."
                className="w-full p-3 text-xs bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
              />
            </div>
          ) : logbook.feedback ? (
            <div className="p-3.5 rounded-2xl bg-[#059669]/10 border border-[#059669]/20 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#059669] dark:text-[#34D399]">
                <ShieldCheck className="w-4 h-4" /> Catatan Direktur / Peninjau:
              </div>
              <p className="text-[#1C1C1E] dark:text-neutral-200">{logbook.feedback}</p>
              {logbook.reviewer && (
                <p className="text-[10px] text-[#8E8E93]">Oleh: {logbook.reviewer?.name} ({logbook.reviewed_at ? new Date(logbook.reviewed_at).toLocaleDateString('id-ID') : ''})</p>
              )}
            </div>
          ) : null}
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Tutup
        </Button>
        {canReview && (
          <Button
            variant="default"
            size="sm"
            loading={saving}
            onClick={handleReview}
            className="bg-[#059669] hover:bg-[#047857]"
          >
            <Check className="w-4 h-4 mr-1.5" /> Setujui Logbook
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}
