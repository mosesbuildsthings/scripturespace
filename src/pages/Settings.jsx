import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Check, AlignRight, AlignLeft, ArrowDown, ArrowUp, Bell, BellOff, Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const THEME_COLORS = [
  { name: "Warm Earth", value: "25 45% 42%", preview: "hsl(25, 45%, 42%)" },
  { name: "Sage Green", value: "150 25% 40%", preview: "hsl(150, 25%, 40%)" },
  { name: "Dusty Rose", value: "350 30% 52%", preview: "hsl(350, 30%, 52%)" },
  { name: "Ocean Blue", value: "210 35% 45%", preview: "hsl(210, 35%, 45%)" },
  { name: "Lavender", value: "270 25% 52%", preview: "hsl(270, 25%, 52%)" },
  { name: "Golden Amber", value: "38 55% 48%", preview: "hsl(38, 55%, 48%)" },
  { name: "Deep Teal", value: "180 30% 38%", preview: "hsl(180, 30%, 38%)" },
  { name: "Soft Plum", value: "290 20% 45%", preview: "hsl(290, 20%, 45%)" },
  { name: "Terracotta", value: "15 50% 50%", preview: "hsl(15, 50%, 50%)" },
  { name: "Forest", value: "140 30% 35%", preview: "hsl(140, 30%, 35%)" },
  { name: "Slate", value: "220 15% 42%", preview: "hsl(220, 15%, 42%)" },
  { name: "Burgundy", value: "340 40% 38%", preview: "hsl(340, 40%, 38%)" },
];

const NAV_POSITIONS = [
  { value: "right", label: "Right", icon: AlignRight },
  { value: "left", label: "Left", icon: AlignLeft },
  { value: "bottom", label: "Bottom", icon: ArrowDown },
  { value: "top", label: "Top", icon: ArrowUp },
];

