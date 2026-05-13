import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Crown, Check, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const FEATURES = [
  "✅ Verified Leader / Pastor badge on your profile",
  "✅ Create and manage community groups",
  "✅ Host live audio Bible study rooms",
  "✅ Send group announcements",
  "✅ Create reading challenges for your members",
  "✅ Access to Leader Dashboard with analytics",
  "✅ Study plan templates library",
  "✅ Priority support",
];

export default function LeaderPremium() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      if (u?.email) {
        const subs = await base44.entities.Subscription.filter({ user_email: u.email });
        const active = subs.find(s => s.status === "active");
        if (active) setSubscription(active);
      }
    });
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("createCheckout", {
      plan: "leader_premium",
      user_email: user?.email,
    });
    if (res.data?.checkoutUrl) {
      window.location.href = res.data.checkoutUrl;
    }
    setLoading(false);
  };

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    setShowCancelDialog(false);
    await base44.functions.invoke("cancelSubscription", {
      subscription_id: subscription.subscription_id,
      user_email: user?.email,
    });
    setSubscription(null);
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display font-bold">Leader Premium</h1>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
        <Crown className="w-10 h-10 mb-3 opacity-90" />
        <h2 className="text-2xl font-bold font-display">Leader / Pastor</h2>
        <p className="text-amber-100 mt-1 text-sm">Elevate your ministry with powerful tools</p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-4xl font-bold">$7</span>
          <span className="text-amber-200 mb-1">/month</span>
        </div>
      </div>

      {/* Features */}
      <div className="bg-card rounded-2xl border p-5 space-y-3">
        <p className="text-sm font-semibold text-foreground">Everything included:</p>
        {FEATURES.map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span>{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      {subscription ? (
        <div className="space-y-3">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-green-700 dark:text-green-400">Active Subscription</p>
              <p className="text-xs text-green-600 dark:text-green-500">You have Leader Premium access.</p>
            </div>
          </div>
          <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-destructive border-destructive/30" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Subscription"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your Leader Premium access will remain active until the end of the current billing period, then it will be removed. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-2 pt-4">
                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleCancel}>
                  Yes, Cancel
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <Button
          className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg"
          onClick={handleCheckout}
          disabled={loading || !user}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Crown className="w-5 h-5 mr-2" /> Get Leader Premium — $7/mo</>}
        </Button>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Cancel anytime. Payments securely processed by Base44 Payments.
      </p>
    </div>
  );
}