<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Research',
                'slug' => 'research',
                'description' => 'Scientific studies and findings from medical research',
                'color' => '#3B82F6', // Blue
                'icon' => 'microscope',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'News',
                'slug' => 'news',
                'description' => 'Breaking health news and updates',
                'color' => '#EF4444', // Red
                'icon' => 'newspaper',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Tips',
                'slug' => 'tips',
                'description' => 'Wellness and lifestyle advice for better health',
                'color' => '#10B981', // Green
                'icon' => 'lightbulb',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Technology',
                'slug' => 'technology',
                'description' => 'Health technology developments and innovations',
                'color' => '#8B5CF6', // Purple
                'icon' => 'cpu',
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Nutrition',
                'slug' => 'nutrition',
                'description' => 'Food and diet information for healthy living',
                'color' => '#F59E0B', // Amber
                'icon' => 'apple',
                'sort_order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
