import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { ShieldAlert, Search, RefreshCw, History, User } from 'lucide-react';

export function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (search) params.append('search', search);
      if (selectedAction) params.append('action', selectedAction);

      const res = await api.get(`/audit-logs?${params.toString()}`);
      setLogs(res.data);
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
    fetchLogs(1);
  }, [search, selectedAction]);

  const pageActions = (
    <Button variant="tertiary" size="md" onClick={() => fetchLogs(pagination.current_page)}>
      <RefreshCw className="w-4 h-4 mr-1.5" /> Muat Ulang Log
    </Button>
  );

  return (
    <AppLayout 
      pageTitle="Jejak Audit Sistem (Audit Trail)" 
      pageSubtitle="Catatan log aktivitas otomatis bersifat append-only yang tidak dapat dimanipulasi atau dihapus."
      pageActions={pageActions}
      breadcrumbs={['Jejak Audit']}
    >

      {/* Filter and Search */}
      <Card className="mb-6" padding="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#586862] dark:text-[#8FA89B]" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Cari deskripsi aksi atau pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E]"
            />
          </div>

          <div>
            <Select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              placeholder="Semua Jenis Aksi"
              options={[
                { value: '', label: 'Semua Jenis Aksi' },
                { value: 'login', label: 'Login Masuk' },
                { value: 'logout', label: 'Logout Keluar' },
                { value: 'reserve_letter_number', label: 'Cadangkan Nomor Surat' },
                { value: 'void_letter_number', label: 'Batalkan Nomor Surat' },
                { value: 'create_document', label: 'Buat Dokumen' },
                { value: 'document_transition', label: 'Perubahan Status Dokumen' },
                { value: 'create_employee', label: 'Tambah Karyawan' },
                { value: 'clock_in', label: 'Presensi Masuk' },
                { value: 'submit_logbook', label: 'Kirim Logbook' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7FAF8] dark:bg-[#192821] text-[#586862] dark:text-[#8FA89B] text-xs uppercase font-semibold border-b border-[#E3EAE5] dark:border-[#22332A]">
              <tr>
                <th className="px-5 py-3.5">Waktu (WIT / WIB)</th>
                <th className="px-5 py-3.5">Pengguna & Peran</th>
                <th className="px-5 py-3.5">Aksi Sistem</th>
                <th className="px-5 py-3.5">Deskripsi Perubahan</th>
                <th className="px-5 py-3.5">IP & Perangkat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE5] dark:divide-[#22332A]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#586862] dark:text-[#8FA89B]">
                    Memuat log jejak audit...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F0FDF4] dark:hover:bg-[#192821]/50 transition-colors text-xs">
                    <td className="px-5 py-3.5 font-mono text-[#586862] dark:text-[#8FA89B]">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#14201A] dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80]" />
                        <span>{log.user?.name || 'Sistem Otomatis'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[#15803D] dark:text-[#4ADE80] font-semibold">
                      {log.action}
                    </td>
                    <td className="px-5 py-3.5 text-[#14201A] dark:text-[#EDF7F1]">
                      {log.description}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[#586862] dark:text-[#8FA89B]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-xs text-[#586862] dark:text-[#8FA89B]">
                    <History className="w-8 h-8 text-[#586862] dark:text-[#8FA89B] mx-auto mb-2 opacity-50" strokeWidth={1.75} />
                    <p className="font-semibold text-sm text-[#14201A] dark:text-white">Belum ada aktivitas tercatat</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="px-5 py-3.5 bg-[#F7FAF8] dark:bg-[#192821] border-t border-[#E3EAE5] dark:border-[#22332A] flex items-center justify-between text-xs text-[#586862] dark:text-[#8FA89B]">
            <span>
              Menampilkan {logs.length} dari {pagination.total} rekaman audit
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="tertiary"
                disabled={pagination.current_page <= 1}
                onClick={() => fetchLogs(pagination.current_page - 1)}
              >
                Sebelumnya
              </Button>
              <span className="px-3 py-1 font-semibold text-[#14201A] dark:text-white">
                {pagination.current_page} / {pagination.last_page}
              </span>
              <Button
                size="sm"
                variant="tertiary"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => fetchLogs(pagination.current_page + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </Card>
    </AppLayout>
  );
}

