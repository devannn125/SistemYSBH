<?php

namespace Tests\Feature;

use App\Mail\EmployeeRegisteredMail;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmployeeRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_hr_manager_can_register_employee_with_custom_password_and_email_is_sent(): void
    {
        Mail::fake();

        $hrManager = User::where('username', 'ayu')->first();
        Sanctum::actingAs($hrManager);

        $customPassword = 'KaderPapua2026!';
        $email = 'kader.merauke@sinarbhaktihusada.org';

        $response = $this->postJson('/api/employees', [
            'name' => 'Maria Kaize',
            'username' => 'maria_kaize',
            'email' => $email,
            'password' => $customPassword,
            'role' => 'staf_lapangan',
            'division' => 'Lapangan',
            'position' => 'Staf Entomologi Malaria',
            'phone' => '081234567890',
            'join_date' => '2026-11-01',
            'contract_type' => 'PKWT',
        ]);

        $response->assertStatus(201);
        $this->assertEquals($customPassword, $response->json('initial_password'));

        // Pastikan email pendaftaran terkirim dengan informasi kredensial yang tepat
        Mail::assertSent(EmployeeRegisteredMail::class, function ($mail) use ($email, $customPassword) {
            return $mail->hasTo($email) &&
                   $mail->rawPassword === $customPassword &&
                   $mail->user->username === 'maria_kaize';
        });

        // Pastikan akun baru dapat login menggunakan password yang ditentukan HR
        $loginRes = $this->postJson('/api/login', [
            'username' => 'maria_kaize',
            'password' => $customPassword,
        ]);
        $loginRes->assertStatus(200);
        $this->assertArrayHasKey('token', $loginRes->json());
    }

    public function test_hr_manager_can_register_employee_with_default_password(): void
    {
        Mail::fake();

        $hrManager = User::where('username', 'ayu')->first();
        Sanctum::actingAs($hrManager);

        $response = $this->postJson('/api/employees', [
            'name' => 'John Gebze',
            'username' => 'john_gebze',
            'email' => 'john.gebze@sinarbhaktihusada.org',
            // password dikosongkan agar memakai default
            'role' => 'staf_lapangan',
            'division' => 'Lapangan',
            'position' => 'Koordinator Lapangan',
            'join_date' => '2026-11-01',
            'contract_type' => 'PKWT',
        ]);

        $response->assertStatus(201);
        $initialPassword = $response->json('initial_password');
        $this->assertNotEmpty($initialPassword);

        // Login dengan default password
        $loginRes = $this->postJson('/api/login', [
            'username' => 'john_gebze',
            'password' => $initialPassword,
        ]);
        $loginRes->assertStatus(200);
    }

    public function test_user_can_change_own_password(): void
    {
        $initialPassword = 'InitialPass123!';
        $newPassword = 'MyNewSecretPass2026!';

        // Daftarkan user
        $hrManager = User::where('username', 'ayu')->first();
        Sanctum::actingAs($hrManager);

        $this->postJson('/api/employees', [
            'name' => 'Petrus Mahuze',
            'username' => 'petrus_m',
            'email' => 'petrus.m@sinarbhaktihusada.org',
            'password' => $initialPassword,
            'role' => 'staf_lapangan',
            'division' => 'Lapangan',
            'position' => 'Surveyor Lapangan',
            'join_date' => '2026-11-01',
            'contract_type' => 'PKWT',
        ])->assertStatus(201);

        // User login
        $user = User::where('username', 'petrus_m')->first();
        Sanctum::actingAs($user);

        // Ubah password sendiri
        $changeRes = $this->putJson('/api/update-password', [
            'current_password' => $initialPassword,
            'new_password' => $newPassword,
            'new_password_confirmation' => $newPassword,
        ]);
        $changeRes->assertStatus(200);
        $this->assertEquals('Kata sandi berhasil diperbarui', $changeRes->json('message'));

        // Coba login dengan password lama (harus gagal)
        $oldLogin = $this->postJson('/api/login', [
            'username' => 'petrus_m',
            'password' => $initialPassword,
        ]);
        $oldLogin->assertStatus(422);

        // Coba login dengan password baru (harus sukses)
        $newLogin = $this->postJson('/api/login', [
            'username' => 'petrus_m',
            'password' => $newPassword,
        ]);
        $newLogin->assertStatus(200);
    }

    public function test_change_password_fails_if_current_password_is_incorrect(): void
    {
        $user = User::where('username', 'budi')->first();
        Sanctum::actingAs($user);

        $res = $this->putJson('/api/update-password', [
            'current_password' => 'WrongCurrentPassword!',
            'new_password' => 'NewValidPassword123!',
            'new_password_confirmation' => 'NewValidPassword123!',
        ]);

        $res->assertStatus(422);
        $res->assertJsonValidationErrors(['current_password']);
    }
}

