<?php

namespace App\Providers;

use App\Events\PostSubmitted;
use App\Listeners\SendTelegramNotification;
use App\Models\Post;
use App\Policies\PostPolicy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register event listeners
        Event::listen(
            PostSubmitted::class,
            SendTelegramNotification::class
        );

        // Register policies
        Gate::policy(Post::class, PostPolicy::class);
    }
}
