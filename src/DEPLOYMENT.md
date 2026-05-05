# Deployment Guide

Scripture Space is deployed on the **Base44 Platform**, a serverless infrastructure that handles frontend hosting, backend functions, database management, and payment processing.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Payment integration tested
- [ ] Badge system running
- [ ] Mobile/tablet/desktop responsive design verified
- [ ] Legal documents (Privacy Policy, Terms of Service) published

## Deployment Architecture

```
GitHub Repository
       ↓ (git push)
Base44 Platform
├── Frontend (Vite React)
│   ├── Static hosting
│   ├── Auto-rebuild & deploy
│   └── CDN distribution
├── Backend (Deno Functions)
│   ├── createCheckout
│   ├── wix-payments-webhook
│   ├── cancelSubscription
│   └── awardBadges
├── Database (SQLite)
│   ├── Entities
│   ├── Subscriptions
│   └── Automations
└── Payments (Base44 Payments / Wix Payments)
    ├── Checkout sessions
    ├── Webhook verification
    └── Subscription management
```

## Deploying to Base44

### Step 1: Connect GitHub Repository

1. Go to **Base44 Dashboard** → Your App → Settings
2. Click **"Connect GitHub"**
3. Authorize Base44 to access your GitHub account
4. Select the repository branch (default: `main`)
5. Base44 will auto-deploy on every push to that branch

### Step 2: Configure Environment Variables

In **Base44 Dashboard** → App Settings → Environment Variables:

```env
WIX_PAYMENTS_API_KEY=your_api_key_here
WIX_PAYMENTS_SITE_ID=your_site_id_here
WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY=your_public_key_here
```

### Step 3: Deploy Backend Functions

All functions in `src/functions/` are automatically deployed:

- `createCheckout.js` → `/api/createCheckout`
- `wix-payments-webhook.js` → `/api/wix-payments-webhook`
- `cancelSubscription.js` → `/api/cancelSubscription`
- `awardBadges.js` → `/api/awardBadges`

Test each function via the **Functions** tab in Base44 Dashboard.

### Step 4: Configure Automations

In **Base44 Dashboard** → Automations, verify these are active:

1. **Daily Badge Award Check**
   - Function: `awardBadges`
   - Schedule: Every day at 2:00 AM CT
   - Status: ✅ Active

2. **Payment Webhook Handler**
   - Function: `wix-payments-webhook`
   - Type: Connector (Wix Payments)
   - Events: order.approved, subscription_contract.canceled
   - Status: ✅ Active

### Step 5: Test Payment Flow

1. Navigate to **LeaderPremium** page in your app
2. Click **"Upgrade to Premium"**
3. Complete the Base44 Payments checkout
4. Verify:
   - Webhook triggers successfully
   - User role updated to "leader"
   - Subscription status changes to "active"
   - Verified badge appears on profile

### Step 6: Deploy to Production

```bash
git add .
git commit -m "Ready for production launch"
git push origin main
```

Base44 will automatically:
1. Build the frontend (Vite)
2. Deploy backend functions
3. Run database migrations
4. Update the live app at your custom domain

## Monitoring

### Logs & Errors

**Base44 Dashboard** → Logs:
- Frontend console errors
- Backend function logs
- Webhook events
- Failed requests

### Metrics

Monitor in **Base44 Dashboard** → Analytics:
- Daily active users
- Payment success rate
- Function execution time
- Database performance

### Alerts

Set up alerts for:
- High error rates (>1%)
- Payment webhook failures
- Backend function timeouts
- Database storage limits

## Rollback

If deployment has critical issues:

```bash
git revert HEAD
git push origin main
```

Base44 will redeploy the previous version automatically.

## Performance Optimization

### Frontend
- Vite build: automatic code splitting and minification
- Tailwind CSS: purge unused styles
- React Query: intelligent caching and revalidation
- Framer Motion: GPU-accelerated animations

### Backend
- Deno functions: serverless auto-scaling
- Database indexing: optimized queries on User, Post, Group entities
- Webhook batching: process multiple events efficiently
- Cache: subscriptions, user roles, settings

### Database
- Regular backups: automated daily
- Indexes: created on frequently queried fields
- Archiving: old logs and inactive user data

## Custom Domain

1. **Base44 Dashboard** → Settings → Custom Domain
2. Add your domain (e.g., `scripturespace.app`)
3. Update DNS records as instructed
4. SSL certificate: auto-provisioned by Base44

## Scaling

Scripture Space automatically scales based on demand:

- **Frontend:** CDN distribution (instant global delivery)
- **Backend:** Serverless functions scale to millions of requests
- **Database:** Auto-scaling SQLite with read replicas
- **Payments:** Base44 Payments handles millions of transactions

No manual scaling required.

## Disaster Recovery

Scripture Space has built-in disaster recovery:

- **Database Backups:** Every 4 hours, retained for 30 days
- **Version Control:** GitHub is source of truth
- **Redundancy:** Multi-region deployment
- **Failover:** Automatic if primary region fails

To restore from backup:

1. **Base44 Dashboard** → Database → Backups
2. Select backup date/time
3. Click "Restore"
4. Verify data integrity
5. Update all users if needed

## Maintenance

### Regular Tasks

- **Weekly:** Check error logs, review metrics
- **Monthly:** Review user feedback, audit security
- **Quarterly:** Performance optimization, feature updates
- **Annually:** Security audit, compliance check

### Update Dependencies

```bash
npm outdated              # Check for updates
npm update               # Update to compatible versions
npm audit fix            # Fix security vulnerabilities
npm run build            # Test build
git push origin main     # Deploy
```

## Post-Launch

### Day 1
- Monitor logs for errors
- Test payment flow with real transaction
- Verify badge awards run successfully
- Check mobile app experience

### Week 1
- Monitor daily active users (DAU)
- Check database performance
- Review user feedback
- Fix any critical bugs

### Month 1
- Analyze user behavior and feature adoption
- Optimize based on usage patterns
- Plan feature updates for Q2
- Security audit

## Support

For deployment issues:
- Check **Base44 Documentation:** https://docs.base44.app
- Review **Function Logs:** Base44 Dashboard → Logs
- Contact **Base44 Support:** support@base44.app

---

Scripture Space is production-ready. Deploy with confidence! 🚀