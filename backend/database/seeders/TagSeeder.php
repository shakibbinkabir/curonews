<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            'cardiovascular',
            'mental-health',
            'diabetes',
            'cancer',
            'nutrition',
            'exercise',
            'sleep',
            'stress',
            'immunity',
            'aging',
            'pregnancy',
            'pediatrics',
            'neurology',
            'dermatology',
            'respiratory',
            'covid-19',
            'vaccines',
            'supplements',
            'meditation',
            'weight-loss',
        ];

        foreach ($tags as $tagName) {
            Tag::updateOrCreate(
                ['slug' => $tagName],
                ['name' => ucwords(str_replace('-', ' ', $tagName))]
            );
        }
    }
}
