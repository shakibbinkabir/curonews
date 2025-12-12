<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determine whether the user can view any posts.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the post.
     */
    public function view(User $user, Post $post): bool
    {
        // Admin can view any post
        if ($user->isAdmin()) {
            return true;
        }

        // Sourcer can view their own posts
        if ($user->isSourcer() && $post->sourcer_id === $user->id) {
            return true;
        }

        // Users can only view published posts
        return $post->status === 'published';
    }

    /**
     * Determine whether the user can create posts.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isSourcer();
    }

    /**
     * Determine whether the user can update the post.
     */
    public function update(User $user, Post $post): bool
    {
        // Admin can update any post
        if ($user->isAdmin()) {
            return true;
        }

        // Sourcer can only update their own posts if still draft or rejected
        if ($user->isSourcer() && $post->sourcer_id === $user->id) {
            return in_array($post->status, ['draft', 'rejected']);
        }

        return false;
    }

    /**
     * Determine whether the user can delete the post.
     */
    public function delete(User $user, Post $post): bool
    {
        // Admin can delete any post
        if ($user->isAdmin()) {
            return true;
        }

        // Sourcer can delete their own draft posts
        if ($user->isSourcer() && $post->sourcer_id === $user->id) {
            return $post->status === 'draft';
        }

        return false;
    }

    /**
     * Determine whether the user can restore the post.
     */
    public function restore(User $user, Post $post): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the post.
     */
    public function forceDelete(User $user, Post $post): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can approve posts.
     */
    public function approve(User $user, Post $post): bool
    {
        return $user->isAdmin() && $post->status === 'pending';
    }

    /**
     * Determine whether the user can reject posts.
     */
    public function reject(User $user, Post $post): bool
    {
        return $user->isAdmin() && $post->status === 'pending';
    }
}
