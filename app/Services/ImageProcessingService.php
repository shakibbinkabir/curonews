<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Interfaces\ImageInterface;

class ImageProcessingService
{
    private ImageManager $manager;
    private array $config;

    public function __construct()
    {
        // Use GD driver (more commonly available on shared hosting)
        $this->manager = new ImageManager(new GdDriver());
        $this->config = config('curonews.images');
    }

    /**
     * Store original image and return the path.
     */
    public function storeOriginal(UploadedFile $file, string $uuid): string
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = $uuid . '_original.' . $extension;
        $path = $this->config['paths']['original'] . '/' . $filename;

        Storage::disk($this->config['disk'])->putFileAs(
            $this->config['paths']['original'],
            $file,
            $filename
        );

        return $path;
    }

    /**
     * Process image: create 9:16 canvas with blurred background.
     */
    public function processImage(string $originalPath): ?string
    {
        $disk = $this->config['disk'];
        $processedConfig = $this->config['processed'];
        $blurConfig = $this->config['blur'];

        // Check if original exists
        if (!Storage::disk($disk)->exists($originalPath)) {
            return null;
        }

        // Get full path to original
        $fullPath = Storage::disk($disk)->path($originalPath);

        // Load original image
        $original = $this->manager->read($fullPath);

        // Target dimensions (9:16 ratio)
        $targetWidth = $processedConfig['width'];
        $targetHeight = $processedConfig['height'];

        // Create canvas with dark background
        $canvas = $this->manager->create($targetWidth, $targetHeight)
            ->fill('#1a1a1a');

        // Layer 1: Blurred background (cover the canvas)
        $background = $this->createBlurredBackground(
            $original,
            $targetWidth,
            $targetHeight,
            $blurConfig['radius']
        );

        // Place background on canvas
        $canvas->place($background, 'center');

        // Layer 2: Original image (contained/scaled down to fit)
        $foreground = $this->createForeground($original, $targetWidth, $targetHeight);

        // Place foreground centered on canvas
        $canvas->place($foreground, 'center');

        // Generate output filename
        $uuid = pathinfo($originalPath, PATHINFO_FILENAME);
        $uuid = str_replace('_original', '', $uuid);
        $filename = $uuid . '_processed.' . $processedConfig['format'];
        $processedPath = $this->config['paths']['processed'] . '/' . $filename;

        // Encode and save
        $encoded = $canvas->toWebp($processedConfig['quality']);
        Storage::disk($disk)->put($processedPath, $encoded->toString());

        return $processedPath;
    }

    /**
     * Create blurred background layer.
     */
    private function createBlurredBackground(
        ImageInterface $original,
        int $targetWidth,
        int $targetHeight,
        int $blurRadius
    ): ImageInterface {
        // Clone and resize to cover
        $background = clone $original;
        
        // Calculate dimensions to cover the canvas
        $originalWidth = $background->width();
        $originalHeight = $background->height();
        
        $scaleWidth = $targetWidth / $originalWidth;
        $scaleHeight = $targetHeight / $originalHeight;
        $scale = max($scaleWidth, $scaleHeight);
        
        $newWidth = (int) ceil($originalWidth * $scale);
        $newHeight = (int) ceil($originalHeight * $scale);
        
        // Resize to cover
        $background->resize($newWidth, $newHeight);
        
        // Crop to exact dimensions (center crop)
        $background->crop($targetWidth, $targetHeight, position: 'center');
        
        // Apply blur effect (GD driver uses different blur method)
        // Apply blur multiple times for stronger effect
        for ($i = 0; $i < min($blurRadius / 10, 5); $i++) {
            $background->blur(100);
        }
        
        // Darken the background
        $background->brightness(-20);

        return $background;
    }

    /**
     * Create foreground layer (contained within bounds).
     */
    private function createForeground(
        ImageInterface $original,
        int $maxWidth,
        int $maxHeight
    ): ImageInterface {
        $foreground = clone $original;
        
        // Add padding (90% of canvas)
        $paddedWidth = (int) ($maxWidth * 0.9);
        $paddedHeight = (int) ($maxHeight * 0.9);
        
        // Scale down to fit within padded area (maintain aspect ratio)
        $foreground->scaleDown($paddedWidth, $paddedHeight);

        return $foreground;
    }

    /**
     * Delete images for a post.
     */
    public function deleteImages(?string $originalPath, ?string $processedPath): void
    {
        $disk = $this->config['disk'];

        if ($originalPath && Storage::disk($disk)->exists($originalPath)) {
            Storage::disk($disk)->delete($originalPath);
        }

        if ($processedPath && Storage::disk($disk)->exists($processedPath)) {
            Storage::disk($disk)->delete($processedPath);
        }
    }

    /**
     * Get public URL for an image.
     */
    public function getPublicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $disk = $this->config['disk'];

        if (!Storage::disk($disk)->exists($path)) {
            return null;
        }

        return Storage::disk($disk)->url($path);
    }

    /**
     * Validate image dimensions.
     */
    public function validateDimensions(UploadedFile $file): array
    {
        $errors = [];
        
        try {
            $image = $this->manager->read($file->getPathname());
            $width = $image->width();
            $height = $image->height();

            $minWidth = $this->config['min_dimensions']['width'];
            $minHeight = $this->config['min_dimensions']['height'];
            $maxWidth = $this->config['max_dimensions']['width'];
            $maxHeight = $this->config['max_dimensions']['height'];

            if ($width < $minWidth || $height < $minHeight) {
                $errors[] = "Image must be at least {$minWidth}x{$minHeight} pixels.";
            }

            if ($width > $maxWidth || $height > $maxHeight) {
                $errors[] = "Image must not exceed {$maxWidth}x{$maxHeight} pixels.";
            }
        } catch (\Exception $e) {
            $errors[] = 'Unable to read image dimensions.';
        }

        return $errors;
    }
}
