<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterSequence extends Model
{
    use HasFactory;

    protected $fillable = [
        'classification_id',
        'year',
        'last_number',
    ];

    public function classification()
    {
        return $this->belongsTo(LetterClassification::class, 'classification_id');
    }
}

