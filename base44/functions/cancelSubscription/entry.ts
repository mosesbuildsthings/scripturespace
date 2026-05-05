import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const WIX_API_KEY = Deno.env.get("WIX_PAYMENTS_API_KEY");
const WIX_SITE_ID = Deno.env.get("WIX_PAYMENTS_SITE_ID");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscription_id, user_email } = await req.json();

    if (!subscription_id) {
      return Response.json({ error: "subscription_id is required" }, { status: 400 });
    }

    // Ensure the requesting user owns this subscription
    const subs = await base44.asServiceRole.entities.Subscription.filter({ subscription_id });
    if (!subs[0]) {
      return Response.json({ error: "Subscription not found" }, { status: 404 });
    }
    if (subs[0].user_email !== user.email) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const response = await fetch(
      `https://www.wixapis.com/payments/base44/v1/subscriptions/${subscription_id}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: WIX_API_KEY,
          "wix-site-id": WIX_SITE_ID,
        },
        body: JSON.stringify({
          subscription_id,
          reason: "Canceled by user",
          immediate: false,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Soft cancel may fail — try immediate cancel
      console.warn("Soft cancel failed, trying immediate:", JSON.stringify(data));
      const retryResponse = await fetch(
        `https://www.wixapis.com/payments/base44/v1/subscriptions/${subscription_id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: WIX_API_KEY,
            "wix-site-id": WIX_SITE_ID,
          },
          body: JSON.stringify({
            subscription_id,
            reason: "Canceled by user",
            immediate: true,
          }),
        }
      );

      if (!retryResponse.ok) {
        const retryData = await retryResponse.json();
        console.error("Immediate cancel also failed:", JSON.stringify(retryData));
        return Response.json({ error: "Failed to cancel subscription" }, { status: 500 });
      }
    }

    // Update local record
    await base44.asServiceRole.entities.Subscription.update(subs[0].id, { status: "canceled" });

    return Response.json({ success: true });
  } catch (error) {
    console.error("cancelSubscription error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});