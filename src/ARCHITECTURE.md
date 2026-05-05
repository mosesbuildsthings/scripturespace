# Architecture Guide

Scripture Space is built on a modern, scalable serverless architecture using the Base44 platform.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Scripture Space                         │
├──────────────────────┬──────────────────────────────────────┤
│   Frontend (React)   │        Backend (Base44)              │
├──────────────────────┼──────────────────────────────────────┤
│ • 30+ Pages          │ • Deno Serverless Functions         │
│ • 50+ Components     │ • SQLite Database                   │
│ • Real-time UI       │ • Real-time Subscriptions           │
│ • WebRTC Audio       │ • Base44 Payments Integration       │
│ • Responsive Design  │ • Automated Workflows (Cron)        │
└──────────────────────┴──────────────────────────────────────┘
```

## Frontend Architecture

### Pages (User-Facing Screens)

```
30 Core Pages
├── Home                     (Dashboard with daily Scripture)
├── Feed                     (Social posts)
├── CreatePost              (Post composer)
├── Scripture               (Bible search & reading)
├── Settings                (Personalization & notifications)
├── Study                    (Hub for all study tools)
│   ├── BibleReading        (1-Year plan tracker)
│   ├── Devotional          (Daily reflection)
│   ├── Journal             (Private journaling)
│   ├── Growth              (Habit & milestone tracking)
│   └── PrayerBoard         (Community prayer)
├── Groups                  (Group management)
├── BibleStudy             (Study plans & sessions)
├── BibleStudyPlanDetail   (Plan details & sessions)
├── ScheduleSession        (Schedule audio study)
├── BibleStudyRoom         (Live audio study room)
├── UserProfile            (User profiles + badges)
├── LeaderDashboard        (Leader management)
├── AdminVerifications     (Admin panel)
└── LeaderPremium          (Subscription)
```

### Components (Reusable UI)

```
50+ Components
├── Layout
│   ├── AppLayout           (Main layout with sidebar/bottom nav)
│   ├── MobileTopBar        (Mobile header)
│   └── Sidebar/BottomNav   (Navigation)
├── Feed
│   ├── PostCard            (Post display + interactions)
│   ├── CreatePostForm      (Composer)
│   └── CommentSection      (Comments on posts)
├── Bible
│   ├── ScriptureCard       (Daily Scripture display)
│   ├── BibleReader         (Reader view)
│   ├── BibleBookSelector   (Book selection)
│   ├── ChapterGrid         (Chapter grid)
│   ├── SavedVerses         (Saved verses list)
│   └── YearPlan            (1-Year plan view)
├── Study
│   ├── BibleReadingContent
│   ├── DevotionalContent
│   ├── JournalContent
│   ├── GrowthContent
│   └── PrayerContent
├── Prayer
│   ├── NewPrayerRequestForm
│   └── PrayerRequestCard
├── Journal
│   ├── NewJournalEntryForm
│   └── JournalEntryCard
├── Growth
│   ├── GoalCard
│   ├── NewGoalForm
│   └── GrowthCharts
├── Groups
│   ├── ChallengeCard       (Challenge display)
│   ├── CreateChallengeForm
│   └── GroupAnnouncementsPanel
├── Leader
│   ├── LeaderBadge         (Verified pastor badge)
│   ├── UserBadgeDisplay    (Achievement badges)
│   ├── StudyPlanTemplates
│   └── ProfileBadges
├── Profile
│   ├── MyCollection        (Saved verses)
│   ├── ReadingHistory      (Reading timeline)
│   ├── SendMessageDialog   (DM users)
│   └── ProfileBadges       (Activity badges)
├── Onboarding
│   └── LeaderOnboarding    (Role selection)
├── Settings
│   └── VerificationRequestCard
└── UI (Shadcn)
    ├── Button, Input, Textarea
    ├── Card, Badge, Tabs
    ├── Dialog, Dropdown, Select
    ├── Toast, Alert, Avatar
    └── ... (25+ components)
```

### State Management

```
React Query
├── Caching layer for entities
├── Automatic revalidation
├── Background sync
└── Optimistic updates

Context API
├── Authentication (AuthContext)
├── App-wide settings (AppLayout context)
└── Theme/navigation state

Local Storage
├── User preferences (theme, nav position)
└── Session tokens
```

### Real-Time Features

```
Base44 Real-Time Subscriptions
├── Post feed updates
├── Chat messages
├── Prayer request updates
├── Group announcements
├── Badge awards
└── Session status changes

WebRTC Peer-to-Peer
├── Audio streaming
├── Signaling via AudioSignal entity
└── ICE candidates
```

## Backend Architecture

### Entities (Database Schema)

```
17 Core Entities
├── User                    (Base44 built-in)
├── UserProfile            (Extended user data)
├── Post                   (Social posts)
├── Comment                (Post comments)
├── PrayerRequest          (Prayer requests)
├── Goal                   (Spiritual goals & habits)
├── JournalEntry           (Private journal entries)
├── Group                  (Community groups)
├── Challenge              (Reading challenges)
├── BibleStudyPlan         (Study plans)
├── BibleStudySession      (Live study rooms)
├── BibleProgress          (Reading progress)
├── SavedVerse             (Saved Scriptures)
├── Subscription           (Premium subscriptions)
├── UserBadge              (Achievement badges)
├── DirectMessage          (User DMs)
├── SessionChat            (Room chat)
└── AudioSignal            (WebRTC signaling)
```

### Backend Functions (Serverless)

```
Deno Functions (Auto-Deployed)
├── createCheckout         (Create payment checkout)
├── wix-payments-webhook   (Handle payment events)
├── cancelSubscription     (Cancel user subscription)
└── awardBadges           (Automated badge awards)
```

### Automations (Scheduled & Event-Driven)

```
Scheduled Automations
└── Daily Badge Award Check
    ├── Time: 2:00 AM CT
    ├── Function: awardBadges
    └── Logic: Audit posts, prayers, and assign badges

