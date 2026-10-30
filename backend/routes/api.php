<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\LetterController;
use App\Http\Controllers\Api\LogbookController;
use App\Http\Controllers\Api\ProgramController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/update-password', [AuthController::class, 'updatePassword']);

    // Executive Dashboard (Direktur & Managers)
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Letter Numbers (FR-NOM)
    Route::get('/letters', [LetterController::class, 'index']);
    Route::get('/letters/classifications', [LetterController::class, 'classifications']);
    Route::post('/letters/request', [LetterController::class, 'requestNumber']);
    Route::post('/letters/{id}/void', [LetterController::class, 'voidNumber']);

    // Documents & Approvals (FR-DOC)
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::get('/documents/{id}', [DocumentController::class, 'show']);
    Route::post('/documents/{id}/transition', [DocumentController::class, 'transition']);
    Route::post('/documents/{id}/versions', [DocumentController::class, 'uploadNewVersion']);
    Route::get('/documents/{id}/versions/{versionId}/download', [DocumentController::class, 'downloadVersion']);

    // Employee & Contracts (FR-HR)
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/expiring-contracts', [EmployeeController::class, 'expiringContracts']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);

    // Attendance (FR-ABS)
    Route::get('/attendances/today', [AttendanceController::class, 'today']);
    Route::post('/attendances/clock-in', [AttendanceController::class, 'clockIn']);
    Route::post('/attendances/clock-out', [AttendanceController::class, 'clockOut']);
    Route::get('/attendances/recap', [AttendanceController::class, 'recap']);

    // Logbook (FR-LOG)
    Route::get('/logbooks', [LogbookController::class, 'index']);
    Route::post('/logbooks', [LogbookController::class, 'store']);
    Route::get('/logbooks/missing-today', [LogbookController::class, 'missingToday']);

    // Programs & Field Reports (FR-PRG)
    Route::get('/programs', [ProgramController::class, 'index']);
    Route::get('/activities', [ProgramController::class, 'activities']);
    Route::get('/reports', [ProgramController::class, 'reports']);
    Route::post('/reports', [ProgramController::class, 'submitReport']);
    Route::post('/reports/{id}/verify', [ProgramController::class, 'verifyReport']);

    // Finance (FR-FIN)
    Route::get('/budgets', [FinanceController::class, 'budgets']);
    Route::post('/budgets', [FinanceController::class, 'storeBudget']);
    Route::get('/expense-reports', [FinanceController::class, 'expenseReports']);
    Route::post('/expense-reports', [FinanceController::class, 'storeExpenseReport']);
    Route::get('/payrolls', [FinanceController::class, 'payrolls']);

    // Audit Logs (FR-AUD)
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
});
