<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\ActivityAssignment;
use App\Models\Attendance;
use App\Models\Contract;
use App\Models\Employee;
use App\Models\LetterClassification;
use App\Models\LetterSequence;
use App\Models\Logbook;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $guard = 'sanctum';

        // 1. Create Roles
        $roleNames = [
            'direktur',
            'hr_manager',
            'staf_hr',
            'finance_manager',
            'program_manager',
            'program_officer',
            'staf_lapangan',
        ];

        $roles = [];
        foreach ($roleNames as $name) {
            $roles[$name] = Role::firstOrCreate(['name' => $name, 'guard_name' => $guard]);
        }

        // 2. Create Permissions
        $permissions = [
            'users.manage', 'users.view',
            'employees.manage', 'employees.view',
            'attendance.create', 'attendance.view_own', 'attendance.view_team', 'attendance.view_all',
            'logbook.create', 'logbook.view_own', 'logbook.view_team', 'logbook.view_all',
            'letters.request', 'letters.manage', 'letters.view',
            'documents.create', 'documents.review', 'documents.approve', 'documents.view',
            'programs.manage', 'programs.view',
            'reports.create', 'reports.verify', 'reports.view',
            'budgets.manage', 'budgets.approve', 'budgets.view',
            'payrolls.manage', 'payrolls.view_own', 'payrolls.view_all',
            'dashboard.director',
            'audit.view',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => $guard]);
        }

        // Assign Permissions to Roles (sesuai PRD Section 4.2 Matriks Hak Akses)
        $roles['direktur']->syncPermissions([
            'users.view', 'employees.view',
            'attendance.view_all', 'logbook.view_all',
            'letters.view',
            'documents.create', 'documents.approve', 'documents.view',
            'programs.view', 'reports.view',
            'budgets.approve', 'budgets.view',
            'payrolls.view_all',
            'dashboard.director',
            'audit.view',
        ]);

        $roles['hr_manager']->syncPermissions([
            'users.manage', 'users.view',
            'employees.manage', 'employees.view',
            'attendance.view_all', 'logbook.view_all',
            'letters.manage', 'letters.request', 'letters.view',
            'documents.create', 'documents.review', 'documents.view',
            'reports.view',
        ]);

        $roles['staf_hr']->syncPermissions([
            'employees.manage', 'employees.view',
            'attendance.create', 'attendance.view_all',
            'logbook.create', 'logbook.view_own',
            'letters.request', 'letters.view',
            'documents.create', 'documents.view',
        ]);

        $roles['finance_manager']->syncPermissions([
            'employees.view',
            'attendance.create', 'attendance.view_all',
            'logbook.create', 'logbook.view_own',
            'letters.request', 'letters.view',
            'documents.create', 'documents.review', 'documents.view',
            'programs.view', 'reports.view',
            'budgets.manage', 'budgets.view',
            'payrolls.manage', 'payrolls.view_all',
        ]);

        $roles['program_manager']->syncPermissions([
            'attendance.create', 'attendance.view_team',
            'logbook.create', 'logbook.view_team', 'logbook.view_own',
            'letters.request', 'letters.view',
            'documents.create', 'documents.review', 'documents.view',
            'programs.manage', 'programs.view',
            'reports.verify', 'reports.view',
            'budgets.view',
        ]);

        $roles['program_officer']->syncPermissions([
            'attendance.create', 'attendance.view_own',
            'logbook.create', 'logbook.view_own',
            'letters.request', 'letters.view',
            'documents.create', 'documents.view',
            'programs.view',
            'reports.create', 'reports.verify', 'reports.view',
        ]);

        $roles['staf_lapangan']->syncPermissions([
            'attendance.create', 'attendance.view_own',
            'logbook.create', 'logbook.view_own',
            'documents.create', 'documents.view',
            'programs.view',
            'reports.create', 'reports.view',
            'payrolls.view_own',
        ]);

        // 3. Create 7 Realistic Users
        $defaultPassword = Hash::make('password123');

        $usersData = [
            [
                'name' => 'I Kadek Hermanta',
                'username' => 'kadek',
                'email' => 'kadek@ysbh.org',
                'phone' => '081234567890',
                'division' => 'Direksi',
                'position' => 'Direktur Eksekutif',
                'role' => 'direktur',
                'nik' => 'YSBH-0001',
            ],
            [
                'name' => 'Ayu Wulandari',
                'username' => 'ayu',
                'email' => 'ayu@ysbh.org',
                'phone' => '081234567891',
                'division' => 'HR',
                'position' => 'HR Manager',
                'role' => 'hr_manager',
                'nik' => 'YSBH-0002',
            ],
            [
                'name' => 'Budi Santoso',
                'username' => 'budi',
                'email' => 'budi@ysbh.org',
                'phone' => '081234567892',
                'division' => 'HR',
                'position' => 'Staf Administrasi & Personalia',
                'role' => 'staf_hr',
                'nik' => 'YSBH-0003',
            ],
            [
                'name' => 'Citra Lestari',
                'username' => 'citra',
                'email' => 'citra@ysbh.org',
                'phone' => '081234567893',
                'division' => 'Keuangan',
                'position' => 'Finance & Accounting Manager',
                'role' => 'finance_manager',
                'nik' => 'YSBH-0004',
            ],
            [
                'name' => 'Dodi Pratama',
                'username' => 'dodi',
                'email' => 'dodi@ysbh.org',
                'phone' => '081234567894',
                'division' => 'Program',
                'position' => 'Program Manager Malaria',
                'role' => 'program_manager',
                'nik' => 'YSBH-0005',
            ],
            [
                'name' => 'Eka Saputra',
                'username' => 'eka',
                'email' => 'eka@ysbh.org',
                'phone' => '081234567895',
                'division' => 'Program',
                'position' => 'Program Officer Lapangan',
                'role' => 'program_officer',
                'nik' => 'YSBH-0006',
            ],
            [
                'name' => 'Fajar Kogoya',
                'username' => 'fajar',
                'email' => 'fajar@ysbh.org',
                'phone' => '081234567896',
                'division' => 'Lapangan',
                'position' => 'Staf Lapangan Survei Merauke',
                'role' => 'staf_lapangan',
                'nik' => 'YSBH-0007',
            ],
        ];

        $createdUsers = [];

        foreach ($usersData as $data) {
            $user = User::create([
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'division' => $data['division'],
                'position' => $data['position'],
                'password' => $defaultPassword,
                'is_active' => true,
            ]);

            $user->assignRole($data['role']);
            $createdUsers[$data['role']] = $user;

            // Create Employee Profile
            $employee = Employee::create([
                'user_id' => $user->id,
                'nik' => $data['nik'],
                'full_name' => $data['name'],
                'birth_date' => '1990-05-15',
                'gender' => in_array($data['username'], ['ayu', 'citra']) ? 'P' : 'L',
                'phone' => $data['phone'],
                'address' => 'Jayapura / Merauke, Papua',
                'division' => $data['division'],
                'position' => $data['position'],
                'join_date' => '2025-01-01',
                'status' => 'tetap',
            ]);

            // Create Contract
            Contract::create([
                'employee_id' => $employee->id,
                'contract_number' => 'KTR/YSBH/' . $data['nik'] . '/2025',
                'contract_type' => 'PKWT',
                'start_date' => '2025-01-01',
                'end_date' => '2026-12-31',
                'status' => 'aktif',
                'notes' => 'Kontrak kerja operasional YSBH Papua',
            ]);
        }

        // 4. Letter Classifications
        $classifications = [
            ['code' => 'DIR', 'name' => 'Keputusan Direksi', 'template' => '{seq:3}/YSBH/DIR/{month_roman}/{year}'],
            ['code' => 'HR', 'name' => 'Sumber Daya Manusia', 'template' => '{seq:3}/YSBH/HR/{month_roman}/{year}'],
            ['code' => 'KEU', 'name' => 'Keuangan & Anggaran', 'template' => '{seq:3}/YSBH/KEU/{month_roman}/{year}'],
            ['code' => 'PRG', 'name' => 'Program Eliminasi Malaria', 'template' => '{seq:3}/YSBH/PRG/{month_roman}/{year}'],
            ['code' => 'UMUM', 'name' => 'Umum & Operasional', 'template' => '{seq:3}/YSBH/UMUM/{month_roman}/{year}'],
        ];

        foreach ($classifications as $c) {
            $class = LetterClassification::create([
                'code' => $c['code'],
                'name' => $c['name'],
                'format_template' => $c['template'],
                'is_active' => true,
            ]);

            LetterSequence::create([
                'classification_id' => $class->id,
                'year' => 2026,
                'last_number' => 0,
            ]);
        }

        // 5. Initial Program & Activities
        $program = Program::create([
            'name' => 'Program Eliminasi Malaria Papua 2026',
            'code' => 'PRG-ELIM-2026',
            'description' => 'Upaya pengendalian vektor, survei entomologi, dan distribusi logistik kelambu berinsektisida di wilayah Merauke dan Jayapura.',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'target_location' => 'Kabupaten Merauke & Jayapura',
            'status' => 'berjalan',
            'manager_id' => $createdUsers['program_manager']->id,
        ]);

        $activity = Activity::create([
            'program_id' => $program->id,
            'name' => 'Survei Entomologi & Vektor Anopheles Merauke',
            'code' => 'ACT-MRK-01',
            'location' => 'Distrik Merauke & Semangga',
            'start_date' => '2026-10-15',
            'end_date' => '2026-11-15',
            'budget_allocated' => 45000000,
            'status' => 'berjalan',
            'lead_officer_id' => $createdUsers['program_officer']->id,
        ]);

        ActivityAssignment::create([
            'activity_id' => $activity->id,
            'user_id' => $createdUsers['staf_lapangan']->id,
            'role_in_activity' => 'Enumerator & Kolektor Sampel Jentik',
            'notes' => 'Fokus area distrik Semangga dan pinggiran rawa.',
        ]);

        // 6. Initial Today Attendance & Logbook for Field Staff
        $today = now()->toDateString();

        Attendance::create([
            'user_id' => $createdUsers['staf_lapangan']->id,
            'date' => $today,
            'clock_in' => '07:55:00',
            'status' => 'hadir',
            'location_note' => 'Distrik Merauke - Posko Lapangan',
            'notes' => 'Hadir tepat waktu sebelum briefing pagi.',
        ]);

        Attendance::create([
            'user_id' => $createdUsers['hr_manager']->id,
            'date' => $today,
            'clock_in' => '08:05:00',
            'status' => 'hadir',
            'location_note' => 'Kantor Utama YSBH',
        ]);

        Attendance::create([
            'user_id' => $createdUsers['finance_manager']->id,
            'date' => $today,
            'clock_in' => '08:12:00',
            'status' => 'hadir',
            'location_note' => 'Kantor Utama YSBH',
        ]);

        Logbook::create([
            'user_id' => $createdUsers['staf_lapangan']->id,
            'date' => $today,
            'activity_summary' => 'Melakukan pemetaan 12 titik genangan air rawa dan pengambilan sampel larva di Distrik Semangga. Membagikan 25 kelambu berinsektisida kepada warga kampung.',
            'challenges' => 'Akses jalan tanah berlumpur setelah hujan deras, memerlukan waktu tempuh tambahan.',
            'next_day_plan' => 'Melanjutkan pencatatan identifikasi spesies nyamuk di pos laboratorium lapangan.',
            'status' => 'submitted',
        ]);
    }
}
