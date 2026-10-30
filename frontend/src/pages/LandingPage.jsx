import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { 
  FileText, 
  MapPin, 
  Receipt, 
  ArrowRight, 
  Sun, 
  Moon,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';

export function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      title: 'Tata Kelola Surat & Dokumen',
      desc: 'Penomoran surat otomatis anti-duplikat dengan mekanisme penguncian atomik dan alur persetujuan dokumen berjenjang.',
      icon: FileText,
      badge: 'Register Terpusat',
    },
    {
      title: 'Presensi & Logbook Lapangan',
      desc: 'Pencatatan presensi staf dan logbook harian terverifikasi foto dari posko operasional Merauke & Jayapura.',
      icon: MapPin,
      badge: 'Operasional Papua',
    },
    {
      title: 'Anggaran & Realisasi (RAB/SPJ)',
      desc: 'Penyusunan anggaran kegiatan eliminasi malaria dan integrasi bukti pengeluaran langsung ke tim keuangan.',
      icon: Receipt,
      badge: 'Akuntabilitas Donatur',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAF8] dark:bg-[#0E1712] text-[#14201A] dark:text-[#EDF7F1] font-sans selection:bg-[#DCFCE7] selection:text-[#15803D] transition-colors duration-200 flex flex-col justify-between">
      {/* Navbar Minimalis */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#14201A]/95 backdrop-blur-md border-b border-[#E3EAE5] dark:border-[#22332A] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#15803D] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              SBH
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-[#14201A] dark:text-white tracking-tight leading-tight block">
                Yayasan Sinar Bhakti Husada
              </span>
              <span className="text-[11px] text-[#586862] dark:text-[#8FA89B] font-medium tracking-wide">
                SIMSBH · Eliminasi Malaria Papua
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              className="p-2 rounded-[10px] border border-[#E3EAE5] dark:border-[#22332A] bg-white dark:bg-[#192821] text-[#586862] dark:text-[#EDF7F1] hover:border-[#15803D] transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#586862]" />}
            </button>

            {user ? (
              <Link to="/dashboard">
                <Button variant="primary" size="md">
                  Buka Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="md">
                  Masuk SIMSBH <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section Bersih & Terfokus */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0FDF4] dark:bg-[#15803D]/20 border border-[#DCFCE7] dark:border-[#15803D]/30 text-xs font-semibold text-[#15803D] dark:text-[#4ADE80]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            Portal Operasional Resmi YSBH
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#14201A] dark:text-white tracking-tight leading-tight">
            Satu Sistem Terpadu untuk Misi Kemanusiaan Papua
          </h1>

          <p className="text-sm sm:text-base text-[#586862] dark:text-[#8FA89B] leading-relaxed">
            Menyatukan penomoran surat dinas, persetujuan dokumen berjenjang, presensi dan logbook staf lapangan, serta realisasi anggaran kegiatan malaria dalam satu alur kerja transparan.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to={user ? '/dashboard' : '/login'}>
              <Button variant="primary" size="lg" className="px-7 shadow-sm">
                {user ? 'Lanjutkan ke Dashboard' : 'Masuk ke Portal SIMSBH'} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Metrik Operasional Sederhana */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-[10px] bg-white dark:bg-[#14201A] border border-[#E3EAE5] dark:border-[#22332A] text-center shadow-2xs">
            <p className="text-2xl font-bold font-mono text-[#15803D] dark:text-[#4ADE80]">0</p>
            <p className="text-xs font-medium text-[#586862] dark:text-[#8FA89B] mt-1">Duplikasi Nomor Surat</p>
          </div>
          <div className="p-4 rounded-[10px] bg-white dark:bg-[#14201A] border border-[#E3EAE5] dark:border-[#22332A] text-center shadow-2xs">
            <p className="text-2xl font-bold font-mono text-[#14201A] dark:text-white">24 Distrik</p>
            <p className="text-xs font-medium text-[#586862] dark:text-[#8FA89B] mt-1">Wilayah Kerja Papua</p>
          </div>
          <div className="p-4 rounded-[10px] bg-white dark:bg-[#14201A] border border-[#E3EAE5] dark:border-[#22332A] text-center shadow-2xs">
            <p className="text-2xl font-bold font-mono text-[#15803D] dark:text-[#4ADE80]">100%</p>
            <p className="text-xs font-medium text-[#586862] dark:text-[#8FA89B] mt-1">Bukti Kegiatan Digital</p>
          </div>
        </div>

        {/* 3 Pilar Modul Utama */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-[10px] bg-white dark:bg-[#14201A] border border-[#E3EAE5] dark:border-[#22332A] hover:border-[#15803D] dark:hover:border-[#4ADE80] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-[8px] bg-[#F0FDF4] dark:bg-[#15803D]/20 border border-[#DCFCE7] dark:border-[#15803D]/30 flex items-center justify-center text-[#15803D] dark:text-[#4ADE80] mb-3">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-bold text-[#14201A] dark:text-white mb-1.5">{feat.title}</h3>
                  <p className="text-xs text-[#586862] dark:text-[#8FA89B] leading-relaxed">{feat.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E3EAE5] dark:border-[#22332A]">
                  <span className="text-[11px] font-semibold text-[#15803D] dark:text-[#4ADE80]">{feat.badge}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="border-t border-[#E3EAE5] dark:border-[#22332A] py-6 text-xs text-[#586862] dark:text-[#8FA89B] bg-white dark:bg-[#14201A] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© 2026 Yayasan Sinar Bhakti Husada. Hak Cipta Dilindungi.</p>
          <p className="text-[11px]">Operasional Merauke & Jayapura, Papua, Indonesia</p>
        </div>
      </footer>
    </div>
  );
}
