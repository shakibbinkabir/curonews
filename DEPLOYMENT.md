# CuroNews cPanel Deployment Guide

This guide covers deploying CuroNews (Laravel backend + Next.js frontend) to a cPanel hosting environment.

## Prerequisites

- cPanel hosting with:
  - PHP 8.2+ with required extensions (BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML)
  - MySQL 8.0+ or MariaDB 10.4+
  - Node.js selector (or SSH access to run Node.js)
  - Composer installed or accessible via SSH
  - SSL certificate (required for production)

## File Structure on Server

```
/home/username/
├── public_html/              # Frontend (Next.js static export or Node.js app)
│   └── api/                  # Symlink or proxy to backend
├── curonews-backend/         # Laravel backend (outside public_html)
│   ├── public/               # Laravel public folder (can symlink to public_html/api)
│   └── ...
└── curonews-frontend/        # Next.js source (if using Node.js)
```

---

## Part 1: Backend (Laravel) Deployment

### Step 1: Upload Backend Files

1. Compress your `backend` folder (excluding `node_modules`, `vendor`, `.env`)
2. Upload to `/home/username/curonews-backend/` via File Manager or FTP
3. Extract the files

### Step 2: Install Dependencies via SSH

```bash
cd ~/curonews-backend
composer install --no-dev --optimize-autoloader
```

### Step 3: Configure Environment

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your production values:
```env
APP_NAME="CuroNews"
APP_ENV=production
APP_KEY=  # Will be generated
APP_DEBUG=false
APP_URL=https://yourdomain.com/api

LOG_CHANNEL=daily
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

FILESYSTEM_DISK=public
QUEUE_CONNECTION=database

# If using Telegram notifications
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHANNEL_ID=your_channel_id
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret
```

### Step 4: Generate App Key & Run Migrations

```bash
php artisan key:generate
php artisan migrate --force
php artisan db:seed --class=CategorySeeder  # Optional: seed categories
php artisan storage:link
```

### Step 5: Optimize for Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### Step 6: Set Up Symbolic Link for API

Option A - Symlink (if cPanel allows):
```bash
ln -s ~/curonews-backend/public ~/public_html/api
```

Option B - Use .htaccess in public_html:
Create `public_html/api/.htaccess`:
```apache
RewriteEngine On
RewriteRule ^(.*)$ /home/username/curonews-backend/public/$1 [L]
```

### Step 7: Configure Apache/PHP

Create or edit `curonews-backend/public/.htaccess`:
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### Step 8: Set Permissions

```bash
cd ~/curonews-backend
chmod -R 755 storage bootstrap/cache
chown -R username:username storage bootstrap/cache
```

### Step 9: Set Up Cron Job (for queues)

In cPanel → Cron Jobs, add:
```
* * * * * cd /home/username/curonews-backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## Part 2: Frontend (Next.js) Deployment

### Option A: Static Export (Recommended for cPanel)

#### Step 1: Configure Next.js for Static Export

In `frontend/next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://yourdomain.com/api/v1',
  },
};

export default nextConfig;
```

#### Step 2: Build Locally

```bash
cd frontend
npm install
npm run build
```

This creates an `out` folder with static files.

#### Step 3: Upload to public_html

1. Upload contents of `out` folder to `public_html/`
2. The API folder should remain separate (symlink or proxy)

#### Step 4: Configure .htaccess for SPA Routing

Create `public_html/.htaccess`:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Don't rewrite API requests
    RewriteCond %{REQUEST_URI} ^/api [NC]
    RewriteRule ^ - [L]

    # Don't rewrite files or directories
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d

    # Rewrite everything else to index.html
    RewriteRule ^ /index.html [L]
</IfModule>

# Enable Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### Option B: Node.js App (if cPanel has Node.js Selector)

1. In cPanel → Setup Node.js App
2. Create new application:
   - Node.js version: 20.x
   - Application mode: Production
   - Application root: curonews-frontend
   - Application URL: yourdomain.com
   - Application startup file: server.js (or use next start)

3. In SSH:
```bash
cd ~/curonews-frontend
npm install
npm run build
```

4. Start the app via cPanel Node.js interface

---

## Part 3: Environment Variables

### Backend `.env.production` Template

```env
APP_NAME="CuroNews"
APP_ENV=production
APP_KEY=base64:GENERATED_KEY_HERE
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=https://yourdomain.com/api

LOG_CHANNEL=daily
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=curonews_db
DB_USERNAME=curonews_user
DB_PASSWORD=secure_password_here

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=public
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_DOMAIN=.yourdomain.com

CACHE_STORE=file
CACHE_PREFIX=curonews

SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com

CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Image Processing
IMAGE_DRIVER=gd

# Telegram (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
TELEGRAM_WEBHOOK_SECRET=
```

### Frontend `.env.production` Template

```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=CuroNews
```

---

## Part 4: Database Setup

### Create Database in cPanel

1. Go to MySQL Databases
2. Create new database: `curonews_db`
3. Create new user: `curonews_user` with strong password
4. Add user to database with ALL PRIVILEGES

### Import Schema

If you have a SQL dump:
```bash
mysql -u curonews_user -p curonews_db < database.sql
```

Or run migrations:
```bash
cd ~/curonews-backend
php artisan migrate --force
```

---

## Part 5: SSL Configuration

1. In cPanel → SSL/TLS Status
2. Install Let's Encrypt certificate for your domain
3. Enable "Force HTTPS Redirect" in cPanel → Domains

---

## Part 6: Post-Deployment Checklist

- [ ] Database migrated successfully
- [ ] Storage linked (`php artisan storage:link`)
- [ ] Cache cleared and rebuilt
- [ ] API endpoints accessible (test with Postman/curl)
- [ ] Frontend loads correctly
- [ ] Auth flow works (register, login, logout)
- [ ] Image uploads work
- [ ] CORS configured properly
- [ ] SSL working
- [ ] Cron job set up for queue processing
- [ ] Error logging working (check `storage/logs`)

---

## Troubleshooting

### 500 Internal Server Error
- Check `storage/logs/laravel.log`
- Ensure storage and cache are writable
- Verify `.env` configuration

### CORS Errors
- Check `CORS_ALLOWED_ORIGINS` in `.env`
- Verify `SANCTUM_STATEFUL_DOMAINS` matches your domain

### Auth Not Working
- Ensure `SESSION_DOMAIN` is set correctly
- Check `SANCTUM_STATEFUL_DOMAINS` includes your domain
- Verify API URL in frontend matches backend

### Images Not Loading
- Run `php artisan storage:link`
- Check file permissions on `storage/app/public`

### Queue Jobs Not Processing
- Verify cron job is set up correctly
- Check `QUEUE_CONNECTION=database` in `.env`
- Run `php artisan queue:table && php artisan migrate` if using database queue

---

## Maintenance Commands

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Run pending migrations
php artisan migrate --force

# Process queue manually
php artisan queue:work --once
```
