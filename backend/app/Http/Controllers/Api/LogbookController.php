<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Logbook;
use App\Models\LogbookAttachment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LogbookController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Logbook::with(['user', 'attachments'])->orderBy('date', 'desc');

        if ($user->hasRole(['staf_lapangan', 'staf_hr', 'program_officer'])) {
            $query->where('user_id', $user->id);
        } elseif ($user->hasRole('program_manager')) {
            $teamIds = User::whereIn('division', ['Program', 'Lapangan'])->pluck('id');
            $query->whereIn('user_id', $teamIds);
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $logbooks = $query->paginate($request->input('per_page', 10));

        return response()->json($logbooks);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
            'activity_summary' => 'required|string',
            'challenges' => 'nullable|string',
            'next_day_plan' => 'nullable|string',
            'files.*' => 'nullable|file|mimes:jpg,png,pdf,docx|max:10240',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $logbook = Logbook::where('user_id', $user->id)
                ->whereDate('date', $request->date)
                ->first();

            $isNew = false;
            if ($logbook) {
                $logbook->update([
                    'activity_summary' => $request->activity_summary,
                    'challenges' => $request->challenges,
                    'next_day_plan' => $request->next_day_plan,
                    'status' => 'submitted',
                ]);
            } else {
                $isNew = true;
                $logbook = Logbook::create([
                    'user_id' => $user->id,
                    'date' => $request->date,
                    'activity_summary' => $request->activity_summary,
                    'challenges' => $request->challenges,
                    'next_day_plan' => $request->next_day_plan,
                    'status' => 'submitted',
                ]);
            }

            // Simpan lampiran berkas jika ada
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store('logbooks/' . $logbook->id, 'local');
                    LogbookAttachment::create([
                        'logbook_id' => $logbook->id,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getClientMimeType(),
                    ]);
                }
            }

            AuditLog::record('submit_logbook', "{$user->name} memperbarui/mengirim logbook untuk tanggal {$request->date}", $logbook);

            return response()->json([
                'message' => 'Logbook harian berhasil disimpan',
                'data' => $logbook->load('attachments'),
            ], $isNew ? 201 : 200);
        });
    }

    public function missingToday(Request $request): JsonResponse
    {
        $today = Carbon::now()->toDateString();
        $submittedUserIds = Logbook::whereDate('date', $today)->pluck('user_id');

        $missingUsers = User::where('is_active', true)
            ->whereNotIn('id', $submittedUserIds)
            ->select('id', 'name', 'username', 'division', 'position')
            ->get();

        return response()->json([
            'date' => $today,
            'total_missing' => $missingUsers->count(),
            'users' => $missingUsers,
        ]);
    }

    /**
     * Tampilkan detail lengkap logbook (FR-LOG)
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $logbook = Logbook::with(['user.employee', 'reviewer', 'attachments'])->findOrFail($id);

        // Jika bukan Direktur/HR/Program Manager, pastikan hanya melihat miliknya
        if ($user->hasRole(['staf_lapangan', 'staf_hr', 'program_officer']) && $logbook->user_id !== $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses melihat logbook ini.'], 403);
        }

        return response()->json([
            'data' => $logbook,
        ]);
    }

    /**
     * Review / Persetujuan Logbook oleh Direktur atau Manager (FR-LOG)
     */
    public function review(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['direktur', 'program_manager', 'superadmin'])) {
            return response()->json(['message' => 'Hanya Direktur atau Program Manager yang dapat mereview logbook.'], 403);
        }

        $request->validate([
            'feedback' => 'nullable|string',
            'status' => 'nullable|string|in:submitted,reviewed,approved',
        ]);

        $logbook = Logbook::with('user')->findOrFail($id);
        $newStatus = $request->status ?: 'approved';

        $logbook->update([
            'reviewed_by' => $user->id,
            'reviewed_at' => Carbon::now(),
            'feedback' => $request->feedback ?: 'Logbook telah ditinjau dan diverifikasi oleh Direktur.',
            'status' => $newStatus,
        ]);

        AuditLog::record(
            'review_logbook',
            "{$user->name} mereview dan menyetujui logbook {$logbook->user->name} tanggal {$logbook->date->toDateString()}",
            $logbook
        );

        return response()->json([
            'message' => 'Logbook berhasil ditinjau dan diverifikasi.',
            'data' => $logbook->load(['user.employee', 'reviewer', 'attachments']),
        ]);
    }
}
