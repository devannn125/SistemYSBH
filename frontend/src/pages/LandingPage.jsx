import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  FileText, 
  MapPin, 
  Receipt, 
  ArrowRight, 
  Sun, 
  Moon,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Users,
  Activity,
  HeartHandshake,
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export function LandingPage() {
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeRoleTab, setActiveRoleTab] = useState('superadmin');

  const demoAccounts = {
    superadmin: { username: 'superadmin', name: 'Super Administrator', role: 'Superadmin', desc: 'Akses penuh ke seluruh sistem, manajemen akun pengguna, dan konfigurasi platform.' },
    direktur: { username: 'kadek', name: 'I Kadek Hermanta', role: 'Direktur Eksekutif', desc: 'Persetujuan akhir seluruh dokumen, monitoring absensi/logbook harian, dan dashboard eksekutif.' },
    hr_manager: { username: 'ayu', name: 'Ayu Wulandari', role: 'HR Manager', desc: 'Kelola data karyawan, penerbitan kontrak baru, penomoran surat HR, dan absensi tim.' },
    finance_manager: { username: 'citra', name: 'Citra Lestari', role: 'Finance Manager', desc: 'Kelola RAB, realisasi biaya (LPJ), slip gaji karyawan, dan verifikasi bukti anggaran.' },
    program_manager: { username: 'dodi', name: 'Dodi Pratama', role: 'Program Manager', desc: 'Perencanaan kegiatan eliminasi malaria, penugasan staf lapangan, dan review kemajuan.' },
    staf_lapangan: { username: 'fajar', name: 'Fajar Kogoya', role: 'Staf Lapangan', desc: 'Presensi lokasi Merauke, logbook harian, dan unggah foto bukti kegiatan langsung dari HP.' },
  };

  const handleQuickLogin = async (username) => {
    try {
      await login(username, 'password123');
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  const operationalGallery = [
    {
      title: 'Survei Entomologi & Vektor Lapangan',
      location: 'Distrik Merauke & Semangga, Papua Selatan',
      tag: 'Operasional Lapangan',
      desc: 'Pengambilan sampel jentik Anopheles di habitat perairan rawa untuk pemetaan titik transmisi malaria.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Distribusi Kelambu Berinsektisida (LLIN)',
      location: 'Kampung Pedalaman Papua',
      tag: 'Intervensi Komunitas',
      desc: 'Penyaluran kelambu berinsektisida massal kepada keluarga berisiko tinggi guna memutus rantai gigitan nyamuk.',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Diagnostik Cepat & Laboratorium Mikroskopis',
      location: 'Posko Kesehatan YSBH Jayapura',
      tag: 'Klinis & Diagnostik',
      desc: 'Pemeriksaan sediaan darah tebal dan tes cepat (RDT) untuk konfirmasi parasit Plasmodium falciparum dan vivax.',
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Tata Kelola Digital & Akuntabilitas Yayasan',
      location: 'Kantor Pusat & Pengawasan Direksi',
      tag: 'Governansi Terpadu',
      desc: 'Penomoran surat tanpa duplikasi, alur persetujuan dokumen berjenjang, dan audit trail transparan bagi donatur.',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-[#1C1C1E] dark:text-[#F5F5F7] font-sans selection:bg-[#ECFDF5] selection:text-[#059669] transition-colors duration-250 flex flex-col justify-between">
      {/* iOS Frosted Glass Navbar */}
      <header className="sticky top-0 z-50 ios-glass border-b border-black/[0.05] dark:border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#047857] to-[#10B981] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#059669]/25">
              SBH
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-[#1C1C1E] dark:text-white tracking-tight leading-tight block">
                Yayasan Sinar Bhakti Husada
              </span>
              <span className="text-[11px] text-[#8E8E93] dark:text-[#98989D] font-medium tracking-wide">
                SIMSBH · Eliminasi Malaria Papua
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              className="p-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white transition-all ios-press cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FF9500]" /> : <Moon className="w-4 h-4 text-[#8E8E93]" />}
            </button>

            {user ? (
              <Link to="/dashboard">
                <Button variant="default" size="default" className="shadow-sm">
                  Buka Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="default" size="default" className="shadow-sm">
                  Masuk Portal <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section dengan Estetika Bersih iPhone */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-16">
        <section className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-gradient-to-b from-white via-white/80 to-white/40 dark:from-[#1C1C1E] dark:via-[#1C1C1E]/80 dark:to-transparent border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_32px_rgba(0,0,0,0.03)] p-6 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] dark:bg-[#059669]/20 border border-[#059669]/20 text-xs font-semibold text-[#059669] dark:text-[#34D399] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#059669] animate-pulse" />
                Sistem Informasi Terintegrasi v1.2
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1C1C1E] dark:text-white tracking-tight leading-[1.12]">
                Satu Sistem Bersih untuk Misi Kemanusiaan di Papua.
              </h1>

              <p className="text-sm sm:text-base text-[#8E8E93] dark:text-[#98989D] leading-relaxed max-w-xl">
                Memadukan tata kelola persetujuan dokumen berjenjang, penomoran surat anti-duplikat, pelaporan bukti lapangan, presensi real-time, dan akuntabilitas anggaran dalam antarmuka yang setenang iPhone.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to={user ? '/dashboard' : '/login'}>
                  <Button variant="default" size="lg" className="rounded-2xl px-7 shadow-lg shadow-[#059669]/25 text-base">
                    {user ? 'Lanjutkan ke Dashboard' : 'Masuk ke Portal SIMSBH'} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="#galeri">
                  <Button variant="secondary" size="lg" className="rounded-2xl px-6 text-sm">
                    Lihat Dokumentasi Lapangan
                  </Button>
                </a>
              </div>

              {/* 3 Metric Pills */}
              <div className="pt-4 grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-center">
                  <p className="text-xl sm:text-2xl font-bold font-mono text-[#059669] dark:text-[#34D399]">0</p>
                  <p className="text-[10px] sm:text-xs text-[#8E8E93] font-medium mt-0.5">Duplikasi Surat</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-center">
                  <p className="text-xl sm:text-2xl font-bold font-mono text-[#1C1C1E] dark:text-white">12+</p>
                  <p className="text-[10px] sm:text-xs text-[#8E8E93] font-medium mt-0.5">Distrik Papua</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-center">
                  <p className="text-xl sm:text-2xl font-bold font-mono text-[#059669] dark:text-[#34D399]">100%</p>
                  <p className="text-[10px] sm:text-xs text-[#8E8E93] font-medium mt-0.5">Jejak Audit</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Frame (iOS Device Preview Card) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto rounded-[32px] overflow-hidden shadow-2xl border-4 border-white dark:border-[#2C2C2E] bg-neutral-900 group">
                <img
                  src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80"
                  alt="Petugas Medis Lapangan Eliminasi Malaria Papua"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold w-max mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#34D399]" /> Merauke & Jayapura, Papua
                  </span>
                  <h3 className="text-base sm:text-lg font-bold leading-snug">
                    Dedikasi Eliminasi Malaria YSBH
                  </h3>
                  <p className="text-xs text-white/80 mt-1 line-clamp-2">
                    Menghubungkan tim lapangan, laboratorium, dan jajaran direksi dalam satu ritme operasional terintegrasi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Galeri Dokumentasi Operasional Lapangan Papua */}
        <section id="galeri" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#059669] dark:text-[#34D399] uppercase tracking-wider">
                Dokumentasi & Portofolio Misi
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1C1E] dark:text-white mt-1">
                Aktivitas Nyata di Tanah Papua
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8E8E93] dark:text-[#98989D] max-w-md">
              Setiap berkas dan laporan di SIMSBH terhubung langsung dengan bukti foto, data GPS posko, serta verifikasi pengawas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {operationalGallery.map((item, idx) => (
              <div
                key={idx}
                className="ios-card overflow-hidden group flex flex-col justify-between"
              >
                <div className="relative h-56 sm:h-64 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="default" className="bg-white/90 dark:bg-black/80 backdrop-blur-md text-[#059669] dark:text-[#34D399] border-none font-semibold text-[11px] shadow-sm">
                      {item.tag}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center gap-1 text-[11px] font-medium text-white/90 drop-shadow-md">
                    <MapPin className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>{item.location}</span>
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#1C1C1E] dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8E8E93] dark:text-[#98989D] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Demo Akun Cepat (Interactive Role Tester Cards) */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <Badge variant="neutral" className="text-[11px] font-medium px-3 py-1">
              Uji Coba Cepat 8 Peran
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1C1E] dark:text-white">
              Coba Masuk Sebagai Setiap Peran
            </h2>
            <p className="text-xs sm:text-sm text-[#8E8E93] dark:text-[#98989D]">
              Pilih peran di bawah ini untuk langsung mengisi kredensial dan meninjau dashboard interaktif masing-masing:
            </p>
          </div>

          {/* Segmented Controls ala iOS */}
          <div className="flex justify-center overflow-x-auto pb-2">
            <div className="inline-flex p-1.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full backdrop-blur-md gap-1">
              {Object.keys(demoAccounts).map((roleKey) => (
                <button
                  key={roleKey}
                  onClick={() => setActiveRoleTab(roleKey)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ios-press cursor-pointer whitespace-nowrap ${
                    activeRoleTab === roleKey
                      ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white shadow-sm'
                      : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                  }`}
                >
                  {demoAccounts[roleKey].role}
                </button>
              ))}
            </div>
          </div>

          {/* Active Role Preview Card */}
          <div className="max-w-2xl mx-auto">
            <div className="ios-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#059669]/20 shadow-lg">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs font-bold text-[#059669] dark:text-[#34D399] uppercase tracking-wider">
                    {demoAccounts[activeRoleTab].role}
                  </span>
                  <span className="text-xs text-[#8E8E93]">•</span>
                  <span className="text-xs font-mono text-[#8E8E93]">
                    @{demoAccounts[activeRoleTab].username}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1C1C1E] dark:text-white">
                  {demoAccounts[activeRoleTab].name}
                </h3>
                <p className="text-xs text-[#8E8E93] dark:text-[#98989D] max-w-md leading-relaxed">
                  {demoAccounts[activeRoleTab].desc}
                </p>
              </div>

              <Button
                variant="default"
                size="default"
                onClick={() => handleQuickLogin(demoAccounts[activeRoleTab].username)}
                className="shrink-0 rounded-2xl px-6 shadow-md"
              >
                Masuk Sebagai {demoAccounts[activeRoleTab].role} <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* iOS Minimal Footer */}
      <footer className="border-t border-black/[0.05] dark:border-white/[0.06] py-8 text-xs text-[#8E8E93] dark:text-[#98989D] bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-md transition-colors mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#059669] text-white flex items-center justify-center font-bold text-[10px]">
              SBH
            </div>
            <p className="font-medium text-[#1C1C1E] dark:text-white">Yayasan Sinar Bhakti Husada Papua</p>
          </div>
          <p>© 2026 SIMSBH. Hak Cipta Dilindungi. Dikembangkan untuk Tugas Akhir UAJY.</p>
        </div>
      </footer>
    </div>
  );
}
