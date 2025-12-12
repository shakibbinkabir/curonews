<?php

namespace App\Listeners;

use App\Events\PostSubmitted;
use App\Services\TelegramService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class SendTelegramNotification implements ShouldQueue
{
    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 10;

    /**
     * Create the event listener.
     */
    public function __construct(
        private TelegramService $telegramService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(PostSubmitted $event): void
    {
        if (!$this->telegramService->isConfigured()) {
            Log::info('Telegram not configured, skipping notification', [
                'post_id' => $event->post->id,
            ]);
            return;
        }

        $success = $this->telegramService->sendPostForReview($event->post);

        if ($success) {
            Log::info('Telegram notification sent for post', [
                'post_id' => $event->post->id,
                'telegram_message_id' => $event->post->fresh()->telegram_message_id,
            ]);
        } else {
            Log::error('Failed to send Telegram notification for post', [
                'post_id' => $event->post->id,
            ]);
        }
    }
}
