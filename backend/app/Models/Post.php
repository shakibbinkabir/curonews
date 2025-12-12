<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Post extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'uuid',
        'sourcer_id',
        'admin_id',
        'category_id',
        'title',
        'slug',
        'content',
        'excerpt',
        'image_original',
        'image_processed',
        'status',
        'rejection_reason',
        'source_name',
        'source_url',
        'meta_title',
        'meta_description',
        'view_count',
        'telegram_message_id',
        'published_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'view_count' => 'integer',
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
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->title);
            }
        });

        // Auto-generate excerpt from content if not provided
        static::saving(function ($model) {
            if (empty($model->excerpt) && !empty($model->content)) {
                $model->excerpt = Str::limit(strip_tags($model->content), 200);
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
     * The sourcer who created this post.
     */
    public function sourcer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sourcer_id');
    }

    /**
     * The admin who approved/rejected this post.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * The category this post belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Tags attached to this post.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    /**
     * Interactions on this post.
     */
    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
    }

    /**
     * Get likes count.
     */
    public function getLikesCountAttribute(): int
    {
        return $this->interactions()->where('type', 'like')->count();
    }

    /**
     * Get saves count.
     */
    public function getSavesCountAttribute(): int
    {
        return $this->interactions()->where('type', 'save')->count();
    }

    /**
     * Check if a user has liked this post.
     */
    public function isLikedBy(?User $user): bool
    {
        if (!$user) return false;
        return $this->interactions()->where('user_id', $user->id)->where('type', 'like')->exists();
    }

    /**
     * Check if a user has saved this post.
     */
    public function isSavedBy(?User $user): bool
    {
        if (!$user) return false;
        return $this->interactions()->where('user_id', $user->id)->where('type', 'save')->exists();
    }

    /**
     * Scope to get only published posts.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope to get pending posts.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get draft posts.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope to order by published date.
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('published_at', 'desc');
    }

    /**
     * Get the original image URL.
     */
    public function getImageOriginalUrlAttribute(): ?string
    {
        if (!$this->image_original) return null;
        
        // Check if it's already a full URL
        if (Str::startsWith($this->image_original, ['http://', 'https://'])) {
            return $this->image_original;
        }
        
        return asset('storage/' . $this->image_original);
    }

    /**
     * Get the processed image URL.
     */
    public function getImageProcessedUrlAttribute(): ?string
    {
        if (!$this->image_processed) return $this->image_original_url;
        
        // Check if it's already a full URL
        if (Str::startsWith($this->image_processed, ['http://', 'https://'])) {
            return $this->image_processed;
        }
        
        return asset('storage/' . $this->image_processed);
    }

    /**
     * Approve this post.
     */
    public function approve(User $admin): void
    {
        $this->update([
            'status' => 'published',
            'admin_id' => $admin->id,
            'published_at' => now(),
        ]);
    }

    /**
     * Reject this post.
     */
    public function reject(User $admin, ?string $reason = null): void
    {
        $this->update([
            'status' => 'rejected',
            'admin_id' => $admin->id,
            'rejection_reason' => $reason,
        ]);
    }

    /**
     * Submit for review.
     */
    public function submitForReview(): void
    {
        $this->update(['status' => 'pending']);
    }

    /**
     * Increment view count.
     */
    public function incrementViews(): void
    {
        $this->increment('view_count');
    }
}
