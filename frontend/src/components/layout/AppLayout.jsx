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
  Sun,
  Moon,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Layers
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
          show: hasRole('superadmin') || hasRole('direktur') || hasRole('hr_manager') || hasRole('staf_hr') || hasRole('finance_manager'),
        },
        {
          label: 'Keuangan & RAB',
          path: '/finance',
          icon: Receipt,
          show: hasRole('superadmin') || hasRole('direktur') || hasRole('finance_manager') || hasRole('program_manager'),
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
          show: hasRole('superadmin') || hasRole('direktur'),
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
      superadmin: 'Super Administrator',
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

  // Bottom navigation items for phone
  const mobileBottomItems = [
    { label: 'Dasbor', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Surat', path: '/letters', icon: Hash },
    { label: 'Presensi', path: '/attendance-logbook', icon: CalendarCheck },
    { label: 'Program', path: '/programs', icon: Activity },
    { label: 'Menu', action: () => setMobileMenuOpen(true), icon: Menu },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-[#1C1C1E] dark:text-[#F5F5F7] flex transition-colors duration-250 font-sans">
      {/* Desktop Sidebar (256px iOS Glassmorphism) */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border-r border-black/[0.06] dark:border-white/[0.08] shrink-0 fixed inset-y-0 z-30 transition-colors">
        {/* Brand Header */}
        <Link to="/dashboard" className="h-16 px-6 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors ios-press">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#047857] to-[#10B981] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#059669]/20">
            SBH
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-[#1C1C1E] dark:text-white tracking-tight leading-none">SIMSBH</h1>
              <span className="text-[10px] font-semibold text-[#059669] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#059669]/30 px-2 py-0.5 rounded-full">v1.2</span>
            </div>
            <p className="text-[11px] text-[#8E8E93] dark:text-[#98989D] font-medium tracking-wide mt-1">Sinar Bhakti Husada</p>
          </div>
        </Link>

        {/* Grouped Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter((item) => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                <div className="text-[10px] font-semibold text-[#8E8E93] dark:text-[#98989D] uppercase tracking-wider px-3 pb-1">
                  {group.groupTitle}
                </div>
                {visibleItems.map((item) => {
                  const active = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-150 ios-press ${
                        active
                          ? 'bg-[#059669] text-white shadow-sm shadow-[#059669]/30 font-semibold'
                          : 'text-[#8E8E93] dark:text-[#98989D] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1C1C1E] dark:hover:text-[#F5F5F7]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.2 : 1.75} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Identity Pill & Controls */}
        <div className="p-3 border-t border-black/[0.05] dark:border-white/[0.06]">
          <div className="p-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#ECFDF5] dark:bg-[#059669]/30 text-[#059669] dark:text-[#34D399] font-bold text-xs flex items-center justify-center shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1C1C1E] dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-[#8E8E93] dark:text-[#98989D] truncate">{getRoleDisplayName(primaryRole)}</p>
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
                className="p-1.5 rounded-xl text-[#8E8E93] hover:text-[#059669] dark:hover:text-[#34D399] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors ios-press cursor-pointer"
              >
                <KeyRound className="w-4 h-4" strokeWidth={1.8} />
              </button>
              <button
                onClick={logout}
                title="Keluar dari sistem"
                className="p-1.5 rounded-xl text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors ios-press cursor-pointer"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Slide-Over Sheet) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-80 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300 border-r border-black/[0.06] dark:border-white/[0.08] shadow-2xl">
            <div className="h-16 px-6 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#047857] to-[#10B981] flex items-center justify-center text-white font-bold text-xs">
                  SBH
                </div>
                <div>
                  <h1 className="text-sm font-bold text-[#1C1C1E] dark:text-white leading-tight">SIMSBH</h1>
                  <p className="text-[10px] text-[#8E8E93]">Sinar Bhakti Husada</p>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white ios-press"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
              {navGroups.map((group, gIdx) => {
                const visibleItems = group.items.filter((item) => item.show);
                if (visibleItems.length === 0) return null;

                return (
                  <div key={gIdx} className="space-y-1">
                    <div className="text-[10px] font-semibold text-[#8E8E93] dark:text-[#98989D] uppercase tracking-wider px-3 pb-1">
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
                          className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium transition-colors ios-press ${
                            active
                              ? 'bg-[#059669] text-white font-semibold shadow-sm shadow-[#059669]/30'
                              : 'text-[#8E8E93] dark:text-[#98989D] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1C1C1E] dark:hover:text-[#F5F5F7]'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.2 : 1.75} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </nav>
            <div className="p-4 border-t border-black/[0.05] dark:border-white/[0.06] space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setPasswordError('');
                  setPasswordSuccess('');
                  setChangePasswordOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] text-[#1C1C1E] dark:text-[#F5F5F7] text-sm font-medium ios-press cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-[#059669] dark:text-[#34D399]" /> Ubah Kata Sandi
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#FF3B30]/10 text-[#FF3B30] text-sm font-semibold ios-press cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* iOS Frosted Glass Top Header Bar */}
        <header className="h-16 border-b border-black/[0.06] dark:border-white/[0.08] ios-glass sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] text-[#1C1C1E] dark:text-white ios-press"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" strokeWidth={2} />
            </button>
            <div className="min-w-0">
              {breadcrumbs.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#8E8E93] mb-0.5">
                  <Link to="/dashboard" className="hover:text-[#059669] transition-colors">SIMSBH</Link>
                  {breadcrumbs.map((b, idx) => (
                    <React.Fragment key={idx}>
                      <ChevronRight className="w-3 h-3 text-[#8E8E93]" />
                      <span className={idx === breadcrumbs.length - 1 ? 'text-[#1C1C1E] dark:text-[#F5F5F7] font-medium' : ''}>
                        {b}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              )}
              <h1 className="text-base sm:text-lg font-bold text-[#1C1C1E] dark:text-white tracking-tight truncate leading-tight">
                {pageTitle || 'SIMSBH'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pageActions}
            
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white transition-all ios-press cursor-pointer"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#FF9500]" strokeWidth={2} />
              ) : (
                <Moon className="w-4 h-4 text-[#8E8E93]" strokeWidth={2} />
              )}
            </button>
          </div>
        </header>

        {/* Content Canvas (Full-Width Edge-to-Edge) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0">
          {pageSubtitle && (
            <div className="mb-6">
              <p className="text-xs sm:text-sm text-[#8E8E93] dark:text-[#98989D]">
                {pageSubtitle}
              </p>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* iOS Mobile Bottom Navigation Bar (Tab Bar) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-2xl border-t border-black/[0.06] dark:border-white/[0.08] px-2 py-1 flex items-center justify-around safe-area-bottom">
        {mobileBottomItems.map((item, idx) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          
          if (item.action) {
            return (
              <button
                key={idx}
                onClick={item.action}
                className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[#8E8E93] hover:text-[#059669] ios-press cursor-pointer"
              >
                <Icon className="w-5 h-5 mb-0.5" strokeWidth={1.75} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={idx}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ios-press ${
                active 
                  ? 'text-[#059669] dark:text-[#34D399] font-bold' 
                  : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={active ? 2.3 : 1.75} />
              <span className="text-[10px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Modal Ubah Kata Sandi */}
      <Modal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        title="Ubah Kata Sandi Saya"
        subtitle="Masukkan kata sandi lama dan tentukan kata sandi baru Anda."
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="p-3 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-xs">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/20 text-[#248A3D] dark:text-[#30D158] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
              Kata Sandi Saat Ini
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
              Kata Sandi Baru (Min. 6 Karakter)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type="password"
              required
              value={newPasswordConfirmation}
              onChange={(e) => setNewPasswordConfirmation(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button
              variant="tertiary"
              onClick={() => setChangePasswordOpen(false)}
              disabled={changePasswordLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={changePasswordLoading}
            >
              Simpan Sandi Baru
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
