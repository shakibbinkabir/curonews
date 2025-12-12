<?php

namespace App\Jobs;

use App\Models\Post;
use App\Services\ImageProcessingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessPostImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Post $post
    ) {
        $this->tries = config('curonews.queue.tries', 3);
        $this->backoff = config('curonews.queue.backoff', 60);
        $this->onQueue(config('curonews.queue.name', 'default'));
    }

    /**
     * Execute the job.
     */
    public function handle(ImageProcessingService $imageService): void
    {
        // Skip if no original image
        if (!$this->post->image_original) {
            Log::info('ProcessPostImage: No original image for post', [
                'post_id' => $this->post->id,
            ]);
            return;
        }

        // Skip if already processed
        if ($this->post->image_processed) {
            Log::info('ProcessPostImage: Image already processed', [
                'post_id' => $this->post->id,
            ]);
            return;
        }

        Log::info('ProcessPostImage: Starting image processing', [
            'post_id' => $this->post->id,
            'original_path' => $this->post->image_original,
        ]);

        try {
            $processedPath = $imageService->processImage($this->post->image_original);

            if ($processedPath) {
                $this->post->update([
                    'image_processed' => $processedPath,
                ]);

                Log::info('ProcessPostImage: Image processed successfully', [
                    'post_id' => $this->post->id,
                    'processed_path' => $processedPath,
                ]);
            } else {
                Log::warning('ProcessPostImage: Failed to process image', [
                    'post_id' => $this->post->id,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('ProcessPostImage: Exception during processing', [
                'post_id' => $this->post->id,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Re-throw to trigger retry
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessPostImage: Job failed after all retries', [
            'post_id' => $this->post->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
