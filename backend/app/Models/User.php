<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'telegram_chat_id',
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
            'password' => 'hashed',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = Str::uuid()->toString();
            }
        });
    }

    /**
     * Get the route key name for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /**
     * Posts created by this user (as sourcer).
     */
    public function sourcedPosts(): HasMany
    {
        return $this->hasMany(Post::class, 'sourcer_id');
    }

    /**
     * Alias for sourcedPosts (used by Filament).
     */
    public function posts(): HasMany
    {
        return $this->sourcedPosts();
    }

    /**
     * Posts approved/rejected by this user (as admin).
     */
    public function reviewedPosts(): HasMany
    {
        return $this->hasMany(Post::class, 'admin_id');
    }

    /**
     * User's interactions (likes, saves).
     */
    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is sourcer or higher.
     */
    public function isSourcer(): bool
    {
        return in_array($this->role, ['sourcer', 'admin']);
    }

    /**
     * Check if user can access Filament admin panel.
     */
    public function canAccessPanel(\Filament\Panel $panel): bool
    {
        return in_array($this->role, ['sourcer', 'admin']);
    }
}
