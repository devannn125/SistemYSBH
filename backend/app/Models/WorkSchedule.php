<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_start_time',
        'work_end_time',
        'late_tolerance_minutes',
        'is_active',
        'notes',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'late_tolerance_minutes' => 'integer',
    ];

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Dapatkan kebijakan jam kerja aktif yayasan
     */
    public static function getActiveSchedule()
    {
        return self::where('is_active', true)->first() ?: self::create([
            'work_start_time' => '08:00',
            'work_end_time' => '17:00',
            'late_tolerance_minutes' => 15,
            'is_active' => true,
            'notes' => 'Jadwal Jam Kerja Standar Yayasan Sinar Bhakti Husada Papua',
        ]);
    }
}
