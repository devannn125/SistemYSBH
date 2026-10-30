import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  Users, 
  Search, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  UserCheck, 
  FileText,
  Phone,
  Mail,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export function Employees() {
  const { user, hasRole } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Add Employee Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdSuccessData, setCreatedSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: 'YSBH2026!',
    role: 'staf_lapangan',
    division: 'Lapangan',
    position: 'Staf Lapangan Survei',
    phone: '',
    address: 'Merauke, Papua',
    join_date: new Date().toISOString().slice(0, 10),
    contract_type: 'PKWT',
    contract_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = 'YSBH@';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: res }));
  };

  // Detail Modal
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (search) params.append('search', search);
      if (selectedDivision) params.append('division', selectedDivision);

      const res = await api.get(`/employees?${params.toString()}`);
      setEmployees(res.data);
      setPagination({
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1);
  }, [search, selectedDivision]);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await api.post('/employees', formData);
      setAddModalOpen(false);
      setCreatedSuccessData({
        employee: res.data,
        initialPassword: res.initial_password || formData.password,
        email: formData.email,
        username: formData.username,
        name: formData.name,
      });
      setFormData({
        name: '',
        username: '',
        email: '',
        password: 'YSBH2026!',
        role: 'staf_lapangan',
        division: 'Lapangan',
        position: 'Staf Lapangan Survei',
        phone: '',
        address: 'Merauke, Papua',
        join_date: new Date().toISOString().slice(0, 10),
        contract_type: 'PKWT',
        contract_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      });
      fetchEmployees(1);
    } catch (err) {
      alert(err.message || 'Gagal menambahkan data karyawan.');
    } finally {
      setAddLoading(false);
    }
  };

  const getContractStatusBadge = (contract) => {
    if (!contract) return <Badge status="draft" label="Belum ada kontrak" />;
    if (contract.status === 'aktif') {
      const endDate = new Date(contract.end_date);
      const diffDays = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 60 && diffDays > 0) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            <AlertTriangle className="w-3 h-3" /> Berakhir {diffDays} Hari
          </span>
        );
      }
      return <Badge status="aktif" label="Aktif" />;
    }
    return <Badge status="draft" label={contract.status} />;
  };

  const pageActions = (hasRole('direktur') || hasRole('hr_manager') || hasRole('staf_hr')) ? (
    <Button variant="primary" size="md" onClick={() => setAddModalOpen(true)}>
      <Plus className="w-4 h-4 mr-1.5" /> Tambah Karyawan Baru
    </Button>
  ) : null;

  return (
    <AppLayout 
      pageTitle="Manajemen Kepegawaian (HR)" 
      pageSubtitle="Data induk karyawan, status kepegawaian, dan pengawasan masa berlaku kontrak kerja."
      pageActions={pageActions}
      breadcrumbs={['Kepegawaian']}
    >

      {/* Filter and Search */}
      <Card className="mb-6" padding="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#586862] dark:text-[#8FA89B]" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Cari nama, NIK, atau jabatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
            />
          </div>

          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
            >
              <option value="">Semua Divisi / Unit Kerja</option>
              <option value="Direksi">Direksi</option>
              <option value="HR">HR / Kepegawaian</option>
              <option value="Keuangan">Keuangan</option>
              <option value="Program">Program Malaria</option>
              <option value="Lapangan">Staf Lapangan (Papua)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Employees Table */}
      <Card padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7FAF8] dark:bg-[#192821] text-[#586862] dark:text-[#8FA89B] text-xs uppercase font-semibold border-b border-[#E3EAE5] dark:border-[#22332A]">
              <tr>
                <th className="px-5 py-3.5">NIK & Nama Staf</th>
                <th className="px-5 py-3.5">Divisi & Jabatan</th>
                <th className="px-5 py-3.5">Status Kontrak</th>
                <th className="px-5 py-3.5">Periode Kontrak</th>
                <th className="px-5 py-3.5">Kontak</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE5] dark:divide-[#22332A]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#586862] dark:text-[#8FA89B]">
                    Memuat data karyawan...
                  </td>
                </tr>
              ) : employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#F0FDF4] dark:hover:bg-[#192821]/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#14201A] dark:text-white">{emp.full_name}</p>
                      <p className="font-mono text-xs text-[#15803D] dark:text-[#4ADE80] font-bold">{emp.nik}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-xs text-[#14201A] dark:text-[#EDF7F1]">{emp.position}</p>
                      <p className="text-xs text-[#586862] dark:text-[#8FA89B]">{emp.division}</p>
                    </td>
                    <td className="px-5 py-4">
                      {getContractStatusBadge(emp.active_contract)}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-[#586862] dark:text-[#8FA89B]">
                      {emp.active_contract ? (
                        <>
                          {emp.active_contract.start_date} s/d{' '}
                          <span className="font-bold text-[#14201A] dark:text-white">
                            {emp.active_contract.end_date || 'Tetap'}
                          </span>
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#586862] dark:text-[#8FA89B]">
                      <p>{emp.phone || '-'}</p>
                      <p className="text-[11px] text-[#15803D] dark:text-[#4ADE80]">{emp.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant="tertiary"
                        onClick={() => setSelectedEmployee(emp)}
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#586862] dark:text-[#8FA89B]">
                    <Users className="w-8 h-8 text-[#586862] dark:text-[#8FA89B] mx-auto mb-2 opacity-50" strokeWidth={1.75} />
                    <p className="font-semibold text-sm text-[#14201A] dark:text-white">Tidak ada data karyawan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah Karyawan Baru (FR-HR-01 & 02) */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Tambah Karyawan Baru"
        subtitle="Membuat profil identitas, akun sistem, dan kontrak kerja awal"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Username Akun Login
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              />
            </div>
          </div>

          {/* Pengaturan Password Awal Akun & Notifikasi Email */}
          <div className="p-3.5 rounded-[10px] bg-[#F0FDF4] dark:bg-[#15803D]/15 border border-[#DCFCE7] dark:border-[#15803D]/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#15803D] dark:text-[#4ADE80] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Password Akun Pegawai (Default / Ditentukan HR)
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] font-semibold text-[#15803D] dark:text-[#4ADE80] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Acak Password
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Tentukan password awal (min 6 karakter)"
                className="w-full pr-10 pl-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[8px] border border-[#DCFCE7] dark:border-[#2A3F33] text-[#14201A] dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#586862] dark:text-[#8FA89B] hover:text-[#14201A] dark:hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-[#586862] dark:text-[#8FA89B] leading-tight">
              <Mail className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80] shrink-0 mt-0.5" />
              <span>
                Setelah disimpan, email resmi SIMSBH akan otomatis terkirim ke <strong>{formData.email || 'alamat email pegawai'}</strong> berisi nama pengguna, password awal di atas, dan tautan masuk sistem.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Peran Sistem (Role)
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              >
                <option value="staf_lapangan">Staf Lapangan</option>
                <option value="program_officer">Program Officer</option>
                <option value="program_manager">Program Manager</option>
                <option value="staf_hr">Staf HR</option>
                <option value="hr_manager">HR Manager</option>
                <option value="finance_manager">Finance Manager</option>
                <option value="direktur">Direktur</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Divisi / Bagian
              </label>
              <select
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              >
                <option value="Lapangan">Lapangan (Papua)</option>
                <option value="Program">Program Malaria</option>
                <option value="HR">HR</option>
                <option value="Keuangan">Keuangan</option>
                <option value="Direksi">Direksi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Nama Jabatan
              </label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E3EAE5] dark:border-[#22332A]">
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Jenis Kontrak
              </label>
              <select
                value={formData.contract_type}
                onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              >
                <option value="PKWT">PKWT (Kontrak Tertentu)</option>
                <option value="PKWTT">PKWTT (Tetap)</option>
                <option value="Konsultan">Konsultan Ahli</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Tanggal Mulai Kerja
              </label>
              <input
                type="date"
                required
                value={formData.join_date}
                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Tanggal Berakhir Kontrak
              </label>
              <input
                type="date"
                value={formData.contract_end_date}
                onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <Button variant="tertiary" onClick={() => setAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={addLoading}>
              Simpan Data Karyawan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Sukses Pendaftaran Pegawai & Pengiriman Email */}
      <Modal
        isOpen={Boolean(createdSuccessData)}
        onClose={() => setCreatedSuccessData(null)}
        title="Pegawai Berhasil Didaftarkan!"
        subtitle="Notifikasi email dan kredensial akses telah dikirimkan ke pegawai"
        maxWidth="max-w-lg"
      >
        {createdSuccessData && (
          <div className="space-y-4">
            <div className="p-4 rounded-[10px] bg-[#F0FDF4] dark:bg-[#15803D]/20 border border-[#DCFCE7] dark:border-[#15803D]/40 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#DCFCE7] dark:bg-[#15803D]/35 text-[#15803D] dark:text-[#4ADE80] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
              </div>
              <h4 className="font-bold text-sm text-[#14201A] dark:text-white">
                Email Pendaftaran Telah Dikirim
              </h4>
              <p className="text-xs text-[#586862] dark:text-[#8FA89B] max-w-sm mx-auto">
                Surat elektronik resmi SIMSBH telah dikirim ke <strong className="text-[#15803D] dark:text-[#4ADE80]">{createdSuccessData.email}</strong> berisi informasi login dan himbauan untuk segera mengubah password awal.
              </p>
            </div>

            <div className="p-3.5 rounded-[10px] bg-[#F7FAF8] dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#22332A] space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#E3EAE5] dark:border-[#22332A]">
                <span className="text-[#586862] dark:text-[#8FA89B]">Nama Pegawai:</span>
                <span className="font-semibold text-[#14201A] dark:text-white">{createdSuccessData.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E3EAE5] dark:border-[#22332A]">
                <span className="text-[#586862] dark:text-[#8FA89B]">NIK Sistem:</span>
                <span className="font-mono font-bold text-[#15803D] dark:text-[#4ADE80]">{createdSuccessData.employee?.nik}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E3EAE5] dark:border-[#22332A]">
                <span className="text-[#586862] dark:text-[#8FA89B]">Nama Pengguna (Username):</span>
                <span className="font-mono font-bold text-[#14201A] dark:text-white">{createdSuccessData.username}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#586862] dark:text-[#8FA89B]">Password Awal:</span>
                <span className="font-mono font-bold text-[#15803D] dark:text-[#4ADE80] bg-[#DCFCE7] dark:bg-[#15803D]/30 px-2 py-0.5 rounded">
                  {createdSuccessData.initialPassword}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const text = `Kredensial SIMSBH:\nNama: ${createdSuccessData.name}\nNIK: ${createdSuccessData.employee?.nik}\nUsername: ${createdSuccessData.username}\nPassword: ${createdSuccessData.initialPassword}\nPortal: ${window.location.origin}/login`;
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="w-4 h-4 mr-1 text-[#16A34A]" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Tersalin!' : 'Salin Kredensial'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCreatedSuccessData(null)}
              >
                Selesai
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Detail Karyawan */}
      <Modal
        isOpen={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        title={selectedEmployee?.full_name || 'Profil Karyawan'}
        subtitle={`NIK: ${selectedEmployee?.nik} · Jabatan: ${selectedEmployee?.position}`}
      >
        {selectedEmployee && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-[8px] bg-[#F7FAF8] dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#22332A] grid grid-cols-2 gap-2">
              <div>
                <span className="text-[#586862] dark:text-[#8FA89B]">Divisi:</span>
                <p className="font-semibold text-[#14201A] dark:text-white">{selectedEmployee.division}</p>
              </div>
              <div>
                <span className="text-[#586862] dark:text-[#8FA89B]">Status Pegawai:</span>
                <p className="font-semibold capitalize text-[#15803D] dark:text-[#4ADE80]">{selectedEmployee.status}</p>
              </div>
              <div>
                <span className="text-[#586862] dark:text-[#8FA89B]">Tanggal Bergabung:</span>
                <p className="font-semibold text-[#14201A] dark:text-white">{selectedEmployee.join_date}</p>
              </div>
              <div>
                <span className="text-[#586862] dark:text-[#8FA89B]">Alamat:</span>
                <p className="font-semibold text-[#14201A] dark:text-white">{selectedEmployee.address || '-'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-[#14201A] dark:text-white mb-2">
                Kontrak Aktif Saat Ini
              </h4>
              {selectedEmployee.active_contract ? (
                <div className="p-3 rounded-[8px] border border-[#E3EAE5] dark:border-[#22332A] bg-white dark:bg-[#192821]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#15803D] dark:text-[#4ADE80]">
                      {selectedEmployee.active_contract.contract_number}
                    </span>
                    <Badge status="aktif" />
                  </div>
                  <p className="mt-1 text-[#586862] dark:text-[#8FA89B]">
                    Tipe: <span className="font-medium text-[#14201A] dark:text-white">{selectedEmployee.active_contract.contract_type}</span> · Berlaku: {selectedEmployee.active_contract.start_date} s/d {selectedEmployee.active_contract.end_date || 'Permanen'}
                  </p>
                </div>
              ) : (
                <p className="text-[#586862] dark:text-[#8FA89B]">Belum ada kontrak aktif tercatat.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

