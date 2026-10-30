<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected string $guard_name = 'sanctum';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'phone',
        'division',
        'position',
        'is_active',
        'avatar_url',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /**
     * Pemeriksaan peran yang andal via relasi koleksi dan fallback divisi.
     */
    public function hasRoleName(string $role): bool
    {
        if ($role === 'direktur' && $this->division === 'Direksi') {
            return true;
        }

        return $this->roles->contains('name', $role);
    }

    /**
     * Relationship to employee profile.
     */
    public function employee()
    {
        return $this->hasOne(Employee::class);
    }

    /**
     * Relationship to documents created.
     */
    public function documents()
    {
        return $this->hasMany(Document::class, 'created_by');
    }

    /**
     * Relationship to audit logs.
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
