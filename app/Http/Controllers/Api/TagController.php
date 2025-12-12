<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TagController extends Controller
{
    /**
     * List popular tags (by post count).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $limit = min($request->get('limit', 20), 50);

        $tags = Tag::query()
            ->withCount(['posts' => function ($query) {
                $query->where('status', 'approved');
            }])
            ->orderByDesc('posts_count')
            ->limit($limit)
            ->get();

        return TagResource::collection($tags);
    }

    /**
     * Search tags by name.
     */
    public function search(Request $request): AnonymousResourceCollection
    {
        $query = $request->get('q', '');
        $limit = min($request->get('limit', 10), 50);

        $tags = Tag::query()
            ->where('name', 'like', "%{$query}%")
            ->withCount(['posts' => function ($q) {
                $q->where('status', 'approved');
            }])
            ->orderByDesc('posts_count')
            ->limit($limit)
            ->get();

        return TagResource::collection($tags);
    }
}
