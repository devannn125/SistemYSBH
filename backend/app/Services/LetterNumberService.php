<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\LetterClassification;
use App\Models\LetterNumber;
use App\Models\LetterSequence;
use Exception;
use Illuminate\Support\Facades\DB;

class LetterNumberService
{
    /**
     * Konversi angka bulan ke angka Romawi.
     */
    public static function romanMonth(int $month): string
    {
        $map = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII'
        ];
        return $map[$month] ?? 'I';
    }

    /**
     * Menghasilkan nomor surat dengan transaksi atomik dan penguncian baris (row-level locking).
     * Memenuhi kebutuhan FR-NOM-01 s/d FR-NOM-04 dan Target G2 (0 duplikasi).
     */
    public function generateNumber(
        int $classificationId,
        int $year,
        int $userId,
        string $subject,
        ?int $documentId = null,
        ?int $month = null
    ): LetterNumber {
        $month = $month ?: (int) date('n');
        $romanMonth = self::romanMonth($month);

        return DB::transaction(function () use ($classificationId, $year, $userId, $subject, $documentId, $romanMonth) {
            $classification = LetterClassification::findOrFail($classificationId);

            // Kunci baris sequence counter secara atomik
            $sequenceRecord = LetterSequence::where('classification_id', $classificationId)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if (!$sequenceRecord) {
                $sequenceRecord = LetterSequence::create([
                    'classification_id' => $classificationId,
                    'year' => $year,
                    'last_number' => 0,
                ]);
                // Kunci kembali record baru
                $sequenceRecord = LetterSequence::where('id', $sequenceRecord->id)
                    ->lockForUpdate()
                    ->first();
            }

            $nextSequence = $sequenceRecord->last_number + 1;
            $sequenceRecord->update(['last_number' => $nextSequence]);

            // Format nomor: {seq:3}/YSBH/{code}/{month_roman}/{year}
            $seqFormatted = str_pad((string) $nextSequence, 3, '0', STR_PAD_LEFT);
            $fullNumber = str_replace(
                ['{seq:3}', '{code}', '{month_roman}', '{year}'],
                [$seqFormatted, $classification->code, $romanMonth, $year],
                $classification->format_template
            );

            // Buat record nomor surat
            $letterNumber = LetterNumber::create([
                'classification_id' => $classificationId,
                'year' => $year,
                'sequence' => $nextSequence,
                'full_number' => $fullNumber,
                'subject' => $subject,
                'requested_by' => $userId,
                'document_id' => $documentId,
                'status' => 'reserved',
                'reserved_at' => now(),
            ]);

            AuditLog::record(
                'reserve_letter_number',
                "Nomor surat {$fullNumber} berhasil dicadangkan untuk perihal: {$subject}",
                $letterNumber,
                ['classification' => $classification->code, 'sequence' => $nextSequence]
            );

            return $letterNumber;
        }, 5); // 5 attempts retry if deadlock occurs
    }

    /**
     * Membatalkan nomor surat. Nomor yang dibatalkan tidak boleh dipakai kembali.
     */
    public function voidNumber(int $letterNumberId, int $userId, string $reason): LetterNumber
    {
        return DB::transaction(function () use ($letterNumberId, $userId, $reason) {
            $letterNumber = LetterNumber::findOrFail($letterNumberId);

            if ($letterNumber->status === 'void') {
                throw new Exception('Nomor surat sudah dalam status batal.');
            }

            $letterNumber->update([
                'status' => 'void',
                'voided_at' => now(),
                'void_reason' => $reason,
            ]);

            AuditLog::record(
                'void_letter_number',
                "Nomor surat {$letterNumber->full_number} dibatalkan dengan alasan: {$reason}",
                $letterNumber
            );

            return $letterNumber;
        });
    }

    /**
     * Mengubah status nomor surat menjadi terbit (issued) setelah dokumen disetujui.
     */
    public function issueNumber(int $letterNumberId): LetterNumber
    {
        $letterNumber = LetterNumber::findOrFail($letterNumberId);
        $letterNumber->update([
            'status' => 'issued',
            'issued_at' => now(),
        ]);

        return $letterNumber;
    }
}