Entity Automations
(None currently, extensible)

Webhook Automations
└── Base44 Payments Events
    ├── Events: order.approved, subscription_contract.canceled
    └── Function: wix-payments-webhook
```

## Data Flow

### User Registration & Login

```
User
  ↓ (sign up/login)
Base44 Auth
  ↓ (token issued)
Frontend (React)
  ↓ (store token)
AuthContext
  ↓ (check is_leader)
LeaderOnboarding or Dashboard
```

### Social Feed Update

```
User Posts
  ↓ (create)
POST entity
  ↓ (webhook)
Real-Time Subscription
  ↓ (all users notified)
Feed component (React Query refetch)
  ↓ (optimistic update)
UI renders new post
```

### Prayer Request Flow

```
User Creates Prayer Request
  ↓
PrayerRequest entity
  ↓ (real-time sub)
All users see in PrayerBoard
  ↓
User clicks "Praying"
  ↓
praying_users array updated
  ↓ (real-time sub)
Count increments for all viewers
```

### Bible Reading Progress

```
User marks chapter read
  ↓
BibleProgress entity created
  ↓
BibleReading component checks progress
  ↓
Streak calculated
  ↓
Goal completion tracked
  ↓
Growth analytics updated
```

### Badge Award Flow

```
Daily (2 AM CT)
  ↓
awardBadges function runs
  ↓ (automated)
COUNT posts by user
COUNT prayer participations
  ↓
Compare to thresholds
  ↓
Create UserBadge entities
  ↓
User profiles display badges
  ↓
Real-time notification
```

### Payment Flow

```
User clicks "Upgrade"
  ↓
LeaderPremium page
  ↓
User selects plan ($7/mo)
  ↓
createCheckout function
  ↓ (calls Base44 Payments API)
Checkout session created
  ↓
User redirected to Wix Payments
  ↓
User completes payment
  ↓
Webhook: order.approved
  ↓
wix-payments-webhook function
  ↓ (verifies JWT signature)
Subscription record updated
User role set to "leader"
  ↓
User redirected to thank you page
  ↓
Verified badge on profile
```

### Group Challenge Tracking

```
Leader creates challenge
  ↓
Challenge entity created
  ├── readings: [{book, chapter}]
  └── participant_progress: []
  ↓
Members join group
  ↓
User marks chapter complete
  ↓
Challenge.participant_progress updated
  ↓
Real-time updates
  ↓
Progress shown in ChallengeCard
```

## Technology Choices

### Why React?
- Large component ecosystem
- Excellent DevX
- Strong community & libraries
- Suitable for complex UIs

### Why Tailwind CSS?
- Utility-first approach
- Responsive design out of the box
- Rapid prototyping
- Small bundle size

### Why Base44?
- Serverless backend (no ops)
- Built-in auth & database
- Real-time subscriptions
- Payment integration
- Automated workflows

### Why WebRTC?
- Peer-to-peer audio (no server bandwidth)
- Low latency
- Open standard
- Works on mobile

### Why SQLite?
- Built into Base44
- Zero setup
- Sufficient for current scale
- Can migrate to PostgreSQL if needed

## Scalability

### Horizontal Scaling

```
Users Grow
  ↓
React: Lazy-code splitting, tree-shaking
Database: Indexes on hot tables
Functions: Auto-scaling per Base44
Payments: Wix Payments handles millions
```

### Caching Strategy

```
Frontend
├── React Query (API caching)
├── Browser cache (static assets)
└── LocalStorage (user preferences)

Backend
├── Database indexes
├── Materialized views (growth stats)
└── Webhook batching
```

### Performance Targets

- **Page Load:** < 2 seconds
- **API Response:** < 500ms
- **Real-time Update:** < 1 second
- **Payment Checkout:** < 3 seconds

## Security

### Authentication
- Base44 Auth (email verification)
- Session tokens (secure cookies)
- OAuth-ready (future integrations)

### Authorization
- Role-based access (admin, leader, user)
- Row-level security (user owns their data)
- Function-level checks

### Data Protection
- HTTPS/TLS in transit
- Encrypted at rest
- PCI-compliant payments (Wix Payments)
- Privacy Policy & Terms of Service

### Input Validation
- Frontend: React Hook Form validation
- Backend: Function-level schema validation
- Database: Entity constraints

## Monitoring & Observability

### Logs
- Frontend errors (console)
- Backend function logs (Deno)
- Webhook events (Base44)
- Database queries

### Metrics
- User signup rate
- Daily active users
- Payment success rate
- Function execution time
- Error rate

### Alerts
- High error rate (>1%)
- Payment webhook failures
- Function timeouts
- Database issues

## Future Architecture

### Phase 2 (Q3 2026)
- Mobile app (React Native)
- Offline sync (IndexedDB)
- Video content storage (CDN)
- Advanced search (Elasticsearch)

### Phase 3 (Q4 2026)
- AI integration (LLM recommendations)
- Multi-language support (i18n)
- Community marketplace (Stripe Connect)
- Analytics dashboard

### Phase 4 (2027)
- Custom deployments (on-premise)
- API for third-party integrations
- Advanced admin panel
- Multi-tenant support

---

Scripture Space architecture prioritizes **simplicity**, **scalability**, and **user experience**. 🏗️