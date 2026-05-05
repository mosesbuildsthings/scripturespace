import React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shows a verified-leader badge if the user has is_leader or a leader role.
 * Pass `user` object or just `isLeader` boolean.
 */
export default function LeaderBadge({ user, isLeader: isLeaderProp, size = "sm", className }) {
  const verified =
    isLeaderProp ??
    (user?.is_leader === true ||
      ["leader", "pastor", "admin"].includes(user?.role));

  if (!verified) return null;

  const label = user?.role === "pastor" ? "Pastor" : "Leader";

  if (size === "xs") {
    return (
      <ShieldCheck
        className={cn("w-3.5 h-3.5 text-amber-500 shrink-0", className)}
        title={`Verified ${label}`}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
        "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
        className
      )}
      title={`Verified ${label}`}
    >
      <ShieldCheck className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}