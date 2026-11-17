import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  Activity,
  Check
} from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali username dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userLogin) => {
    setUsername(userLogin);
    setPassword('password123');
    setError(null);
  };

  const quickRoles = [
    { username: 'superadmin', role: 'Superadmin', name: 'Super Administrator', badge: 'Admin' },
    { username: 'kadek', role: 'Direktur Eksekutif', name: 'I Kadek Hermanta', badge: 'Direksi' },
    { username: 'ayu', role: 'HR Manager', name: 'Ayu Wulandari', badge: 'HR' },
    { username: 'budi', role: 'Staf HR', name: 'Budi Santoso', badge: 'HR' },
    { username: 'citra', role: 'Finance Manager', name: 'Citra Lestari', badge: 'Keuangan' },
    { username: 'dodi', role: 'Program Manager', name: 'Dodi Pratama', badge: 'Program' },
    { username: 'eka', role: 'Program Officer', name: 'Eka Saputra', badge: 'Program' },
    { username: 'fajar', role: 'Staf Lapangan', name: 'Fajar Kogoya', badge: 'Lapangan' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F2F2F7] dark:bg-[#000000] text-[#1C1C1E] dark:text-[#F5F5F7] font-sans transition-colors duration-250 selection:bg-[#059669]/20 selection:text-[#059669]">
      
      {/* =========================================================================
          PANEL KIRI (SPLIT SCREEN HERO & VISUAL YAYASAN) - KHUSUS DESKTOP & TABLET
      ========================================================================= */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between p-10 xl:p-14 overflow-hidden bg-neutral-950 text-white selection:bg-[#059669]/30">
        {/* Foto Latar Belakang Lapangan Kesehatan Papua */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 hover:scale-100 opacity-40 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1800&q=80')`,
          }}
        />

        {/* Gradasi Overlay Estetika Apple (Deep Noir & Emerald Glow) */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#059669]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#007AFF]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Identity */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#047857] to-[#10B981] flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-[#059669]/30 group-hover:scale-105 transition-transform">
              SBH
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                Yayasan Sinar Bhakti Husada
              </span>
              <span className="text-[11px] text-neutral-400 font-medium block">
                Kabupaten Merauke & Jayapura, Papua
              </span>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" /> SIMSBH v2.0
          </div>
        </div>

        {/* Center Hero Message */}
        <div className="relative z-10 my-auto py-12 max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#059669]/20 border border-[#059669]/30 text-xs font-semibold text-[#34D399]">
            <Activity className="w-3.5 h-3.5" /> Eliminasi Malaria & Pelayanan Kesehatan Papua
          </div>

          <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Tata Kelola Digital Berintegritas untuk Papua Bebas Malaria.
          </h1>

          <p className="text-sm xl:text-base text-neutral-300 leading-relaxed">
            Sistem informasi operasional terintegrasi: penomoran surat atomik anti-duplikasi, verifikasi dokumen legal berjenjang, pelaporan presensi & logbook lapangan, serta pertanggungjawaban anggaran program.
          </p>

          {/* 3 Keunggulan Utama */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/[0.08]">
              <span className="font-mono text-lg font-bold text-[#34D399] block">0 Duplikasi</span>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">Penomoran Atomik</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/[0.08]">
              <span className="font-mono text-lg font-bold text-[#60A5FA] block">100% Jejak</span>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">Audit Trail Permanen</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/[0.08]">
              <span className="font-mono text-lg font-bold text-[#FBBF24] block">Real-Time</span>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">Posko Merauke</span>
            </div>
          </div>
        </div>

        {/* Bottom Frosted Glass Testimonial / Mission Statement */}
        <div className="relative z-10 p-5 rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] text-xs text-neutral-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#059669]/30 flex items-center justify-center text-[#34D399] shrink-0 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="leading-relaxed">
              Mendukung akuntabilitas tata kelola lembaga swadaya masyarakat dan mitra donatur kesehatan global.
            </p>
          </div>
          <span className="shrink-0 text-[11px] font-mono text-neutral-400">YSBH Papua</span>
        </div>
      </div>

      {/* =========================================================================
          PANEL KANAN (FORMULIR MASUK / AUTHENTICATION PANEL)
      ========================================================================= */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto min-h-screen">
        
        {/* Top Bar Form Panel: Tombol Kembali & Ganti Tema */}
        <div className="flex items-center justify-between w-full pb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8E8E93] hover:text-[#059669] dark:hover:text-[#34D399] transition-colors ios-press"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>

          <button
            onClick={toggleTheme}
            type="button"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="p-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white transition-all ios-press cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FF9500]" /> : <Moon className="w-4 h-4 text-[#8E8E93]" />}
          </button>
        </div>

        {/* Mobile Header Banner (Hanya muncul di layar ponsel < lg) */}
        <div className="lg:hidden mb-6 p-4 rounded-3xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#047857] to-[#10B981] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
            SBH
          </div>
          <div>
            <h2 className="font-bold text-sm text-white leading-tight">Yayasan Sinar Bhakti Husada</h2>
            <p className="text-[11px] text-neutral-300">SIMSBH Papua · Sistem Informasi Terintegrasi</p>
          </div>
        </div>

        {/* Main Content Center Area */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          
          {/* Header Judul Masuk */}
          <div className="space-y-1.5 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1C1E] dark:text-white">
              Masuk ke Akun
            </h2>
            <p className="text-xs sm:text-sm text-[#8E8E93] dark:text-[#98989D]">
              Gunakan kredensial resmi yayasan atau pilih akun demo uji coba di bawah.
            </p>
          </div>

          {/* Quick 1-Click Role Selector (8 Roles Pills) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                Pilih Cepat Peran Demo (8 Role):
              </span>
              <span className="text-[10px] text-[#059669] dark:text-[#34D399] font-medium">
                1-Klik Otomatis
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickRoles.map((r) => {
                const isSelected = username === r.username;
                return (
                  <button
                    key={r.username}
                    type="button"
                    onClick={() => handleQuickLogin(r.username)}
                    className={`p-2.5 rounded-2xl text-left transition-all duration-150 border ios-press cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#059669]/10 border-[#059669] text-[#059669] dark:text-[#34D399] shadow-sm shadow-[#059669]/20'
                        : 'bg-black/[0.025] dark:bg-white/[0.035] border-black/[0.05] dark:border-white/[0.06] text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:border-black/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/[0.05] dark:bg-white/[0.08]">
                        {r.badge}
                      </span>
                      {isSelected && <Check className="w-3 h-3 text-[#059669] dark:text-[#34D399]" />}
                    </div>
                    <p className="text-xs font-bold truncate leading-tight">{r.role}</p>
                    <p className="text-[10px] text-[#8E8E93] truncate mt-0.5">@{r.username}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-start gap-2.5 text-xs text-[#FF3B30]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.8} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                Nama Pengguna / Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E93]">
                  <User className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username atau email"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-sm text-[#1C1C1E] dark:text-white placeholder-[#8E8E93]/60 focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
                  Kata Sandi
                </label>
                <span className="text-[11px] text-[#8E8E93] font-mono">
                  Default: password123
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E93]">
                  <Lock className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-sm text-[#1C1C1E] dark:text-white placeholder-[#8E8E93]/60 focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#1C1C1E] dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md text-[#059669] border-black/[0.15] dark:border-white/[0.2] focus:ring-[#059669]/30 accent-[#059669]"
                />
                <span>Ingat Sesi Perangkat</span>
              </label>

              <span className="text-[#8E8E93] hover:text-[#059669] dark:hover:text-[#34D399] transition-colors cursor-pointer">
                Butuh Bantuan?
              </span>
            </div>

            {/* Action Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="default"
                size="lg"
                loading={loading}
                className="w-full text-base font-semibold py-4 rounded-2xl shadow-lg shadow-[#059669]/25 hover:shadow-[#059669]/35"
              >
                Masuk ke SIMSBH <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Security Pill */}
        <div className="w-full pt-8 text-center text-xs text-[#8E8E93]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.025] dark:bg-white/[0.035] border border-black/[0.04] dark:border-white/[0.06]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399]" />
            <span>Basis Data MySQL: <strong className="font-mono text-[#1C1C1E] dark:text-white">sinarbhaktihusada</strong> · Enkripsi Sanctum & Argon2id</span>
          </div>
        </div>

      </div>
    </div>
  );
}
