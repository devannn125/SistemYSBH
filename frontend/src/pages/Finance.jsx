import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  Receipt, 
  Plus, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  Trash2
} from 'lucide-react';

export function Finance() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('rab'); // 'rab' | 'spj' | 'gaji'
  const [budgets, setBudgets] = useState([]);
  const [expenseReports, setExpenseReports] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Budget Modal
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetActivityId, setBudgetActivityId] = useState('');
  const [budgetTitle, setBudgetTitle] = useState('');
  const [budgetItems, setBudgetItems] = useState([
    { category: 'transport', description: 'Sewa Speedboat Survei Rawa', quantity: 3, unit: 'hari', unit_price: 1500000, notes: '' },
    { category: 'konsumsi', description: 'Konsumsi Tim Lapangan (5 orang)', quantity: 15, unit: 'porsi', unit_price: 50000, notes: '' },
  ]);
  const [budgetLoading, setBudgetLoading] = useState(false);

  // New SPJ Modal
  const [spjModalOpen, setSpjModalOpen] = useState(false);
  const [spjActivityId, setSpjActivityId] = useState('');
  const [spjTitle, setSpjTitle] = useState('');
  const [spjRealized, setSpjRealized] = useState('');
  const [spjNotes, setSpjNotes] = useState('');
  const [spjLoading, setSpjLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bRes = await api.get('/budgets');
      setBudgets(bRes || []);

      const eRes = await api.get('/expense-reports');
      setExpenseReports(eRes || []);

      const pRes = await api.get('/payrolls');
      setPayrolls(pRes || []);

      const actRes = await api.get('/activities');
      setActivities(actRes || []);
      if (actRes.length > 0) {
        setBudgetActivityId(actRes[0].id);
        setSpjActivityId(actRes[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addBudgetItem = () => {
    setBudgetItems([
      ...budgetItems,
      { category: 'operasional', description: '', quantity: 1, unit: 'paket', unit_price: 0, notes: '' },
    ]);
  };

  const removeBudgetItem = (index) => {
    setBudgetItems(budgetItems.filter((_, i) => i !== index));
  };

  const updateBudgetItem = (index, field, value) => {
    const updated = [...budgetItems];
    updated[index][field] = value;
    setBudgetItems(updated);
  };

  const calculateTotalBudget = () => {
    return budgetItems.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    setBudgetLoading(true);
    try {
      await api.post('/budgets', {
        activity_id: budgetActivityId,
        title: budgetTitle,
        items: budgetItems,
      });
      alert('RAB kegiatan berhasil disimpan!');
      setBudgetModalOpen(false);
      setBudgetTitle('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan RAB.');
    } finally {
      setBudgetLoading(false);
    }
  };

  const handleCreateSPJ = async (e) => {
    e.preventDefault();
    setSpjLoading(true);
    try {
      await api.post('/expense-reports', {
        activity_id: spjActivityId,
        title: spjTitle,
        total_realized: Number(spjRealized),
        notes: spjNotes,
      });
      alert('Laporan pertanggungjawaban keuangan berhasil dicatat!');
      setSpjModalOpen(false);
      setSpjTitle('');
      setSpjRealized('');
      setSpjNotes('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan pertanggungjawaban.');
    } finally {
      setSpjLoading(false);
    }
  };

  const formatRupiah = (num) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

  const pageActions = hasRole('finance_manager') ? (
    <>
      <Button variant="secondary" size="md" onClick={() => setSpjModalOpen(true)}>
        + Catat SPJ Realisasi
      </Button>
      <Button variant="primary" size="md" onClick={() => setBudgetModalOpen(true)}>
        + Buat RAB Kegiatan
      </Button>
    </>
  ) : null;

  return (
    <AppLayout 
      pageTitle="Keuangan & Anggaran Operasional" 
      pageSubtitle="Penyusunan Rencana Anggaran Biaya (RAB), pertanggungjawaban realisasi belanja (SPJ), dan slip gaji staf."
      pageActions={pageActions}
      breadcrumbs={['Keuangan']}
    >

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-[#E3EAE5] dark:border-[#22332A] flex items-center gap-6">
        <button
          onClick={() => setActiveTab('rab')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'rab'
              ? 'border-[#15803D] dark:border-[#4ADE80] text-[#15803D] dark:text-[#4ADE80]'
              : 'border-transparent text-[#586862] dark:text-[#8FA89B] hover:text-[#14201A] dark:hover:text-white'
          }`}
        >
          Rencana Anggaran Biaya (RAB)
        </button>
        <button
          onClick={() => setActiveTab('spj')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'spj'
              ? 'border-[#15803D] dark:border-[#4ADE80] text-[#15803D] dark:text-[#4ADE80]'
              : 'border-transparent text-[#586862] dark:text-[#8FA89B] hover:text-[#14201A] dark:hover:text-white'
          }`}
        >
          Pertanggungjawaban (SPJ)
        </button>
        <button
          onClick={() => setActiveTab('gaji')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'gaji'
              ? 'border-[#15803D] dark:border-[#4ADE80] text-[#15803D] dark:text-[#4ADE80]'
              : 'border-transparent text-[#586862] dark:text-[#8FA89B] hover:text-[#14201A] dark:hover:text-white'
          }`}
        >
          Slip Gaji
        </button>
      </div>

      {activeTab === 'rab' && (
        <div className="space-y-6">
          <Card padding="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F7FAF8] dark:bg-[#192821] text-[#586862] dark:text-[#8FA89B] text-xs uppercase font-semibold border-b border-[#E3EAE5] dark:border-[#22332A]">
                  <tr>
                    <th className="px-5 py-3.5">Judul RAB & Kegiatan</th>
                    <th className="px-5 py-3.5">Total Nilai Anggaran</th>
                    <th className="px-5 py-3.5">Penyusun</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Item Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE5] dark:divide-[#22332A]">
                  {budgets.length > 0 ? (
                    budgets.map((b) => (
                      <tr key={b.id} className="hover:bg-[#F0FDF4] dark:hover:bg-[#192821]/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#14201A] dark:text-white">{b.title}</p>
                          <p className="text-xs text-[#586862] dark:text-[#8FA89B]">
                            Kegiatan: {b.activity?.name} ({b.activity?.program?.name})
                          </p>
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-sm text-[#15803D] dark:text-[#4ADE80]">
                          {formatRupiah(b.total_amount)}
                        </td>
                        <td className="px-5 py-4 text-xs text-[#14201A] dark:text-[#EDF7F1]">{b.creator?.name}</td>
                        <td className="px-5 py-4"><Badge status={b.status} /></td>
                        <td className="px-5 py-4 text-xs text-[#586862] dark:text-[#8FA89B]">
                          {b.items?.length || 0} baris pengeluaran
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-xs text-[#586862] dark:text-[#8FA89B]">
                        Belum ada dokumen RAB dibuat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'spj' && (
        <Card padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7FAF8] dark:bg-[#192821] text-[#586862] dark:text-[#8FA89B] text-xs uppercase font-semibold border-b border-[#E3EAE5] dark:border-[#22332A]">
                <tr>
                  <th className="px-5 py-3.5">Judul Pertanggungjawaban</th>
                  <th className="px-5 py-3.5">Realisasi Biaya</th>
                  <th className="px-5 py-3.5">Selisih (Variance)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Pelapor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE5] dark:divide-[#22332A]">
                {expenseReports.length > 0 ? (
                  expenseReports.map((spj) => (
                    <tr key={spj.id} className="hover:bg-[#F0FDF4] dark:hover:bg-[#192821]/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#14201A] dark:text-white">{spj.title}</p>
                        <p className="text-xs text-[#586862] dark:text-[#8FA89B]">Kegiatan: {spj.activity?.name}</p>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-sm text-[#14201A] dark:text-white">
                        {formatRupiah(spj.total_realized)}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#15803D] dark:text-[#4ADE80]">
                        {formatRupiah(spj.variance)}
                      </td>
                      <td className="px-5 py-4"><Badge status={spj.status} /></td>
                      <td className="px-5 py-4 text-xs text-[#586862] dark:text-[#8FA89B]">{spj.submitter?.name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-xs text-[#586862] dark:text-[#8FA89B]">
                      Belum ada laporan pertanggungjawaban tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'gaji' && (
        <Card padding="p-0">
          <div className="p-4 bg-[#F7FAF8] dark:bg-[#192821] border-b border-[#E3EAE5] dark:border-[#22332A] text-xs text-[#586862] dark:text-[#8FA89B]">
            Informasi gaji diisolasi dengan keamanan ketat (FR-FIN-06). Hanya terlihat oleh Finance Manager, Direktur, dan pemilik akun terkait.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7FAF8] dark:bg-[#192821] text-[#586862] dark:text-[#8FA89B] text-xs uppercase font-semibold border-b border-[#E3EAE5] dark:border-[#22332A]">
                <tr>
                  <th className="px-5 py-3.5">Nama Staf & NIK</th>
                  <th className="px-5 py-3.5">Periode</th>
                  <th className="px-5 py-3.5">Gaji Pokok</th>
                  <th className="px-5 py-3.5">Tunjangan</th>
                  <th className="px-5 py-3.5">Gaji Bersih (Take Home)</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE5] dark:divide-[#22332A]">
                {payrolls.length > 0 ? (
                  payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F0FDF4] dark:hover:bg-[#192821]/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#14201A] dark:text-white">{p.employee?.full_name}</p>
                        <p className="font-mono text-xs text-[#15803D] dark:text-[#4ADE80] font-bold">{p.employee?.nik}</p>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#14201A] dark:text-[#EDF7F1]">
                        Bulan {p.period_month} / {p.period_year}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#586862] dark:text-[#8FA89B]">{formatRupiah(p.basic_salary)}</td>
                      <td className="px-5 py-4 font-mono text-xs text-[#586862] dark:text-[#8FA89B]">{formatRupiah(p.allowances)}</td>
                      <td className="px-5 py-4 font-mono font-bold text-sm text-[#15803D] dark:text-[#4ADE80]">
                        {formatRupiah(p.net_salary)}
                      </td>
                      <td className="px-5 py-4"><Badge status={p.status} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-xs text-[#586862] dark:text-[#8FA89B]">
                      Tidak ada data slip gaji yang dapat diakses.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Buat RAB Baru */}
      <Modal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        title="Penyusunan Rencana Anggaran Biaya (RAB)"
        subtitle="RAB akan diajukan ke Direktur melalui alur persetujuan terpadu"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateBudget} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Pilih Kegiatan Program
              </label>
              <select
                required
                value={budgetActivityId}
                onChange={(e) => setBudgetActivityId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white"
              >
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">
                Judul Dokumen RAB
              </label>
              <input
                type="text"
                required
                placeholder="Misal: RAB Survei Entomologi Merauke Periode I"
                value={budgetTitle}
                onChange={(e) => setBudgetTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14201A] dark:text-white">Rincian Item Anggaran</span>
              <Button size="sm" variant="secondary" onClick={addBudgetItem}>
                + Tambah Baris Item
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {budgetItems.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-[8px] border border-[#E3EAE5] bg-[#F7FAF8] grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-3">
                    <select
                      value={item.category}
                      onChange={(e) => updateBudgetItem(idx, 'category', e.target.value)}
                      className="w-full p-1.5 bg-white border border-[#E3EAE5] rounded-[6px]"
                    >
                      <option value="transport">Transport</option>
                      <option value="konsumsi">Konsumsi</option>
                      <option value="honor">Honor / Upah</option>
                      <option value="logistik">Logistik / Alat</option>
                      <option value="operasional">Operasional</option>
                    </select>
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Uraian item..."
                      value={item.description}
                      onChange={(e) => updateBudgetItem(idx, 'description', e.target.value)}
                      className="w-full p-1.5 bg-white border border-[#E3EAE5] rounded-[6px]"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="0.1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => updateBudgetItem(idx, 'quantity', e.target.value)}
                      className="w-full p-1.5 bg-white border border-[#E3EAE5] rounded-[6px]"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Harga"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateBudgetItem(idx, 'unit_price', e.target.value)}
                      className="w-full p-1.5 bg-white border border-[#E3EAE5] rounded-[6px]"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    {budgetItems.length > 1 && (
                      <button type="button" onClick={() => removeBudgetItem(idx)} className="text-[#DC2626] p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 bg-[#DCFCE7] rounded-[8px] flex justify-between items-center text-sm font-bold text-[#15803D]">
              <span>Total Estimasi Anggaran:</span>
              <span className="font-mono text-base">{formatRupiah(calculateTotalBudget())}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="tertiary" onClick={() => setBudgetModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" loading={budgetLoading}>Simpan Draf RAB</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Buat SPJ Realisasi */}
      <Modal
        isOpen={spjModalOpen}
        onClose={() => setSpjModalOpen(false)}
        title="Catat Realisasi Pengeluaran (SPJ)"
        subtitle="Pertanggungjawaban keuangan kegiatan"
      >
        <form onSubmit={handleCreateSPJ} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">Kegiatan</label>
            <select
              value={spjActivityId}
              onChange={(e) => setSpjActivityId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white"
            >
              {activities.map((a) => (
                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">Judul Laporan Realisasi</label>
            <input
              type="text"
              required
              placeholder="Misal: SPJ Biaya Transport & Konsumsi Survei Tahap I"
              value={spjTitle}
              onChange={(e) => setSpjTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">Total Biaya Riil yang Digunakan (Rp)</label>
            <input
              type="number"
              required
              min="0"
              placeholder="Misal: 5250000"
              value={spjRealized}
              onChange={(e) => setSpjRealized(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1">Catatan</label>
            <textarea
              rows={2}
              value={spjNotes}
              onChange={(e) => setSpjNotes(e.target.value)}
              placeholder="Catatan kwitansi atau bukti nota fisik..."
              className="w-full p-2.5 text-sm bg-white dark:bg-[#192821] rounded-[10px] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 focus:border-[#15803D] dark:focus:border-[#22C55E] resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="tertiary" onClick={() => setSpjModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" loading={spjLoading}>Simpan Pertanggungjawaban</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

