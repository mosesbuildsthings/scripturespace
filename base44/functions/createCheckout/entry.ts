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

    const body = await req.json();
    const { plan, user_email } = body;

    const origin = req.headers.get("Origin") || "https://app.base44.com";
    const thankYouPageUrl = `${origin}/Home`;
    const postFlowUrl = `${origin}/Home`;

    // Create a pending subscription record to link this checkout to the user
    const pendingSubscription = await base44.asServiceRole.entities.Subscription.create({
      user_email: user_email || user.email,
      checkout_id: "__pending__", // will be updated below
      status: "pending",
      plan: plan || "leader_premium",
    });

    const requestBody = {
      cart: {
        items: [
          {
            name: "Leader / Pastor Premium",
            quantity: 1,
            price: "7.00",
            subscriptionInfo: {
              subscriptionSettings: {
                frequency: "MONTH",
              },
              title: "Leader Premium Monthly",
              description: "Verified badge, group management, live audio rooms & more",
            },
          },
        ],
        customerInfo: {
          email: user_email || user.email,
        },
      },
      callbackUrls: {
        postFlowUrl,
        thankYouPageUrl,
      },
    };

    const response = await fetch(
      "https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: WIX_API_KEY,
          "wix-site-id": WIX_SITE_ID,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Wix checkout error:", JSON.stringify(data));
      return Response.json({ error: data.message || "Failed to create checkout" }, { status: 500 });
    }

    const checkoutId = data.checkoutSession?.id;
    const checkoutUrl = data.checkoutSession?.redirectUrl;

    // Update pending subscription record with the real checkout_id
    if (checkoutId && pendingSubscription?.id) {
      await base44.asServiceRole.entities.Subscription.update(pendingSubscription.id, {
        checkout_id: checkoutId,
      });
    }

    return Response.json({ checkoutUrl, checkoutId });
  } catch (error) {
    console.error("createCheckout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});