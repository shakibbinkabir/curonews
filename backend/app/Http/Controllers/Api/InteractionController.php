<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Interaction;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InteractionController extends Controller
{
    /**
     * Toggle like on a post.
     */
    public function toggleLike(Request $request, string $uuid): JsonResponse
    {
        $post = Post::where('uuid', $uuid)->firstOrFail();
        $user = $request->user();

        $liked = Interaction::toggle($user->id, $post->id, 'like');

        return response()->json([
            'liked' => $liked,
            'likes_count' => $post->interactions()->where('type', 'like')->count(),
        ]);
    }

    /**
     * Toggle save on a post.
     */
    public function toggleSave(Request $request, string $uuid): JsonResponse
    {
        $post = Post::where('uuid', $uuid)->firstOrFail();
        $user = $request->user();

        $saved = Interaction::toggle($user->id, $post->id, 'save');

        return response()->json([
            'saved' => $saved,
            'saves_count' => $post->interactions()->where('type', 'save')->count(),
        ]);
    }

    /**
     * Get user's liked posts.
     */
    public function likedPosts(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $posts = Post::query()
            ->with(['category', 'tags'])
            ->whereHas('interactions', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->where('type', 'like');
            })
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->paginate($request->get('per_page', 20));

        return PostResource::collection($posts);
    }

    /**
     * Get user's saved posts.
     */
    public function savedPosts(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $posts = Post::query()
            ->with(['category', 'tags'])
            ->whereHas('interactions', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->where('type', 'save');
            })
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->paginate($request->get('per_page', 20));

        return PostResource::collection($posts);
    }
}
