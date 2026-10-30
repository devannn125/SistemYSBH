<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityReport;
use App\Models\AuditLog;
use App\Models\Program;
use App\Models\ReportAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgramController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $programs = Program::with(['manager', 'activities.leadOfficer'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($programs);
    }

    public function activities(Request $request): JsonResponse
    {
        $query = Activity::with(['program', 'leadOfficer', 'assignments.user'])
            ->orderBy('id', 'desc');

        if ($request->filled('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        return response()->json($query->get());
    }

    public function reports(Request $request): JsonResponse
    {
        $query = ActivityReport::with(['activity.program', 'submitter', 'verifier', 'attachments'])
            ->orderBy('id', 'desc');

        if ($request->filled('activity_id')) {
            $query->where('activity_id', $request->activity_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(15));
    }

    public function submitReport(Request $request): JsonResponse
    {
        $request->validate([
            'activity_id' => 'required|exists:activities,id',
            'report_date' => 'required|date',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'findings' => 'nullable|string',
            'challenges' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'files.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf,docx|max:10240',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $report = ActivityReport::create([
                'activity_id' => $request->activity_id,
                'submitted_by' => $user->id,
                'report_date' => $request->report_date,
                'title' => $request->title,
                'description' => $request->description,
                'findings' => $request->findings,
                'challenges' => $request->challenges,
                'recommendations' => $request->recommendations,
                'status' => 'submitted',
            ]);

            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store('reports/' . $report->id, 'local');
                    ReportAttachment::create([
                        'activity_report_id' => $report->id,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getClientMimeType(),
                        'caption' => $file->getClientOriginalName(),
                        'is_evidence_for_finance' => true,
                    ]);
                }
            }

            AuditLog::record('submit_field_report', "Laporan kegiatan '{$report->title}' dikirim oleh {$user->name}", $report);

            return response()->json([
                'message' => 'Laporan kegiatan lapangan berhasil dikirim',
                'data' => $report->load('attachments'),
            ], 201);
        });
    }

    public function verifyReport(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:verified,revision_needed',
            'verification_notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $report = ActivityReport::findOrFail($id);

        $report->update([
            'status' => $request->status,
            'verified_by' => $user->id,
            'verified_at' => now(),
            'verification_notes' => $request->verification_notes,
        ]);

        AuditLog::record('verify_field_report', "Laporan kegiatan '{$report->title}' status diubah menjadi {$request->status} oleh {$user->name}", $report);

        return response()->json([
            'message' => "Laporan berhasil di-{$request->status}",
            'data' => $report,
        ]);
    }
}

