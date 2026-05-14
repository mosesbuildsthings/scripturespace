import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookMarked, BookOpen, Heart, NotebookPen, TrendingUp, HandHeart, Search } from "lucide-react";
import BibleReading from "./BibleReading";
import Devotional from "./Devotional";
import Journal from "./Journal";
import Growth from "./Growth";
import PrayerBoard from "./PrayerBoard";
import Scripture from "./Scripture";
import SavedVerses from "@/components/bible/SavedVerses";

const TABS = [
  { value: "reading",    label: "Reading",    icon: BookMarked  },
  { value: "scripture",  label: "Scripture",  icon: Search      },
  { value: "saved",      label: "Saved",      icon: Heart       },
  { value: "daily",      label: "Devotional", icon: BookOpen    },
  { value: "journal",    label: "Journal",    icon: NotebookPen },
  { value: "growth",     label: "Growth",     icon: TrendingUp  },
  { value: "prayer",     label: "Prayer",     icon: HandHeart   },
];

export default function Study() {
  const [tab, setTab] = useState("reading");

  return (
    <div className="max-w-3xl mx-auto">
      <Tabs value={tab} onValueChange={setTab} className="w-full">

        {/* Sticky header — -webkit-sticky for iOS WebView + GPU layer for flicker-free scroll */}
        <div
          className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 pt-5 pb-3"
          style={{
            position: '-webkit-sticky',
            WebkitTransform: 'translate3d(0,0,0)',
            transform: 'translate3d(0,0,0)',
            willChange: 'transform',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            isolation: 'isolate',
          }}
        >
          <h1 className="text-2xl font-display font-bold text-foreground mb-3">Study</h1>
          <TabsList className="w-full overflow-x-auto flex gap-1 h-auto p-1 bg-muted/60 rounded-2xl scrollbar-none">
            {TABS.map(t => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className={[
                  "flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl flex-shrink-0 font-medium",
                  "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
                  "data-[state=active]:shadow-[0_1px_8px_hsl(var(--foreground)/0.08)]",
                  "transition-all duration-150"
                ].join(" ")}
              >
                <t.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="reading"    className="mt-0"><BibleReading /></TabsContent>
        <TabsContent value="scripture"  className="mt-0"><Scripture /></TabsContent>
        <TabsContent value="saved"      className="mt-0 px-4 py-4"><SavedVerses /></TabsContent>
        <TabsContent value="daily"      className="mt-0"><Devotional /></TabsContent>
        <TabsContent value="journal"    className="mt-0"><Journal /></TabsContent>
        <TabsContent value="growth"     className="mt-0"><Growth /></TabsContent>
        <TabsContent value="prayer"     className="mt-0"><PrayerBoard /></TabsContent>
      </Tabs>
    </div>
  );
}