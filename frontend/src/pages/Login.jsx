import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { Lock, User, AlertCircle, ArrowRight, ArrowLeft, Sun, Moon } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState('kadek');
  const [password, setPassword] = useState('password123');
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
  };

  const quickRoles = [
    { username: 'kadek', role: 'Direktur Eksekutif', name: 'I Kadek Hermanta' },
    { username: 'ayu', role: 'HR Manager', name: 'Ayu Wulandari' },
    { username: 'budi', role: 'Staf HR', name: 'Budi Santoso' },
    { username: 'citra', role: 'Finance Manager', name: 'Citra Lestari' },
    { username: 'dodi', role: 'Program Manager', name: 'Dodi Pratama' },
    { username: 'eka', role: 'Program Officer', name: 'Eka Saputra' },
    { username: 'fajar', role: 'Staf Lapangan (Merauke)', name: 'Fajar Kogoya' },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAF8] dark:bg-[#0E1712] text-[#14201A] dark:text-[#EDF7F1] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative transition-colors duration-200">
      {/* Top action bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#586862] dark:text-[#8FA89B] hover:text-[#15803D] dark:hover:text-[#4ADE80] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          className="p-2 rounded-[10px] border border-[#E3EAE5] dark:border-[#22332A] bg-white dark:bg-[#14201A] text-[#586862] dark:text-[#EDF7F1] hover:border-[#15803D] transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#586862]" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-[10px] bg-[#15803D] flex items-center justify-center text-white font-bold text-lg mx-auto shadow-sm">
          SBH
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#14201A] dark:text-white">
          Sistem Informasi Terintegrasi
        </h2>
        <p className="mt-1 text-sm text-[#586862] dark:text-[#8FA89B]">
          Yayasan Sinar Bhakti Husada (YSBH) Papua
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#14201A] py-8 px-6 sm:px-10 rounded-[10px] border border-[#E3EAE5] dark:border-[#22332A] shadow-[0_2px_4px_rgba(20,32,26,0.03)]">
          {error && (
            <div className="mb-5 p-3.5 rounded-[10px] bg-[#FEE2E2] dark:bg-[#DC2626]/20 border border-[#FECACA] dark:border-[#DC2626]/40 flex items-start gap-2.5 text-xs text-[#DC2626] dark:text-[#F87171]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
                Nama Pengguna / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#586862] dark:text-[#8FA89B]">
                  <User className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username atau email"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#22332A] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#586862] dark:text-[#8FA89B]">
                  <Lock className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#22332A] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D]"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full justify-center"
              >
                Masuk ke Sistem <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>

          {/* Quick Login Test Role Section */}
          <div className="mt-6 pt-6 border-t border-[#E3EAE5] dark:border-[#22332A]">
            <p className="text-[11px] font-semibold text-[#586862] dark:text-[#8FA89B] uppercase tracking-wider mb-2.5">
              Pilih Akun Demo Cepat (7 Peran):
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-left">
              {quickRoles.map((r) => (
                <button
                  key={r.username}
                  type="button"
                  onClick={() => handleQuickLogin(r.username)}
                  className={`p-2 rounded-[8px] border text-left transition-colors cursor-pointer ${
                    username === r.username
                      ? 'bg-[#DCFCE7] dark:bg-[#15803D]/30 border-[#15803D] text-[#15803D] dark:text-[#4ADE80]'
                      : 'bg-[#F7FAF8] dark:bg-[#192821] border-[#E3EAE5] dark:border-[#22332A] text-[#586862] dark:text-[#8FA89B] hover:bg-white dark:hover:bg-[#22332A] hover:text-[#14201A] dark:hover:text-white'
                  }`}
                >
                  <p className="text-xs font-semibold truncate">{r.name}</p>
                  <p className="text-[10px] opacity-80 truncate">{r.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
