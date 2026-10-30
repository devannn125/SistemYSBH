<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Employees & Contracts (HR)
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nik')->unique(); // e.g. YSBH-0024
            $table->string('full_name');
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['L', 'P'])->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('division'); // Direksi, HR, Keuangan, Program, Lapangan
            $table->string('position'); // Jabatan fungsional
            $table->date('join_date');
            $table->string('status')->default('kontrak'); // tetap, kontrak, magang, berhenti
            $table->string('emergency_contact')->nullable();
            $table->json('documents_info')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('contract_number')->unique();
            $table->string('contract_type')->default('PKWT'); // PKWT, PKWTT, Konsultan
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('file_url')->nullable();
            $table->string('status')->default('aktif'); // aktif, akan_berakhir, selesai, dibatalkan
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Letter Numbering (FR-NOM)
        Schema::create('letter_classifications', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // HR, KEU, PRG, DIR, UMUM
            $table->string('name');
            $table->string('format_template')->default('{seq:3}/YSBH/{code}/{month_roman}/{year}');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('letter_sequences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classification_id')->constrained('letter_classifications')->cascadeOnDelete();
            $table->integer('year');
            $table->integer('last_number')->default(0);
            $table->timestamps();
            $table->unique(['classification_id', 'year']);
        });

        Schema::create('letter_numbers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classification_id')->constrained('letter_classifications')->cascadeOnDelete();
            $table->integer('year');
            $table->integer('sequence');
            $table->string('full_number')->unique();
            $table->string('subject');
            $table->foreignId('requested_by')->constrained('users');
            $table->unsignedBigInteger('document_id')->nullable();
            $table->string('status')->default('reserved'); // reserved, issued, void
            $table->timestamp('reserved_at')->useCurrent();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->timestamps();
            $table->unique(['classification_id', 'year', 'sequence']);
        });

        // 3. Documents & Approvals (FR-DOC)
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('document_number')->nullable();
            $table->string('title');
            $table->string('category')->default('surat_keluar'); // surat_keluar, rab, pertanggungjawaban, laporan_kegiatan, kebijakan, lainnya
            $table->string('division'); // HR, Keuangan, Program, Direksi
            $table->string('status')->default('draft'); // draft, submitted, in_review, pending_director, approved, rejected, revision_needed, archived
            $table->integer('current_version')->default(1);
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('current_reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('letter_number_id')->nullable()->constrained('letter_numbers')->nullOnDelete();
            $table->unsignedBigInteger('related_activity_id')->nullable();
            $table->unsignedBigInteger('related_budget_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('document_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->integer('version_number');
            $table->string('file_path');
            $table->string('file_name');
            $table->integer('file_size');
            $table->string('mime_type');
            $table->text('changelog_notes')->nullable();
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();
            $table->unique(['document_id', 'version_number']);
        });

        Schema::create('document_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->foreignId('version_id')->nullable()->constrained('document_versions')->nullOnDelete();
            $table->foreignId('action_by')->constrained('users');
            $table->string('action_role');
            $table->string('from_status');
            $table->string('to_status');
            $table->text('comments')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // 4. Programs & Field Reports (FR-PRG)
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('target_location')->default('Papua');
            $table->string('status')->default('berjalan'); // direncanakan, berjalan, selesai, ditunda
            $table->foreignId('manager_id')->constrained('users');
            $table->timestamps();
        });

        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('location');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('budget_allocated', 15, 2)->default(0);
            $table->string('status')->default('belum_mulai'); // belum_mulai, berjalan, selesai, dibatalkan
            $table->foreignId('lead_officer_id')->constrained('users');
            $table->timestamps();
        });

        Schema::create('activity_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role_in_activity')->default('pelaksana');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('activity_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();
            $table->foreignId('submitted_by')->constrained('users');
            $table->date('report_date');
            $table->string('title');
            $table->text('description');
            $table->text('findings')->nullable();
            $table->text('challenges')->nullable();
            $table->text('recommendations')->nullable();
            $table->string('status')->default('submitted'); // draft, submitted, verified, revision_needed
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('verification_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('report_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_report_id')->constrained('activity_reports')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_name');
            $table->integer('file_size');
            $table->string('mime_type');
            $table->string('caption')->nullable();
            $table->boolean('is_evidence_for_finance')->default(true);
            $table->timestamps();
        });

        // 5. Finance (FR-FIN)
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();
            $table->foreignId('document_id')->nullable()->constrained('documents')->nullOnDelete();
            $table->string('title');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->string('status')->default('draft'); // draft, submitted, approved, rejected
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('budget_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained('budgets')->cascadeOnDelete();
            $table->string('category'); // transport, konsumsi, honor, logistik, operasional
            $table->string('description');
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit')->default('paket');
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('total_price', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('expense_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();
            $table->foreignId('budget_id')->nullable()->constrained('budgets')->nullOnDelete();
            $table->foreignId('document_id')->nullable()->constrained('documents')->nullOnDelete();
            $table->string('title');
            $table->decimal('total_realized', 15, 2)->default(0);
            $table->decimal('variance', 15, 2)->default(0);
            $table->string('status')->default('draft'); // draft, submitted, approved
            $table->text('notes')->nullable();
            $table->foreignId('submitted_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->integer('period_month');
            $table->integer('period_year');
            $table->decimal('basic_salary', 15, 2);
            $table->decimal('allowances', 15, 2)->default(0);
            $table->decimal('deductions', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2);
            $table->string('status')->default('draft'); // draft, approved, paid
            $table->timestamp('paid_at')->nullable();
            $table->string('slip_file_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['employee_id', 'period_month', 'period_year']);
        });

        // 6. Attendance & Logbook (FR-ABS, FR-LOG)
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('date');
            $table->time('clock_in')->nullable();
            $table->time('clock_out')->nullable();
            $table->string('status')->default('hadir'); // hadir, izin, sakit, tugas_lapangan
            $table->string('location_note')->nullable(); // Lokasi (mis. Merauke, Jayapura, Kantor)
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'date']);
        });

        Schema::create('logbooks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('date');
            $table->text('activity_summary');
            $table->text('challenges')->nullable();
            $table->text('next_day_plan')->nullable();
            $table->string('status')->default('submitted'); // draft, submitted
            $table->timestamps();
            $table->unique(['user_id', 'date']);
        });

        Schema::create('logbook_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('logbook_id')->constrained('logbooks')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_name');
            $table->integer('file_size');
            $table->string('mime_type');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logbook_attachments');
        Schema::dropIfExists('logbooks');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('payrolls');
        Schema::dropIfExists('expense_reports');
        Schema::dropIfExists('budget_items');
        Schema::dropIfExists('budgets');
        Schema::dropIfExists('report_attachments');
        Schema::dropIfExists('activity_reports');
        Schema::dropIfExists('activity_assignments');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('programs');
        Schema::dropIfExists('document_approvals');
        Schema::dropIfExists('document_versions');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('letter_numbers');
        Schema::dropIfExists('letter_sequences');
        Schema::dropIfExists('letter_classifications');
        Schema::dropIfExists('contracts');
        Schema::dropIfExists('employees');
    }
};

