import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Crown, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LeaderOnboarding({ onComplete }) {
  const [selected, setSelected] = useState(null); // "leader" | "regular"
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    const isLeader = selected === "leader";
    await base44.auth.updateMe({
      is_leader: isLeader,
      role: isLeader ? "leader" : "user",
    });
    setSaving(false);
    onComplete(isLeader);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-[0_4px_24px_hsl(var(--primary)/0.45)]">
          <BookOpen className="w-7 h-7 text-primary-foreground" />
        </div>
        <h1 className="font-display font-bold text-2xl text-foreground">Welcome to BibleSocial</h1>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          Before you dive in, tell us a little about yourself so we can set up the right experience for you.
        </p>
      </div>

      {/* Question */}
      <p className="text-base font-semibold text-foreground mb-4 text-center">
        Are you a pastor or leader of a faith community?
      </p>

      {/* Options */}
      <div className="w-full max-w-sm space-y-3 mb-8">
        <button
          onClick={() => setSelected("leader")}
          className={cn(
            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left",
            selected === "leader"
              ? "border-amber-500 bg-amber-500/10 shadow-[0_0_0_1px_hsl(36,88%,50%/0.30)]"
              : "border-border hover:border-primary/40 hover:bg-accent/40"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
            selected === "leader" ? "bg-amber-500/20" : "bg-muted"
          )}>
            <Crown className={cn("w-5 h-5", selected === "leader" ? "text-amber-600" : "text-muted-foreground")} />
          </div>
          <div>
            <p className={cn("font-semibold text-sm", selected === "leader" ? "text-amber-700 dark:text-amber-400" : "text-foreground")}>
              Yes, I'm a pastor or community leader
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You'll get leader tools: group management, dashboards, and community features.
            </p>
          </div>
        </button>

        <button
          onClick={() => setSelected("regular")}
          className={cn(
            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left",
            selected === "regular"
              ? "border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.30)]"
              : "border-border hover:border-primary/40 hover:bg-accent/40"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
            selected === "regular" ? "bg-primary/15" : "bg-muted"
          )}>
            <Users className={cn("w-5 h-5", selected === "regular" ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div>
            <p className={cn("font-semibold text-sm", selected === "regular" ? "text-primary" : "text-foreground")}>
              No, I'm a regular member
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Join communities, read scripture, journal, and connect with others.
            </p>
          </div>
        </button>
      </div>

      <Button
        className="w-full max-w-sm rounded-xl h-12 text-base"
        disabled={!selected || saving}
        onClick={handleContinue}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {saving ? "Setting up your profile..." : "Continue"}
      </Button>

      <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs">
        You can always change this later in your profile settings.
      </p>
    </div>
  );
}