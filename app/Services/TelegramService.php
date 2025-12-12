<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class TelegramService
{
    private string $apiUrl;
    private ?string $botToken;
    private ?string $adminGroupId;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token');
        $this->apiUrl = $this->botToken ? "https://api.telegram.org/bot{$this->botToken}" : '';
        $this->adminGroupId = config('services.telegram.admin_group_id');
    }

    /**
     * Check if Telegram is configured.
     */
    public function isConfigured(): bool
    {
        return !empty($this->botToken) && !empty($this->adminGroupId);
    }

    /**
     * Send a post for review to the admin group.
     */
    public function sendPostForReview(Post $post): bool
    {
        if (!$this->isConfigured()) {
            Log::warning('Telegram not configured, skipping notification');
            return false;
        }

        $caption = $this->buildCaption($post);
        $keyboard = $this->buildInlineKeyboard($post);

        // If post has an image, send photo; otherwise send message
        if ($post->image_path) {
            return $this->sendPhoto($post, $caption, $keyboard);
        }

        return $this->sendMessage($caption, $keyboard);
    }

    /**
     * Send a photo with caption.
     */
    private function sendPhoto(Post $post, string $caption, array $keyboard): bool
    {
        $response = Http::post("{$this->apiUrl}/sendPhoto", [
            'chat_id' => $this->adminGroupId,
            'photo' => $post->image_original_url,
            'caption' => $caption,
            'parse_mode' => 'HTML',
            'reply_markup' => json_encode([
                'inline_keyboard' => $keyboard,
            ]),
        ]);

        if ($response->successful()) {
            $post->update([
                'telegram_message_id' => $response->json('result.message_id'),
            ]);
            return true;
        }

        Log::error('Failed to send Telegram photo', [
            'response' => $response->json(),
            'post_id' => $post->id,
        ]);

        return false;
    }

    /**
     * Send a text message.
     */
    private function sendMessage(string $text, array $keyboard = []): bool
    {
        $payload = [
            'chat_id' => $this->adminGroupId,
            'text' => $text,
            'parse_mode' => 'HTML',
        ];

        if (!empty($keyboard)) {
            $payload['reply_markup'] = json_encode([
                'inline_keyboard' => $keyboard,
            ]);
        }

        $response = Http::post("{$this->apiUrl}/sendMessage", $payload);

        return $response->successful();
    }

    /**
     * Build caption for post notification.
     */
    private function buildCaption(Post $post): string
    {
        $excerpt = Str::limit(strip_tags($post->content ?? $post->excerpt ?? ''), 200);
        $sourcerName = $post->sourcer?->name ?? 'Unknown';
        $categoryName = $post->category?->name ?? 'Uncategorized';

        return <<<HTML
📰 <b>NEW ARTICLE FOR REVIEW</b>

<b>📝 Title:</b> {$post->title}
<b>👤 Sourcer:</b> {$sourcerName}
<b>📁 Category:</b> {$categoryName}

{$excerpt}
HTML;
    }

    /**
     * Build inline keyboard for post actions.
     */
    private function buildInlineKeyboard(Post $post): array
    {
        $editUrl = URL::temporarySignedRoute(
            'filament.admin.resources.posts.edit',
            now()->addHours(24),
            ['record' => $post->uuid]
        );

        return [
            [
                ['text' => '✅ Approve', 'callback_data' => "approve:{$post->uuid}"],
                ['text' => '❌ Reject', 'callback_data' => "reject:{$post->uuid}"],
            ],
            [
                ['text' => '✏️ Edit & Publish', 'url' => $editUrl],
            ],
        ];
    }

    /**
     * Handle callback query from Telegram.
     */
    public function handleCallback(array $callbackQuery): void
    {
        $data = $callbackQuery['data'] ?? '';
        $messageId = $callbackQuery['message']['message_id'] ?? null;
        $chatId = $callbackQuery['message']['chat']['id'] ?? null;
        $user = $callbackQuery['from'] ?? [];
        $callbackId = $callbackQuery['id'] ?? '';

        if (!str_contains($data, ':')) {
            $this->answerCallback($callbackId, 'Invalid action');
            return;
        }

        [$action, $postUuid] = explode(':', $data, 2);
        
        $post = Post::where('uuid', $postUuid)->first();
        
        if (!$post) {
            $this->answerCallback($callbackId, 'Post not found');
            return;
        }

        $admin = $this->findOrCreateAdmin($user);

        match ($action) {
            'approve' => $this->approvePost($post, $admin, $messageId, $chatId, $callbackId),
            'reject' => $this->rejectPost($post, $admin, $messageId, $chatId, $callbackId),
            default => $this->answerCallback($callbackId, 'Unknown action'),
        };
    }

    /**
     * Approve a post.
     */
    private function approvePost(Post $post, User $admin, ?int $messageId, ?string $chatId, string $callbackId): void
    {
        $post->approve($admin);

        $this->answerCallback($callbackId, '✅ Post approved and published!');
        
        if ($messageId && $chatId) {
            $this->updateMessageCaption(
                $chatId,
                $messageId,
                $this->buildCaption($post) . "\n\n✅ <b>Approved by {$admin->name}</b>"
            );
        }
    }

    /**
     * Reject a post.
     */
    private function rejectPost(Post $post, User $admin, ?int $messageId, ?string $chatId, string $callbackId): void
    {
        $post->reject($admin);

        $this->answerCallback($callbackId, '❌ Post rejected');
        
        if ($messageId && $chatId) {
            $this->updateMessageCaption(
                $chatId,
                $messageId,
                $this->buildCaption($post) . "\n\n❌ <b>Rejected by {$admin->name}</b>"
            );
        }
    }

    /**
     * Find or create admin user from Telegram user data.
     */
    private function findOrCreateAdmin(array $telegramUser): User
    {
        $telegramId = $telegramUser['id'] ?? null;
        $name = trim(($telegramUser['first_name'] ?? '') . ' ' . ($telegramUser['last_name'] ?? '')) ?: 'Telegram Admin';
        $username = $telegramUser['username'] ?? null;

        // Try to find by telegram_chat_id first
        $user = User::where('telegram_chat_id', (string) $telegramId)->first();
        
        if ($user) {
            return $user;
        }

        // If not found, create a new admin user
        return User::create([
            'name' => $name,
            'email' => $username ? "{$username}@telegram.local" : "telegram_{$telegramId}@telegram.local",
            'password' => bcrypt(Str::random(32)),
            'role' => 'admin',
            'telegram_chat_id' => (string) $telegramId,
            'email_verified_at' => now(),
        ]);
    }

    /**
     * Answer a callback query.
     */
    private function answerCallback(string $callbackId, string $text): void
    {
        Http::post("{$this->apiUrl}/answerCallbackQuery", [
            'callback_query_id' => $callbackId,
            'text' => $text,
            'show_alert' => false,
        ]);
    }

    /**
     * Update message caption.
     */
    private function updateMessageCaption(string $chatId, int $messageId, string $caption): void
    {
        Http::post("{$this->apiUrl}/editMessageCaption", [
            'chat_id' => $chatId,
            'message_id' => $messageId,
            'caption' => $caption,
            'parse_mode' => 'HTML',
        ]);
    }

    /**
     * Set webhook URL.
     */
    public function setWebhook(string $url, ?string $secretToken = null): bool
    {
        $payload = [
            'url' => $url,
            'allowed_updates' => ['callback_query'],
        ];

        if ($secretToken) {
            $payload['secret_token'] = $secretToken;
        }

        $response = Http::post("{$this->apiUrl}/setWebhook", $payload);

        return $response->successful() && $response->json('ok');
    }

    /**
     * Delete webhook.
     */
    public function deleteWebhook(): bool
    {
        $response = Http::post("{$this->apiUrl}/deleteWebhook");
        return $response->successful();
    }

    /**
     * Get webhook info.
     */
    public function getWebhookInfo(): array
    {
        $response = Http::get("{$this->apiUrl}/getWebhookInfo");
        return $response->json('result', []);
    }
}
