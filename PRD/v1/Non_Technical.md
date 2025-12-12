# CuroNews - Product Requirements Document (Non-Technical)

**Version:** 1.0  
**Status:** Draft  
**Date:** December 12, 2025  
**Document Type:** Business & Stakeholder PRD

---

## 1. Product Vision

### What is CuroNews? 

CuroNews is a **premium health news discovery platform** that curates high-quality medical research, breaking health news, and wellness tips. Think of it as a beautifully designed magazine for health information—where every piece of content has been hand-picked and verified by real people before it reaches our readers.

### Why Does CuroNews Exist? 

In today's world, health misinformation is everywhere.  CuroNews solves this by: 

1. **Human-Verified Content** - Every article passes through a rigorous approval process
2. **Beautiful, Distraction-Free Design** - A calm, premium reading experience inspired by Apple's design philosophy
3. **Curated, Not Algorithmic** - Real experts select content, not automated systems

### Success Metrics (KPIs)

| Metric | Target (6 Months) | How We Measure |
|--------|-------------------|----------------|
| Monthly Active Users | 50,000 | Analytics dashboard |
| Content Published Weekly | 30+ articles | Admin panel metrics |
| User Engagement Rate | 15% like/save ratio | Interaction tracking |
| Average Session Duration | 4+ minutes | Analytics |
| Content Approval Time | < 2 hours | Workflow timestamps |

---

## 2. Who Are Our Users?

### User Personas

#### 👤 Sarah - The Health-Conscious Professional
- **Age:** 32
- **Occupation:** Marketing Manager
- **Behavior:** Checks health news during morning coffee, saves articles to read later
- **Need:** Quick, trustworthy health updates without clickbait
- **How CuroNews Helps:** Clean interface, save functionality, verified sources

#### 👤 Dr. Michael - The Healthcare Provider
- **Age:** 45
- **Occupation:** Family Physician
- **Behavior:** Shares relevant articles with patients, stays updated on research
- **Need:** Credible sources he can reference and share professionally
- **How CuroNews Helps:** Source attribution, research category, professional presentation

#### 👤 Emma - The Wellness Enthusiast
- **Age:** 28
- **Occupation:** Yoga Instructor
- **Behavior:** Browses wellness tips, shares on social media
- **Need:** Inspirational, visually appealing health content
- **How CuroNews Helps:** Beautiful card design, tips category, easy sharing

### User Access Levels

| User Type | What They Can Do |
|-----------|------------------|
| **Guest** | Browse feed, search articles, view full content |
| **Registered User** | Everything above + Like articles + Save to personal collection |
| **News Sourcer** | Submit draft articles for review (internal team) |
| **Admin** | Approve/reject content, edit articles, manage platform |

---

## 3. How the Product Works

### The Reader Experience

```
┌─────────────────────────────────────────────────────────────┐
│                    CURONEWS HOMEPAGE                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │         │  │         │  │         │  │         │        │
│  │  Card   │  │  Card   │  │  Card   │  │  Card   │        │
│  │  9:16   │  │  9:16   │  │  9:16   │  │  9:16   │        │
│  │         │  │         │  │         │  │         │        │
│  │ ♥ 🔖    │  │ ♥ 🔖    │  │ ♥ 🔖    │  │ ♥ 🔖    │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │         │  │         │  │         │  │         │        │
│  │  Card   │  │  Card   │  │  Card   │  │  Card   │        │
│  │  9:16   │  │  9:16   │  │  9:16   │  │  9:16   │        │
│  │         │  │         │  │         │  │         │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                             │
│              [ Load More Articles ]                         │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**

1. **Bento Grid Layout** - Articles displayed in a beautiful, organized grid (like a Japanese bento box)
2. **Portrait Cards** - Each card is tall (9:16 ratio, like a phone screen) for visual impact
3. **Smart Images** - System automatically makes all images look perfect, regardless of original size
4. **Quick Preview** - Click any card to see full article in a popup (no page reload)
5. **Like & Save** - Heart button to show appreciation, bookmark to save for later
6. **Infinite Scroll** - Content loads automatically as you scroll (or "Load More" button)

### The Content Workflow

This is what makes CuroNews special—our **human approval system**: 

```
┌──────────────────────────────────────────────────────────────────┐
│                     CONTENT APPROVAL FLOW                        │
└──────────────────────────────────────────────────────────────────┘

   STEP 1                STEP 2                STEP 3
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Sourcer │         │ Telegram │         │  Admin   │
│  Drafts  │ ──────► │  Alert   │ ──────► │ Reviews  │
│  Article │         │  Sent    │         │          │
└──────────┘         └──────────┘         └────┬─────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          │                    │                    │
                          ▼                    ▼                    ▼
                   ┌──────────┐         ┌──────────┐         ┌──────────┐
                   │    ✅    │         │    ❌    │         │    ✏️    │
                   │ APPROVE  │         │  REJECT  │         │   EDIT   │
                   │          │         │          │         │    &     │
                   │ Goes     │         │ Archived │         │ PUBLISH  │
                   │ Live!     │         │          │         │          │
                   └──────────┘         └──────────┘         └──────────┘
