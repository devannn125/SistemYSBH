<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpenseReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_id',
        'budget_id',
        'document_id',
        'title',
        'total_realized',
        'variance',
        'status',
        'notes',
        'submitted_by',
    ];

    protected $casts = [
        'total_realized' => 'decimal:2',
        'variance' => 'decimal:2',
    ];

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}

