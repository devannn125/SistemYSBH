<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\ExpenseReport;
use App\Models\Payroll;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    public function budgets(Request $request): JsonResponse
    {
        $budgets = Budget::with(['activity.program', 'creator', 'items'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($budgets);
    }

    public function storeBudget(Request $request): JsonResponse
    {
        $request->validate([
            'activity_id' => 'required|exists:activities,id',
            'title' => 'required|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.category' => 'required|string',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit' => 'required|string',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $totalAmount = 0;
            foreach ($request->items as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $budget = Budget::create([
                'activity_id' => $request->activity_id,
                'title' => $request->title,
                'total_amount' => $totalAmount,
                'status' => 'draft',
                'created_by' => $user->id,
            ]);

            foreach ($request->items as $item) {
                BudgetItem::create([
                    'budget_id' => $budget->id,
                    'category' => $item['category'],
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit' => $item['unit'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            AuditLog::record('create_budget', "RAB '{$budget->title}' senilai Rp " . number_format($totalAmount, 0, ',', '.') . " dibuat", $budget);

            return response()->json([
                'message' => 'RAB berhasil disimpan',
                'data' => $budget->load('items'),
            ], 201);
        });
    }

    public function expenseReports(Request $request): JsonResponse
    {
        $reports = ExpenseReport::with(['activity.program', 'budget', 'submitter'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($reports);
    }

    public function storeExpenseReport(Request $request): JsonResponse
    {
        $request->validate([
            'activity_id' => 'required|exists:activities,id',
            'budget_id' => 'nullable|exists:budgets,id',
            'title' => 'required|string|max:255',
            'total_realized' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $budget = $request->budget_id ? Budget::find($request->budget_id) : null;
        $variance = $budget ? ($budget->total_amount - $request->total_realized) : 0;

        $report = ExpenseReport::create([
            'activity_id' => $request->activity_id,
            'budget_id' => $request->budget_id,
            'title' => $request->title,
            'total_realized' => $request->total_realized,
            'variance' => $variance,
            'status' => 'submitted',
            'notes' => $request->notes,
            'submitted_by' => $user->id,
        ]);

        AuditLog::record('submit_expense_report', "Laporan pertanggungjawaban keuangan '{$report->title}' dikirim", $report);

        return response()->json([
            'message' => 'Pertanggungjawaban keuangan berhasil dicatat',
            'data' => $report,
        ], 201);
    }

    public function payrolls(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Payroll::with(['employee.user'])->orderBy('period_year', 'desc')->orderBy('period_month', 'desc');

        // FR-FIN-06: Hanya Finance Manager, Direktur, dan pemilik akun yang dapat melihat
        if (!$user->hasRole(['direktur', 'finance_manager'])) {
            $employeeId = $user->employee?->id;
            if (!$employeeId) {
                return response()->json([]);
            }
            $query->where('employee_id', $employeeId);
        }

        return response()->json($query->get());
    }
}

