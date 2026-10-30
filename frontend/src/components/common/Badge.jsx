import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  XCircle, 
  FileText, 
  Bookmark,
  AlertTriangle
} from 'lucide-react';

export function Badge({ status, label, className = '' }) {
  const configs = {
    draft: {
      bg: 'bg-[#F3F4F6] dark:bg-[#1E293B]/60',
      border: 'border-[#E5E7EB] dark:border-[#334155]',
      text: 'text-[#4B5563] dark:text-[#94A3B8]',
      icon: FileText,
      defaultLabel: 'Draf',
    },
    submitted: {
      bg: 'bg-[#FEF3C7] dark:bg-[#78350F]/30',
      border: 'border-[#FDE68A] dark:border-[#92400E]',
      text: 'text-[#D97706] dark:text-[#FBBF24]',
      icon: Clock,
      defaultLabel: 'Diajukan',
    },
    in_review: {
      bg: 'bg-[#FEF3C7] dark:bg-[#78350F]/30',
      border: 'border-[#FDE68A] dark:border-[#92400E]',
      text: 'text-[#D97706] dark:text-[#FBBF24]',
      icon: Clock,
      defaultLabel: 'Direview Manager',
    },
    pending_director: {
      bg: 'bg-[#FEF3C7] dark:bg-[#78350F]/30',
      border: 'border-[#FDE68A] dark:border-[#92400E]',
      text: 'text-[#D97706] dark:text-[#FBBF24]',
      icon: Clock,
      defaultLabel: 'Menunggu Direktur',
    },
    revision_needed: {
      bg: 'bg-[#FFEDD5] dark:bg-[#7C2D12]/30',
      border: 'border-[#FED7AA] dark:border-[#9A3412]',
      text: 'text-[#EA580C] dark:text-[#FB923C]',
      icon: RotateCcw,
      defaultLabel: 'Perlu Revisi',
    },
    approved: {
      bg: 'bg-[#DCFCE7] dark:bg-[#14532D]/35',
      border: 'border-[#BBF7D0] dark:border-[#15803D]',
      text: 'text-[#15803D] dark:text-[#4ADE80]',
      icon: CheckCircle2,
      defaultLabel: 'Disetujui',
    },
    rejected: {
      bg: 'bg-[#FEE2E2] dark:bg-[#7F1D1D]/35',
      border: 'border-[#FECACA] dark:border-[#991B1B]',
      text: 'text-[#DC2626] dark:text-[#F87171]',
      icon: XCircle,
      defaultLabel: 'Ditolak',
    },
    reserved: {
      bg: 'bg-[#E0F2FE] dark:bg-[#0C4A6E]/35',
      border: 'border-[#BAE6FD] dark:border-[#0284C7]',
      text: 'text-[#0284C7] dark:text-[#38BDF8]',
      icon: Bookmark,
      defaultLabel: 'Dicadangkan',
    },
    issued: {
      bg: 'bg-[#DCFCE7] dark:bg-[#14532D]/35',
      border: 'border-[#BBF7D0] dark:border-[#15803D]',
      text: 'text-[#15803D] dark:text-[#4ADE80]',
      icon: CheckCircle2,
      defaultLabel: 'Terbit',
    },
    void: {
      bg: 'bg-[#FEE2E2] dark:bg-[#7F1D1D]/35',
      border: 'border-[#FECACA] dark:border-[#991B1B]',
      text: 'text-[#DC2626] dark:text-[#F87171]',
      icon: XCircle,
      defaultLabel: 'Batal',
    },
    hadir: {
      bg: 'bg-[#DCFCE7] dark:bg-[#14532D]/35',
      border: 'border-[#BBF7D0] dark:border-[#15803D]',
      text: 'text-[#15803D] dark:text-[#4ADE80]',
      icon: CheckCircle2,
      defaultLabel: 'Hadir',
    },
    aktif: {
      bg: 'bg-[#DCFCE7] dark:bg-[#14532D]/35',
      border: 'border-[#BBF7D0] dark:border-[#15803D]',
      text: 'text-[#15803D] dark:text-[#4ADE80]',
      icon: CheckCircle2,
      defaultLabel: 'Aktif',
    },
    verified: {
      bg: 'bg-[#DCFCE7] dark:bg-[#14532D]/35',
      border: 'border-[#BBF7D0] dark:border-[#15803D]',
      text: 'text-[#15803D] dark:text-[#4ADE80]',
      icon: CheckCircle2,
      defaultLabel: 'Terverifikasi',
    },
  };

  const config = configs[status] || {
    bg: 'bg-[#F3F4F6] dark:bg-[#1E293B]/60',
    border: 'border-[#E5E7EB] dark:border-[#334155]',
    text: 'text-[#4B5563] dark:text-[#94A3B8]',
    icon: FileText,
    defaultLabel: status,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.text} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
      <span>{label || config.defaultLabel}</span>
    </span>
  );
}
