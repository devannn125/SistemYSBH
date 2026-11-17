<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\ActivityAssignment;
use App\Models\ActivityReport;
use App\Models\Attendance;
use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\Contract;
use App\Models\Document;
use App\Models\DocumentApproval;
use App\Models\DocumentVersion;
use App\Models\Employee;
use App\Models\ExpenseReport;
use App\Models\LetterClassification;
use App\Models\LetterNumber;
use App\Models\LetterSequence;
use App\Models\Logbook;
use App\Models\Payroll;
use App\Models\Program;
use App\Models\User;
use App\Models\WorkSchedule;
use Carbon\Carbon;
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

        // 1. Create Roles (termasuk superadmin)
        $roleNames = [
            'superadmin',
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
            'system.manage',
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
            'dashboard.superadmin',
            'audit.view',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => $guard]);
        }

        // Assign Permissions to Roles
        // Superadmin memiliki semua permissions
        $roles['superadmin']->syncPermissions(Permission::all());

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
            'payrolls.view_own',
        ]);

        $roles['staf_hr']->syncPermissions([
            'employees.manage', 'employees.view',
            'attendance.create', 'attendance.view_all',
            'logbook.create', 'logbook.view_own',
            'letters.request', 'letters.view',
            'documents.create', 'documents.view',
            'payrolls.view_own',
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
            'payrolls.view_own',
        ]);

        $roles['program_officer']->syncPermissions([
            'attendance.create', 'attendance.view_own',
            'logbook.create', 'logbook.view_own',
            'letters.request', 'letters.view',
            'documents.create', 'documents.view',
            'programs.view',
            'reports.create', 'reports.verify', 'reports.view',
            'payrolls.view_own',
        ]);

        $roles['staf_lapangan']->syncPermissions([
            'attendance.create', 'attendance.view_own',
            'logbook.create', 'logbook.view_own',
            'documents.create', 'documents.view',
            'programs.view',
            'reports.create', 'reports.view',
            'payrolls.view_own',
        ]);

        // 3. Create 8 Realistic Users (Termasuk Superadmin)
        $defaultPassword = Hash::make('password123');

        $usersData = [
            [
                'name' => 'Super Administrator',
                'username' => 'superadmin',
                'email' => 'admin@sinarbhaktihusada.org',
                'phone' => '081100000000',
                'division' => 'Direksi',
                'position' => 'Super Administrator & IT Lead',
                'role' => 'superadmin',
                'nik' => 'YSBH-0000',
                'gender' => 'L',
                'join_date' => '2024-01-01',
                'contract_end' => '2027-12-31',
            ],
            [
                'name' => 'I Kadek Hermanta',
                'username' => 'kadek',
                'email' => 'kadek@ysbh.org',
                'phone' => '081234567890',
                'division' => 'Direksi',
                'position' => 'Direktur Eksekutif',
                'role' => 'direktur',
                'nik' => 'YSBH-0001',
                'gender' => 'L',
                'join_date' => '2024-01-01',
                'contract_end' => '2027-12-31',
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
                'gender' => 'P',
                'join_date' => '2025-01-01',
                'contract_end' => Carbon::now()->addDays(25)->toDateString(), // Mendekati habis (alert)
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
                'gender' => 'L',
                'join_date' => '2025-03-01',
                'contract_end' => '2026-12-31',
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
                'gender' => 'P',
                'join_date' => '2025-01-01',
                'contract_end' => '2026-12-31',
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
                'gender' => 'L',
                'join_date' => '2025-01-01',
                'contract_end' => Carbon::now()->addDays(45)->toDateString(), // Mendekati habis (alert)
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
                'gender' => 'L',
                'join_date' => '2025-06-01',
                'contract_end' => '2026-12-31',
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
                'gender' => 'L',
                'join_date' => '2025-07-01',
                'contract_end' => '2026-12-31',
            ],
        ];

        $createdUsers = [];
        $createdEmployees = [];

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
                'birth_date' => '1992-06-20',
                'gender' => $data['gender'],
                'phone' => $data['phone'],
                'address' => 'Jayapura & Merauke, Papua',
                'division' => $data['division'],
                'position' => $data['position'],
                'join_date' => $data['join_date'],
                'status' => 'tetap',
            ]);

            $createdEmployees[$data['role']] = $employee;

            // Create Contract
            Contract::create([
                'employee_id' => $employee->id,
                'contract_number' => 'KTR/YSBH/' . $data['nik'] . '/' . date('Y'),
                'contract_type' => 'PKWT',
                'start_date' => $data['join_date'],
                'end_date' => $data['contract_end'],
                'status' => 'aktif',
                'notes' => 'Kontrak kerja operasional YSBH Papua',
            ]);

            // Create Sample Payroll
            Payroll::create([
                'employee_id' => $employee->id,
                'period_month' => (int) date('n'),
                'period_year' => (int) date('Y'),
                'basic_salary' => $data['role'] === 'direktur' ? 15000000 : ($data['role'] === 'staf_lapangan' ? 5500000 : 8500000),
                'allowances' => 1200000,
                'deductions' => 200000,
                'net_salary' => ($data['role'] === 'direktur' ? 15000000 : ($data['role'] === 'staf_lapangan' ? 5500000 : 8500000)) + 1000000,
                'status' => 'paid',
                'paid_at' => Carbon::now()->subDays(5),
                'notes' => 'Gaji periode berjalan yayasan',
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

        $createdClasses = [];
        foreach ($classifications as $c) {
            $class = LetterClassification::create([
                'code' => $c['code'],
                'name' => $c['name'],
                'format_template' => $c['template'],
                'is_active' => true,
            ]);

            LetterSequence::create([
                'classification_id' => $class->id,
                'year' => (int) date('Y'),
                'last_number' => 0,
            ]);

            $createdClasses[$c['code']] = $class;
        }

        // 4b. Representative Letter Numbers for Analytics & Verification (Skip during automated unit tests to preserve sequential assertions)
        if (!app()->runningUnitTests()) {
            $romanMonth = \App\Services\LetterNumberService::romanMonth((int) date('n'));
            $currentYear = (int) date('Y');

            $sampleLetters = [
                ['code' => 'DIR', 'seq' => 1, 'status' => 'issued', 'subject' => 'SK Penetapan Struktur Organisasi Yayasan Sinar Bhakti Husada 2026', 'user' => 'direktur'],
                ['code' => 'DIR', 'seq' => 2, 'status' => 'reserved', 'subject' => 'Surat Edaran Direksi Kebijakan Operasional Akhir Tahun', 'user' => 'direktur'],
                ['code' => 'HR', 'seq' => 1, 'status' => 'issued', 'subject' => 'Surat Tugas Tim Eliminasi Malaria Merauke', 'user' => 'hr_manager'],
                ['code' => 'HR', 'seq' => 2, 'status' => 'reserved', 'subject' => 'Surat Pengantar BPJS Ketenagakerjaan Karyawan Lapangan', 'user' => 'staf_hr'],
                ['code' => 'KEU', 'seq' => 1, 'status' => 'issued', 'subject' => 'Surat Permohonan Pencairan Dana Hibah Eliminasi Malaria', 'user' => 'finance_manager'],
                ['code' => 'PRG', 'seq' => 1, 'status' => 'issued', 'subject' => 'Surat Pemberitahuan Pelaksanaan Survei Larva ke Puskesmas Semangga', 'user' => 'program_officer'],
                ['code' => 'PRG', 'seq' => 2, 'status' => 'issued', 'subject' => 'Berita Acara Serah Terima 50 Pcs Kelambu Insektisida', 'user' => 'program_manager'],
                ['code' => 'UMUM', 'seq' => 1, 'status' => 'issued', 'subject' => 'Surat Peminjaman Kendaraan Operasional Lapangan 4x4', 'user' => 'staf_lapangan'],
            ];

            foreach ($sampleLetters as $item) {
                $class = $createdClasses[$item['code']];
                $fullNum = sprintf('%03d/YSBH/%s/%s/%d', $item['seq'], $item['code'], $romanMonth, $currentYear);
                LetterNumber::create([
                    'classification_id' => $class->id,
                    'year' => $currentYear,
                    'sequence' => $item['seq'],
                    'full_number' => $fullNum,
                    'subject' => $item['subject'],
                    'requested_by' => $createdUsers[$item['user']]->id,
                    'status' => $item['status'],
                    'reserved_at' => now()->subDays(2),
                    'issued_at' => $item['status'] === 'issued' ? now()->subDay() : null,
                ]);
                LetterSequence::where('classification_id', $class->id)->where('year', $currentYear)->update(['last_number' => $item['seq']]);
            }
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
            'end_date' => '2026-11-30',
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

        // Activity Report
        $report = ActivityReport::create([
            'activity_id' => $activity->id,
            'submitted_by' => $createdUsers['staf_lapangan']->id,
            'report_date' => now()->toDateString(),
            'title' => 'Laporan Lapangan: Distribusi 50 Kelambu & Pengecekan 12 Titik Rawa',
            'description' => 'Telah dilakukan penyuluhan kepada 35 kepala keluarga dan pemantauan jentik Anopheles di 12 titik genangan air Kampung Semangga.',
            'findings' => 'Ditemukan 3 titik positif larva Anopheles farauti di sekitar rawa pasang surut.',
            'challenges' => 'Akses jalan tanah tergenang setelah hujan deras.',
            'recommendations' => 'Diperlukan larvasidasi berkala setiap 2 minggu dan penambahan stok abate.',
            'status' => 'submitted',
        ]);

        // 6. Initial Budgets (RAB) & Expense Reports (LPJ)
        $budget = Budget::create([
            'activity_id' => $activity->id,
            'title' => 'RAB Survei Lapangan & Logistik Kelambu Merauke',
            'total_amount' => 45000000,
            'status' => 'approved',
            'created_by' => $createdUsers['finance_manager']->id,
        ]);

        BudgetItem::create([
            'budget_id' => $budget->id,
            'category' => 'logistik',
            'description' => 'Pengadaan kelambu berinsektisida tahan lama (LLIN)',
            'quantity' => 100,
            'unit' => 'buah',
            'unit_price' => 200000,
            'total_price' => 20000000,
            'notes' => 'Standar sertifikasi WHO',
        ]);

        BudgetItem::create([
            'budget_id' => $budget->id,
            'category' => 'transport',
            'description' => 'Sewa perahu & kendaraan operasional pedalaman',
            'quantity' => 10,
            'unit' => 'hari',
            'unit_price' => 1500000,
            'total_price' => 15000000,
            'notes' => 'Akses Distrik Semangga dan pinggiran rawa',
        ]);

        BudgetItem::create([
            'budget_id' => $budget->id,
            'category' => 'honor',
            'description' => 'Uang saku & konsumsi kader lapangan (4 orang)',
            'quantity' => 20,
            'unit' => 'OH',
            'unit_price' => 500000,
            'total_price' => 10000000,
        ]);

        ExpenseReport::create([
            'activity_id' => $activity->id,
            'budget_id' => $budget->id,
            'title' => 'LPJ Termin 1: Pembelian Logistik & Sewa Transport',
            'total_realized' => 33500000,
            'variance' => 11500000,
            'status' => 'submitted',
            'notes' => 'Realisasi tahap pertama untuk kegiatan Merauke',
            'submitted_by' => $createdUsers['finance_manager']->id,
        ]);

        // 7. Initial Documents with Versions & Approvals
        $year = (int) date('Y');
        $doc = Document::create([
            'document_number' => '001/YSBH/HR/XI/' . $year,
            'title' => 'Surat Keputusan Penugasan Tim Eliminasi Malaria Merauke',
            'category' => 'surat_keluar',
            'division' => 'HR',
            'status' => 'pending_director',
            'current_version' => 1,
            'created_by' => $createdUsers['hr_manager']->id,
            'current_reviewer_id' => $createdUsers['direktur']->id,
            'notes' => 'Mohon persetujuan Direktur untuk surat penugasan resmi.',
        ]);

        $version = DocumentVersion::create([
            'document_id' => $doc->id,
            'version_number' => 1,
            'file_path' => 'documents/sample_sk_penugasan.pdf',
            'file_name' => 'SK_Penugasan_Merauke.pdf',
            'file_size' => 1048576,
            'mime_type' => 'application/pdf',
            'changelog_notes' => 'Draf awal penugasan tim lapangan',
            'uploaded_by' => $createdUsers['hr_manager']->id,
        ]);

        DocumentApproval::create([
            'document_id' => $doc->id,
            'version_id' => $version->id,
            'action_by' => $createdUsers['hr_manager']->id,
            'action_role' => 'hr_manager',
            'from_status' => 'submitted',
            'to_status' => 'pending_director',
            'comments' => 'Dokumen siap dan telah direview oleh HR',
        ]);

        if (!app()->runningUnitTests()) {
            // Approved document
            $docApproved = Document::create([
                'document_number' => '001/YSBH/DIR/XI/' . $year,
                'title' => 'SK Penetapan Struktur Organisasi Yayasan Sinar Bhakti Husada 2026',
                'category' => 'sk_direksi',
                'division' => 'Direksi',
                'status' => 'approved',
                'current_version' => 1,
                'created_by' => $createdUsers['direktur']->id,
                'notes' => 'Telah disahkan dan ditandatangani Direktur.',
            ]);
            DocumentVersion::create([
                'document_id' => $docApproved->id,
                'version_number' => 1,
                'file_path' => 'documents/sk_struktur_organisasi.pdf',
                'file_name' => 'SK_Struktur_Organisasi_2026.pdf',
                'file_size' => 2048576,
                'mime_type' => 'application/pdf',
                'uploaded_by' => $createdUsers['direktur']->id,
            ]);

            // In Review document
            $docInReview = Document::create([
                'document_number' => '001/YSBH/PRG/XI/' . $year,
                'title' => 'Rencana Kerja & Kerangka Acuan Kegiatan (KAK) Surveilans 2026',
                'category' => 'laporan_kegiatan',
                'division' => 'Program',
                'status' => 'in_review',
                'current_version' => 1,
                'created_by' => $createdUsers['program_officer']->id,
                'current_reviewer_id' => $createdUsers['program_manager']->id,
                'notes' => 'Sedang direview oleh Program Manager sebelum diteruskan ke Direktur.',
            ]);
            DocumentVersion::create([
                'document_id' => $docInReview->id,
                'version_number' => 1,
                'file_path' => 'documents/kak_surveilans.pdf',
                'file_name' => 'KAK_Surveilans_2026.pdf',
                'file_size' => 1548576,
                'mime_type' => 'application/pdf',
                'uploaded_by' => $createdUsers['program_officer']->id,
            ]);

            // Draft document
            Document::create([
                'title' => 'Draf SOP Pengelolaan Sampel Darah Mikroskopis Lapangan',
                'category' => 'sop',
                'division' => 'Program',
                'status' => 'draft',
                'current_version' => 1,
                'created_by' => $createdUsers['staf_lapangan']->id,
                'notes' => 'Draf internal penyusunan SOP penanganan sampel darah di posko lapangan.',
            ]);
        }

        // 8. Work Schedule (Kebijakan Jam Kerja Direktur)
        $schedule = WorkSchedule::create([
            'work_start_time' => '08:00',
            'work_end_time' => '17:00',
            'late_tolerance_minutes' => 15,
            'is_active' => true,
            'notes' => 'Jadwal Kerja Reguler Yayasan Sinar Bhakti Husada Papua',
            'updated_by' => $createdUsers['direktur']->id,
        ]);

        // 9. Initial 7-Day Attendance History for Charts & Compliance
        $today = now()->toDateString();
        $rolesToAttend = ['superadmin', 'direktur', 'hr_manager', 'staf_hr', 'finance_manager', 'program_manager', 'program_officer', 'staf_lapangan'];
        
        for ($dayOffset = 6; $dayOffset >= 0; $dayOffset--) {
            $pastDate = now()->subDays($dayOffset)->toDateString();
            // Variasikan kehadiran (mis. 5 sampai 7 orang per hari)
            $sliceCount = $dayOffset === 0 ? 6 : (($dayOffset % 2 === 0) ? 7 : 6);
            $attendeesForDay = array_slice($rolesToAttend, 0, $sliceCount);

            foreach ($attendeesForDay as $roleKey) {
                if (isset($createdUsers[$roleKey])) {
                    // Beri variasi keterlambatan untuk staf_hr dan staf_lapangan pada hari tertentu
                    $isLate = ($roleKey === 'staf_hr' && $dayOffset === 1) || ($roleKey === 'staf_lapangan' && $dayOffset === 2);
                    $clockInTime = $isLate 
                        ? '08:' . str_pad((string) rand(25, 45), 2, '0', STR_PAD_LEFT) . ':00'
                        : '07:' . str_pad((string) rand(40, 58), 2, '0', STR_PAD_LEFT) . ':00';
                    $status = $isLate ? 'terlambat' : 'hadir';
                    $lateNote = $isLate ? 'Terlambat karena kendala akses jalan tanah becek di Merauke.' : 'Hadir tepat waktu sebelum briefing pagi.';

                    Attendance::firstOrCreate([
                        'user_id' => $createdUsers[$roleKey]->id,
                        'date' => $pastDate,
                    ], [
                        'clock_in' => $clockInTime,
                        'clock_out' => $dayOffset === 0 ? null : '17:' . str_pad((string) rand(0, 30), 2, '0', STR_PAD_LEFT) . ':00',
                        'status' => $status,
                        'location_note' => $roleKey === 'staf_lapangan' ? 'Pos Lapangan Distrik Semangga' : 'Kantor Utama YSBH',
                        'notes' => $lateNote,
                    ]);
                }
            }
        }

        Logbook::create([
            'user_id' => $createdUsers['staf_lapangan']->id,
            'date' => $today,
            'activity_summary' => 'Melakukan pemetaan 12 titik genangan air rawa dan pengambilan sampel larva di Distrik Semangga. Membagikan 25 kelambu berinsektisida kepada warga kampung.',
            'challenges' => 'Akses jalan tanah berlumpur setelah hujan deras, memerlukan waktu tempuh tambahan.',
            'next_day_plan' => 'Melanjutkan pencatatan identifikasi spesies nyamuk di pos laboratorium lapangan.',
            'status' => 'submitted',
        ]);

        Logbook::create([
            'user_id' => $createdUsers['program_officer']->id,
            'date' => $today,
            'activity_summary' => 'Koordinasi dengan Puskesmas Semangga mengenai rekapitulasi data penderita malaria dan sinkronisasi jadwal penyuluhan.',
            'challenges' => 'Koneksi seluler di puskesmas pembantu sempat tidak stabil.',
            'next_day_plan' => 'Menyiapkan berkas verifikasi laporan kader.',
            'status' => 'approved',
            'reviewed_by' => $createdUsers['direktur']->id,
            'feedback' => 'Koordinasi berjalan sangat baik. Segera laporkan data hasil survei ke Dinas Kesehatan.',
            'reviewed_at' => now(),
        ]);
    }
}
