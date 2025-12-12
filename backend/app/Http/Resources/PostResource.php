<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'uuid' => $this->uuid,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->when($request->routeIs('api.posts.show'), $this->content),
            'image_original' => $this->when($request->routeIs('api.posts.show'), $this->image_original_url),
            'image_processed' => $this->image_processed_url,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'source_name' => $this->source_name,
            'source_url' => $this->when($request->routeIs('api.posts.show'), $this->source_url),
            'status' => $this->when($user && in_array($user->role, ['admin', 'sourcer']), $this->status),
            'published_at' => $this->published_at?->toIso8601String(),
            'likes_count' => $this->likes_count ?? $this->interactions()->where('type', 'like')->count(),
            'saves_count' => $this->saves_count ?? $this->interactions()->where('type', 'save')->count(),
            'user_liked' => $user ? $this->interactions()->where('user_id', $user->id)->where('type', 'like')->exists() : false,
            'user_saved' => $user ? $this->interactions()->where('user_id', $user->id)->where('type', 'save')->exists() : false,
        ];
    }
}
