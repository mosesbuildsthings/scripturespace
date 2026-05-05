import React, { useMemo, useState, useCallback } from "react";
import { Check, BookOpen, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Classic chronological 1-year Bible reading plan — 365 days
// Each entry: { day, readings: [{book, chapter}] }
// We'll generate this from a sequential plan (canonical order, ~3-4 chapters/day)
function generateYearPlan() {
  const books = [
    { name: "Genesis", chapters: 50 }, { name: "Exodus", chapters: 40 }, { name: "Leviticus", chapters: 27 },
    { name: "Numbers", chapters: 36 }, { name: "Deuteronomy", chapters: 34 }, { name: "Joshua", chapters: 24 },
    { name: "Judges", chapters: 21 }, { name: "Ruth", chapters: 4 }, { name: "1 Samuel", chapters: 31 },
    { name: "2 Samuel", chapters: 24 }, { name: "1 Kings", chapters: 22 }, { name: "2 Kings", chapters: 25 },
    { name: "1 Chronicles", chapters: 29 }, { name: "2 Chronicles", chapters: 36 }, { name: "Ezra", chapters: 10 },
    { name: "Nehemiah", chapters: 13 }, { name: "Esther", chapters: 10 }, { name: "Job", chapters: 42 },
    { name: "Psalms", chapters: 150 }, { name: "Proverbs", chapters: 31 }, { name: "Ecclesiastes", chapters: 12 },
    { name: "Song of Solomon", chapters: 8 }, { name: "Isaiah", chapters: 66 }, { name: "Jeremiah", chapters: 52 },
    { name: "Lamentations", chapters: 5 }, { name: "Ezekiel", chapters: 48 }, { name: "Daniel", chapters: 12 },
    { name: "Hosea", chapters: 14 }, { name: "Joel", chapters: 3 }, { name: "Amos", chapters: 9 },
    { name: "Obadiah", chapters: 1 }, { name: "Jonah", chapters: 4 }, { name: "Micah", chapters: 7 },
    { name: "Nahum", chapters: 3 }, { name: "Habakkuk", chapters: 3 }, { name: "Zephaniah", chapters: 3 },
    { name: "Haggai", chapters: 2 }, { name: "Zechariah", chapters: 14 }, { name: "Malachi", chapters: 4 },
    { name: "Matthew", chapters: 28 }, { name: "Mark", chapters: 16 }, { name: "Luke", chapters: 24 },
    { name: "John", chapters: 21 }, { name: "Acts", chapters: 28 }, { name: "Romans", chapters: 16 },
    { name: "1 Corinthians", chapters: 16 }, { name: "2 Corinthians", chapters: 13 }, { name: "Galatians", chapters: 6 },
    { name: "Ephesians", chapters: 6 }, { name: "Philippians", chapters: 4 }, { name: "Colossians", chapters: 4 },
    { name: "1 Thessalonians", chapters: 5 }, { name: "2 Thessalonians", chapters: 3 }, { name: "1 Timothy", chapters: 6 },
    { name: "2 Timothy", chapters: 4 }, { name: "Titus", chapters: 3 }, { name: "Philemon", chapters: 1 },
    { name: "Hebrews", chapters: 13 }, { name: "James", chapters: 5 }, { name: "1 Peter", chapters: 5 },
    { name: "2 Peter", chapters: 3 }, { name: "1 John", chapters: 5 }, { name: "2 John", chapters: 1 },
    { name: "3 John", chapters: 1 }, { name: "Jude", chapters: 1 }, { name: "Revelation", chapters: 22 },
  ];

  // Flatten all chapters
  const allChapters = [];
  for (const book of books) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      allChapters.push({ book: book.name, chapter: ch });
    }
  }

  // Distribute into 365 days
  const total = allChapters.length; // 1189
  const plan = [];
  let idx = 0;
  for (let day = 1; day <= 365; day++) {
    const remaining = 365 - day;
    const chaptersLeft = total - idx;
    // Spread remaining chapters evenly — some days get 3, some get 4
    const count = Math.ceil(chaptersLeft / (remaining + 1));
    const readings = allChapters.slice(idx, idx + count);
    idx += count;
    plan.push({ day, readings });
  }
  return plan;
}

const YEAR_PLAN = generateYearPlan();

// Get today's day of year (1-365)
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getDayLabel(day) {
  const now = new Date();
  const date = new Date(now.getFullYear(), 0, day);
  return format(date, "MMM d");
}

