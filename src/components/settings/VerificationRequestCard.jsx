import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, CheckCircle2, XCircle, Crown } from "lucide-react";
import { toast } from "sonner";

const STATUS_UI = {
  pending:  { icon: Clock,          color: "bg-amber-100 text-amber-700 border-amber-200",  label: "Pending Review"  },
  approved: { icon: CheckCircle2,   color: "bg-green-100 text-green-700 border-green-200",  label: "Approved"        },
  rejected: { icon: XCircle,        color: "bg-red-100   text-red-700   border-red-200",    label: "Not Approved"    },
};

export default function VerificationRequestCard({ currentUser }) {
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ role_requested: "leader", church_or_org: "", message: "" });

  useEffect(() => {
    if (!currentUser?.email) return;
    base44.entities.VerificationRequest.filter({ user_email: currentUser.email })
      .then(results => {
        setExisting(results[0] || null);
        setLoading(false);
      });
  }, [currentUser]);

  const handleSubmit = async () => {
    if (!form.church_or_org.trim()) {
      toast.error("Please enter your church or organisation name.");
      return;
    }
    setSubmitting(true);
    await base44.entities.VerificationRequest.create({
      user_email: currentUser.email,
      user_name: currentUser.full_name || "",
      ...form,
    });
    const results = await base44.entities.VerificationRequest.filter({ user_email: currentUser.email });
    setExisting(results[0] || null);
    setSubmitting(false);
    toast.success("Verification request submitted! An admin will review it shortly.");
  };

  if (loading) return null;

  const statusInfo = existing ? STATUS_UI[existing.status] : null;
  const Icon = statusInfo?.icon;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          Leader / Pastor Verification
        </CardTitle>
        <CardDescription>
          Request verified access to the Leader Dashboard for managing groups, sessions, and challenges.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Already a leader */}
        {(currentUser?.is_leader || ["leader","pastor","admin"].includes(currentUser?.role)) && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              Your account already has leader access.
            </p>
          </div>
        )}

        {/* Existing request status */}
        {existing && !currentUser?.is_leader && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border ${statusInfo.color}`}>
            <Icon className="w-4 h-4 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{statusInfo.label}</p>
              <p className="text-xs opacity-75">
                {existing.status === "pending" && "Your request is under review. We'll update your account once approved."}
                {existing.status === "approved" && "Your account has been upgraded. Please refresh the page."}
                {existing.status === "rejected" && "Your request was not approved. Contact support for more info."}
              </p>
            </div>
          </div>
        )}

        {/* Submission form — only if no existing request and not already a leader */}
        {!existing && !currentUser?.is_leader && !["leader","pastor","admin"].includes(currentUser?.role) && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">I am a</Label>
              <div className="flex gap-2">
                {["leader", "pastor"].map(r => (
                  <button
                    key={r}
                    onClick={() => setForm(f => ({ ...f, role_requested: r }))}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                      form.role_requested === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {r === "pastor" ? "🙏 Pastor" : "👑 Leader"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Church / Organisation *</Label>
              <Input
                placeholder="e.g. Grace Community Church"
                value={form.church_or_org}
                onChange={e => setForm(f => ({ ...f, church_or_org: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Brief statement (optional)</Label>
              <Textarea
                placeholder="Tell us a bit about your role and ministry..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="min-h-[70px] text-sm"
              />
            </div>

            <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
              <ShieldCheck className="w-4 h-4" />
              {submitting ? "Submitting..." : "Request Verification"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}