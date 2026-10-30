<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterClassification extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'format_template',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function sequences()
    {
        return $this->hasMany(LetterSequence::class, 'classification_id');
    }

    public function letterNumbers()
    {
        return $this->hasMany(LetterNumber::class, 'classification_id');
    }
}

