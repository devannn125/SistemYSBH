<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_report_id',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'caption',
        'is_evidence_for_finance',
    ];

    protected $casts = [
        'is_evidence_for_finance' => 'boolean',
    ];

    public function report()
    {
        return $this->belongsTo(ActivityReport::class, 'activity_report_id');
    }
}

