<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test can list published posts.
     */
    public function test_can_list_published_posts(): void
    {
        $category = Category::factory()->create();
        
        // Create published posts
        Post::factory()->count(3)->published()->create(['category_id' => $category->id]);
        
        // Create draft posts (should not appear)
        Post::factory()->count(2)->create(['category_id' => $category->id, 'status' => 'draft']);

        $response = $this->getJson('/api/v1/posts');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'uuid',
                        'title',
                        'slug',
                        'excerpt',
                        'category',
                        'published_at',
                    ],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    /**
     * Test can filter posts by category.
     */
    public function test_can_filter_posts_by_category(): void
    {
        $category1 = Category::factory()->create(['slug' => 'health']);
        $category2 = Category::factory()->create(['slug' => 'fitness']);
        
        Post::factory()->count(3)->published()->create(['category_id' => $category1->id]);
        Post::factory()->count(2)->published()->create(['category_id' => $category2->id]);

        $response = $this->getJson('/api/v1/posts?category=health');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /**
     * Test can search posts.
     */
    public function test_can_search_posts(): void
    {
        $category = Category::factory()->create();
        
        Post::factory()->published()->create([
            'category_id' => $category->id,
            'title' => 'Amazing Health Tips',
        ]);
        Post::factory()->published()->create([
            'category_id' => $category->id,
            'title' => 'Fitness Guide',
        ]);

        $response = $this->getJson('/api/v1/posts?search=health');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Amazing Health Tips');
    }

    /**
     * Test can view single post.
     */
    public function test_can_view_single_post(): void
    {
        $category = Category::factory()->create();
        $post = Post::factory()->published()->create(['category_id' => $category->id]);

        $response = $this->getJson("/api/v1/posts/{$post->uuid}");

        $response->assertStatus(200)
            ->assertJsonPath('data.uuid', $post->uuid)
            ->assertJsonPath('data.title', $post->title)
            ->assertJsonStructure([
                'data' => [
                    'uuid',
                    'title',
                    'slug',
                    'content',
                    'excerpt',
                    'category',
                    'tags',
                    'source_name',
                    'source_url',
                    'likes_count',
                    'saves_count',
                ],
            ]);
    }

    /**
     * Test cannot view unpublished post as guest.
     */
    public function test_cannot_view_unpublished_post_as_guest(): void
    {
        $category = Category::factory()->create();
        $post = Post::factory()->create([
            'category_id' => $category->id,
            'status' => 'draft',
        ]);

        $response = $this->getJson("/api/v1/posts/{$post->uuid}");

        $response->assertStatus(404);
    }

    /**
     * Test sourcer can create post.
     */
    public function test_sourcer_can_create_post(): void
    {
        $user = User::factory()->sourcer()->create();
        $category = Category::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/posts', [
            'title' => 'New Health Article',
            'content' => 'This is the content of the article about health tips.',
            'category_id' => $category->id,
            'source_name' => 'Health Today',
            'source_url' => 'https://healthtoday.com/article',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'New Health Article')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('posts', [
            'title' => 'New Health Article',
            'sourcer_id' => $user->id,
            'status' => 'pending',
        ]);
    }

    /**
     * Test regular user cannot create post.
     */
    public function test_regular_user_cannot_create_post(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $category = Category::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/posts', [
            'title' => 'New Health Article',
            'content' => 'Content here.',
            'category_id' => $category->id,
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test sourcer can view own posts.
     */
    public function test_sourcer_can_view_own_posts(): void
    {
        $user = User::factory()->sourcer()->create();
        $category = Category::factory()->create();
        
        // Create posts for this user
        Post::factory()->count(3)->create([
            'category_id' => $category->id,
            'sourcer_id' => $user->id,
        ]);
        
        // Create posts for another user
        Post::factory()->count(2)->create(['category_id' => $category->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/user/posts');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /**
     * Test sourcer can update own post.
     */
    public function test_sourcer_can_update_own_post(): void
    {
        $user = User::factory()->sourcer()->create();
        $category = Category::factory()->create();
        $post = Post::factory()->create([
            'category_id' => $category->id,
            'sourcer_id' => $user->id,
            'status' => 'draft',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/posts/{$post->uuid}", [
            'title' => 'Updated Title',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Title');
    }

    /**
     * Test sourcer cannot update others post.
     */
    public function test_sourcer_cannot_update_others_post(): void
    {
        $user = User::factory()->sourcer()->create();
        $otherUser = User::factory()->sourcer()->create();
        $category = Category::factory()->create();
        $post = Post::factory()->create([
            'category_id' => $category->id,
            'sourcer_id' => $otherUser->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/posts/{$post->uuid}", [
            'title' => 'Hacked Title',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test admin can update any post.
     */
    public function test_admin_can_update_any_post(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->sourcer()->create();
        $category = Category::factory()->create();
        $post = Post::factory()->create([
            'category_id' => $category->id,
            'sourcer_id' => $user->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/v1/posts/{$post->uuid}", [
            'title' => 'Admin Updated Title',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Admin Updated Title');
    }

    /**
     * Test admin can update post status.
     */
    public function test_admin_can_update_post_status(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();
        $post = Post::factory()->pending()->create(['category_id' => $category->id]);

        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/v1/posts/{$post->uuid}/status", [
            'status' => 'published',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'published');

        $this->assertNotNull($post->fresh()->published_at);
    }

    /**
     * Test sourcer cannot change post status.
     */
    public function test_sourcer_cannot_change_post_status(): void
    {
        $user = User::factory()->sourcer()->create();
        $category = Category::factory()->create();
        $post = Post::factory()->pending()->create([
            'category_id' => $category->id,
            'sourcer_id' => $user->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/v1/posts/{$post->uuid}/status", [
            'status' => 'published',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test posts are paginated.
     */
    public function test_posts_are_paginated(): void
    {
        $category = Category::factory()->create();
        Post::factory()->count(25)->published()->create(['category_id' => $category->id]);

        $response = $this->getJson('/api/v1/posts?per_page=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.total', 25)
            ->assertJsonPath('meta.per_page', 10);
    }

    /**
     * Test can delete own post.
     */
    public function test_sourcer_can_delete_own_draft_post(): void
    {
        $user = User::factory()->sourcer()->create();
        $category = Category::factory()->create();
        $post = Post::factory()->create([
            'category_id' => $category->id,
            'sourcer_id' => $user->id,
            'status' => 'draft',
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/v1/posts/{$post->uuid}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }
}
