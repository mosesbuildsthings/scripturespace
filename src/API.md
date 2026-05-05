# Backend API Documentation

Scripture Space exposes a REST API through serverless functions on the Base44 platform.

## Authentication

All functions require a valid Base44 auth token (stored in secure cookies automatically).

For public endpoints, authentication is optional but recommended to provide personalized responses.

## Base URL

```
Production: https://scripturespace.app/api
Development: http://localhost:5173/api
```

## Functions

### 1. Create Checkout Session

**Endpoint:** `POST /createCheckout`

Creates a Base44 Payments checkout session for premium subscription.

#### Request

```json
{
  "plan": "leader_premium"
}
```

#### Response (Success)

```json
{
  "checkoutUrl": "https://payments.wix.com/checkout/...",
  "checkoutId": "checkout_1234567890"
}
```

#### Response (Error)

```json
{
  "error": "Unauthorized",
  "status": 401
}
```

#### Status Codes
- `200` — Checkout session created
- `400` — Invalid plan
- `401` — User not authenticated
- `500` — Server error (check logs)

#### Notes
- Redirects user to Wix Payments checkout page
- Saves pending subscription record
- Webhook confirms payment

---

### 2. Payment Webhook Handler

**Endpoint:** `POST /wix-payments-webhook`

Handles webhook events from Base44 Payments (Wix Payments integration).

**Events Handled:**
- `wix.ecom.v1.order_approved` — Subscription payment approved
- `wix.ecom.subscription_contracts.v1.subscription_contract_canceled` — Subscription canceled
- `wix.ecom.subscription_contracts.v1.subscription_contract_expired` — Subscription expired

#### Request (Example: Order Approved)

```json
{
  "entity": {
    "entityFurl": "wix.ecom.v1.order_approved",
    "eventBody": "{...jwt_signed_body...}"
  }
}
```

#### Internal Logic

**On `order_approved`:**
1. Verify JWT signature using `WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY`
2. Parse order details
3. Find Subscription record by checkout_id
4. Update subscription:
   - `status` → "active"
   - `subscription_id` → Wix subscription contract ID
5. Update User:
   - `role` → "leader"
6. Log event

**On `subscription_contract_canceled` or `expired`:**
1. Find Subscription record by subscription_id
2. Update subscription `status` → "canceled" or "ended"
3. Update User `role` → "user"
4. Log event

#### Response

```json
{
  "success": true
}
```

#### Status Codes
- `200` — Event processed successfully
- `400` — Invalid signature
- `500` — Server error

---

### 3. Cancel Subscription

**Endpoint:** `POST /cancelSubscription`

Cancels an active premium subscription.

#### Request

```json
{
  "subscriptionId": "sub_1234567890"
}
```

#### Response (Success)

```json
{
  "success": true,
  "message": "Subscription canceled"
}
```

#### Response (Error)

```json
{
  "error": "Subscription not found"
}
```

#### Status Codes
- `200` — Subscription canceled
- `404` — Subscription not found
- `401` — User not authenticated
- `403` — User is not subscription owner
- `500` — Server error

#### Notes
- User role reverts to "user"
- Leader dashboard becomes inaccessible
- Verified badge removed from profile
- Access to group management tools revoked

---

### 4. Award Badges

**Endpoint:** `POST /awardBadges`

Runs automated badge award logic. Called daily at 2:00 AM CT via scheduled automation.

#### Request

```json
{}
```

#### Response (Success)

```json
{
  "success": true,
  "message": "Badges awarded"
}
```

#### Automated Logic

**Scripture Scholar Badge** (50+ posts)
- Count posts by user where `author_email` matches
- If count ≥ 50, create UserBadge

**Prayer Warrior Badge** (25+ prayer participations)
- Count appearances in PrayerRequest `praying_users` arrays
- If count ≥ 25, create UserBadge

**Community Leader Badge** (exceptional impact)
- Count: posts + comments + prayer participations
- If total ≥ 100, create UserBadge

**Bible Expert Badge** (250+ posts)
- Count posts by user
- If count ≥ 250, create UserBadge

#### Threshold Adjustments

Edit `functions/awardBadges.js` to modify thresholds:

```javascript
const THRESHOLDS = {
  scripture_scholar: 50,
  prayer_warrior: 25,
  community_leader: 100,
  bible_expert: 250
};
```

---

## Entity Operations

While not technically API endpoints, the Base44 SDK provides full CRUD access to entities:

### Create

```javascript
const post = await base44.entities.Post.create({
  author_email: "user@example.com",
  author_name: "John",
  content: "Great Scripture today!"
});
```

### Read

```javascript
const posts = await base44.entities.Post.list("-created_date", 20);
const post = await base44.entities.Post.read(postId);
const userPosts = await base44.entities.Post.filter({ author_email: "user@example.com" });
```

### Update

```javascript
await base44.entities.Post.update(postId, {
  likes: [...post.likes, "newuser@example.com"]
});
```

### Delete

```javascript
await base44.entities.Post.delete(postId);
```

### Real-Time Subscription

```javascript
const unsubscribe = base44.entities.Post.subscribe(event => {
  console.log(`Post ${event.id} was ${event.type}d`);
  // Refresh UI
});

// Later: unsubscribe()
```

---

## Error Handling

All functions return errors in this format:

```json
{
  "error": "Human-readable error message",
  "status": 400,
  "details": "Optional debugging info"
}
```

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 401 | Unauthorized | User not logged in; call base44.auth.redirectToLogin() |
| 403 | Forbidden | User lacks required role; check user.role |
| 404 | Not Found | Resource doesn't exist; verify ID |
| 500 | Server Error | Check Base44 Dashboard logs |

---

## Rate Limiting

Base44 Payments checkout: **5 requests per minute per user**

If limit exceeded, response includes `Retry-After` header.

---

## Webhook Security

**Signature Verification:**

Base44 Payments signs all webhook payloads with JWT using `WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY`.

The `wix-payments-webhook` function automatically verifies:

```javascript
const publicKey = Deno.env.get("WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY");
// Verify JWT signature before processing
```

Never trust webhook data without verifying the signature.

---

## Testing

### Local Testing

```bash
# Test createCheckout
curl -X POST http://localhost:5173/api/createCheckout \
  -H "Content-Type: application/json" \
  -d '{"plan": "leader_premium"}'

# Test awardBadges
curl -X POST http://localhost:5173/api/awardBadges
```

### Production Testing

Use Base44 Dashboard **Functions** tab to test with mock payloads.

---

## Examples

### Example 1: User Signs Up for Premium

```javascript
// Frontend
const response = await base44.functions.invoke('createCheckout', {
  plan: 'leader_premium'
});
const { checkoutUrl } = response.data;
window.location.href = checkoutUrl;
```

### Example 2: Webhook Processes Payment

```
1. User completes payment on Wix Payments
2. Webhook sent to wix-payments-webhook
3. Function verifies JWT signature
4. Subscription activated
5. User role set to "leader"
6. Frontend detects role change, shows verified badge
```

### Example 3: Badge Award Runs

```
2:00 AM CT
  ↓
awardBadges function triggers
  ↓
SELECT * FROM Post WHERE author_email = ? COUNT
  ↓
If count ≥ 50, INSERT UserBadge
  ↓
Real-time subscription notifies user profile
  ↓
Badge displays on profile
```

---

## Support

For API issues:
- Check **Base44 Docs:** https://docs.base44.app
- Review **Function Logs:** Base44 Dashboard → Logs
- Contact **Support:** support@scripturespace.app

---

Scripture Space API is production-ready and fully documented. 📚