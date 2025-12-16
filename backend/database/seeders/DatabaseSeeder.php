<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed a default admin for Filament access
        User::query()->updateOrCreate(
            ['email' => 'admin@curonews.local'],
            [
                'uuid' => (string) Str::uuid(),
                'name' => 'CuroNews Admin',
                'password' => bcrypt('Admin@123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );
    }
}
