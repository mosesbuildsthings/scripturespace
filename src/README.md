# Scripture Space

**A modern, inclusive platform for spiritual growth, community connection, and Bible study.**

Scripture Space brings together a vibrant global community of believers to read Scripture, share reflections, pray together, and grow spiritually. Built for mobile, tablet, and web.

## Features

### 🙏 Prayer & Reflection
- **Prayer Board** — Share prayer requests and intercede for one another
- **Journal** — Private spiritual journaling with mood tracking and Scripture linking
- **Daily Devotional** — Guided daily Scripture reading with reflections

### 📖 Bible Study
- **1-Year Reading Plan** — Track progress through all 66 books with chapter-by-chapter navigation
- **Scripture Search** — Save verses with personal notes and highlight colors
- **Study Plans** — Create, follow, and share curated Bible study plans
- **Live Study Rooms** — Join real-time audio Bible study sessions with interactive Q&A

### 👥 Community
- **Social Feed** — Share spiritual insights, testimonies, and encouragement
- **Groups** — Create or join prayer groups, church groups, youth groups, and Bible studies
- **Reading Challenges** — Participate in group reading challenges with real-time progress tracking
- **User Profiles** — Connect with other believers, follow their journeys, send messages

### 📊 Personal Growth
- **Habit Tracking** — Monitor spiritual habits (prayer, fasting, worship, service)
- **Milestone Goals** — Set and achieve spiritual milestones
- **Achievement Badges** — Scripture Scholar, Prayer Warrior, Community Leader, Bible Expert
- **Analytics** — Visualize your spiritual progress over time

### 👨‍🏫 Leadership Tools
- **Premium for Leaders** — Verified pastor/leader badges, group management, live audio rooms
- **Group Management** — Manage members, create challenges, post announcements
- **Leader Dashboard** — Monitor ministry health, group engagement, and session statistics

## Getting Started

### For Users

1. **Visit** [Scripture Space](https://scripturespace.app)
2. **Sign Up** with your email
3. **Choose a Role** — Regular user or verify as pastor/leader
4. **Explore** — Start with the Feed, Prayer Board, or Bible Reading

### For Developers

#### Local Development

```bash
# Clone the repository
git clone https://github.com/scripture-space/scripture-space.git
cd scripture-space

# Install dependencies
npm install

# Start development server
npm run dev
```

Server will start at `http://localhost:5173`

#### Requirements
- Node.js 18+
- npm or yarn
- Base44 platform account (for backend)

#### Project Structure
```
src/
├── pages/            # Page components (30+ screens)
├── components/       # Reusable UI components
├── lib/             # Utilities, auth, query client
├── functions/       # Backend functions (Deno)
├── entities/        # Data schemas
├── hooks/           # Custom React hooks
└── utils/           # Helper functions
```

## Technology Stack

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Framer Motion
- React Query
- React Router

**Backend:**
- Base44 Platform (serverless)
- Deno runtime
- SQLite database
- Base44 Payments (Wix Payments)

**Real-Time:**
- WebRTC (peer-to-peer audio)
- Base44 Real-Time Subscriptions

## Key Entities

| Entity | Purpose |
|--------|---------|
| **Post** | Social feed posts with likes, comments, shares |
| **PrayerRequest** | Prayer requests with intercession tracking |
| **Group** | Community groups with members, challenges, announcements |
| **Challenge** | Reading challenges with progress tracking |
| **BibleStudySession** | Live or scheduled audio study rooms |
| **BibleStudyPlan** | Curated Scripture reading plans |
| **Goal** | Personal spiritual habits and milestones |
| **JournalEntry** | Private spiritual reflections with mood |
| **UserBadge** | Achievement badges earned through activity |
| **Subscription** | Premium leader subscription management |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete data model.

## Backend Functions

All backend functions are deployed serverlessly on Base44:

| Function | Purpose |
|----------|---------|
| `createCheckout` | Create Base44 Payments checkout session |
| `wix-payments-webhook` | Handle subscription order approvals & cancellations |
| `cancelSubscription` | Process subscription cancellation |
| `awardBadges` | Automated daily badge award logic |

See [API.md](./API.md) for detailed documentation.

## Deployment

Scripture Space is deployed on the **Base44 Platform**:
- **Frontend** — Vite build, auto-deployed on git push
- **Backend** — Serverless Deno functions
- **Database** — SQLite with real-time subscriptions
- **Payments** — Base44 Payments (Wix Payments integration)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Payment Integration

Scripture Space uses **Base44 Payments** for premium leader subscriptions:

- **Plan:** Leader/Pastor Premium — $7/month
- **Features Unlocked:**
  - Verified leader badge
  - Group management tools
  - Live audio room hosting
  - Advanced analytics
  - Group announcements

Payment flow is handled by `createCheckout` function with webhook confirmation via `wix-payments-webhook`.

## Environment Variables

Required for production:

```env
WIX_PAYMENTS_API_KEY=          # Base44 Payments API key
WIX_PAYMENTS_SITE_ID=          # Base44 Payments site ID
WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY= # JWT verification key
```

These are managed in the Base44 dashboard.

## Configuration

Customizable settings in `src/lib/app-params.js`:
- Theme colors
- Feature toggles
- API timeouts
- Navigation defaults

User-specific settings are stored in the User entity and can be modified via the Settings page.

## Security

- **Authentication** — Base44 Auth (email verification)
- **Authorization** — Role-based access control (admin, leader, user)
- **Privacy** — User-generated content is private by default
- **Payments** — PCI-compliant Base44 Payments
- **Data** — Encrypted in transit and at rest

See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) and [TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md).

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Code style
- Pull requests
- Reporting bugs
- Suggesting features

## Support

- **Email:** support@scripturespace.app
- **Issues:** [GitHub Issues](https://github.com/scripture-space/scripture-space/issues)
- **Docs:** [Documentation](https://docs.scripturespace.app)

## Roadmap

### Q3 2026
- [ ] Mobile app (iOS/Android via React Native)
- [ ] Offline reading mode
- [ ] Advanced search filters
- [ ] Analytics dashboard for leaders

### Q4 2026
- [ ] AI-powered study suggestions
- [ ] Multi-language Bible translations
- [ ] Video study content
- [ ] Community marketplace

## License

Scripture Space is licensed under the MIT License. See [LICENSE](./LICENSE).

---

**Scripture Space** — Growing together in faith, one verse at a time. 🙏