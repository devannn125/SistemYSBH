<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'name',
        'code',
        'location',
        'start_date',
        'end_date',
        'budget_allocated',
        'status',
        'lead_officer_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget_allocated' => 'decimal:2',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function leadOfficer()
    {
        return $this->belongsTo(User::class, 'lead_officer_id');
    }

    public function assignments()
    {
        return $this->hasMany(ActivityAssignment::class);
    }

    public function reports()
    {
        return $this->hasMany(ActivityReport::class);
    }

    public function budget()
    {
        return $this->hasOne(Budget::class);
    }

    public function expenseReport()
    {
        return $this->hasOne(ExpenseReport::class);
    }
}

