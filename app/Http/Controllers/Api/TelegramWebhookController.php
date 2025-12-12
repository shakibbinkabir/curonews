<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    public function __construct(
        private TelegramService $telegramService
    ) {}

    /**
     * Handle incoming webhook from Telegram.
     */
    public function handle(Request $request): Response
    {
        // Verify secret token if configured
        $secretToken = config('services.telegram.webhook_secret');
        
        if ($secretToken) {
            $headerToken = $request->header('X-Telegram-Bot-Api-Secret-Token');
            
            if ($headerToken !== $secretToken) {
                Log::warning('Invalid Telegram webhook secret token', [
                    'ip' => $request->ip(),
                ]);
                return response('Unauthorized', 401);
            }
        }

        $update = $request->all();

        Log::info('Telegram webhook received', ['update' => $update]);

        // Handle callback queries (button presses)
        if (isset($update['callback_query'])) {
            $this->telegramService->handleCallback($update['callback_query']);
        }

        // Always return 200 OK to Telegram
        return response('OK', 200);
    }
}
