<?php

namespace Tests\Feature;

use App\Models\LetterClassification;
use App\Models\User;
use App\Services\LetterNumberService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LetterNumberTest extends TestCase
{
    use RefreshDatabase;

    public function test_letter_numbers_are_generated_sequentially_without_duplicate(): void
    {
        $this->seed(DatabaseSeeder::class);

        $user = User::where('username', 'ayu')->first();
        $classification = LetterClassification::where('code', 'HR')->first();

        $service = new LetterNumberService();

        $letter1 = $service->generateNumber($classification->id, 2026, $user->id, 'Surat Tugas A');
        $letter2 = $service->generateNumber($classification->id, 2026, $user->id, 'Surat Tugas B');
        $letter3 = $service->generateNumber($classification->id, 2026, $user->id, 'Surat Tugas C');

        $this->assertEquals('001/YSBH/HR/X/2026', $letter1->full_number);
        $this->assertEquals('002/YSBH/HR/X/2026', $letter2->full_number);
        $this->assertEquals('003/YSBH/HR/X/2026', $letter3->full_number);

        $this->assertEquals('reserved', $letter1->status);

        // Test voiding letter 2
        $voidedLetter = $service->voidNumber($letter2->id, $user->id, 'Salah ketik nama tujuan');
        $this->assertEquals('void', $voidedLetter->status);
        $this->assertEquals('Salah ketik nama tujuan', $voidedLetter->void_reason);

        // Next letter should continue sequence (004), never reusing 002
        $letter4 = $service->generateNumber($classification->id, 2026, $user->id, 'Surat Tugas D');
        $this->assertEquals('004/YSBH/HR/X/2026', $letter4->full_number);
    }
}

