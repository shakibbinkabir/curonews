# CuroNews - Technical Product Requirements Document

**Version:** 1.0  
**Status:** Draft  
**Date:** December 12, 2025  
**Document Type:** Engineering & Development PRD

---

## 1. Technical Overview

### 1.1 Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SYSTEM ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────┘

      ┌───────────────────────┐
      │   cPanel Shared       │
      │   Web Hosting         │
      │   (BDIX Advance)      │
      └───────────┬───────────┘
             │
         ┌────────▼────────┐
         │    Laravel 11   │
         │  Web + API +    │
         │   Filament      │
         └────────┬────────┘
             │
         ┌────────▼────────┐
         │     MySQL       │
         │   (Unlimited    │
         │   Databases)    │
         └────────┬────────┘
             │
     ┌─────────────────┼─────────────────┐
     │                 │                 │
   ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
   │ Telegram    │   │ Local File  │   │ Image       │
   │   Bot API   │   │ Storage /   │   │ Processing  │
   │             │   │ Cloudinary  │   │ (Intervention)
   └─────────────┘   └─────────────┘   └─────────────┘
```

### 1.2 Hosting Specifications (cPanel BDIX Advance)

| Resource | Specification |
|----------|---------------|
| **Disk Space** | 10GB NVMe SSD (4GB available) |
| **Bandwidth** | 520GB/month Managed |
| **RAM** | 2GB Managed |
| **CPU** | 2 Core (150% Limit) |
| **I/O** | 30 Mbps |
| **Entry Processes** | 35 |
| **Total Processes** | 120 |
| **MySQL Databases** | Unlimited |
| **Addon Domains** | Unlimited |
| **Subdomains** | Unlimited |
| **Email Accounts** | Unlimited |
| **SSL** | Free Lifetime SSL |
| **SSH Access** | Yes |
| **Node.js Support** | Yes |
| **Backup** | Up to 7 Days Daily |

### 1.3 Tech Stack Specification

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Hosting** | cPanel Shared | BDIX Advance | Cost-effective, SSH access, Node.js support |
| **Web + API** | Laravel | 11 | Single-stack app (Blade + API) on shared hosting |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first, works with Blade components |
| **Frontend Runtime** | Laravel Blade + Alpine/Livewire (optional) | - | Keep UI server-rendered without Next.js |
| **Admin Panel** | Filament PHP | 3+ | Rapid admin development |
| **Database** | MySQL | 8+ | Unlimited databases on cPanel |
| **Queue** | Database Driver | - | Fits shared hosting, no Redis requirement |
| **Image Processing** | Intervention Image | 3+ | Laravel integration |
| **File Storage** | Local/Cloudinary | - | Local storage or Cloudinary for CDN |

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA (ERD)                            │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │    users     │         │    posts     │         │  categories  │
  ├──────────────┤         ├──────────────┤         ├──────────────┤
  │ id           │◄───┐    │ id           │    ┌───►│ id           │
  │ uuid         │    │    │ uuid         │    │    │ name         │
  │ name         │    │    │ sourcer_id   │────┘    │ slug         │
  │ email        │    │    │ admin_id     │────┐    │ description  │
  │ password     │    │    │ category_id  │────┼───►│ timestamps   │
  │ role         │    │    │ title        │    │    └──────────────┘
  │ avatar       │    │    │ slug         │    │
  │ timestamps   │    │    │ content      │    │
  └──────────────┘    │    │ excerpt      │    │
         ▲            │    │ image_original│   │
         │            │    │ image_processed│  │
         │            └────│ status       │    │
         │                 │ source_name  │    │
         │                 │ source_url   │    │
         │                 │ published_at │    │
         │                 │ timestamps   │    │
         │                 └──────┬───────┘    │
         │                        │            │
         │            ┌───────────┴───────┐    │
         │            ▼                   ▼    │
  ┌──────┴───────┐  ┌──────────────┐  ┌───────┴────┐
  │ interactions │  │   post_tag   │  │    tags    │
  ├──────────────┤  ├──────────────┤  ├────────────┤
  │ id           │  │ post_id      │  │ id         │
  │ user_id      │  │ tag_id       │  │ name       │
  │ post_id      │  └──────────────┘  │ slug       │
  │ type         │                    │ timestamps │
  │ timestamps   │                    └────────────┘
  └──────────────┘
```

### 2.2 Table Definitions

