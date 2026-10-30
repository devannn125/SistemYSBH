<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterNumber extends Model
{
    use HasFactory;

    protected $fillable = [
        'classification_id',
        'year',
        'sequence',
        'full_number',
        'subject',
        'requested_by',
        'document_id',
        'status',
        'reserved_at',
        'issued_at',
        'voided_at',
        'void_reason',
    ];

    protected $casts = [
        'reserved_at' => 'datetime',
        'issued_at' => 'datetime',
        'voided_at' => 'datetime',
    ];

    public function classification()
    {
        return $this->belongsTo(LetterClassification::class, 'classification_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function document()
    {
        return $this->belongsTo(Document::class, 'document_id');
    }
}

