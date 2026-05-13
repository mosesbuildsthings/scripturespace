import React, { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function StudyCalendar({ sessionDates = [] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const activeDates = new Set(sessionDates);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isoDate = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isToday = (d) => isoDate(d) === today.toISOString().slice(0, 10);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const totalThisMonth = cells.filter(d => d && activeDates.has(isoDate(d))).length;

  return (
    <div className="bg-card rounded-2xl border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-foreground flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-primary" /> Study Calendar
          </p>
          {totalThisMonth > 0 && (
            <p className="text-xs text-muted-foreground">{totalThisMonth} session{totalThisMonth !== 1 ? "s" : ""} this month</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-medium w-24 text-center">{MONTHS[month]} {year}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const active = activeDates.has(isoDate(d));
          const todayCell = isToday(d);
          return (
            <div
              key={d}
              className={cn(
                "aspect-square flex items-center justify-center rounded-full text-xs font-medium transition-colors",
                active && "bg-primary text-primary-foreground shadow-sm",
                !active && todayCell && "ring-2 ring-primary ring-offset-1 text-primary font-bold",
                !active && !todayCell && "text-foreground hover:bg-muted"
              )}
            >
              {d}
            </div>
          );
        })}
      </div>

      {activeDates.size === 0 && (
        <p className="text-xs text-muted-foreground text-center pb-1">
          Join a Bible study session to see it highlighted here.
        </p>
      )}
    </div>
  );
}