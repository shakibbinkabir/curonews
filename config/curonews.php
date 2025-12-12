<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Image Processing Configuration
    |--------------------------------------------------------------------------
    |
    | These settings control how images are processed for posts.
    | The 9:16 aspect ratio is optimized for mobile viewing.
    |
    */

    'images' => [
        // Maximum upload size in bytes (10MB)
        'max_size' => 10 * 1024 * 1024,

        // Minimum dimensions for uploaded images
        'min_dimensions' => [
            'width' => 400,
            'height' => 400,
        ],

        // Maximum dimensions for uploaded images
        'max_dimensions' => [
            'width' => 8000,
            'height' => 8000,
        ],

        // Allowed MIME types
        'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],

        // Processed image settings (9:16 ratio for mobile)
        'processed' => [
            'width' => 1080,
            'height' => 1920,
            'format' => 'webp',
            'quality' => 85,
        ],

        // Background blur settings
        'blur' => [
            'radius' => 40,
            'brightness' => -20,
        ],

        // Storage disk for images
        'disk' => env('IMAGE_DISK', 'public'),

        // Paths within the storage disk
        'paths' => [
            'original' => 'posts/original',
            'processed' => 'posts/processed',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Configuration
    |--------------------------------------------------------------------------
    |
    | Settings for the image processing queue.
    |
    */

    'queue' => [
        'connection' => env('QUEUE_CONNECTION', 'database'),
        'name' => 'image-processing',
        'tries' => 3,
        'backoff' => 60,
    ],
];
