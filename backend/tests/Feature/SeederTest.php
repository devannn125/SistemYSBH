<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_and_roles_are_seeded(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertEquals(7, User::count());

        $kadek = User::where('username', 'kadek')->first();
        $this->assertNotNull($kadek);
        $this->assertTrue($kadek->hasRole('direktur'));

        $ayu = User::where('username', 'ayu')->first();
        $this->assertNotNull($ayu);
        $this->assertTrue($ayu->hasRole('hr_manager'));

        $fajar = User::where('username', 'fajar')->first();
        $this->assertNotNull($fajar);
        $this->assertTrue($fajar->hasRole('staf_lapangan'));
    }
}
