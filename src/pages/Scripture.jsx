import React, { useState } from "react";
import { Link } from "react-router-dom";
import ScriptureCard from "@/components/scripture/ScriptureCard";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function Scripture() {
  const [currentRef, setCurrentRef] = useState("");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Today's Scripture</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your daily reading from the 1-Year Bible plan
          </p>
        </div>
        <Link to={`/CreateBibleStudyPlan?scripture=${encodeURIComponent(currentRef || "Today's Scripture")}`}>
          <Button size="sm" variant="outline" className="rounded-full gap-2 shrink-0">
            <BookOpen className="w-4 h-4" /> Create Study
          </Button>
        </Link>
      </div>

      <ScriptureCard onReferenceLoaded={setCurrentRef} />
    </div>
  );
}