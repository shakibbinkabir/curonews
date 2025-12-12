<?php

namespace App\Http\Controllers\Api;

use App\Events\PostSubmitted;
use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * List published posts with pagination.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Post::query()
            ->with(['category', 'tags', 'sourcer'])
            ->where('status', 'published')
            ->whereNotNull('published_at');

        // Filter by category
        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filter by tag
        if ($request->filled('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'published_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSorts = ['published_at', 'likes_count', 'title'];
        if (in_array($sortBy, $allowedSorts)) {
            if ($sortBy === 'likes_count') {
                $query->withCount(['interactions as likes_count' => function ($q) {
                    $q->where('type', 'like');
                }]);
            }
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = min($request->get('per_page', 20), 100);
        
        return PostResource::collection($query->paginate($perPage));
    }

    /**
     * Get a single post by UUID.
     */
    public function show(string $uuid): PostResource
    {
        $post = Post::query()
            ->with(['category', 'tags', 'sourcer'])
            ->where('uuid', $uuid)
            ->where('status', 'published')
            ->firstOrFail();

        // Increment view count
        $post->incrementViews();

        return new PostResource($post);
    }

    /**
     * Create a new post (for sourcers and admins).
     */
    public function store(Request $request): PostResource
    {
        Gate::authorize('create', Post::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'category_id' => 'required|exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'source_name' => 'nullable|string|max:255',
            'source_url' => 'nullable|url|max:500',
            'image' => 'nullable|image|max:10240', // 10MB max
        ]);

        $post = new Post($validated);
        $post->sourcer_id = $request->user()->id;
        $post->status = 'pending';

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('posts/original', 'public');
            $post->image_original = $path;
        }

        $post->save();

        // Attach tags
        if (!empty($validated['tags'])) {
            $post->tags()->sync($validated['tags']);
        }

        // Dispatch event for Telegram notification
        event(new PostSubmitted($post->load(['category', 'tags', 'sourcer'])));

        return new PostResource($post->load(['category', 'tags', 'sourcer']));
    }

    /**
     * Update a post.
     */
    public function update(Request $request, string $uuid): PostResource
    {
        $post = Post::where('uuid', $uuid)->firstOrFail();
        
        Gate::authorize('update', $post);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string|max:500',
            'category_id' => 'sometimes|exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'source_name' => 'nullable|string|max:255',
            'source_url' => 'nullable|url|max:500',
        ]);

        $post->update($validated);

        if (isset($validated['tags'])) {
            $post->tags()->sync($validated['tags']);
        }

        return new PostResource($post->load(['category', 'tags', 'sourcer']));
    }

    /**
     * Delete a post (admin only).
     */
    public function destroy(string $uuid): \Illuminate\Http\JsonResponse
    {
        $post = Post::where('uuid', $uuid)->firstOrFail();
        
        Gate::authorize('delete', $post);

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }

    /**
     * Update post status (admin only).
     */
    public function updateStatus(Request $request, string $uuid): PostResource
    {
        $post = Post::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:draft,pending,published,rejected',
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        if ($validated['status'] === 'published') {
            Gate::authorize('approve', $post);
            $post->approve($user);
        } elseif ($validated['status'] === 'rejected') {
            Gate::authorize('reject', $post);
            $post->reject($user, $validated['rejection_reason'] ?? null);
        } else {
            Gate::authorize('update', $post);
            $post->update(['status' => $validated['status']]);
        }

        return new PostResource($post->load(['category', 'tags', 'sourcer']));
    }

    /**
     * Get posts for sourcer (their own posts).
     */
    public function myPosts(Request $request): AnonymousResourceCollection
    {
        $query = Post::query()
            ->with(['category', 'tags'])
            ->where('sourcer_id', $request->user()->id);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min($request->get('per_page', 20), 100);
        
        return PostResource::collection(
            $query->orderBy('created_at', 'desc')->paginate($perPage)
        );
    }
}
