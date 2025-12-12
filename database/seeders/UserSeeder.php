<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::updateOrCreate(
            ['email' => 'admin@curonews.com'],
            [
                'uuid' => Str::uuid()->toString(),
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Create Sourcer User
        User::updateOrCreate(
            ['email' => 'sourcer@curonews.com'],
            [
                'uuid' => Str::uuid()->toString(),
                'name' => 'News Sourcer',
                'password' => Hash::make('password'),
                'role' => 'sourcer',
                'email_verified_at' => now(),
            ]
        );

        // Create Regular User
        User::updateOrCreate(
            ['email' => 'user@curonews.com'],
            [
                'uuid' => Str::uuid()->toString(),
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );
    }
}
