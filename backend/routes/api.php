<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\InteractionController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\TelegramWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('v1')->group(function () {
    
    // Auth routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Public post routes
    Route::get('/posts', [PostController::class, 'index'])->name('api.posts.index');
    Route::get('/posts/{uuid}', [PostController::class, 'show'])->name('api.posts.show');

    // Categories
    Route::get('/categories', [CategoryController::class, 'index'])->name('api.categories.index');
    Route::get('/categories/{slug}', [CategoryController::class, 'show'])->name('api.categories.show');

    // Tags
    Route::get('/tags', [TagController::class, 'index'])->name('api.tags.index');
    Route::get('/tags/search', [TagController::class, 'search'])->name('api.tags.search');

    // Telegram webhook (verified by secret token in controller)
    Route::post('/telegram/webhook', [TelegramWebhookController::class, 'handle']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/user', [AuthController::class, 'user']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/password', [AuthController::class, 'changePassword']);

        // Post interactions
        Route::post('/posts/{uuid}/like', [InteractionController::class, 'toggleLike']);
        Route::post('/posts/{uuid}/save', [InteractionController::class, 'toggleSave']);

        // User collections
        Route::get('/user/likes', [InteractionController::class, 'likedPosts']);
        Route::get('/user/saves', [InteractionController::class, 'savedPosts']);

        // Sourcer routes (create posts, view own posts)
        Route::get('/user/posts', [PostController::class, 'myPosts']);
        Route::post('/posts', [PostController::class, 'store']);

        // Post management routes (authorization handled in controller)
        Route::put('/posts/{uuid}', [PostController::class, 'update']);
        Route::delete('/posts/{uuid}', [PostController::class, 'destroy']);
        Route::patch('/posts/{uuid}/status', [PostController::class, 'updateStatus']);
    });
});
