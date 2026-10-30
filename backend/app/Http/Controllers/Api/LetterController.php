<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LetterClassification;
use App\Models\LetterNumber;
use App\Services\LetterNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LetterController extends Controller
{
    protected LetterNumberService $letterService;

    public function __construct(LetterNumberService $letterService)
    {
        $this->letterService = $letterService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = LetterNumber::with(['classification', 'requester', 'document'])
            ->orderBy('id', 'desc');

        if ($request->filled('classification_id')) {
            $query->where('classification_id', $request->classification_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_number', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $letters = $query->paginate($request->input('per_page', 15));

        return response()->json($letters);
    }

    public function classifications(): JsonResponse
    {
        $classifications = LetterClassification::where('is_active', true)->get();
        return response()->json($classifications);
    }

    public function requestNumber(Request $request): JsonResponse
    {
        $request->validate([
            'classification_id' => 'required|exists:letter_classifications,id',
            'subject' => 'required|string|max:255',
            'year' => 'nullable|integer',
            'document_id' => 'nullable|exists:documents,id',
        ]);

        $year = $request->input('year', (int) date('Y'));
        $user = $request->user();

        $letterNumber = $this->letterService->generateNumber(
            $request->classification_id,
            $year,
            $user->id,
            $request->subject,
            $request->document_id
        );

        $letterNumber->load(['classification', 'requester']);

        return response()->json([
            'message' => 'Nomor surat berhasil dicadangkan',
            'data' => $letterNumber,
        ], 201);
    }

    public function voidNumber(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:5|max:255',
        ]);

        $user = $request->user();
        $letterNumber = $this->letterService->voidNumber($id, $user->id, $request->reason);

        return response()->json([
            'message' => 'Nomor surat berhasil dibatalkan',
            'data' => $letterNumber,
        ]);
    }
}

