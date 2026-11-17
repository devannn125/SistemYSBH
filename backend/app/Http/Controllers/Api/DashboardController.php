<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityReport;
use App\Models\Attendance;
use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\Contract;
use App\Models\Document;
use App\Models\Employee;
use App\Models\ExpenseReport;
use App\Models\LetterClassification;
use App\Models\LetterNumber;
use App\Models\Logbook;
use App\Models\Program;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::now()->toDateString();
        $sixtyDaysLater = Carbon::now()->addDays(60);

        // 1. Antrean Dokumen Persetujuan
        $pendingApprovalsQuery = Document::with(['creator', 'latestVersion', 'letterNumber']);
        if ($user->hasRole(['direktur', 'superadmin'])) {
            $pendingApprovalsQuery->where('status', 'pending_director');
        } elseif ($user->hasRole(['hr_manager', 'finance_manager', 'program_manager'])) {
            $pendingApprovalsQuery->where('status', 'in_review')->where('division', $user->division);
        } else {
            $pendingApprovalsQuery->where('created_by', $user->id);
        }
        $pendingApprovals = $pendingApprovalsQuery->take(5)->get();
        $pendingCount = $pendingApprovalsQuery->count();

        // 2. Statistik Presensi Hari Ini
        $totalEmployees = Employee::count();
        $presentCount = Attendance::where('date', $today)->where('status', 'hadir')->count();
        $notClockedIn = max(0, $totalEmployees - $presentCount);

        // 3. Statistik Logbook Hari Ini
        $submittedLogbooksCount = Logbook::where('date', $today)->count();
        $missingLogbooksCount = max(0, $totalEmployees - $submittedLogbooksCount);

        // 4. Peringatan Masa Kontrak (60 Hari)
        $expiringContracts = Contract::with('employee')
            ->where('status', 'aktif')
            ->whereNotNull('end_date')
            ->where('end_date', '<=', $sixtyDaysLater)
            ->where('end_date', '>=', Carbon::now())
            ->get();

        // 5. Program Berjalan & Laporan Lapangan Terbaru
        $activeProgramsCount = Program::where('status', 'berjalan')->count();
        $latestReports = ActivityReport::with(['activity', 'submitter'])
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        // 6. Ringkasan Status Dokumen Keseluruhan
        $documentStatusCounts = [
            'draft' => Document::where('status', 'draft')->count(),
            'in_review' => Document::where('status', 'in_review')->count(),
            'pending_director' => Document::where('status', 'pending_director')->count(),
            'approved' => Document::where('status', 'approved')->count(),
            'rejected' => Document::where('status', 'rejected')->count(),
            'revision_needed' => Document::where('status', 'revision_needed')->count(),
        ];

        // =========================================================================
        // DATASET GRAFIK SESUAI BASIS DATA NYATA
        // =========================================================================

        // 7. Grafik Tren Presensi 7 Hari Terakhir
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        $attendanceTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $targetDate = Carbon::now()->subDays($i);
            $dateStr = $targetDate->toDateString();
            $dayOfWeek = (int) $targetDate->format('w');
            $dayLabel = $dayNames[$dayOfWeek] ?? $targetDate->format('D');
            
            $hadirCount = Attendance::where('date', $dateStr)->where('status', 'hadir')->count();
            $attendanceTrend[] = [
                'date' => $dateStr,
                'day' => $dayLabel,
                'short_date' => $targetDate->format('d M'),
                'present' => $hadirCount,
                'absent' => max(0, $totalEmployees - $hadirCount),
                'total' => $totalEmployees,
                'rate' => $totalEmployees > 0 ? round(($hadirCount / $totalEmployees) * 100) : 0,
            ];
        }

        // 8. Grafik Alokasi Anggaran (RAB) vs Realisasi (LPJ) per Kategori
        $budgetItemsByCategory = BudgetItem::select('category', DB::raw('SUM(total_price) as total_budget'))
            ->groupBy('category')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => ucfirst($item->category),
                    'budget' => (float) $item->total_budget,
                ];
            });

        $totalRAB = (float) Budget::sum('total_amount');
        $totalLPJ = (float) ExpenseReport::sum('total_realized');
        $budgetVariance = $totalRAB - $totalLPJ;
        $budgetRealizationRate = $totalRAB > 0 ? round(($totalLPJ / $totalRAB) * 100, 1) : 0;

        // 9. Grafik Distribusi Dokumen per Siklus Hidup (Lifecycle)
        $totalDocs = Document::count();
        $docLifecycle = [
            [
                'label' => 'Disetujui',
                'status' => 'approved',
                'count' => $documentStatusCounts['approved'],
                'color' => '#34C759',
                'percentage' => $totalDocs > 0 ? round(($documentStatusCounts['approved'] / $totalDocs) * 100) : 0,
            ],
            [
                'label' => 'Menunggu Direktur',
                'status' => 'pending_director',
                'count' => $documentStatusCounts['pending_director'],
                'color' => '#007AFF',
                'percentage' => $totalDocs > 0 ? round(($documentStatusCounts['pending_director'] / $totalDocs) * 100) : 0,
            ],
            [
                'label' => 'Dalam Review',
                'status' => 'in_review',
                'count' => $documentStatusCounts['in_review'],
                'color' => '#FF9500',
                'percentage' => $totalDocs > 0 ? round(($documentStatusCounts['in_review'] / $totalDocs) * 100) : 0,
            ],
            [
                'label' => 'Draf Baru',
                'status' => 'draft',
                'count' => $documentStatusCounts['draft'],
                'color' => '#8E8E93',
                'percentage' => $totalDocs > 0 ? round(($documentStatusCounts['draft'] / $totalDocs) * 100) : 0,
            ],
            [
                'label' => 'Perlu Revisi',
                'status' => 'revision_needed',
                'count' => $documentStatusCounts['revision_needed'],
                'color' => '#FF3B30',
                'percentage' => $totalDocs > 0 ? round(($documentStatusCounts['revision_needed'] / $totalDocs) * 100) : 0,
            ],
        ];

        // 10. Grafik Distribusi Pegawai per Divisi
        $divisionStats = Employee::select('division', DB::raw('COUNT(*) as total'))
            ->groupBy('division')
            ->get()
            ->map(function ($item) use ($totalEmployees) {
                return [
                    'division' => $item->division,
                    'count' => $item->total,
                    'percentage' => $totalEmployees > 0 ? round(($item->total / $totalEmployees) * 100) : 0,
                ];
            });

        // 11. Grafik Status Penomoran Surat per Klasifikasi
        $letterStats = LetterClassification::withCount([
            'letterNumbers as total',
            'letterNumbers as issued' => function ($q) { $q->where('status', 'issued'); },
            'letterNumbers as reserved' => function ($q) { $q->where('status', 'reserved'); },
            'letterNumbers as void' => function ($q) { $q->where('status', 'void'); },
        ])->get()->map(function ($c) {
            return [
                'code' => $c->code,
                'name' => $c->name,
                'total' => $c->total,
                'issued' => $c->issued,
                'reserved' => $c->reserved,
                'void' => $c->void,
            ];
        });

        // 12. Metrik Khusus Staf Lapangan & Personal
        $myAttendanceTrend = [];
        $myPresentDays = 0;
        for ($i = 6; $i >= 0; $i--) {
            $targetDate = Carbon::now()->subDays($i);
            $dateStr = $targetDate->toDateString();
            $dayOfWeek = (int) $targetDate->format('w');
            $dayLabel = $dayNames[$dayOfWeek] ?? $targetDate->format('D');
            
            $att = Attendance::where('user_id', $user->id)->where('date', $dateStr)->first();
            if ($att && in_array($att->status, ['hadir', 'terlambat'])) {
                $myPresentDays++;
            }
            $myAttendanceTrend[] = [
                'date' => $dateStr,
                'day' => $dayLabel,
                'short_date' => $targetDate->format('d M'),
                'status' => $att ? $att->status : 'belum_absen',
                'clock_in' => $att ? $att->clock_in : null,
                'clock_out' => $att ? $att->clock_out : null,
                'is_late' => $att ? ($att->status === 'terlambat') : false,
                'location' => $att ? $att->location_note : null,
            ];
        }
        $myComplianceRate = round(($myPresentDays / 7) * 100);
        $myLogbooksCount = Logbook::where('user_id', $user->id)->count();

        // 13. Metrik Khusus HR (Kontrak Pegawai)
        $totalContracts = Contract::count();
        $activeContracts = Contract::where('status', 'aktif')->count();
        $contractStats = [
            'total' => $totalContracts,
            'active' => $activeContracts,
            'expiring_soon' => $expiringContracts->count(),
            'safe' => max(0, $activeContracts - $expiringContracts->count()),
        ];

        // 14. Metrik Khusus Program & Operasional
        $programStats = [
            'total_programs' => Program::count(),
            'active_programs' => $activeProgramsCount,
            'total_activities' => \App\Models\Activity::count(),
            'logbook_rate' => $totalEmployees > 0 ? round(($submittedLogbooksCount / $totalEmployees) * 100) : 0,
            'reports_count' => ActivityReport::count(),
        ];

        return response()->json([
            'pending_approvals_count' => $pendingCount,
            'pending_approvals' => $pendingApprovals,
            'attendance' => [
                'total_employees' => $totalEmployees,
                'present' => $presentCount,
                'not_present' => $notClockedIn,
            ],
            'logbook' => [
                'submitted' => $submittedLogbooksCount,
                'missing' => $missingLogbooksCount,
            ],
            'active_programs_count' => $activeProgramsCount,
            'latest_reports' => $latestReports,
            'expiring_contracts_count' => $expiringContracts->count(),
            'expiring_contracts' => $expiringContracts,
            'document_statuses' => $documentStatusCounts,
            // Dataset Grafik (Role-Customizable):
            'charts' => [
                'attendance_trend' => $attendanceTrend,
                'budget' => [
                    'total_rab' => $totalRAB,
                    'total_lpj' => $totalLPJ,
                    'variance' => $budgetVariance,
                    'realization_rate' => $budgetRealizationRate,
                    'categories' => $budgetItemsByCategory,
                ],
                'document_lifecycle' => $docLifecycle,
                'divisions' => $divisionStats,
                'letters' => $letterStats,
                'my_stats' => [
                    'attendance_7days' => $myAttendanceTrend,
                    'present_days' => $myPresentDays,
                    'compliance_rate' => $myComplianceRate,
                    'logbooks_count' => $myLogbooksCount,
                ],
                'contracts' => $contractStats,
                'programs' => $programStats,
            ],
        ]);
    }
}
