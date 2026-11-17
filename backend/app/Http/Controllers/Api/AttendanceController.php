<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\WorkSchedule;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Dapatkan kebijakan jam kerja aktif yayasan
     */
    public function getSchedule(Request $request): JsonResponse
    {
        $schedule = WorkSchedule::getActiveSchedule();
        if ($schedule->updated_by) {
            $schedule->load('updatedByUser:id,name,username,position');
        }

        return response()->json([
            'schedule' => $schedule,
            'server_time' => Carbon::now()->format('H:i:s'),
        ]);
    }

    /**
     * Atur kebijakan jam kerja (Khusus Direktur & Superadmin)
     */
    public function updateSchedule(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['direktur', 'superadmin', 'hr_manager'])) {
            return response()->json(['message' => 'Hanya Direktur atau Administrator yang berwenang mengatur jam kerja.'], 403);
        }

        $request->validate([
            'work_start_time' => 'required|string|regex:/^\d{2}:\d{2}$/',
            'work_end_time' => 'required|string|regex:/^\d{2}:\d{2}$/',
            'late_tolerance_minutes' => 'required|integer|min:0|max:120',
            'notes' => 'nullable|string|max:255',
        ]);

        $schedule = WorkSchedule::where('is_active', true)->first();
        if (!$schedule) {
            $schedule = new WorkSchedule();
            $schedule->is_active = true;
        }

        $schedule->work_start_time = $request->work_start_time;
        $schedule->work_end_time = $request->work_end_time;
        $schedule->late_tolerance_minutes = (int) $request->late_tolerance_minutes;
        $schedule->notes = $request->notes ?: 'Jadwal Kerja Reguler Yayasan Sinar Bhakti Husada Papua';
        $schedule->updated_by = $user->id;
        $schedule->save();

        AuditLog::record(
            'update_schedule',
            "{$user->name} memperbarui jam kerja yayasan: Masuk {$schedule->work_start_time}, Pulang {$schedule->work_end_time}, Toleransi {$schedule->late_tolerance_minutes} menit",
            $schedule
        );

        return response()->json([
            'message' => 'Kebijakan jam kerja yayasan berhasil diperbarui',
            'schedule' => $schedule->load('updatedByUser:id,name,username,position'),
        ]);
    }

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

        $schedule = WorkSchedule::getActiveSchedule();
        $startTime = Carbon::createFromTimeString($schedule->work_start_time);
        $thresholdTime = (clone $startTime)->addMinutes((int) $schedule->late_tolerance_minutes);
        $currentCarbon = Carbon::createFromTimeString($currentTime);

        $status = 'hadir';
        $notes = $request->notes;

        if ($currentCarbon->greaterThan($thresholdTime)) {
            $lateMinutes = $currentCarbon->diffInMinutes($startTime);
            $status = 'terlambat';
            $lateNote = "Terlambat {$lateMinutes} menit (Jadwal masuk: {$schedule->work_start_time})";
            $notes = $notes ? "{$notes} · {$lateNote}" : $lateNote;
        }

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'date' => $today,
            'clock_in' => $currentTime,
            'status' => $status,
            'location_note' => $request->location_note ?: ($user->division === 'Lapangan' ? 'Pos Lapangan Merauke' : 'Kantor Utama YSBH'),
            'notes' => $notes,
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

        $baseQuery = Attendance::query()
            ->whereMonth('date', $month)
            ->whereYear('date', $year);

        // Jika bukan Direktur, HR, atau Superadmin, batasi akses
        if (!$user->hasRole(['direktur', 'hr_manager', 'staf_hr', 'superadmin'])) {
            if ($user->hasRole('program_manager')) {
                $teamIds = User::where('division', 'Program')->orWhere('division', 'Lapangan')->pluck('id');
                $baseQuery->whereIn('user_id', $teamIds);
            } else {
                $baseQuery->where('user_id', $user->id);
            }
        }

        if ($request->filled('status') && in_array($request->status, ['hadir', 'terlambat'])) {
            $baseQuery->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $baseQuery->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('division', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
        }

        // Summary counters across the entire filtered period
        $totalRecords = (clone $baseQuery)->count();
        $totalLate = (clone $baseQuery)->where('status', 'terlambat')->count();
        $totalOnTime = $totalRecords - $totalLate;

        $perPage = (int) $request->input('per_page', 10);
        $records = $baseQuery->with('user')
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        $schedule = WorkSchedule::getActiveSchedule();
        $startTime = Carbon::createFromTimeString($schedule->work_start_time);
        $thresholdTime = (clone $startTime)->addMinutes((int) $schedule->late_tolerance_minutes);
        $endTime = Carbon::createFromTimeString($schedule->work_end_time);

        $records->getCollection()->transform(function ($att) use ($startTime, $thresholdTime, $endTime) {
            $clockInTime = $att->clock_in ? Carbon::createFromTimeString($att->clock_in) : null;
            $clockOutTime = $att->clock_out ? Carbon::createFromTimeString($att->clock_out) : null;

            $isLate = false;
            $lateMinutes = 0;
            if ($clockInTime && $clockInTime->greaterThan($thresholdTime)) {
                $isLate = true;
                $lateMinutes = $clockInTime->diffInMinutes($startTime);
            }

            $isEarly = false;
            $earlyMinutes = 0;
            if ($clockOutTime && $clockOutTime->lessThan($endTime)) {
                $isEarly = true;
                $earlyMinutes = $endTime->diffInMinutes($clockOutTime);
            }

            $att->is_late = $isLate;
            $att->late_minutes = $lateMinutes;
            $att->is_early_departure = $isEarly;
            $att->early_departure_minutes = $earlyMinutes;

            return $att;
        });

        $paginated = $records->toArray();
        $paginated['schedule'] = $schedule;
        $paginated['summary'] = [
            'total_records' => $totalRecords,
            'total_late' => $totalLate,
            'total_on_time' => $totalOnTime,
        ];

        return response()->json($paginated);
    }
}
