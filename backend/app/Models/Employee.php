<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'nik',
        'full_name',
        'birth_date',
        'gender',
        'phone',
        'address',
        'division',
        'position',
        'join_date',
        'status',
        'emergency_contact',
        'documents_info',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'join_date' => 'date',
        'documents_info' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function activeContract()
    {
        return $this->hasOne(Contract::class)->where('status', 'aktif')->latestOfMany();
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }
}

