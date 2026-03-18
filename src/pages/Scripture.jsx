import React from "react";
import ScriptureCard from "@/components/scripture/ScriptureCard";

export default function Scripture() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Today's Scripture</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your daily reading from the 1-Year Bible plan
        </p>
      </div>

      <ScriptureCard />
    </div>
  );
}