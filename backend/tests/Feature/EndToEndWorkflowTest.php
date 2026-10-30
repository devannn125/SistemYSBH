<?php

namespace Tests\Feature;

use App\Models\LetterClassification;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EndToEndWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_operational_workflow(): void
    {
        Storage::fake('local');
        $this->seed(DatabaseSeeder::class);

        // 1. Uji Login sebagai Staf HR (Budi)
        $loginResponse = $this->postJson('/api/login', [
            'username' => 'budi',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200);
        $this->assertArrayHasKey('token', $loginResponse->json());

        $budi = User::where('username', 'budi')->first();
        Sanctum::actingAs($budi);

        // 2. Minta Nomor Surat Otomatis (FR-NOM)
        $hrClassification = LetterClassification::where('code', 'HR')->first();
        $letterResponse = $this->postJson('/api/letters/request', [
            'classification_id' => $hrClassification->id,
            'subject' => 'Surat Tugas Supervisi Malaria Papua',
            'year' => 2026,
        ]);

        $letterResponse->assertStatus(201);
        $letterData = $letterResponse->json('data');
        $this->assertEquals('001/YSBH/HR/X/2026', $letterData['full_number']);
        $this->assertEquals('reserved', $letterData['status']);
        $letterId = $letterData['id'];

        // 3. Buat dan Unggah Dokumen (FR-DOC)
        $fakeFile = UploadedFile::fake()->create('Surat_Tugas.pdf', 500, 'application/pdf');

        $docResponse = $this->postJson('/api/documents', [
            'title' => 'Surat Tugas Lapangan Merauke',
            'category' => 'surat_keluar',
            'division' => 'HR',
            'letter_number_id' => $letterId,
            'submit_immediately' => true,
            'file' => $fakeFile,
        ]);

        $docResponse->assertStatus(201);
        $docData = $docResponse->json('data');
        $docId = $docData['id'];
        $this->assertEquals('submitted', $docData['status']);

        // 4. HR Manager (Ayu) mereview dokumen dan meneruskannya ke Direktur
        $ayu = User::where('username', 'ayu')->first();
        Sanctum::actingAs($ayu);

        // Review oleh Manager
        $this->postJson("/api/documents/{$docId}/transition", [
            'action' => 'review',
            'comments' => 'Dokumen sudah sesuai standar HR YSBH',
        ])->assertStatus(200);

        // Teruskan ke Direktur
        $this->postJson("/api/documents/{$docId}/transition", [
            'action' => 'forward_director',
            'comments' => 'Diajukan ke Direktur untuk persetujuan final',
        ])->assertStatus(200);

        // 5. Direktur (Kadek) menyetujui dokumen (FR-DOC-04 & FR-NOM-04)
        $kadek = User::where('username', 'kadek')->first();
        Sanctum::actingAs($kadek);

        $approveResponse = $this->postJson("/api/documents/{$docId}/transition", [
            'action' => 'approve',
            'comments' => 'Disetujui. Lanjutkan kegiatan sesuai protokol.',
        ]);

        $approveResponse->assertStatus(200);
        $this->assertEquals('approved', $approveResponse->json('data.status'));

        // Pastikan status nomor surat otomatis berubah menjadi 'issued' (terbit)
        $this->assertDatabaseHas('letter_numbers', [
            'id' => $letterId,
            'status' => 'issued',
        ]);

        // 6. Uji Presensi dan Logbook Staf Lapangan (Fajar)
        $fajar = User::where('username', 'fajar')->first();
        Sanctum::actingAs($fajar);

        // Catat masuk
        $clockInResponse = $this->postJson('/api/attendances/clock-in', [
            'location_note' => 'Distrik Semangga, Merauke',
        ]);
        $clockInResponse->assertStatus(200);

        // Isi logbook
        $logbookResponse = $this->postJson('/api/logbooks', [
            'date' => now()->toDateString(),
            'activity_summary' => 'Distribusi 50 kelambu berinsektisida dan pemeriksaan jentik.',
            'challenges' => 'Cuaca hujan di sore hari.',
        ]);
        $this->assertTrue(in_array($logbookResponse->status(), [200, 201]));

        // 7. Verifikasi Statistik Dashboard Direktur
        Sanctum::actingAs($kadek);
        $dashResponse = $this->getJson('/api/dashboard/stats');

        $dashResponse->assertStatus(200);
        $this->assertArrayHasKey('attendance', $dashResponse->json());
        $this->assertArrayHasKey('logbook', $dashResponse->json());
        $this->assertArrayHasKey('document_statuses', $dashResponse->json());
    }
}