export default function YearPlan({ readChaptersMap, onRead, onMarkRead, user }) {
  const todayDay = getDayOfYear();
  const [expandedWeek, setExpandedWeek] = useState(Math.ceil(todayDay / 7));

  // Build a fast lookup set: "book|chapter" => true
  const readSet = useMemo(() => {
    const set = new Set();
    for (const [book, chapters] of Object.entries(readChaptersMap)) {
      for (const ch of chapters) set.add(`${book}|${ch}`);
    }
    return set;
  }, [readChaptersMap]);

  const isChapterRead = useCallback((book, chapter) => readSet.has(`${book}|${chapter}`), [readSet]);

  const isDayComplete = useCallback((dayEntry) =>
    dayEntry.readings.every((r) => readSet.has(`${r.book}|${r.chapter}`)), [readSet]);

  const isDayPartial = useCallback((dayEntry) => {
    const some = dayEntry.readings.some((r) => readSet.has(`${r.book}|${r.chapter}`));
    const all = dayEntry.readings.every((r) => readSet.has(`${r.book}|${r.chapter}`));
    return some && !all;
  }, [readSet]);

  const completedDays = useMemo(
    () => YEAR_PLAN.filter((d) => isDayComplete(d)).length,
    [readSet]
  );

  const handleMarkDayRead = async (dayEntry) => {
    const complete = isDayComplete(dayEntry);
    for (const reading of dayEntry.readings) {
      const bookReadChapters = readChaptersMap[reading.book] || [];
      const alreadyRead = bookReadChapters.includes(reading.chapter);
      if (!complete && !alreadyRead) {
        await onMarkRead(reading.book, reading.chapter, false);
      } else if (complete && alreadyRead) {
        await onMarkRead(reading.book, reading.chapter, true);
      }
    }
  };

  // Group into weeks
  const weeks = [];
  for (let w = 0; w < 52; w++) {
    weeks.push(YEAR_PLAN.slice(w * 7, w * 7 + 7));
  }
  // Remaining days (day 365)
  if (YEAR_PLAN.length > 364) weeks[51] = [...(weeks[51] || []), ...YEAR_PLAN.slice(364)];

  const progressPercent = Math.round((completedDays / 365) * 100);

  return (
    <div className="space-y-4">
      {/* Plan header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground">1-Year Bible Reading Plan</p>
          <p className="text-xs text-muted-foreground">~3–4 chapters per day, Genesis to Revelation</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{completedDays}<span className="text-sm font-normal text-muted-foreground">/365</span></p>
          <p className="text-xs text-muted-foreground">days done</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Today's reading highlight */}
      {todayDay >= 1 && todayDay <= 365 && (() => {
        const todayEntry = YEAR_PLAN[todayDay - 1];
        const done = isDayComplete(todayEntry);
        return (
          <div className={cn(
            "rounded-xl border-2 p-4 space-y-2",
            done ? "border-green-400 bg-green-50 dark:bg-green-900/20" : "border-primary bg-primary/5"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">Today — Day {todayDay} ({getDayLabel(todayDay)})</span>
              </div>
              <button
                onClick={() => handleMarkDayRead(todayEntry)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg font-medium transition-colors",
                  done
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {done ? "✓ Complete" : "Mark All Read"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {todayEntry.readings.map((r) => {
                const isRead = isChapterRead(r.book, r.chapter);
                return (
                  <button
                    key={`${r.book}-${r.chapter}`}
                    onClick={() => onRead(r.book, r.chapter)}
                    className={cn(
                      "flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all hover:scale-105",
                      isRead
                        ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                        : "bg-card border-border text-foreground hover:border-primary/50"
                    )}
                  >
                    {isRead && <Check className="w-3 h-3" />}
                    <BookOpen className="w-3 h-3 opacity-60" />
                    {r.book} {r.chapter}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Weekly accordion */}
      <div className="space-y-2">
        {weeks.map((week, wi) => {
          const weekNum = wi + 1;
          const isExpanded = expandedWeek === weekNum;
          const weekComplete = week.every((d) => isDayComplete(d));
          const weekPartial = week.some((d) => isDayComplete(d) || isDayPartial(d));
          const hasToday = week.some((d) => d.day === todayDay);

          return (
            <div key={weekNum} className={cn("border rounded-xl overflow-hidden", hasToday && "border-primary/40")}>
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-accent/30 transition-colors"
                onClick={() => setExpandedWeek(isExpanded ? null : weekNum)}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    weekComplete ? "bg-green-500 text-white" : weekPartial ? "bg-amber-400 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {weekComplete ? <Check className="w-3 h-3" /> : weekNum}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Week {weekNum} — Day {week[0]?.day}–{week[week.length - 1]?.day}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({getDayLabel(week[0]?.day)} – {getDayLabel(week[week.length - 1]?.day)})
                    </span>
                  </span>
                  {hasToday && <Badge variant="outline" className="text-xs text-primary border-primary">Today</Badge>}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 space-y-2 bg-card/50">
                  {week.map((dayEntry) => {
                    const done = isDayComplete(dayEntry);
                    const partial = isDayPartial(dayEntry);
                    const isToday = dayEntry.day === todayDay;
                    return (
                      <div key={dayEntry.day} className={cn(
                        "flex items-start gap-3 py-2 border-b last:border-0",
                        isToday && "bg-primary/5 -mx-4 px-4 rounded-lg"
                      )}>
                        <div className={cn(
                          "w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-xs",
                          done ? "bg-green-500 text-white" : partial ? "bg-amber-400 text-white" : "bg-muted text-muted-foreground"
                        )}>
                          {done ? <Check className="w-3 h-3" /> : dayEntry.day}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">
                            Day {dayEntry.day} · {getDayLabel(dayEntry.day)}{isToday ? " (Today)" : ""}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {dayEntry.readings.map((r) => {
                              const isRead = isChapterRead(r.book, r.chapter);
                              return (
                                <button
                                  key={`${r.book}-${r.chapter}`}
                                  onClick={() => onRead(r.book, r.chapter)}
                                  className={cn(
                                    "text-xs px-2 py-1 rounded-md border transition-all hover:scale-105",
                                    isRead
                                      ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                                      : "bg-background border-border text-foreground hover:border-primary/40"
                                  )}
                                >
                                  {isRead && <Check className="w-2.5 h-2.5 inline mr-0.5" />}
                                  {r.book} {r.chapter}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <button
                          onClick={() => handleMarkDayRead(dayEntry)}
                          className={cn(
                            "text-xs px-2 py-1 rounded-lg flex-shrink-0",
                            done
                              ? "text-green-600 dark:text-green-400"
                              : "text-muted-foreground hover:text-primary"
                          )}
                        >
                          {done ? "✓" : "All"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}