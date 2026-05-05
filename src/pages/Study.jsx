import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookMarked, BookOpen, Heart, NotebookPen, TrendingUp, HandHeart } from "lucide-react";
import BibleReading from "./BibleReading";
import Devotional from "./Devotional";
import Journal from "./Journal";
import Growth from "./Growth";
import PrayerBoard from "./PrayerBoard";
import SavedVerses from "@/components/bible/SavedVerses";

const TABS = [
  { value: "reading", label: "Reading", icon: BookOpen },
  { value: "saved", label: "Saved", icon: Heart },
  { value: "daily", label: "Daily", icon: BookMarked },
  { value: "journal", label: "Journal", icon: NotebookPen },
  { value: "growth", label: "Growth", icon: TrendingUp },
  { value: "prayer", label: "Prayer", icon: HandHeart },
];

export default function Study() {
  const [tab, setTab] = useState("reading");

  return (
    <div className="max-w-3xl mx-auto">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-2">
          <h1 className="text-xl font-display font-bold text-foreground mb-2">Study</h1>
          <TabsList className="w-full overflow-x-auto flex gap-1 h-auto p-1 bg-muted/50 rounded-xl">
            {TABS.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg flex-shrink-0">
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="reading" className="mt-0"><BibleReading /></TabsContent>
        <TabsContent value="saved" className="mt-0 px-4 py-4"><SavedVerses /></TabsContent>
        <TabsContent value="daily" className="mt-0"><Devotional /></TabsContent>
        <TabsContent value="journal" className="mt-0"><Journal /></TabsContent>
        <TabsContent value="growth" className="mt-0"><Growth /></TabsContent>
        <TabsContent value="prayer" className="mt-0"><PrayerBoard /></TabsContent>
      </Tabs>
    </div>
  );
}