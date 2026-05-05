import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import * as jose from 'npm:jose@5.9.6';

const WEBHOOK_PUBLIC_KEY_PEM = Deno.env.get("WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY");

Deno.serve(async (req) => {
  try {
    if (!WEBHOOK_PUBLIC_KEY_PEM) {
      console.error("Missing WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY");
      return new Response("Missing webhook key", { status: 500 });
    }

    const base44 = createClientFromRequest(req);
    const requestBody = await req.text();

    // Verify JWT signature
    let rawPayload;
    try {
      const publicKey = await jose.importSPKI(WEBHOOK_PUBLIC_KEY_PEM, "RS256");
      const { payload } = await jose.jwtVerify(requestBody, publicKey, { algorithms: ["RS256"] });
      rawPayload = payload;
    } catch (verifyErr) {
      console.error("JWT verification failed:", verifyErr.message);
      return new Response("Invalid signature", { status: 401 });
    }

    // Double-nested JSON parsing
    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);
    const eventType = event.eventType;

    console.log("Webhook event type:", eventType);

    if (eventType === "wix.ecom.v1.order_approved") {
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;

      console.log("Order approved, checkoutId:", checkoutId);

      // Find pending subscription by checkout_id
      const pending = await base44.asServiceRole.entities.Subscription.filter({ checkout_id: checkoutId });
      if (!pending[0]) {
        console.warn("No pending subscription found for checkoutId:", checkoutId);
        return new Response("OK", { status: 200 });
      }

      const sub = pending[0];

      // Extract subscription ID from line items
      let subscriptionId = null;
      for (const lineItem of order.lineItems || []) {
        if (lineItem.subscriptionInfo?.id) {
          subscriptionId = lineItem.subscriptionInfo.id;
          break;
        }
      }

      // Activate subscription
      await base44.asServiceRole.entities.Subscription.update(sub.id, {
        status: "active",
        subscription_id: subscriptionId || "",
      });

      // Grant leader role to the user
      if (sub.user_email) {
        const users = await base44.asServiceRole.entities.User.filter({ email: sub.user_email });
        if (users[0]) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            role: "leader",
            is_leader: true,
          });
        }
      }

      console.log("Subscription activated for:", sub.user_email);

    } else if (
      eventType === "wix.ecom.subscription_contracts.v1.subscription_contract_canceled" ||
      eventType === "wix.ecom.subscription_contracts.v1.subscription_contract_expired"
    ) {
      const subscriptionContract = eventData.actionEvent.body.subscriptionContract;
      const subscriptionId = subscriptionContract.id;

      console.log("Subscription ended, id:", subscriptionId);

      // Find subscription by subscription_id
      const subs = await base44.asServiceRole.entities.Subscription.filter({ subscription_id: subscriptionId });
      if (!subs[0]) {
        console.warn("No subscription found for subscriptionId:", subscriptionId);
        return new Response("OK", { status: 200 });
      }

      const sub = subs[0];
      const newStatus = eventType.includes("canceled") ? "canceled" : "ended";

      await base44.asServiceRole.entities.Subscription.update(sub.id, { status: newStatus });

      // Revoke leader access
      if (sub.user_email) {
        const users = await base44.asServiceRole.entities.User.filter({ email: sub.user_email });
        if (users[0]) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            role: "user",
            is_leader: false,
          });
        }
      }

      console.log("Subscription deactivated for:", sub.user_email);
    } else {
      console.log("Unhandled event type:", eventType);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook handler error:", error.message);
    return new Response("Internal error", { status: 500 });
  }
});