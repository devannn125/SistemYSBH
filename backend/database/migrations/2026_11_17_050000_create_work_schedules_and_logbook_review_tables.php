<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel Kebijakan Jam Kerja Yayasan (FR-ABS)
        Schema::create('work_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('work_start_time')->default('08:00'); // Format HH:mm
            $table->string('work_end_time')->default('17:00');   // Format HH:mm
            $table->integer('late_tolerance_minutes')->default(15); // Toleransi keterlambatan dalam menit
            $table->boolean('is_active')->default(true);
            $table->string('notes')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 2. Tambahkan kolom review pada tabel logbooks (FR-LOG)
        Schema::table('logbooks', function (Blueprint $table) {
            $table->foreignId('reviewed_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->text('feedback')->nullable()->after('reviewed_by');
            $table->timestamp('reviewed_at')->nullable()->after('feedback');
        });
    }

    public function down(): void
    {
        Schema::table('logbooks', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn(['reviewed_by', 'feedback', 'reviewed_at']);
        });

        Schema::dropIfExists('work_schedules');
    }
};
