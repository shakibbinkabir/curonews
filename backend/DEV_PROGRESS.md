# CuroNews Development Progress

## Day 1-2: Foundation Setup ✅ COMPLETED

### Environment Setup
- ✅ PHP 8.2.12 verified (via XAMPP)
- ✅ Composer 2.x verified
- ✅ `intl` extension enabled in php.ini
- ✅ MySQL via XAMPP

### Laravel Installation
- ✅ Laravel 12.42.0 installed (upgraded from planned v11)
- ✅ Project location: `c:\Users\shaki\Desktop\curonews\backend`
- ✅ Database: `curonews` (MySQL)
- ✅ Storage link created for file uploads

### Database Schema
Created migrations for all core tables:

1. **users** (modified default)
   - Added: `uuid`, `role` (enum: guest, user, sourcer, admin), `avatar`, `telegram_chat_id`

2. **categories**
   - Fields: `name`, `slug`, `description`, `color`, `icon`, `sort_order`, `is_active`

3. **tags**
   - Fields: `name`, `slug` (unique)

4. **posts**
   - Fields: `uuid`, `title`, `slug`, `excerpt`, `content`, `source_url`, `image_path`, `status` (enum: draft, pending, approved, rejected)
   - Foreign keys: `sourcer_id`, `approved_by`, `category_id`
   - Fulltext index on title, excerpt, content

5. **post_tag** (pivot table)
   - Connects posts and tags (many-to-many)

6. **interactions**
   - Fields: `user_id`, `post_id`, `type` (enum: like, save)

### Eloquent Models
Created all models with proper relationships:

- **User** - Implements FilamentUser, has roles, relationships to posts and interactions
- **Category** - Posts relationship, active scope, auto-slug generation
- **Tag** - Posts relationship, auto-slug generation
- **Post** - Full relationships, status methods (approve/reject), image URL accessors
- **Interaction** - Toggle functionality for likes/saves

### Database Seeders
- **UserSeeder**: Creates admin, sourcer, and user accounts
- **CategorySeeder**: Creates 5 health categories with colors
- **TagSeeder**: Creates 20 health-related tags

### Filament Admin Panel
- ✅ Installed Filament v4.3.1 (upgraded from planned v3 for Laravel 12 compatibility)
- ✅ Admin panel at: `/admin`

**Resources Created:**
- **PostResource** - Full CRUD with image upload, tag selection, status workflow
- **CategoryResource** - CRUD with color picker, icon selection
- **TagResource** - Simple CRUD
- **UserResource** - Admin-only, role management

**Navigation Groups:**
- Content Management (Posts, Categories, Tags)
- User Management (Users - admin only)

---

## Login Credentials

| Role    | Email               | Password |
|---------|---------------------|----------|
| Admin   | admin@curonews.com  | password |
| Sourcer | sourcer@curonews.com| password |
| User    | user@curonews.com   | password |

---

## How to Run

```powershell
# Navigate to backend
cd c:\Users\shaki\Desktop\curonews\backend

# Start development server
php artisan serve

# Access admin panel
# http://127.0.0.1:8000/admin
```

---

## cPanel Deployment Notes (For Later)

### Prerequisites
1. cPanel hosting with SSH access
2. PHP 8.2+ with extensions: `intl`, `pdo_mysql`, `fileinfo`, `mbstring`
3. MySQL database
4. Composer access (or upload vendor folder)

### Deployment Steps
1. Upload all files except `node_modules` and `.git`
2. Create MySQL database in cPanel
3. Update `.env` with production database credentials
4. Set `APP_ENV=production`, `APP_DEBUG=false`
5. Run migrations: `php artisan migrate --force`
6. Run seeders (first time): `php artisan db:seed`
7. Set document root to `public` folder
8. Set folder permissions:
   ```bash
   chmod -R 755 storage bootstrap/cache
   ```
9. Create storage link: `php artisan storage:link`

---

## Next Steps (Day 3+)

### API Development
- [ ] Install Laravel Sanctum
- [ ] Create API routes for posts, categories, tags
- [ ] Implement authentication endpoints
- [ ] Add interaction endpoints (like/save)

### Frontend (Next.js)
- [ ] Set up Next.js 14 project
- [ ] Configure Tailwind CSS
- [ ] Create homepage with post cards
- [ ] Implement infinite scroll
- [ ] Add search functionality

### Telegram Bot
- [ ] Create Telegram bot via BotFather
- [ ] Set up webhook
- [ ] Implement notification system

---

## Technical Notes

### Version Changes from PRD
| Planned        | Actual          | Reason                    |
|----------------|-----------------|---------------------------|
| Laravel 11     | Laravel 12      | Latest stable release     |
| Filament v3    | Filament v4.3.1 | Required for Laravel 12   |

### Filament v4 API Differences
- Uses `Schema` instead of `Form` in form methods
- Navigation properties require methods instead of static strings
- Form/Table components split into separate files in new structure

---

*Last Updated: December 12, 2024*
