<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function today(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::now()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        return response()->json([
            'date' => $today,
            'attendance' => $attendance,
        ]);
    }

    public function clockIn(Request $request): JsonResponse
    {
        $request->validate([
            'location_note' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $today = Carbon::now()->toDateString();
        $currentTime = Carbon::now()->toTimeString();

        $existing = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Presensi masuk hari ini sudah tercatat sebelumnya.',
                'data' => $existing,
            ]);
        }

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'date' => $today,
            'clock_in' => $currentTime,
            'status' => 'hadir',
            'location_note' => $request->location_note ?: ($user->division === 'Lapangan' ? 'Pos Lapangan Merauke' : 'Kantor Utama YSBH'),
            'notes' => $request->notes,
        ]);

        AuditLog::record('clock_in', "{$user->name} mencatat absensi masuk pukul {$currentTime}", $attendance);

        return response()->json([
            'message' => 'Presensi masuk berhasil dicatat',
            'data' => $attendance,
        ]);
    }

    public function clockOut(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::now()->toDateString();
        $currentTime = Carbon::now()->toTimeString();

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->firstOrFail();

        $attendance->update([
            'clock_out' => $currentTime,
        ]);

        AuditLog::record('clock_out', "{$user->name} mencatat absensi pulang pukul {$currentTime}", $attendance);

        return response()->json([
            'message' => 'Presensi pulang berhasil dicatat',
            'data' => $attendance,
        ]);
    }

    public function recap(Request $request): JsonResponse
    {
        $user = $request->user();
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $query = Attendance::with('user')
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date', 'desc');

        // Jika bukan Direktur atau HR, hanya melihat tim atau miliknya
        if (!$user->hasRole(['direktur', 'hr_manager', 'staf_hr'])) {
            if ($user->hasRole('program_manager')) {
                $teamIds = User::where('division', 'Program')->orWhere('division', 'Lapangan')->pluck('id');
                $query->whereIn('user_id', $teamIds);
            } else {
                $query->where('user_id', $user->id);
            }
        }

        $records = $query->paginate($request->input('per_page', 20));

        return response()->json($records);
    }
}
