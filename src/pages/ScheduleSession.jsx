import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, CalendarPlus, Bell } from "lucide-react";
import { format } from "date-fns";

export default function ScheduleSession() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const planId = params.get("planId");
  const planTitle = params.get("planTitle") || "";

  const [form, setForm] = useState({
    title: planTitle ? `${planTitle} - Session` : "",
    description: "",
    scheduled_time: "",
  });

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const addToCalendar = (scheduledTime) => {
    const start = new Date(scheduledTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default
    const formatICS = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${formatICS(start)}`,
      `DTEND:${formatICS(end)}`,
      `SUMMARY:${form.title}`,
      `DESCRIPTION:Bible Study Session - ${planTitle}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bible-study-session.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const setAlarm = (scheduledTime) => {
    const alarmTime = new Date(new Date(scheduledTime).getTime() - 30 * 60 * 1000);
    const now = new Date();
    const msUntilAlarm = alarmTime - now;
    if (msUntilAlarm > 0 && "Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setTimeout(() => {
            new Notification("Bible Study Starting Soon!", {
              body: `"${form.title}" starts in 30 minutes!`,
              icon: "/favicon.ico",
            });
          }, msUntilAlarm);
          alert(`Reminder set! You'll get a notification 30 minutes before the session starts.`);
        }
      });
    } else {
      alert("Alarm set! (Note: browser notifications must remain open to receive the alert)");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.scheduled_time) return;
    setSaving(true);

    const session = await base44.entities.BibleStudySession.create({
      ...form,
      plan_id: planId || "",
      plan_title: planTitle,
      created_by: user?.email,
      creator_name: user?.full_name || "User",
      hosts: [{ email: user?.email, name: user?.full_name || "Host" }],
      speakers: [],
      listeners: [],
      raised_hands: [],
      status: "scheduled",
    });

    // Ask about calendar
    if (window.confirm("Would you like to add this session to your device's calendar?")) {
      addToCalendar(form.scheduled_time);
    }

    // Ask about alarm
    if (window.confirm("Would you like to set an alarm 30 minutes before the session starts?")) {
      setAlarm(form.scheduled_time);
    }

    navigate(`/BibleStudyRoom?id=${session.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <h1 className="text-xl font-display font-bold">Schedule Session</h1>
      </div>
      {planTitle && <p className="text-sm text-muted-foreground -mt-4 ml-14">Plan: <strong>{planTitle}</strong></p>}

      <form onSubmit={handleSubmit} className="space-y-5 bg-card rounded-2xl border p-5">
        <div className="space-y-1">
          <Label>Session Title *</Label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Week 1: Opening Prayer" />
        </div>

        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What will be covered in this session?" className="min-h-[60px]" />
        </div>

        <div className="space-y-1">
          <Label>Scheduled Date & Time *</Label>
          <Input type="datetime-local" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))} />
        </div>

        <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-xl text-sm text-muted-foreground">
          <CalendarPlus className="w-4 h-4 text-primary shrink-0" />
          <span>After saving, you'll be asked to add this to your calendar and set a reminder alarm.</span>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={saving || !form.title.trim() || !form.scheduled_time}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Schedule Session"}
          </Button>
        </div>
      </form>
    </div>
  );
}