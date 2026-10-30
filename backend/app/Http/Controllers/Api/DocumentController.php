<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Document;
use App\Models\DocumentApproval;
use App\Models\DocumentVersion;
use App\Models\LetterNumber;
use App\Services\LetterNumberService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Document::with(['creator', 'latestVersion', 'letterNumber', 'currentReviewer'])
            ->orderBy('id', 'desc');

        if ($request->filled('division')) {
            $query->where('division', $request->division);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('document_number', 'like', "%{$search}%");
            });
        }

        // Filter untuk antrean persetujuan (pending approval queue)
        if ($request->boolean('pending_my_action')) {
            $user = $request->user();
            if ($user->hasRole('direktur')) {
                $query->where('status', 'pending_director');
            } elseif ($user->hasRole(['hr_manager', 'finance_manager', 'program_manager'])) {
                $query->where('status', 'in_review')
                      ->where('division', $user->division);
            }
        }

        $documents = $query->paginate($request->input('per_page', 10));

        return response()->json($documents);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'division' => 'required|string',
            'notes' => 'nullable|string',
            'letter_number_id' => 'nullable|exists:letter_numbers,id',
            'related_activity_id' => 'nullable|exists:activities,id',
            'related_budget_id' => 'nullable|exists:budgets,id',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,png|max:10240', // Maks 10 MB
            'submit_immediately' => 'nullable|boolean',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $status = $request->boolean('submit_immediately') ? 'submitted' : 'draft';

            // Tangani nomor surat jika ada
            $docNumber = null;
            if ($request->filled('letter_number_id')) {
                $letter = LetterNumber::find($request->letter_number_id);
                $docNumber = $letter?->full_number;
            }

            $document = Document::create([
                'document_number' => $docNumber,
                'title' => $request->title,
                'category' => $request->category,
                'division' => $request->division,
                'status' => $status,
                'current_version' => 1,
                'created_by' => $user->id,
                'letter_number_id' => $request->letter_number_id,
                'related_activity_id' => $request->related_activity_id,
                'related_budget_id' => $request->related_budget_id,
                'notes' => $request->notes,
            ]);

            // Tautkan document_id ke letter_number jika dipilih
            if ($request->filled('letter_number_id')) {
                LetterNumber::where('id', $request->letter_number_id)->update(['document_id' => $document->id]);
            }

            // Simpan file berkas
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $path = $file->store('documents/' . $document->id, 'local');

            $version = DocumentVersion::create([
                'document_id' => $document->id,
                'version_number' => 1,
                'file_path' => $path,
                'file_name' => $fileName,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getClientMimeType(),
                'changelog_notes' => 'Versi awal dokumen',
                'uploaded_by' => $user->id,
            ]);

            // Catat approval history awal
            DocumentApproval::create([
                'document_id' => $document->id,
                'version_id' => $version->id,
                'action_by' => $user->id,
                'action_role' => $user->getRoleNames()->first() ?? 'user',
                'from_status' => 'none',
                'to_status' => $status,
                'comments' => $request->boolean('submit_immediately') ? 'Dokumen dibuat dan langsung diajukan' : 'Draf dokumen dibuat',
            ]);

            AuditLog::record('create_document', "Dokumen {$document->title} berhasil dibuat", $document);

            return response()->json([
                'message' => 'Dokumen berhasil disimpan',
                'data' => $document->load(['latestVersion', 'letterNumber']),
            ], 201);
        });
    }

    public function show(int $id): JsonResponse
    {
        $document = Document::with([
            'creator',
            'letterNumber',
            'versions.uploader',
            'approvals.actor',
        ])->findOrFail($id);

        return response()->json($document);
    }

    public function transition(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'action' => 'required|in:submit,review,forward_director,approve,reject,request_revision,archive',
            'comments' => 'nullable|string',
        ]);

        $user = $request->user();
        $action = $request->action;
        $comments = $request->comments;

        // Validasi komentar wajib untuk reject dan revisi (FR-DOC-04)
        if (in_array($action, ['reject', 'request_revision']) && empty($comments)) {
            return response()->json(['message' => 'Komentar/catatan wajib diisi saat menolak atau meminta revisi.'], 422);
        }

        return DB::transaction(function () use ($id, $user, $action, $comments) {
            $document = Document::findOrFail($id);
            $fromStatus = $document->status;
            $toStatus = $fromStatus;

            switch ($action) {
                case 'submit':
                    if (!in_array($fromStatus, ['draft', 'revision_needed'])) {
                        throw new Exception("Dokumen dengan status {$fromStatus} tidak dapat diajukan kembali.");
                    }
                    $toStatus = 'in_review';
                    break;

                case 'review':
                    if ($fromStatus !== 'submitted') {
                        throw new Exception("Dokumen belum diajukan untuk direview.");
                    }
                    $toStatus = 'in_review';
                    break;

                case 'forward_director':
                    if ($fromStatus !== 'in_review') {
                        throw new Exception("Dokumen harus dalam tahap review divisi sebelum diajukan ke Direktur.");
                    }
                    $toStatus = 'pending_director';
                    break;

                case 'approve':
                    if (!in_array($fromStatus, ['in_review', 'pending_director'])) {
                        throw new Exception("Dokumen tidak berada pada status menunggu persetujuan.");
                    }
                    // Hanya Direktur yang berwenang menyetujui final
                    if (!$user->hasRoleName('direktur')) {
                        return response()->json(['message' => 'Hanya Direktur yang berwenang menyetujui dokumen ini.'], 403);
                    }
                    $toStatus = 'approved';

                    // Jika dokumen memiliki nomor surat yang dicadangkan, terbitkan nomornya (issued)
                    if ($document->letter_number_id) {
                        $letterService = app(LetterNumberService::class);
                        $letterService->issueNumber($document->letter_number_id);
                    }
                    break;

                case 'reject':
                    $toStatus = 'rejected';
                    break;

                case 'request_revision':
                    $toStatus = 'revision_needed';
                    break;

                case 'archive':
                    $toStatus = 'archived';
                    break;
            }

            $document->update([
                'status' => $toStatus,
                'current_reviewer_id' => $user->id,
            ]);

            DocumentApproval::create([
                'document_id' => $document->id,
                'version_id' => $document->latestVersion?->id,
                'action_by' => $user->id,
                'action_role' => $user->getRoleNames()->first() ?? 'user',
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'comments' => $comments,
            ]);

            AuditLog::record(
                'document_transition',
                "Status dokumen '{$document->title}' diubah dari {$fromStatus} ke {$toStatus}",
                $document,
                ['action' => $action, 'comments' => $comments]
            );

            return response()->json([
                'message' => "Status dokumen berhasil diubah menjadi {$toStatus}",
                'data' => $document->load(['latestVersion', 'approvals.actor']),
            ]);
        });
    }

    public function uploadNewVersion(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,png|max:10240',
            'changelog_notes' => 'required|string|max:255',
            'resubmit' => 'nullable|boolean',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $id, $user) {
            $document = Document::findOrFail($id);

            $nextVersionNumber = $document->current_version + 1;
            $file = $request->file('file');
            $path = $file->store('documents/' . $document->id, 'local');

            $version = DocumentVersion::create([
                'document_id' => $document->id,
                'version_number' => $nextVersionNumber,
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getClientMimeType(),
                'changelog_notes' => $request->changelog_notes,
                'uploaded_by' => $user->id,
            ]);

            $newStatus = $request->boolean('resubmit') ? 'in_review' : 'draft';
            $fromStatus = $document->status;

            $document->update([
                'current_version' => $nextVersionNumber,
                'status' => $newStatus,
            ]);

            DocumentApproval::create([
                'document_id' => $document->id,
                'version_id' => $version->id,
                'action_by' => $user->id,
                'action_role' => $user->getRoleNames()->first() ?? 'user',
                'from_status' => $fromStatus,
                'to_status' => $newStatus,
                'comments' => "Unggah berkas versi {$nextVersionNumber}: {$request->changelog_notes}",
            ]);

            AuditLog::record('upload_new_version', "Versi baru (v{$nextVersionNumber}) diunggah untuk dokumen {$document->title}", $document);

            return response()->json([
                'message' => "Versi {$nextVersionNumber} berhasil diunggah",
                'data' => $document->load(['versions', 'approvals.actor']),
            ], 201);
        });
    }

    public function downloadVersion(Request $request, int $documentId, int $versionId): BinaryFileResponse|JsonResponse
    {
        $version = DocumentVersion::where('document_id', $documentId)
            ->where('id', $versionId)
            ->firstOrFail();

        $path = storage_path('app/' . $version->file_path);

        if (!file_exists($path)) {
            return response()->json(['message' => 'Berkas tidak ditemukan pada server.'], 404);
        }

        return response()->download($path, $version->file_name, [
            'Content-Type' => $version->mime_type,
        ]);
    }
}
