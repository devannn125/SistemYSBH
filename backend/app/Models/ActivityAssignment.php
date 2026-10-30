<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_id',
        'user_id',
        'role_in_activity',
        'notes',
    ];

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

