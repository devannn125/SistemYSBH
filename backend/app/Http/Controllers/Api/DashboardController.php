<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityReport;
use App\Models\Attendance;
use App\Models\Contract;
use App\Models\Document;
use App\Models\Employee;
use App\Models\Logbook;
use App\Models\Program;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::now()->toDateString();
        $sixtyDaysLater = Carbon::now()->addDays(60);

        // 1. Antrean Dokumen Persetujuan
        $pendingApprovalsQuery = Document::with(['creator', 'latestVersion', 'letterNumber']);
        if ($user->hasRole('direktur')) {
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
        ]);
    }
}

