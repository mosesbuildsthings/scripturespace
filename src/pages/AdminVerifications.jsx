import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_COLORS = {
  pending:  "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100   text-red-700   border-red-200",
};

export default function AdminVerifications() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [processing, setProcessing] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => { base44.auth.me().then(setCurrentUser); }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["verification-requests"],
    queryFn: () => base44.entities.VerificationRequest.list("-created_date", 100),
  });

  const handleAction = async (req, action) => {
    setProcessing(req.id);
    await base44.entities.VerificationRequest.update(req.id, { status: action });

    if (action === "approved") {
      // Grant leader access to the user
      const users = await base44.entities.User.filter({ email: req.user_email });
      if (users[0]) {
        await base44.entities.User.update(users[0].id, { role: req.role_requested, is_leader: true });
      }
      toast.success(`${req.user_name || req.user_email} approved as ${req.role_requested}!`);
    } else {
      toast.success("Request rejected.");
    }

    queryClient.invalidateQueries({ queryKey: ["verification-requests"] });
    setProcessing(null);
  };

  if (!currentUser) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!["admin"].includes(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldCheck className="w-12 h-12 text-muted-foreground" />
        <p className="text-lg font-semibold">Admin access required</p>
        <Link to="/Home"><Button variant="outline">Go Home</Button></Link>
      </div>
    );
  }

  const pending  = requests.filter(r => r.status === "pending");
  const reviewed = requests.filter(r => r.status !== "pending");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/LeaderDashboard">
          <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">Verification Requests</h1>
          <p className="text-sm text-muted-foreground">{pending.length} pending</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending</h2>
          {pending.map(req => (
            <RequestCard key={req.id} req={req} processing={processing} onAction={handleAction} />
          ))}
        </div>
      )}

      {reviewed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Reviewed</h2>
          {reviewed.map(req => (
            <RequestCard key={req.id} req={req} processing={processing} onAction={handleAction} />
          ))}
        </div>
      )}

      {!isLoading && requests.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No verification requests yet.</p>
        </div>
      )}
    </div>
  );
}

function RequestCard({ req, processing, onAction }) {
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{req.user_name || req.user_email}</p>
            <p className="text-xs text-muted-foreground">{req.user_email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {req.created_date ? format(new Date(req.created_date), "MMM d, yyyy") : ""}
            </p>
          </div>
          <Badge className={`text-xs capitalize border ${STATUS_COLORS[req.status]}`}>
            {req.status}
          </Badge>
        </div>

        <div className="text-sm space-y-1">
          <p><span className="text-muted-foreground">Role: </span><span className="font-medium capitalize">{req.role_requested}</span></p>
          {req.church_or_org && <p><span className="text-muted-foreground">Church: </span>{req.church_or_org}</p>}
          {req.message && <p className="text-muted-foreground italic">"{req.message}"</p>}
        </div>

        {req.status === "pending" && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              disabled={processing === req.id}
              onClick={() => onAction(req, "approved")}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
              disabled={processing === req.id}
              onClick={() => onAction(req, "rejected")}
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}