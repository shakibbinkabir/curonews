<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interaction extends Model
{
    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'post_id',
        'type',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    /**
     * The user who made this interaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The post this interaction is on.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Scope to get only likes.
     */
    public function scopeLikes($query)
    {
        return $query->where('type', 'like');
    }

    /**
     * Scope to get only saves.
     */
    public function scopeSaves($query)
    {
        return $query->where('type', 'save');
    }

    /**
     * Toggle an interaction (like or save).
     */
    public static function toggle(int $userId, int $postId, string $type): bool
    {
        $interaction = static::where('user_id', $userId)
            ->where('post_id', $postId)
            ->where('type', $type)
            ->first();

        if ($interaction) {
            $interaction->delete();
            return false; // Removed
        }

        static::create([
            'user_id' => $userId,
            'post_id' => $postId,
            'type' => $type,
        ]);

        return true; // Added
    }
}
