<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Interaction;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InteractionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can like a post.
     */
    public function test_user_can_like_post(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $post = Post::factory()->published()->create(['category_id' => $category->id]);
        
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/posts/{$post->uuid}/like");

        $response->assertStatus(200)
            ->assertJson([
                'liked' => true,
            ])
            ->assertJsonStructure(['liked', 'likes_count']);

        $this->assertDatabaseHas('interactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'like',
        ]);
    }

    /**
     * Test user can unlike a post.
     */
    public function test_user_can_unlike_post(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $post = Post::factory()->published()->create(['category_id' => $category->id]);
        
        // Create existing like
        Interaction::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'like',
        ]);
        
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/posts/{$post->uuid}/like");

        $response->assertStatus(200)
            ->assertJson([
                'liked' => false,
            ])
            ->assertJsonStructure(['liked', 'likes_count']);

        $this->assertDatabaseMissing('interactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'like',
        ]);
    }

    /**
     * Test user can save a post.
     */
    public function test_user_can_save_post(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $post = Post::factory()->published()->create(['category_id' => $category->id]);
        
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/posts/{$post->uuid}/save");

        $response->assertStatus(200)
            ->assertJson([
                'saved' => true,
            ])
            ->assertJsonStructure(['saved', 'saves_count']);

        $this->assertDatabaseHas('interactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'save',
        ]);
    }

    /**
     * Test user can unsave a post.
     */
    public function test_user_can_unsave_post(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $post = Post::factory()->published()->create(['category_id' => $category->id]);
        
        // Create existing save
        Interaction::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'save',
        ]);
        
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/posts/{$post->uuid}/save");

        $response->assertStatus(200)
            ->assertJson([
                'saved' => false,
            ])
            ->assertJsonStructure(['saved', 'saves_count']);

        $this->assertDatabaseMissing('interactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'save',
        ]);
    }

    /**
     * Test user can get liked posts.
     */
    public function test_user_can_get_liked_posts(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        // Create posts and like some
        $likedPosts = Post::factory()->count(3)->published()->create(['category_id' => $category->id]);
        $unlikedPosts = Post::factory()->count(2)->published()->create(['category_id' => $category->id]);
        
        foreach ($likedPosts as $post) {
            Interaction::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
                'type' => 'like',
            ]);
        }
        
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/user/likes');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /**
     * Test user can get saved posts.
     */
    public function test_user_can_get_saved_posts(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        // Create posts and save some
        $savedPosts = Post::factory()->count(2)->published()->create(['category_id' => $category->id]);
        $unsavedPosts = Post::factory()->count(3)->published()->create(['category_id' => $category->id]);
        
        foreach ($savedPosts as $post) {
            Interaction::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
                'type' => 'save',
            ]);
        }
        
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/user/saves');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test guest cannot like post.
     */
    public function test_guest_cannot_like_post(): void
    {
        $category = Category::factory()->create();
        $post = Post::factory()->published()->create(['category_id' => $category->id]);

        $response = $this->postJson("/api/v1/posts/{$post->uuid}/like");

        $response->assertStatus(401);
    }

    /**
     * Test guest cannot save post.
     */
    public function test_guest_cannot_save_post(): void
    {
        $category = Category::factory()->create();
        $post = Post::factory()->published()->create(['category_id' => $category->id]);

        $response = $this->postJson("/api/v1/posts/{$post->uuid}/save");

        $response->assertStatus(401);
    }

    /**
     * Test cannot like non-existent post.
     */
    public function test_cannot_like_nonexistent_post(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/posts/nonexistent-uuid/like');

        $response->assertStatus(404);
    }

    /**
     * Test cannot save non-existent post.
     */
    public function test_cannot_save_nonexistent_post(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/posts/nonexistent-uuid/save');

        $response->assertStatus(404);
    }

    /**
     * Test post includes interaction status for authenticated user.
     */
    public function test_post_includes_interaction_status_for_authenticated_user(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $post = Post::factory()->published()->create(['category_id' => $category->id]);
        
        // Like the post
        Interaction::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'like',
        ]);
        
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/posts/{$post->uuid}");

        $response->assertStatus(200)
            ->assertJsonPath('data.user_liked', true)
            ->assertJsonPath('data.user_saved', false);
    }

    /**
     * Test can like and save same post.
     */
    public function test_can_like_and_save_same_post(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $post = Post::factory()->published()->create(['category_id' => $category->id]);
        
        Sanctum::actingAs($user);

        // Like
        $this->postJson("/api/v1/posts/{$post->uuid}/like")
            ->assertJson(['liked' => true]);
        
        // Save
        $this->postJson("/api/v1/posts/{$post->uuid}/save")
            ->assertJson(['saved' => true]);

        // Check both exist
        $this->assertDatabaseHas('interactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'like',
        ]);
        
        $this->assertDatabaseHas('interactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'save',
        ]);
    }

    /**
     * Test liked posts are paginated.
     */
    public function test_liked_posts_are_paginated(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        $posts = Post::factory()->count(25)->published()->create(['category_id' => $category->id]);
        
        foreach ($posts as $post) {
            Interaction::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
                'type' => 'like',
            ]);
        }
        
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/user/likes?per_page=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.total', 25);
    }
}
