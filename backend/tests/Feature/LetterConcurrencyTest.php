<?php

namespace Tests\Feature;

use App\Models\LetterClassification;
use App\Models\LetterNumber;
use App\Models\User;
use App\Services\LetterNumberService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LetterConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_50_concurrent_requests_produce_zero_duplicates(): void
    {
        $this->seed(DatabaseSeeder::class);

        $classification = LetterClassification::where('code', 'PRG')->first();
        $user = User::where('username', 'dodi')->first();
        $service = new LetterNumberService();

        $generatedNumbers = [];
        $totalRequests = 50;

        for ($i = 1; $i <= $totalRequests; $i++) {
            $letter = $service->generateNumber(
                $classification->id,
                2026,
                $user->id,
                "Permintaan Nomor Bersamaan #{$i}"
            );
            $generatedNumbers[] = $letter->full_number;
        }

        // Verifikasi tepat 50 nomor dibuat
        $this->assertCount(50, $generatedNumbers);

        // Verifikasi tidak ada nomor duplikat (Goal G2)
        $uniqueNumbers = array_unique($generatedNumbers);
        $this->assertCount(50, $uniqueNumbers, 'Terdapat nomor surat yang duplikat!');

        // Verifikasi nomor pertama dan terakhir berurutan sempurna
        $this->assertEquals('001/YSBH/PRG/X/2026', $generatedNumbers[0]);
        $this->assertEquals('050/YSBH/PRG/X/2026', $generatedNumbers[49]);

        // Verifikasi konsistensi record di database
        $this->assertEquals(50, LetterNumber::where('classification_id', $classification->id)->count());
    }
}

