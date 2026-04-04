import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, CheckCircle2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// 7-day rolling reading plan seeded by day of year
const READING_PLAN = [
  { label: "Old Testament", books: ["Genesis 1–2", "Psalm 1", "Proverbs 1"] },
  { label: "Gospels", books: ["Matthew 5–7", "Psalm 2", "Proverbs 2"] },
  { label: "Epistles", books: ["Romans 8", "Psalm 23", "Proverbs 3"] },
  { label: "Wisdom", books: ["Job 1–2", "Psalm 46", "Proverbs 4"] },
  { label: "Prophets", books: ["Isaiah 40", "Psalm 91", "Proverbs 5"] },
  { label: "History", books: ["Joshua 1", "Psalm 100", "Proverbs 6"] },
  { label: "Revelation", books: ["Revelation 21–22", "Psalm 119:1–32", "Proverbs 7"] },
];

const DAILY_SCRIPTURES = [
  { reference: "Psalm 23:1-3", text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul." },
  { reference: "John 3:16", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life." },
  { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths." },
  { reference: "Isaiah 40:31", text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint." },
  { reference: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
  { reference: "Philippians 4:6-7", text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God." },
  { reference: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go." },
];

function getDayIndex() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  return Math.floor((new Date() - start) / 86400000);
}

const MOODS = ["grateful", "hopeful", "struggling", "peaceful", "joyful", "seeking"];
const MOOD_EMOJI = { grateful: "🙏", hopeful: "🌅", struggling: "💙", peaceful: "☮️", joyful: "😊", seeking: "🔍" };

export default function Devotional() {
  const [user, setUser] = useState(null);
  const [journalText, setJournalText] = useState("");
  const [mood, setMood] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [todayEntry, setTodayEntry] = useState(null);
  const [planExpanded, setPlanExpanded] = useState(true);
  const { toast } = useToast();

  const dayIdx = getDayIndex();
  const scripture = DAILY_SCRIPTURES[dayIdx % DAILY_SCRIPTURES.length];
  const plan = READING_PLAN[dayIdx % READING_PLAN.length];
  const today = format(new Date(), "yyyy-MM-dd");
  const todayLabel = format(new Date(), "EEEE, MMMM d, yyyy");

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      if (u) {
        const entries = await base44.entities.JournalEntry.filter({
          user_email: u.email,
          entry_type: "devotional",
          entry_date: today,
        });
        if (entries[0]) {
          setTodayEntry(entries[0]);
          setJournalText(entries[0].content);
          setMood(entries[0].mood || "");
          setSaved(true);
        }
      }
    });
  }, []);

  const handleSave = async () => {
    if (!journalText.trim()) return;
    setSaving(true);
    const data = {
      user_email: user.email,
      entry_type: "devotional",
      title: `Devotional — ${todayLabel}`,
      content: journalText,
      scripture_reference: scripture.reference,
      mood: mood || undefined,
      entry_date: today,
    };
    if (todayEntry) {
      await base44.entities.JournalEntry.update(todayEntry.id, data);
    } else {
      const created = await base44.entities.JournalEntry.create(data);
      setTodayEntry(created);
    }
    setSaving(false);
    setSaved(true);
    toast({ title: "Journal saved ✓", description: "Your devotional thoughts are saved privately." });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Daily Devotional
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{todayLabel}</p>
      </div>

      {/* Daily Scripture */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/20 rounded-2xl border p-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Today's Verse</p>
        <h2 className="text-lg font-display font-bold text-foreground">{scripture.reference}</h2>
        <blockquote className="border-l-4 border-primary/40 pl-4">
          <p className="text-base leading-relaxed italic text-foreground/90">"{scripture.text}"</p>
        </blockquote>
      </div>

      {/* Reading Plan */}
      <div className="bg-card rounded-2xl border overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
          onClick={() => setPlanExpanded(v => !v)}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Today's Reading Plan — {plan.label}
          </span>
          {planExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {planExpanded && (
          <div className="px-5 pb-4 space-y-2">
            {plan.books.map((reading, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary/40 shrink-0" />
                <span>{reading}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Journal Section */}
      <div className="bg-card rounded-2xl border p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">My Devotional Journal</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your thoughts are private — only you can see them.</p>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">How are you feeling spiritually today?</p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(m => (
              <button
                key={m}
                onClick={() => setMood(m === mood ? "" : m)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                  mood === m ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {MOOD_EMOJI[m]} {m}
              </button>
            ))}
          </div>
        </div>

        {/* Journal Text */}
        <Textarea
          placeholder="What stood out to you in today's reading? What is God saying to you? Write freely..."
          value={journalText}
          onChange={e => { setJournalText(e.target.value); setSaved(false); }}
          className="min-h-[140px] text-sm leading-relaxed"
        />

        <div className="flex items-center justify-between">
          {saved && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Saved</p>}
          <div className="ml-auto">
            <Button onClick={handleSave} disabled={saving || !journalText.trim()} size="sm" className="rounded-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Entry"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}