export default function Settings() {
  const context = useOutletContext();
  const [selectedColor, setSelectedColor] = useState("25 45% 42%");
  const [selectedNav, setSelectedNav] = useState("right");
  const [saving, setSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState("08:00");
  const [readingReminderEnabled, setReadingReminderEnabled] = useState(false);
  const [readingReminderTime, setReadingReminderTime] = useState("07:00");
  const [notifPermission, setNotifPermission] = useState(typeof Notification !== "undefined" ? Notification.permission : "default");
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const user = await base44.auth.me();
    if (user?.theme_color) setSelectedColor(user.theme_color);
    if (user?.nav_position) setSelectedNav(user.nav_position);
    if (user?.daily_notif_enabled !== undefined) setNotificationsEnabled(user.daily_notif_enabled);
    if (user?.daily_notif_time) setNotificationTime(user.daily_notif_time);
    if (user?.reading_reminder_enabled !== undefined) setReadingReminderEnabled(user.reading_reminder_enabled);
    if (user?.reading_reminder_time) setReadingReminderTime(user.reading_reminder_time);
    if (user?.dark_mode !== undefined) {
      setDarkMode(user.dark_mode);
      document.documentElement.classList.toggle("dark", user.dark_mode);
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    // Preview immediately
    document.documentElement.style.setProperty("--primary", color);
    document.documentElement.style.setProperty("--ring", color);
  };

  const requestNotifPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === "granted") {
      setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
      toast.error("Notification permission denied. Please allow notifications in your browser settings.");
    }
  };

  const handleToggleNotifications = async (val) => {
    if (val && notifPermission !== "granted") {
      await requestNotifPermission();
    } else {
      setNotificationsEnabled(val);
    }
  };

  const scheduleTimeout = (storageKey, delayMs, title, body) => {
    const existingId = sessionStorage.getItem(storageKey);
    if (existingId) clearTimeout(Number(existingId));
    const id = setTimeout(() => {
      new Notification(title, { body, icon: "/favicon.ico" });
    }, delayMs);
    sessionStorage.setItem(storageKey, String(id));
  };

  const getDelayUntil = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next - now;
  };

  const scheduleNotification = (time) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const ENCOURAGEMENTS = [
      "✨ You are loved beyond measure. 'The Lord your God is with you wherever you go.' — Joshua 1:9",
      "🙏 Start your day in His presence. 'Draw near to God, and He will draw near to you.' — James 4:8",
      "💛 Cast your worries on Him today. 'Do not be anxious about anything.' — Philippians 4:6",
      "🌿 His mercies are new this morning. 'Great is your faithfulness.' — Lamentations 3:23",
      "🕊️ Walk in peace today. 'The peace of God... will guard your hearts.' — Philippians 4:7",
      "🌟 You are chosen and set apart. 'You are a chosen people, a royal priesthood.' — 1 Peter 2:9",
      "🔥 Be strong and take heart. 'Wait for the Lord.' — Psalm 27:14",
    ];
    const msg = ENCOURAGEMENTS[new Date().getDay()];
    scheduleTimeout("notif_timeout", getDelayUntil(time), "Daily Spiritual Encouragement 🙏", msg);
  };

  const scheduleReadingReminder = (time) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const READING_NUDGES = [
      "📖 Time to open the Word! Your daily reading plan is waiting for you.",
      "📚 Don't forget your Bible reading today. Small steps lead to big growth!",
      "🌅 A new day, a new chapter. Your 1-Year reading plan continues today!",
      "✝️ His Word is a lamp to your feet. Complete today's reading plan!",
      "🕊️ Nourish your soul — your daily Scripture reading is ready.",
      "🔥 Stay on track! Your Bible reading plan awaits you today.",
      "🌿 Wisdom grows one chapter at a time. Read today's plan!",
    ];
    const msg = READING_NUDGES[new Date().getDay()];
    scheduleTimeout("reading_notif_timeout", getDelayUntil(time), "Bible Reading Reminder 📖", msg);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      theme_color: selectedColor,
      nav_position: selectedNav,
      daily_notif_enabled: notificationsEnabled,
      daily_notif_time: notificationTime,
      reading_reminder_enabled: readingReminderEnabled,
      reading_reminder_time: readingReminderTime,
      dark_mode: darkMode,
    });
    document.documentElement.classList.toggle("dark", darkMode);

    if (notificationsEnabled && notifPermission === "granted") {
      scheduleNotification(notificationTime);
    }
    if (readingReminderEnabled && notifPermission === "granted") {
      scheduleReadingReminder(readingReminderTime);
    } else {
      const existingId = sessionStorage.getItem("reading_notif_timeout");
      if (existingId) clearTimeout(Number(existingId));
      sessionStorage.removeItem("reading_notif_timeout");
    }

    if (context?.setNavPosition) context.setNavPosition(selectedNav);
    if (context?.setThemeColor) context.setThemeColor(selectedColor);
    if (context?.applyThemeColor) context.applyThemeColor(selectedColor);

    setSaving(false);
    toast.success("Settings saved! Refresh to see navigation changes.");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalize your experience</p>
      </div>

      {/* Theme Color */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Theme Color</CardTitle>
          <CardDescription>Choose a color that speaks to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {THEME_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value)}
                className={cn(
                  "relative w-full aspect-square rounded-xl transition-all duration-200 shadow-sm hover:scale-105",
                  selectedColor === color.value && "ring-2 ring-offset-2 ring-foreground scale-105"
                )}
                style={{ backgroundColor: color.preview }}
                title={color.name}
              >
                {selectedColor === color.value && (
                  <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Selected: {THEME_COLORS.find(c => c.value === selectedColor)?.name || "Custom"}
          </p>
        </CardContent>
      </Card>

      {/* Navigation Position */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Menu Position</CardTitle>
          <CardDescription>Choose where your navigation menu appears</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {NAV_POSITIONS.map((pos) => (
              <button
                key={pos.value}
                onClick={() => setSelectedNav(pos.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                  selectedNav === pos.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <pos.icon className={cn(
                  "w-5 h-5",
                  selectedNav === pos.value ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  selectedNav === pos.value ? "text-primary" : "text-muted-foreground"
                )}>{pos.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dark / Light Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            Appearance
          </CardTitle>
          <CardDescription>Switch between light and dark mode</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">{darkMode ? "Dark Mode" : "Light Mode"}</span>
              <Moon className="w-4 h-4 text-indigo-400" />
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={(val) => {
                setDarkMode(val);
                if (val) {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Currently: <strong>{darkMode ? "Dark" : "Light"}</strong> — toggle to switch, then Save to persist.
          </p>
        </CardContent>
      </Card>

      {/* Daily Encouragement Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {notificationsEnabled ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
            Daily Encouragement
          </CardTitle>
          <CardDescription>Receive a spiritual verse and reflection each day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Enable daily notifications</Label>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
            />
          </div>

          {notificationsEnabled && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Preferred time</Label>
              <input
                type="time"
                value={notificationTime}
                onChange={e => setNotificationTime(e.target.value)}
                className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {notifPermission === "granted"
                  ? "✅ Notifications are allowed. Save to schedule."
                  : "⚠️ You'll be asked to allow notifications when you enable this."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Reading Reminder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {readingReminderEnabled ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
            Daily Reading Reminder
          </CardTitle>
          <CardDescription>Get nudged to complete your 1-Year Bible reading plan each day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Enable reading reminder</Label>
            <Switch
              checked={readingReminderEnabled}
              onCheckedChange={async (val) => {
                if (val && notifPermission !== "granted") {
                  await requestNotifPermission();
                  setReadingReminderEnabled(Notification.permission === "granted");
                } else {
                  setReadingReminderEnabled(val);
                }
              }}
            />
          </div>

          {readingReminderEnabled && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Reminder time</Label>
              <input
                type="time"
                value={readingReminderTime}
                onChange={e => setReadingReminderTime(e.target.value)}
                className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                <p className="text-xs text-primary font-medium">📖 What you'll receive</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A daily nudge at {readingReminderTime} reminding you to open your Bible reading plan for the day.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {notifPermission === "granted"
                  ? "✅ Notifications allowed. Save to activate your reminder."
                  : "⚠️ You'll be asked to allow notifications."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl h-12 text-base">
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}