<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->when($request->routeIs('api.categories.*'), $this->description),
            'color' => $this->color,
            'icon' => $this->icon,
            'posts_count' => $this->when(isset($this->posts_count), $this->posts_count),
        ];
    }
}
