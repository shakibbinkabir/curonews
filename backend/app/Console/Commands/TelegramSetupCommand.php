<?php

namespace App\Console\Commands;

use App\Services\TelegramService;
use Illuminate\Console\Command;

class TelegramSetupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telegram:setup 
                            {action : The action to perform (webhook, delete-webhook, info)}
                            {--url= : The webhook URL (required for webhook action)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage Telegram bot webhook';

    /**
     * Execute the console command.
     */
    public function handle(TelegramService $telegramService): int
    {
        if (!$telegramService->isConfigured()) {
            $this->error('Telegram is not configured. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_GROUP_ID in .env');
            return Command::FAILURE;
        }

        return match ($this->argument('action')) {
            'webhook' => $this->setWebhook($telegramService),
            'delete-webhook' => $this->deleteWebhook($telegramService),
            'info' => $this->showInfo($telegramService),
            default => $this->invalidAction(),
        };
    }

    private function setWebhook(TelegramService $telegramService): int
    {
        $url = $this->option('url');

        if (!$url) {
            $url = url('/api/v1/telegram/webhook');
            $this->info("Using default URL: {$url}");
        }

        $secretToken = config('services.telegram.webhook_secret');
        
        $success = $telegramService->setWebhook($url, $secretToken);

        if ($success) {
            $this->info('✅ Webhook set successfully!');
            $this->line("URL: {$url}");
            return Command::SUCCESS;
        }

        $this->error('❌ Failed to set webhook');
        return Command::FAILURE;
    }

    private function deleteWebhook(TelegramService $telegramService): int
    {
        $success = $telegramService->deleteWebhook();

        if ($success) {
            $this->info('✅ Webhook deleted successfully!');
            return Command::SUCCESS;
        }

        $this->error('❌ Failed to delete webhook');
        return Command::FAILURE;
    }

    private function showInfo(TelegramService $telegramService): int
    {
        $info = $telegramService->getWebhookInfo();

        $this->info('Webhook Information:');
        $this->table(
            ['Property', 'Value'],
            collect($info)->map(fn ($v, $k) => [$k, is_array($v) ? json_encode($v) : ($v ?? 'null')])->toArray()
        );

        return Command::SUCCESS;
    }

    private function invalidAction(): int
    {
        $this->error('Invalid action. Use: webhook, delete-webhook, or info');
        return Command::FAILURE;
    }
}
