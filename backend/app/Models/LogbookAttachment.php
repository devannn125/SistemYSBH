<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogbookAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'logbook_id',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
    ];

    public function logbook()
    {
        return $this->belongsTo(Logbook::class);
    }
}

