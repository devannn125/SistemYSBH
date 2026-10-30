import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/client';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { 
  LayoutDashboard, 
  FileText, 
  Hash, 
  Users, 
  CalendarCheck, 
  Activity, 
  Receipt, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Clock,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export function AppLayout({ 
  children, 
  pageTitle, 
  pageSubtitle, 
  pageActions, 
  breadcrumbs = [] 
}) {
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Change Password Modal State
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setChangePasswordLoading(true);
    try {
      const res = await api.put('/update-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });
      setPasswordSuccess(res.message || 'Kata sandi berhasil diperbarui.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
      setTimeout(() => {
        setChangePasswordOpen(false);
        setPasswordSuccess('');
      }, 1500);
    } catch (err) {
      setPasswordError(
        err.errors?.current_password?.[0] || 
        err.errors?.new_password?.[0] || 
        err.message || 
        'Gagal memperbarui kata sandi.'
      );
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const navGroups = [
    {
      groupTitle: 'Ringkasan',
      items: [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          show: true,
        },
      ],
    },
    {
      groupTitle: 'Administrasi & Surat',
      items: [
        {
          label: 'Nomor Surat',
          path: '/letters',
          icon: Hash,
          show: true,
        },
        {
          label: 'Dokumen & Persetujuan',
          path: '/documents',
          icon: FileText,
          show: true,
        },
      ],
    },
    {
      groupTitle: 'Operasional Lapangan',
      items: [
        {
          label: 'Presensi & Logbook',
          path: '/attendance-logbook',
          icon: CalendarCheck,
          show: true,
        },
        {
          label: 'Program & Lapangan',
          path: '/programs',
          icon: Activity,
          show: true,
        },
      ],
    },
    {
      groupTitle: 'Manajemen Yayasan',
      items: [
        {
          label: 'Kepegawaian (HR)',
          path: '/employees',
          icon: Users,
          show: hasRole('direktur') || hasRole('hr_manager') || hasRole('staf_hr') || hasRole('finance_manager'),
        },
        {
          label: 'Keuangan & RAB',
          path: '/finance',
          icon: Receipt,
          show: hasRole('direktur') || hasRole('finance_manager') || hasRole('program_manager'),
        },
      ],
    },
    {
      groupTitle: 'Kontrol & Keamanan',
      items: [
        {
          label: 'Jejak Audit',
          path: '/audit-trail',
          icon: ShieldAlert,
          show: hasRole('direktur'),
        },
      ],
    },
  ];

  const getInitials = (name) => {
    if (!name) return 'SB';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getRoleDisplayName = (role) => {
    const map = {
      direktur: 'Direktur Eksekutif',
      hr_manager: 'HR Manager',
      staf_hr: 'Staf HR',
      finance_manager: 'Finance Manager',
      program_manager: 'Program Manager',
      program_officer: 'Program Officer',
      staf_lapangan: 'Staf Lapangan',
    };
    return map[role] || role;
  };

  const primaryRole = user?.roles?.[0] || 'Pengguna';

  return (
    <div className="min-h-screen bg-[#F7FAF8] dark:bg-[#0E1712] text-[#14201A] dark:text-[#EDF7F1] flex transition-colors duration-200">
      {/* Desktop Sidebar (256px fixed) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#14201A] border-r border-[#E3EAE5] dark:border-[#22332A] shrink-0 fixed inset-y-0 z-30 transition-colors duration-200">
        {/* Brand Header */}
        <Link to="/dashboard" className="h-16 px-6 border-b border-[#E3EAE5] dark:border-[#22332A] flex items-center gap-3 hover:bg-[#F7FAF8] dark:hover:bg-[#1A2A22] transition-colors">
          <div className="w-9 h-9 rounded-[10px] bg-[#15803D] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            SBH
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-[#14201A] dark:text-white tracking-tight leading-none">SIMSBH</h1>
              <span className="text-[10px] font-semibold text-[#15803D] dark:text-[#4ADE80] bg-[#DCFCE7] dark:bg-[#15803D]/30 px-1.5 py-0.2 rounded-full">v1.0</span>
            </div>
            <p className="text-[11px] text-[#586862] dark:text-[#8FA89B] font-medium tracking-wide mt-1">Sinar Bhakti Husada</p>
          </div>
        </Link>

        {/* Grouped Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter((item) => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                <div className="text-[10px] font-bold text-[#586862] dark:text-[#8FA89B] uppercase tracking-wider px-3 pb-1">
                  {group.groupTitle}
                </div>
                {visibleItems.map((item) => {
                  const active = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-xs sm:text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[#DCFCE7] dark:bg-[#15803D]/25 text-[#15803D] dark:text-[#4ADE80] font-semibold'
                          : 'text-[#586862] dark:text-[#8FA89B] hover:bg-[#F0FDF4] dark:hover:bg-[#1A2A22] hover:text-[#15803D] dark:hover:text-[#4ADE80]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Identity Pill & Logout */}
        <div className="p-3 border-t border-[#E3EAE5] dark:border-[#22332A] bg-[#F7FAF8]/60 dark:bg-[#0E1712]/60">
          <div className="p-2.5 rounded-[10px] bg-white dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#22332A] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#DCFCE7] dark:bg-[#15803D]/30 text-[#15803D] dark:text-[#4ADE80] font-bold text-xs flex items-center justify-center shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#14201A] dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-[#586862] dark:text-[#8FA89B] truncate">{getRoleDisplayName(primaryRole)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setPasswordError('');
                  setPasswordSuccess('');
                  setChangePasswordOpen(true);
                }}
                title="Ubah Kata Sandi Saya"
                className="p-1.5 rounded-[8px] text-[#586862] dark:text-[#8FA89B] hover:text-[#15803D] dark:hover:text-[#4ADE80] hover:bg-[#F0FDF4] dark:hover:bg-[#1A2A22] transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={logout}
                title="Keluar dari sistem"
                className="p-1.5 rounded-[8px] text-[#586862] dark:text-[#8FA89B] hover:text-[#DC2626] hover:bg-[#FEE2E2] dark:hover:bg-[#DC2626]/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-[#14201A]/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-white dark:bg-[#14201A] flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r border-[#E3EAE5] dark:border-[#22332A]">
            <div className="h-16 px-6 border-b border-[#E3EAE5] dark:border-[#22332A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[10px] bg-[#15803D] flex items-center justify-center text-white font-bold text-xs">
                  SBH
                </div>
                <h1 className="text-base font-bold text-[#14201A] dark:text-white">SIMSBH</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#586862] dark:text-[#8FA89B]">
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
              {navGroups.map((group, gIdx) => {
                const visibleItems = group.items.filter((item) => item.show);
                if (visibleItems.length === 0) return null;

                return (
                  <div key={gIdx} className="space-y-1">
                    <div className="text-[10px] font-bold text-[#586862] dark:text-[#8FA89B] uppercase tracking-wider px-3 pb-1">
                      {group.groupTitle}
                    </div>
                    {visibleItems.map((item) => {
                      const active = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-colors ${
                            active
                              ? 'bg-[#DCFCE7] dark:bg-[#15803D]/25 text-[#15803D] dark:text-[#4ADE80] font-semibold'
                              : 'text-[#586862] dark:text-[#8FA89B] hover:bg-[#F0FDF4] dark:hover:bg-[#1A2A22] hover:text-[#15803D] dark:hover:text-[#4ADE80]'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </nav>
            <div className="p-4 border-t border-[#E3EAE5] dark:border-[#22332A] space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setPasswordError('');
                  setPasswordSuccess('');
                  setChangePasswordOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[10px] bg-[#F7FAF8] dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#22332A] text-[#14201A] dark:text-[#EDF7F1] text-sm font-medium cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" /> Ubah Kata Sandi
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[10px] bg-[#FEE2E2] dark:bg-[#DC2626]/20 text-[#DC2626] dark:text-[#F87171] text-sm font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-[#14201A] border-b border-[#E3EAE5] dark:border-[#22332A] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-[8px] border border-[#E3EAE5] dark:border-[#22332A] md:hidden text-[#586862] dark:text-[#8FA89B]"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-[#586862] dark:text-[#8FA89B]">
              <Link to="/dashboard" className="hover:text-[#15803D] dark:hover:text-[#4ADE80] transition-colors">SIMSBH</Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] dark:text-[#334D3F]" />
                  <span className={idx === breadcrumbs.length - 1 ? 'font-medium text-[#14201A] dark:text-white' : ''}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Operational Time Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F7FAF8] dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#22332A] text-xs text-[#586862] dark:text-[#8FA89B]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <Clock className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80]" strokeWidth={1.75} />
              <span>Zona WIT (Papua)</span>
            </div>

            {/* Ubah Password Button */}
            <button
              onClick={() => {
                setPasswordError('');
                setPasswordSuccess('');
                setChangePasswordOpen(true);
              }}
              title="Ubah Kata Sandi Akun Saya"
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-[10px] border border-[#E3EAE5] dark:border-[#22332A] bg-[#F7FAF8] dark:bg-[#192821] text-xs font-semibold text-[#586862] dark:text-[#EDF7F1] hover:border-[#15803D] hover:text-[#15803D] dark:hover:text-[#4ADE80] transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80]" strokeWidth={1.75} />
              <span className="hidden lg:inline">Ganti Password</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              className="p-2 rounded-[10px] border border-[#E3EAE5] dark:border-[#22332A] bg-[#F7FAF8] dark:bg-[#192821] text-[#586862] dark:text-[#EDF7F1] hover:border-[#15803D] transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#F59E0B]" strokeWidth={1.75} />
              ) : (
                <Moon className="w-4 h-4 text-[#586862]" strokeWidth={1.75} />
              )}
            </button>

            {/* User Profile Badge */}
            <div className="text-right hidden sm:block pl-2 border-l border-[#E3EAE5] dark:border-[#22332A]">
              <p className="text-xs font-semibold text-[#14201A] dark:text-white">{user?.name}</p>
              <p className="text-[11px] text-[#15803D] dark:text-[#4ADE80] font-medium">{user?.division || 'YSBH'}</p>
            </div>
          </div>
        </header>

        {/* Page Content with Standardized Clean Header */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {pageTitle && (
            <div className="mb-6 pb-4 border-b border-[#E3EAE5] dark:border-[#22332A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#14201A] dark:text-white tracking-tight">{pageTitle}</h2>
                {pageSubtitle && (
                  <p className="text-xs sm:text-sm text-[#586862] dark:text-[#8FA89B] mt-1">{pageSubtitle}</p>
                )}
              </div>
              {pageActions && (
                <div className="flex items-center gap-2.5 shrink-0">
                  {pageActions}
                </div>
              )}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Modal Ubah Kata Sandi Akun */}
      <Modal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        title="Ubah Kata Sandi Akun"
        subtitle="Perbarui kata sandi Anda untuk memastikan keamanan akses sistem SIMSBH"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="p-3 rounded-[8px] bg-[#FEE2E2] dark:bg-[#DC2626]/20 border border-[#FECACA] dark:border-[#DC2626]/40 text-xs text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-[8px] bg-[#DCFCE7] dark:bg-[#15803D]/25 border border-[#BBF7D0] dark:border-[#15803D]/40 text-xs text-[#15803D] dark:text-[#4ADE80] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
              Kata Sandi Saat Ini
            </label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama Anda"
                className="w-full pr-10 pl-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#586862] dark:text-[#8FA89B] hover:text-[#14201A] dark:hover:text-white cursor-pointer"
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
              Kata Sandi Baru (Min. 6 Karakter)
            </label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru"
                className="w-full pr-10 pl-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#586862] dark:text-[#8FA89B] hover:text-[#14201A] dark:hover:text-white cursor-pointer"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPasswordConfirmation}
              onChange={(e) => setNewPasswordConfirmation(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="tertiary"
              onClick={() => setChangePasswordOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={changePasswordLoading}
            >
              Simpan Kata Sandi Baru
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