#### `users` Table

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('guest', 'user', 'sourcer', 'admin') DEFAULT 'user',
    avatar VARCHAR(255) NULL,
    telegram_chat_id VARCHAR(255) NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_role (role),
    INDEX idx_email (email)
);
```

#### `posts` Table

```sql
CREATE TABLE posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE NOT NULL,
    sourcer_id BIGINT UNSIGNED NOT NULL,
    admin_id BIGINT UNSIGNED NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt VARCHAR(500) NULL,
    image_original VARCHAR(255) NOT NULL,
    image_processed VARCHAR(255) NULL,
    status ENUM('draft', 'pending', 'published', 'rejected') DEFAULT 'draft',
    rejection_reason TEXT NULL,
    source_name VARCHAR(255) NULL,
    source_url VARCHAR(500) NULL,
    meta_title VARCHAR(255) NULL,
    meta_description VARCHAR(500) NULL,
    view_count INT UNSIGNED DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sourcer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_category (category_id),
    FULLTEXT INDEX idx_search (title, content)
);
```

#### `categories` Table

```sql
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NULL,
    color VARCHAR(7) NULL,  -- Hex color code
    icon VARCHAR(50) NULL,  -- Icon identifier
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
);
```

#### `tags` Table

```sql
CREATE TABLE tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug)
);
```

#### `post_tag` Pivot Table

```sql
CREATE TABLE post_tag (
    post_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

#### `interactions` Table

```sql
CREATE TABLE interactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    post_id BIGINT UNSIGNED NOT NULL,
    type ENUM('like', 'save') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_interaction (user_id, post_id, type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    
    INDEX idx_user_type (user_id, type),
    INDEX idx_post_type (post_id, type)
);
```

---

## 3. API Specification

### 3.1 Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | User login | No |
| `POST` | `/api/auth/logout` | User logout | Yes |
| `GET` | `/api/auth/user` | Get current user | Yes |
| `POST` | `/api/auth/refresh` | Refresh token | Yes |

### 3.2 Posts Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/api/posts` | List published posts | No | - |
| `GET` | `/api/posts/{uuid}` | Get single post | No | - |
| `POST` | `/api/posts` | Create draft post | Yes | Sourcer+ |
| `PUT` | `/api/posts/{uuid}` | Update post | Yes | Admin |
| `DELETE` | `/api/posts/{uuid}` | Delete post | Yes | Admin |
| `PATCH` | `/api/posts/{uuid}/status` | Change status | Yes | Admin |

#### GET `/api/posts` - List Posts

**Query Parameters:**
```typescript
interface PostListParams {
  page?:  number;           // Default: 1
  per_page?: number;       // Default: 20, Max: 100
  category?:  string;       // Category slug
  tag?: string;            // Tag slug
  search?: string;         // Search query
  status?: 'published';    // Only published for public
  sort_by?: 'published_at' | 'view_count' | 'likes_count';
  sort_order?: 'asc' | 'desc';
}
```

**Response:**
```json
{
  "data": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "title": "New Study Reveals.. .",
      "slug": "new-study-reveals",
      "excerpt": "Scientists have discovered.. .",
      "image_processed": "https://cdn.curonews.com/images/processed/abc123.jpg",
      "category":  {
        "name": "Research",
        "slug": "research",
        "color":  "#3B82F6"
      },
      "tags": ["cardiovascular", "study"],
      "source_name": "Johns Hopkins",
      "published_at": "2025-12-12T10:00:00Z",
      "likes_count": 42,
      "saves_count": 15,
      "user_liked": false,
      "user_saved": false
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 20,
    "total":  195
  }
}
```

#### GET `/api/posts/{uuid}` - Single Post

**Response:**
```json
{
  "data":  {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "title": "New Study Reveals...",
    "slug":  "new-study-reveals",
    "content": "<p>Full article content in HTML... </p>",
    "excerpt": "Scientists have discovered...",
    "image_original": "https://cdn.curonews. com/images/original/abc123.jpg",
    "image_processed": "https://cdn.curonews.com/images/processed/abc123.jpg",
    "category": {
      "name": "Research",
      "slug": "research",
      "color":  "#3B82F6"
    },
    "tags":  [
      {"name": "Cardiovascular", "slug": "cardiovascular"},
      {"name":  "Study", "slug": "study"}
    ],
    "source_name": "Johns Hopkins",
    "source_url": "https://source.example.com/article",
    "published_at": "2025-12-12T10:00:00Z",
    "likes_count":  42,
    "saves_count":  15,
    "view_count": 1250,
    "user_liked": true,
    "user_saved": false
  }
}
```

### 3.3 Interactions Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/posts/{uuid}/like` | Toggle like | Yes |
| `POST` | `/api/posts/{uuid}/save` | Toggle save | Yes |
| `GET` | `/api/user/likes` | Get user's liked posts | Yes |
| `GET` | `/api/user/saves` | Get user's saved posts | Yes |

### 3.4 Categories & Tags Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/categories` | List all categories | No |
| `GET` | `/api/tags` | List popular tags | No |
| `GET` | `/api/tags/search` | Search tags | No |

### 3.5 Telegram Webhook Endpoint

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/telegram/webhook` | Handle Telegram callbacks | Telegram Token |

---

## 4. Image Processing System

### 4.1 Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    IMAGE PROCESSING PIPELINE                        │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   Original   │
    │    Image     │
    │  (Any Size)  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Validate   │
    │  • Format    │
    │  • Size      │
    │  • Dimensions│
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Upload to  │
    │   S3/CDN     │
    │  (Original)  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Dispatch Job │
    │  to Redis    │
    │    Queue     │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────────────────────┐
    │               PROCESSING JOB                      │
    ├──────────────────────────────────────────────────┤
    │  1. Create 9: 16 canvas (1080 x 1920 px)          │
    │                                                   │
    │  2. Layer 1 - Background:                         │
    │     • Load original image                        │
    │     • Resize to COVER canvas                     │
    │     • Apply Gaussian blur (radius:  40px)         │
    │     • Reduce opacity to 80%                      │
    │                                                   │
    │  3. Layer 2 - Foreground:                        │
    │     • Load original image                        │
    │     • Resize to CONTAIN within canvas            │
    │     • Center on canvas                           │
    │                                                   │
    │  4. Composite layers                             │
    │                                                   │
    │  5. Optimize (WebP, quality:  85)                 │
    │                                                   │
    │  6. Upload processed image to S3/CDN             │
    │                                                   │
    │  7. Update post record with processed URL        │
    └──────────────────────────────────────────────────┘
```

### 4.2 Laravel Job Implementation

```php
<?php

namespace App\Jobs;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Imagick\Driver;
use Illuminate\Support\Facades\Storage;

class ProcessPostImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        private Post $post
    ) {}

    public function handle(): void
    {
        $manager = new ImageManager(new Driver());
        
        // Target dimensions (9:16 ratio)
        $targetWidth = 1080;
        $targetHeight = 1920;
        
        // Load original image
        $originalPath = Storage::disk('s3')->path($this->post->image_original);
        $original = $manager->read($originalPath);
        
        // Create canvas
        $canvas = $manager->create($targetWidth, $targetHeight)
            ->fill('#1a1a1a');
        
        // Layer 1: Blurred background
        $background = clone $original;
        $background->cover($targetWidth, $targetHeight)
            ->blur(40)
            ->brightness(-20);
        
        $canvas->place($background, 'center');
        
        // Layer 2: Original image (contained)
        $foreground = clone $original;
        $foreground->scaleDown($targetWidth, $targetHeight);
        
        $canvas->place($foreground, 'center');
        
        // Encode as WebP
        $encoded = $canvas->toWebp(85);
        
        // Generate filename
        $filename = 'processed/' . $this->post->uuid . '. webp';
        
        // Upload to S3
        Storage::disk('s3')->put($filename, $encoded);
        
        // Update post
        $this->post->update([
            'image_processed' => $filename
        ]);
    }
}
```

### 4.3 Image Validation Rules

```php
// config/curonews.php
return [
    'images' => [
        'max_size' => 10 * 1024 * 1024, // 10MB
        'min_dimensions' => [
            'width' => 400,
            'height' => 400,
        ],
        'max_dimensions' => [
            'width' => 8000,
            'height' => 8000,
        ],
        'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
        'processed' => [
            'width' => 1080,
            'height' => 1920,
            'format' => 'webp',
            'quality' => 85,
        ],
    ],
];
```

---

## 5. Telegram Bot Integration

### 5.1 Bot Setup

```php
// config/services.php
return [
    'telegram' => [
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'admin_group_id' => env('TELEGRAM_ADMIN_GROUP_ID'),
        'webhook_url' => env('APP_URL') . '/api/telegram/webhook',
        'webhook_secret' => env('TELEGRAM_WEBHOOK_SECRET'),
    ],
];
```

### 5.2 Event Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TELEGRAM NOTIFICATION FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

  Sourcer submits post
          │
          ▼
  ┌───────────────────┐
  │  PostSubmitted    │
  │     Event         │
  └─────────┬─────────┘
            │
            ▼
  ┌───────────────────┐
  │ SendTelegramNotif │
  │    Listener       │
  └─────────┬─────────┘
            │
            ▼
  ┌───────────────────┐
  │ TelegramNotification │
  │      Job (Queue)     │
  └─────────┬─────────┘
            │
            ▼
  ┌───────────────────┐
  │   Telegram API    │
  │  sendPhoto with   │
  │  inline_keyboard  │
  └─────────┬─────────┘
            │
            ▼
  ┌───────────────────────────────────────┐
  │         ADMIN TELEGRAM GROUP          │
  │                                       │
  │  📰 NEW ARTICLE FOR REVIEW            │
  │  ─────────────────────────────────    │
  │  [Image Preview]                      │
  │                                       │
  │  📝 Title: {title}                    │
  │  👤 Sourcer: {sourcer_name}           │
  │  📁 Category: {category}              │
  │                                       │
  │  {excerpt_200_chars}...                │
  │                                       │
  │  ┌─────────┐┌─────────┐┌─────────┐    │
  │  │✅Approve││❌Reject ││✏️ Edit  │    │
  │  └─────────┘└─────────┘└─────────┘    │
  └───────────────────────────────────────┘
            │
            │ Admin clicks button
            ▼
  ┌───────────────────┐
  │ Telegram Webhook  │
  │   /api/telegram   │
  │     /webhook      │
  └─────────┬─────────┘
            │
            ├─────────────────────────────────────┐
            │                                     │
   ┌────────▼────────┐               ┌────────────▼───────────┐
   │ Approve/Reject  │               │    Edit & Publish      │
   │ Update status   │               │ Generate magic link    │
   │ directly        │               │ Admin opens dashboard  │
   └────────┬────────┘               └────────────┬───────────┘
            │                                     │
            ▼                                     ▼
   ┌─────────────────┐               ┌─────────────────────────┐
   │ Edit Telegram   │               │ Redirect to Filament    │
   │ message to show │               │ /admin/posts/{id}/edit  │
   │ "✅ Approved by │               │ with auth token         │
   │  @admin"        │               └─────────────────────────┘
   └─────────────────┘
```

### 5.3 Telegram Service Class

```php
<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class TelegramService
{
    private string $apiUrl;
    private string $botToken;
    private string $adminGroupId;

    public function __construct()
    {
        $this->botToken = config('services.telegram. bot_token');
        $this->apiUrl = "https://api.telegram.org/bot{$this->botToken}";
        $this->adminGroupId = config('services.telegram.admin_group_id');
    }

    public function sendPostForReview(Post $post): bool
    {
        $caption = $this->buildCaption($post);
        $keyboard = $this->buildInlineKeyboard($post);

        $response = Http::post("{$this->apiUrl}/sendPhoto", [
            'chat_id' => $this->adminGroupId,
            'photo' => $post->image_original_url,
            'caption' => $caption,
            'parse_mode' => 'HTML',
            'reply_markup' => json_encode([
                'inline_keyboard' => $keyboard
            ])
        ]);

        if ($response->successful()) {
            $post->update([
                'telegram_message_id' => $response->json('result.message_id')
            ]);
            return true;
        }

        return false;
    }

    private function buildCaption(Post $post): string
    {
        $excerpt = Str::limit(strip_tags($post->content), 200);
        
        return <<<HTML
📰 <b>NEW ARTICLE FOR REVIEW</b>

<b>📝 Title:</b> {$post->title}
<b>👤 Sourcer: </b> {$post->sourcer->name}
<b>📁 Category:</b> {$post->category->name}

{$excerpt}
HTML;
    }

    private function buildInlineKeyboard(Post $post): array
    {
        $editUrl = URL::temporarySignedRoute(
            'admin.posts.edit',
            now()->addHours(24),
            ['post' => $post->uuid]
        );

        return [
            [
                ['text' => '✅ Approve', 'callback_data' => "approve:{$post->uuid}"],
                ['text' => '❌ Reject', 'callback_data' => "reject:{$post->uuid}"],
                ['text' => '✏️ Edit & Publish', 'url' => $editUrl],
            ]
        ];
    }

    public function handleCallback(array $callbackQuery): void
    {
        $data = $callbackQuery['data'];
        $messageId = $callbackQuery['message']['message_id'];
        $user = $callbackQuery['from'];

        [$action, $postUuid] = explode(':', $data);
        
        $post = Post::where('uuid', $postUuid)->firstOrFail();
        $admin = $this->findOrCreateAdmin($user);

        match ($action) {
            'approve' => $this->approvePost($post, $admin, $messageId),
            'reject' => $this->rejectPost($post, $admin, $messageId),
            default => null,
        };
    }

    private function approvePost(Post $post, $admin, int $messageId): void
    {
        $post->update([
            'status' => 'published',
            'admin_id' => $admin->id,
            'published_at' => now(),
        ]);

        $this->updateMessage($messageId, "✅ Approved by @{$admin->name}");
        $this->answerCallback("Post approved and published!");
    }

    private function rejectPost(Post $post, $admin, int $messageId): void
    {
        $post->update([
            'status' => 'rejected',
            'admin_id' => $admin->id,
        ]);

        $this->updateMessage($messageId, "❌ Rejected by @{$admin->name}");
        $this->answerCallback("Post rejected.");
    }
}
```

### 5.4 Webhook Controller

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TelegramWebhookController extends Controller
{
    public function __construct(
        private TelegramService $telegram
    ) {}

    public function handle(Request $request): JsonResponse
    {
        // Verify webhook secret
        $secretToken = $request->header('X-Telegram-Bot-Api-Secret-Token');
        
        if ($secretToken !== config('services.telegram.webhook_secret')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $update = $request->all();

        if (isset($update['callback_query'])) {
            $this->telegram->handleCallback($update['callback_query']);
        }

        return response()->json(['ok' => true]);
    }
}
```

---

## 6. Web UI (Laravel)

### 6.1 View Structure

```
resources/
├── views/
│   ├── layouts/
│   │   └── app.blade.php          # Shell with header/footer, meta tags, flash messages
│   ├── components/                # Blade components for cards, badges, buttons
│   │   ├── card.blade.php         # 9:16 bento card wrapper
│   │   ├── badge.blade.php        # Category badge with color
│   │   └── modal.blade.php        # Article modal
│   ├── feed/
│   │   └── index.blade.php        # Home feed with infinite scroll / "load more"
│   ├── posts/
│   │   └── show.blade.php         # Full article view
│   ├── auth/
│   │   ├── login.blade.php
│   │   └── register.blade.php
│   └── profile/
│       ├── likes.blade.php
│       └── saves.blade.php
└── css/
    └── app.css                    # Tailwind entry (compiled via Laravel Mix/Vite)
```

### 6.2 UI Behavior

- Use Blade + Tailwind for all reader pages; Alpine.js or Livewire for modals and like/save toggles to avoid a separate SPA.
- Post cards remain 9:16; reuse processed image for cover and overlay excerpt/title.
- Infinite scroll can be implemented with cursor-based pagination via AJAX endpoints that return Blade partials for cards.
- Auth flows rely on Sanctum session cookies; prompts for guests open a login modal rendered in Blade.

### 6.3 Design Tokens

- Tailwind config holds light/dark color tokens aligning with product palette.
- Rounded corners (`--radius: 1.5rem`) and generous spacing match the bento aesthetic.
- Theme toggle (optional) can switch a `dark` class on `<html>`; no separate Next.js theme provider needed.

---

## 7. Filament Admin Configuration

### 7.1 PostResource

```php
<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PostResource\Pages;
use App\Models\Post;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PostResource extends Resource
{
    protected static ?string $model = Post::class;
    protected static ?string $navigationIcon = 'heroicon-o-newspaper';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Content')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn ($state, $set) => 
                                $set('slug', Str::slug($state))
                            ),
                        
                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        
                        Forms\Components\Select::make('category_id')
                            ->relationship('category', 'name')
                            ->required()
                            ->searchable()
                            ->preload(),
                        
                        Forms\Components\Select::make('tags')
                            ->relationship('tags', 'name')
                            ->multiple()
                            ->searchable()
                            ->preload()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')
                                    ->required(),
                            ]),
                        
                        Forms\Components\RichEditor::make('content')
                            ->required()
                            ->columnSpanFull(),
                        
                        Forms\Components\Textarea::make('excerpt')
                            ->maxLength(500)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Media')
                    ->schema([
                        Forms\Components\FileUpload::make('image_original')
                            ->image()
                            ->required()
                            ->directory('posts/original')
                            ->visibility('public')
                            ->imageResizeMode('contain')
                            ->imageCropAspectRatio(null)
                            ->maxSize(10240) // 10MB
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp']),
                    ]),

                Forms\Components\Section::make('Source')
                    ->schema([
                        Forms\Components\TextInput::make('source_name')
                            ->maxLength(255),
                        
                        Forms\Components\TextInput::make('source_url')
                            ->url()
                            ->maxLength(500),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Status')
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->options([
                                'draft' => 'Draft',
                                'pending' => 'Pending Review',
                                'published' => 'Published',
                                'rejected' => 'Rejected',
                            ])
                            ->required()
                            ->default('draft')
                            ->visible(fn () => auth()->user()->isAdmin()),
                        
                        Forms\Components\DateTimePicker::make('published_at')
                            ->visible(fn () => auth()->user()->isAdmin()),
                        
                        Forms\Components\Textarea::make('rejection_reason')
                            ->visible(fn ($get) => $get('status') === 'rejected'),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image_processed')
                    ->label('Image')
                    ->circular(false)
                    ->height(80),
                
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->limit(40),
                
                Tables\Columns\TextColumn::make('category. name')
                    ->badge()
                    ->color(fn ($record) => $record->category->color ??  'gray'),
                
                Tables\Columns\TextColumn::make('sourcer. name')
                    ->label('Sourcer'),
                
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'gray' => 'draft',
                        'warning' => 'pending',
                        'success' => 'published',
                        'danger' => 'rejected',
                    ]),
                
                Tables\Columns\TextColumn::make('published_at')
                    ->dateTime()
                    ->sortable(),
                
                Tables\Columns\TextColumn::make('likes_count')
                    ->label('❤️')
                    ->counts('likes'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'pending' => 'Pending',
                        'published' => 'Published',
                        'rejected' => 'Rejected',
                    ]),
                
                Tables\Filters\SelectFilter::make('category')
                           ->relationship('category', 'name'),
                
                Tables\Filters\Filter::make('published_at')
                    ->form([
                        Forms\Components\DatePicker::make('published_from'),
                        Forms\Components\DatePicker::make('published_until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['published_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('published_at', '>=', $date),
                            )
                            ->when(
                                $data['published_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('published_at', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => $record->status === 'pending')
                    ->requiresConfirmation()
                    ->action(fn ($record) => $record->approve(auth()->user())),
                
                Tables\Actions\Action::make('reject')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn ($record) => $record->status === 'pending')
                    ->form([
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('Reason for rejection')
                            ->required(),
                    ])
                    ->action(fn ($record, array $data) => 
                        $record->reject(auth()->user(), $data['rejection_reason'])
                    ),
                
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkAction::make('bulk_approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(fn ($records) => $records->each->approve(auth()->user())),
                
                Tables\Actions\DeleteBulkAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPosts::route('/'),
            'create' => Pages\CreatePost::route('/create'),
            'edit' => Pages\EditPost::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();
        
        // Sourcers can only see their own posts
        if (auth()->user()->role === 'sourcer') {
            $query->where('sourcer_id', auth()->id());
        }
        
        return $query;
    }
}
```

### 7. 2 Role-Based Panel Access

```php
<? php

namespace App\Filament;

use Filament\Panel;
use Filament\PanelProvider;
use Filament\Navigation\NavigationGroup;
use Illuminate\Support\Facades\Gate;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->colors([
                'primary' => '#3B82F6',
            ])
            ->brandName('CuroNews Admin')
            ->brandLogo(asset('images/logo. svg'))
            ->favicon(asset('images/favicon.ico'))
            ->navigationGroups([
                NavigationGroup::make('Content')
                    ->icon('heroicon-o-document-text'),
                NavigationGroup::make('Users')
                    ->icon('heroicon-o-users')
                    ->collapsed(),
                NavigationGroup::make('Settings')
                    ->icon('heroicon-o-cog-6-tooth')
                    ->collapsed(),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->middleware([
                'web',
                \Filament\Http\Middleware\Authenticate::class,
            ])
            ->authMiddleware([
                \App\Http\Middleware\EnsureUserHasAdminAccess::class,
            ]);
    }
}
```

### 7.3 Dashboard Widgets

```php
<?php

namespace App\Filament\Widgets;

use App\Models\Post;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ContentStatsWidget extends BaseWidget
{
    protected static ? int $sort = 1;

    protected function getStats(): array
    {
        return [
            Stat::make('Pending Review', Post::where('status', 'pending')->count())
                ->description('Awaiting approval')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning')
                ->chart([7, 3, 4, 5, 6, 3, 5])
                ->url(route('filament.admin.resources.posts.index', ['tableFilters[status][value]' => 'pending'])),

            Stat::make('Published Today', Post::whereDate('published_at', today())->count())
                ->description('Articles published')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('success'),

            Stat::make('Total Published', Post::where('status', 'published')->count())
                ->description('All time')
                ->descriptionIcon('heroicon-m-newspaper')
                ->color('primary'),

            Stat::make('Total Engagement', 
                Post::withCount(['likes', 'saves'])
                    ->get()
                    ->sum(fn ($post) => $post->likes_count + $post->saves_count)
            )
                ->description('Likes + Saves')
                ->descriptionIcon('heroicon-m-heart')
                ->color('danger'),
        ];
    }
}
```

---

## 8. Authentication System

### 8.1 Laravel Sanctum Configuration

```php
<?php

// config/sanctum. php
return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,:: 1',
        env('APP_URL') ?  ',' .  parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    'guard' => ['web'],

    'expiration' => 60 * 24 * 7, // 7 days

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken:: class,
    ],
];
```

### 8.2 Auth Controller

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'uuid' => (string) Str::uuid(),
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->only(['uuid', 'name', 'email', 'avatar']),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Revoke previous tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->only(['uuid', 'name', 'email', 'avatar', 'role']),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'user' => $user->only(['uuid', 'name', 'email', 'avatar', 'role']),
            'stats' => [
                'likes_count' => $user->likes()->count(),
                'saves_count' => $user->saves()->count(),
            ],
        ]);
    }
}
```

### 8.3 Web Auth UI (Blade)

- Blade views for login/register (`resources/views/auth/*.blade.php`) backed by `AuthController` routes.
- Sanctum session cookies issued after login; CSRF tokens handled via Blade helpers.
- Guest prompts on like/save open a Blade-rendered modal (Alpine/Livewire) and post to `/login`.
- Profile pages pull user stats (likes, saves) via server-rendered controllers; AJAX endpoints return JSON for like/save toggles.

---

## 9. Caching Strategy

### 9.1 Redis Cache Configuration

```php
<?php

// config/cache.php
return [
    'default' => env('CACHE_DRIVER', 'file'),

    'stores' => [
        'file' => [
            'driver' => 'file',
            'path' => storage_path('framework/cache/data'),
        ],
    ],

    'prefix' => env('CACHE_PREFIX', 'curonews_cache_'),
];
```

### 9.2 Cache Keys & TTL Strategy

| Cache Key Pattern | TTL | Description |
|-------------------|-----|-------------|
| `posts:feed: page:{n}` | 5 min | Paginated feed results |
| `posts:category:{slug}: page:{n}` | 5 min | Category filtered posts |
| `posts:single:{uuid}` | 15 min | Single post details |
| `categories:all` | 1 hour | All categories list |
| `tags:popular` | 30 min | Popular tags |
| `user:{id}:likes` | 10 min | User's liked posts |
| `user:{id}:saves` | 10 min | User's saved posts |
| `stats:dashboard` | 5 min | Admin dashboard stats |

### 9.3 Cache Service

```php
<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;

class PostCacheService
{
    private const FEED_TTL = 300;      // 5 minutes
    private const SINGLE_TTL = 900;    // 15 minutes

    public function getFeed(int $page = 1, int $perPage = 20, ? string $category = null): LengthAwarePaginator
    {
        $cacheKey = $category 
            ? "posts:category:{$category}:page:{$page}" 
            : "posts:feed:page:{$page}";

        return Cache::remember($cacheKey, self::FEED_TTL, function () use ($page, $perPage, $category) {
            $query = Post::query()
                ->with(['category', 'tags'])
                ->withCount(['likes', 'saves'])
                ->where('status', 'published')
                ->orderByDesc('published_at');

            if ($category) {
                $query->whereHas('category', fn ($q) => $q->where('slug', $category));
            }

            return $query->paginate($perPage, ['*'], 'page', $page);
        });
    }

    public function getPost(string $uuid): ?Post
    {
        return Cache::remember(
            "posts:single:{$uuid}",
            self:: SINGLE_TTL,
            fn () => Post::query()
                ->with(['category', 'tags', 'sourcer: id,name'])
                ->withCount(['likes', 'saves'])
                ->where('uuid', $uuid)
                ->where('status', 'published')
                ->first()
        );
    }

    public function invalidatePost(Post $post): void
    {
        Cache::forget("posts:single:{$post->uuid}");
        
        // Invalidate feed caches (simplified - in production use cache tags)
        for ($i = 1; $i <= 10; $i++) {
            Cache::forget("posts: feed:page:{$i}");
            Cache::forget("posts:category:{$post->category->slug}:page:{$i}");
        }
    }

    public function invalidateFeed(): void
    {
        // Use cache tags in production for more efficient invalidation
        Cache::flush();
    }
}
```

---

## 10. Queue & Job Configuration

### 10.1 Queue Setup

```php
<?php

// config/queue.php
return [
    'default' => env('QUEUE_CONNECTION', 'database'),

    'connections' => [
        'database' => [
            'driver' => 'database',
            'table' => 'jobs',
            'queue' => 'default',
            'retry_after' => 90,
            'after_commit' => false,
        ],
    ],

    'batching' => [
        'database' => env('DB_CONNECTION', 'mysql'),
        'table' => 'job_batches',
    ],

    'failed' => [
        'driver' => env('QUEUE_FAILED_DRIVER', 'database-uuids'),
        'database' => env('DB_CONNECTION', 'mysql'),
        'table' => 'failed_jobs',
    ],
];
```

### 10.2 Queue Worker Configuration

```ini
# supervisor configuration:  /etc/supervisor/conf.d/curonews-worker.conf

[program:curonews-worker-default]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/curonews/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/curonews/storage/logs/worker. log
stopwaitsecs=3600

[program:curonews-worker-images]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/curonews/artisan queue:work redis --queue=images --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/curonews/storage/logs/worker-images.log
stopwaitsecs=3600

[program: curonews-worker-telegram]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/curonews/artisan queue:work redis --queue=telegram --sleep=3 --tries=5 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/curonews/storage/logs/worker-telegram.log
stopwaitsecs=3600
```

### 10.3 Job Classes Summary

| Job | Queue | Description | Retry |
|-----|-------|-------------|-------|
| `ProcessPostImage` | `images` | Generate 9: 16 processed image | 3 |
| `SendTelegramNotification` | `telegram` | Send post review notification | 5 |
| `UpdateTelegramMessage` | `telegram` | Update message after approval/rejection | 3 |
| `IncrementViewCount` | `default` | Async view counter update | 1 |
| `InvalidatePostCache` | `default` | Clear relevant caches | 1 |

---

## 11. Testing Strategy

### 11.1 Test Structure

```
tests/
├── Feature/
│   ├── Api/
│   │   ├── AuthTest.php
│   │   ├── PostsTest.php
│   │   ├── InteractionsTest.php
│   │   └── TelegramWebhookTest.php
│   ├── Filament/
│   │   ├── PostResourceTest.php
│   │   └── DashboardTest.php
│   └── Jobs/
│       ├── ProcessPostImageTest.php
│       └── SendTelegramNotificationTest.php
├── Unit/
│   ├── Models/
│   │   ├── PostTest.php
│   │   ├── UserTest.php
│   │   └── InteractionTest.php
│   └── Services/
│       ├── TelegramServiceTest. php
│       ├── ImageProcessingServiceTest.php
│       └── PostCacheServiceTest.php
└── TestCase.php
```

### 11.2 Example Feature Test

```php
<?php

namespace Tests\Feature\Api;

use App\Models\Post;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->category = Category::factory()->create();
    }

    public function test_guests_can_view_published_posts(): void
    {
        $posts = Post::factory()
            ->count(5)
            ->published()
            ->for($this->category)
            ->create();

        $response = $this->getJson('/api/posts');

        $response->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'uuid',
                        'title',
                        'slug',
                        'excerpt',
                        'image_processed',
                        'category',
                        'published_at',
                        'likes_count',
                        'saves_count',
                    ],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    public function test_guests_cannot_view_pending_posts(): void
    {
        Post::factory()->pending()->create();

        $response = $this->getJson('/api/posts');

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_authenticated_users_can_like_posts(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->published()->create();

        $response = $this->actingAs($user)
            ->postJson("/api/posts/{$post->uuid}/like");

        $response->assertOk()
            ->assertJson(['liked' => true]);

        $this->assertDatabaseHas('interactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'like',
        ]);
    }

    public function test_guests_cannot_like_posts(): void
    {
        $post = Post::factory()->published()->create();

        $response = $this->postJson("/api/posts/{$post->uuid}/like");

        $response->assertUnauthorized();
    }

    public function test_liking_twice_removes_like(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->published()->create();

        // First like
        $this->actingAs($user)->postJson("/api/posts/{$post->uuid}/like");
        
        // Second like (toggle off)
        $response = $this->actingAs($user)
            ->postJson("/api/posts/{$post->uuid}/like");

        $response->assertOk()
            ->assertJson(['liked' => false]);

        $this->assertDatabaseMissing('interactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'like',
        ]);
    }
}
```

### 11.3 UI Testing (Laravel)

- Feature tests cover feed rendering, pagination JSON endpoints, and like/save toggles.
- Blade component tests validate card layout (image, title, category badge) and modal partials.
- Optional Dusk tests for end-to-end flows: guest browsing, login prompt on like, and successful like/save after authentication.

---

## 12. Deployment Architecture

### 12.1 Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PRODUCTION INFRASTRUCTURE                       │
│                      (cPanel Shared Hosting)                         │
└─────────────────────────────────────────────────────────────────────┘

                ┌──────────────┐
                │  Cloudflare  │
                │   (DNS/CDN)  │
                │   Free SSL   │
                └──────┬───────┘
                    │
            ┌──────────▼──────────┐
            │    curonews.com     │
            │  (Laravel web + API │
            │   + /admin Filament)│
            └──────────┬──────────┘
                    │
            ┌──────────▼──────────┐
            │   cPanel Server     │
            │   (BDIX Advance)    │
            │                      │
            │  ┌─────────────────┐ │
            │  │   public_html/  │ │ ◄── Laravel app
            │  └─────────────────┘ │
            │                      │
            │  ┌─────────────────┐ │
            │  │     MySQL       │ │
            │  └─────────────────┘ │
            │                      │
            │  ┌─────────────────┐ │
            │  │  File Storage   │ │
            │  │ (local/Cloudinary)
            │  └─────────────────┘ │
            └──────────┬──────────┘
                    │
            ┌──────────▼──────────┐
            │ Telegram Bot API    │
            └─────────────────────┘
```

### 12.2 Environment Variables

```bash
# .env.production (Laravel)

APP_NAME=CuroNews
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.curonews.com

# Database (cPanel MySQL)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=curonews
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

# Queue (Database Driver - no Redis on shared hosting)
QUEUE_CONNECTION=database

# Cache (File-based for shared hosting)
CACHE_DRIVER=file
SESSION_DRIVER=file

# Storage (Local or Cloudinary)
FILESYSTEM_DISK=local
# Optional Cloudinary
CLOUDINARY_URL=${CLOUDINARY_URL}

# Telegram
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
TELEGRAM_ADMIN_GROUP_ID=${TELEGRAM_ADMIN_GROUP_ID}
TELEGRAM_WEBHOOK_SECRET=${TELEGRAM_WEBHOOK_SECRET}

# Sanctum
SANCTUM_STATEFUL_DOMAINS=curonews.com,www.curonews.com
SESSION_DOMAIN=.curonews.com
# CORS origins (web + admin on same host)
FRONTEND_URL=https://curonews.com
```

### 12.3 Deployment Process (cPanel)

```bash
# Deployment Steps for cPanel Shared Hosting (single Laravel app)

# 1. Upload codebase (public_html/ for web + /admin)
cd ~/curonews
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 2. Set up Cron Job in cPanel for Laravel Scheduler
# Add to Cron Jobs:
* * * * * cd ~/curonews && php artisan schedule:run >> /dev/null 2>&1

# 3. Queue Worker via Cron (database driver on shared hosting)
# Run queue worker every minute:
* * * * * cd ~/curonews && php artisan queue:work --queue=default,images,telegram --stop-when-empty >> /dev/null 2>&1
```

GitHub Actions (backend-only):

```
name: ci

on: [push, pull_request]

jobs:
    test-backend:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - name: Setup PHP
                uses: shivammathur/setup-php@v2
                with:
                    php-version: ${{ env.PHP_VERSION }}
                    extensions: mbstring, pdo, pdo_mysql, gd, imagick
            - name: Install Composer dependencies
                run: composer install --prefer-dist --no-progress
            - name: Copy .env
                run: cp .env.example .env
            - name: Generate key
                run: php artisan key:generate
            - name: Run migrations
                run: php artisan migrate --env=testing --force
            - name: Run tests
                run: php artisan test --coverage --min=80

    deploy-backend:
        needs: [test-backend]
        if: github.ref == 'refs/heads/main'
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - name: Deploy to Production
                uses: appleboy/ssh-action@v1.0.0
                with:
                    host: ${{ secrets.PRODUCTION_HOST }}
                    username: ${{ secrets.PRODUCTION_USER }}
                    key: ${{ secrets.PRODUCTION_SSH_KEY }}
                    script: |
                        cd /var/www/curonews
                        git pull origin main
                        composer install --no-dev --optimize-autoloader
                        php artisan migrate --force
                        php artisan config:cache
                        php artisan route:cache
                        php artisan view:cache
                        php artisan queue:restart
```
```

---

## 13. Security Considerations

### 13.1 Security Checklist

| Area | Implementation | Status |
|------|----------------|--------|
| **Authentication** | Laravel Sanctum with token expiration | ☐ |
| **CORS** | Strict origin whitelist | ☐ |
| **Rate Limiting** | 60 req/min guests, 120 req/min authenticated | ☐ |
| **Input Validation** | Form requests with strict validation | ☐ |
| **SQL Injection** | Eloquent ORM (parameterized queries) | ☐ |
| **XSS Prevention** | Content sanitization, CSP headers | ☐ |
| **CSRF** | Sanctum cookie-based CSRF | ☐ |
| **File Upload** | MIME validation, size limits, virus scan | ☐ |
| **Telegram Webhook** | Secret token verification | ☐ |
| **Admin Access** | Role-based middleware, 2FA (Phase 2) | ☐ |
| **Secrets Management** | Environment variables, no hardcoding | ☐ |
| **HTTPS** | Enforce TLS 1.3 | ☐ |

### 13.2 Rate Limiting Configuration

```php
<?php

// app/Providers/RouteServiceProvider.php

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

public function boot(): void
{
    RateLimiter::for('api', function (Request $request) {
        return $request->user()
            ?  Limit::perMinute(120)->by($request->user()->id)
            : Limit::perMinute(60)->by($request->ip());
    });

    RateLimiter::for('auth', function (Request $request) {
        return Limit::perMinute(5)->by($request->ip());
    });

    RateLimiter::for('interactions', function (Request $request) {
        return Limit::perMinute(30)->by($request->user()->id);
    });
}
```

---

## 14. Monitoring & Observability

### 14.1 Logging Configuration

```php
<?php

// config/logging.php
return [
    'default' => env('LOG_CHANNEL', 'stack'),

    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['daily', 'slack'],
            'ignore_exceptions' => false,
        ],

        'daily' => [
            'driver' => 'daily',
            'path' => storage_path('logs/laravel. log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'days' => 14,
        ],

        'slack' => [
            'driver' => 'slack',
            'url' => env('LOG_SLACK_WEBHOOK_URL'),
            'username' => 'CuroNews Bot',
            'emoji' => ':boom:',
            'level' => 'error',
        ],
    ],
];
```

### 14.2 Health Check Endpoint

```php
<?php

// routes/api.php
Route:: get('/health', function () {
    $checks = [
        'database' => fn () => DB::connection()->getPdo() !== null,
        'redis' => fn () => Redis::ping() === 'PONG',
        'storage' => fn () => Storage::disk('s3')->exists('. health'),
    ];

    $results = [];
    $healthy = true;

    foreach ($checks as $name => $check) {
        try {
            $results[$name] = $check() ? 'ok' : 'fail';
        } catch (\Exception $e) {
            $results[$name] = 'fail';
            $healthy = false;
        }
    }

    return response()->json([
        'status' => $healthy ?  'healthy' :  'unhealthy',
        'checks' => $results,
        'timestamp' => now()->toIso8601String(),
    ], $healthy ?  200 : 503);
});
```

---

## 15. Development Milestones & Timeline

### Sprint Breakdown

```
┌─────────────────────────────────────────────────────────────────────┐
│                     10-DAY DEVELOPMENT TIMELINE                      │
└─────────────────────────────────────────────────────────────────────┘

DAY 1-2: Foundation
├── [ ] Laravel project setup with best practices
├── [ ] Database migrations & seeders
├── [ ] Filament installation & configuration
├── [ ] Basic PostResource CRUD
├── [ ] User & role system
└── [ ] cPanel hosting setup

DAY 3-4: Content Workflow
├── [x] Sourcer submission flow
├── [x] Post status state machine
├── [x] Telegram bot setup & registration
├── [x] SendTelegramNotification job
├── [x] Webhook handler for button callbacks
└── [x] Admin approval/rejection actions (with optional feedback)

DAY 5-6: Image Processing
├── [ ] Intervention Image integration
├── [ ] ProcessPostImage job
├── [ ] 9:16 canvas generation
├── [ ] Blur effect implementation
├── [ ] Local/Cloudinary upload
└── [ ] Cron-based queue worker configuration

DAY 7-8: Laravel Web UI
├── [ ] Blade layout + Tailwind tokens
├── [ ] Bento grid cards (9:16) with blurred backdrop
├── [ ] Article modal (Blade partial + Alpine/Livewire)
├── [ ] Feed page with pagination / infinite scroll
└── [ ] Category filtering + search

DAY 9-10: Auth & Interactions
├── [ ] Sanctum authentication (session tokens)
├── [ ] Login/Register forms (Blade)
├── [ ] Like/Save functionality (AJAX endpoints + Livewire/Alpine)
├── [ ] User profile page (likes/saves collections)
├── [ ] Testing & bug fixes
└── [ ] Production deployment to cPanel

FUTURE (V2): Social Media Features
├── [ ] Social feed with personalized content
├── [ ] User-generated posts
├── [ ] Comments and reactions
├── [ ] Friend/follower system
├── [ ] Direct messaging and chats
└── [ ] Content sharing capabilities
```

### Design Decisions

| Question | Decision |
|----------|----------|
| **Telegram Edit Flow** | Opens web dashboard for editing |
| **Rejection Feedback** | Optional feedback field provided |
| **Draft Expiration** | Drafts do not expire |

---

## 16. Appendix

### 16.1 API Response Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation error |
| `401` | Unauthorized | Missing/invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `422` | Unprocessable | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Server Error | Unexpected error |

### 16.2 Useful Commands

```bash
# Backend (Laravel)
php artisan make:model Post -mfsc    # Model + Migration + Factory + Seeder + Controller
php artisan queue:work --queue=images,telegram,default
php artisan filament:make-resource Post --generate
php artisan test --filter=PostsTest

# Telegram Bot Setup
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://api.curonews. com/api/telegram/webhook" \
  -d "secret_token=<WEBHOOK_SECRET>"
```

### 16.3 External Resources

- [Laravel 11 Documentation](https://laravel.com/docs/11.x)
- [Filament PHP Documentation](https://filamentphp.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Intervention Image](https://image.intervention.io/v3)

---

## 17. Document Information

**Created by:** Shakib Bin Kabir  
**Last updated:** December 12, 2025

---

*CuroNews Engineering Team*