```

**How It Works:**

1. **Sourcer Creates Draft** - Team member finds interesting health news and writes it up
2. **Instant Telegram Alert** - Admin receives notification on their phone with preview
3. **Quick Decision** - Admin can approve, reject, or edit right from Telegram
4. **Published** - Approved content appears on the website immediately

---

## 4. Feature Details

### 4.1 The News Feed

| Feature | Description | User Benefit |
|---------|-------------|--------------|
| Bento Grid | Organized card layout | Easy to scan, visually pleasing |
| Category Filters | Research, News, Tips, etc. | Find relevant content quickly |
| Search | Find articles by keyword | Locate specific topics |
| Infinite Scroll | Content loads as you scroll | Seamless browsing experience |

### 4.2 Article Cards

Each card displays: 
- **Featured Image** (portrait format)
- **Title** (clear, readable)
- **Category Badge** (Research, News, Tips)
- **Like Button** (heart icon)
- **Save Button** (bookmark icon)

**The Magic Image System:**
No matter what shape an image the sourcer uploads, it will always look beautiful in our portrait card format. The system automatically creates a blurred background version to fill empty space. 

### 4.3 Article Detail View

When you click a card: 
- Smooth popup appears (Pinterest-style)
- Full article content displayed
- Source attribution shown
- Like and Save buttons available
- Easy close button to return to feed

### 4.4 User Accounts

**For Guests (Not Logged In):**
- Browse all content ✓
- Search articles ✓
- Read full articles ✓
- Like/Save → Prompts to create account

**For Registered Users:**
- All guest features ✓
- Like articles ✓
- Save articles to personal collection ✓
- View saved articles in profile ✓

### 4.5 Content Management

**Sourcer Dashboard:**
- Submit new article drafts
- View status of submitted articles (Pending/Approved/Rejected)
- Required fields:  Title, Content, Image, Category
- Optional fields: Tags, Source Name, Source Link

**Admin Dashboard:**
- View all articles (filterable by status)
- Approve pending articles
- Reject articles with feedback
- Edit any article before publishing
- Manage user accounts (Phase 2)

### 4.6 Telegram Integration

Admins receive instant notifications when new content is submitted: 

```
┌─────────────────────────────────────┐
│ 📰 NEW ARTICLE FOR REVIEW           │
├─────────────────────────────────────┤
│ [Article Image Preview]             │
│                                     │
│ Title: "New Study Shows..."         │
│ Sourcer: John Smith                 │
│ Category: Research                  │
│                                     │
│ "Scientists at Harvard have         │
│ discovered a new link between..."   │
│                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │✅Approve│ │❌Reject │ │✏️ Edit  ││
│ └─────────┘ └─────────┘ └─────────┘│
└─────────────────────────────────────┘
```

**Benefits:**
- No need to constantly check the dashboard
- Approve content from anywhere
- Faster content publishing
- Never miss a submission

---

## 5. Design Philosophy

### Visual Identity

| Element | Specification |
|---------|---------------|
| **Style** | Minimalist, Apple-inspired |
| **Layout** | Bento Box grid |
| **Whitespace** | Generous, breathable |
| **Corners** | Rounded (soft, friendly) |
| **Colors (Light)** | Off-white background (#F5F5F7) |
| **Colors (Dark)** | Deep charcoal (#121212) |
| **Typography** | Clean sans-serif (Inter) |

### Design Principles

1. **Calm Over Chaos** - No visual clutter, no overwhelming colors
2. **Content First** - Images and text are the heroes
3. **Consistent** - Every card looks the same size and shape
4. **Accessible** - Easy to read, easy to navigate
5. **Premium Feel** - Should feel like a high-end magazine

---

## 6. Content Categories

| Category | Description | Example Topics |
|----------|-------------|----------------|
| **Research** | Scientific studies and findings | Clinical trials, medical journals |
| **News** | Breaking health news | FDA approvals, health policies |
| **Tips** | Wellness and lifestyle advice | Exercise, nutrition, mental health |
| **Technology** | Health tech developments | Wearables, apps, AI in healthcare |
| **Nutrition** | Food and diet information | Diets, superfoods, meal planning |

---

## 7. Project Timeline

### Phase 1 Milestones (Current Scope - 10 Days)

```
Day 1-2: Foundation
├── Set up backend systems
├── Create admin dashboard
└── Basic database structure

Day 3-4: Approval Workflow
├── Telegram bot setup
├── Approval button functionality
└── Status management

Day 5-6: Frontend Development
├── Bento grid layout
├── Card component design
├── Image processing system
└── Article popup view

Day 7-8: User Features
├── User registration/login
├── Like functionality
├── Save functionality
└── User profile page

Day 9-10: Polish & Launch
├── Testing and bug fixes
├── Performance optimization
├── Content seeding
└── Launch! 🚀
```

### Future Phases (V2)

Version 2 will transform CuroNews into a full social media platform with features including:
- Social feed with personalized content
- User-generated posts
- Comments and reactions
- Friend/follower system
- Direct messaging and chats
- Content sharing capabilities

---

## 8. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Telegram bot downtime | Delayed approvals | Low | Email backup notification |
| Image processing slow | Poor user experience | Medium | Queue system with progress indicator |
| Content quality issues | User trust damage | Medium | Clear sourcer guidelines |
| Low user registration | Limited engagement data | Medium | Compelling sign-up benefits |

---

## 9. Design Decisions

| Question | Decision |
|----------|----------|
| **Telegram Edit Flow** | Opens web dashboard for editing |
| **Rejection Feedback** | Optional feedback field provided |
| **Draft Expiration** | Drafts do not expire |

---

## 10. Document Information

**Created by:** Shakib Bin Kabir  
**Last updated:** December 12, 2025

---

*CuroNews Product Team*