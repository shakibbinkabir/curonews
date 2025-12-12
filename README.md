# CuroNews

A premium health news discovery platform that curates high-quality medical research, breaking health news, and wellness tips with human-verified content.

## 🌟 Overview

CuroNews is a beautifully designed magazine-style platform for health information where every piece of content is hand-picked and verified by real people before reaching readers. Built with a minimalist, Apple-inspired design philosophy.

## ✨ Key Features

- **Human-Verified Content** - Every article passes through a rigorous approval process via Telegram
- **Bento Grid Layout** - Beautiful, organized card display (9:16 portrait format)
- **Smart Image Processing** - Automatic image optimization with blurred background effect
- **Like & Save** - Users can like articles and save them to personal collections
- **Real-time Approval** - Admins receive instant Telegram notifications for content review
- **Dark/Light Mode** - Premium reading experience in both themes

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Hosting** | cPanel Shared Hosting (BDIX Advance) |
| **Frontend** | Next.js 14+ (Static Export) |
| **Styling** | Tailwind CSS + Shadcn/UI |
| **State Management** | TanStack Query |
| **Backend** | Laravel 11 |
| **Admin Panel** | Filament PHP |
| **Database** | MySQL |
| **Image Processing** | Intervention Image |

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Guest** | Browse feed, search articles, view content |
| **User** | All guest features + Like & Save articles |
| **Sourcer** | Submit draft articles for review |
| **Admin** | Approve/reject content, edit articles, manage platform |

## 📁 Project Structure

```
curonews/
├── PRD/
│   └── v1/
│       ├── Non_Technical.md    # Business & stakeholder requirements
│       └── Technical.md        # Engineering specifications
├── index.html
└── README.md
```

## 🚀 Development Timeline (10 Days)

| Days | Focus |
|------|-------|
| 1-2 | Foundation (Laravel, Database, Filament) |
| 3-4 | Content Workflow (Telegram Bot, Approval System) |
| 5-6 | Image Processing (9:16 Canvas, Blur Effects) |
| 7-8 | Frontend (Next.js, Bento Grid, Components) |
| 9-10 | Auth & Interactions (Login, Like/Save, Deploy) |

## 📋 Content Categories

- **Research** - Scientific studies and findings
- **News** - Breaking health news
- **Tips** - Wellness and lifestyle advice
- **Technology** - Health tech developments
- **Nutrition** - Food and diet information

## 🔮 Future Plans (V2)

Version 2 will transform CuroNews into a full social media platform:
- Social feed with personalized content
- User-generated posts
- Comments and reactions
- Friend/follower system
- Direct messaging and chats
- Content sharing capabilities

## 📄 Documentation

- [Non-Technical PRD](PRD/v1/Non_Technical.md) - Business requirements and user stories
- [Technical PRD](PRD/v1/Technical.md) - Architecture, database schema, API specs

## � License

This project is **proprietary software**. All rights reserved.

No part of this software may be used, copied, modified, or distributed without prior written permission from the copyright holder. See [LICENSE](LICENSE) for details.

## �👤 Creator

**Shakib Bin Kabir**

---

*Last updated: December 12, 2025*
