<?php

namespace Tests\Feature;

use App\Models\Logbook;
use App\Models\User;
use App\Models\WorkSchedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AttendanceScheduleAndLogbookReviewTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_director_can_get_and_update_work_schedule(): void
    {
        $kadek = User::where('username', 'kadek')->first(); // Direktur
        Sanctum::actingAs($kadek);

        // 1. Get schedule
        $getResponse = $this->getJson('/api/attendances/schedule');
        $getResponse->assertStatus(200);
        $getResponse->assertJsonStructure(['schedule', 'server_time']);

        // 2. Update schedule
        $updateResponse = $this->postJson('/api/attendances/schedule', [
            'work_start_time' => '07:30',
            'work_end_time' => '16:30',
            'late_tolerance_minutes' => 10,
            'notes' => 'Jadwal penyesuaian operasional musim hujan Merauke',
        ]);

        $updateResponse->assertStatus(200);
        $this->assertEquals('07:30', $updateResponse->json('schedule.work_start_time'));
        $this->assertEquals(10, $updateResponse->json('schedule.late_tolerance_minutes'));

        // 3. Regular employee cannot update schedule
        $fajar = User::where('username', 'fajar')->first(); // Staf Lapangan
        Sanctum::actingAs($fajar);
        $failResponse = $this->postJson('/api/attendances/schedule', [
            'work_start_time' => '09:00',
            'work_end_time' => '17:00',
            'late_tolerance_minutes' => 30,
        ]);
        $failResponse->assertStatus(403);
    }

    public function test_director_can_view_logbook_detail_and_review_it(): void
    {
        $kadek = User::where('username', 'kadek')->first(); // Direktur
        $logbook = Logbook::first();

        Sanctum::actingAs($kadek);

        // 1. Show logbook detail
        $showResponse = $this->getJson("/api/logbooks/{$logbook->id}");
        $showResponse->assertStatus(200);
        $showResponse->assertJsonStructure(['data' => ['id', 'activity_summary', 'user']]);

        // 2. Review logbook
        $reviewResponse = $this->postJson("/api/logbooks/{$logbook->id}/review", [
            'feedback' => 'Bagus sekali, teruskan pemantauan jentik.',
            'status' => 'approved',
        ]);

        $reviewResponse->assertStatus(200);
        $this->assertEquals('approved', $reviewResponse->json('data.status'));
        $this->assertEquals('Bagus sekali, teruskan pemantauan jentik.', $reviewResponse->json('data.feedback'));
    }

    public function test_director_can_view_paginated_attendance_recap(): void
    {
        $kadek = User::where('username', 'kadek')->first(); // Direktur
        Sanctum::actingAs($kadek);

        // Test page 1 with per_page 5
        $response = $this->getJson('/api/attendances/recap?per_page=5&page=1');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'current_page',
            'data',
            'first_page_url',
            'from',
            'last_page',
            'per_page',
            'to',
            'total',
            'summary' => ['total_records', 'total_late', 'total_on_time'],
            'schedule',
        ]);

        $this->assertEquals(1, $response->json('current_page'));
        $this->assertEquals(5, $response->json('per_page'));
        $this->assertNotEmpty($response->json('data'));
        $this->assertLessThanOrEqual(5, count($response->json('data')));

        // Test filter by status=terlambat
        $lateResponse = $this->getJson('/api/attendances/recap?status=terlambat&per_page=5');
        $lateResponse->assertStatus(200);
        foreach ($lateResponse->json('data') as $record) {
            $this->assertEquals('terlambat', $record['status']);
        }
    }
}
