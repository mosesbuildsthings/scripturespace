import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { X, ChevronLeft, ChevronRight, Check, Loader2, BookOpen, Heart, Share2, Highlighter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Map our book names to API book IDs
const BOOK_ID_MAP = {
  "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
  "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
  "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
  "1 Chronicles": "1CH", "2 Chronicles": "2CH", "Ezra": "EZR", "Nehemiah": "NEH",
  "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Proverbs": "PRO",
  "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA", "Jeremiah": "JER",
  "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS",
  "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA", "Jonah": "JON", "Micah": "MIC",
  "Nahum": "NAH", "Habakkuk": "HAB", "Zephaniah": "ZEP", "Haggai": "HAG",
  "Zechariah": "ZEC", "Malachi": "MAL", "Matthew": "MAT", "Mark": "MRK",
  "Luke": "LUK", "John": "JHN", "Acts": "ACT", "Romans": "ROM",
  "1 Corinthians": "1CO", "2 Corinthians": "2CO", "Galatians": "GAL",
  "Ephesians": "EPH", "Philippians": "PHP", "Colossians": "COL",
  "1 Thessalonians": "1TH", "2 Thessalonians": "2TH", "1 Timothy": "1TI",
  "2 Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB",
  "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN",
  "2 John": "2JN", "3 John": "3JN", "Jude": "JUD", "Revelation": "REV",
};

export const TRANSLATIONS = [
  { id: "NIV", name: "New International Version", short: "NIV" },
  { id: "NKJV", name: "New King James Version", short: "NKJV" },
  { id: "KJV", name: "King James Version", short: "KJV" },
  { id: "ESV", name: "English Standard Version", short: "ESV" },
  { id: "NLT", name: "New Living Translation", short: "NLT" },
  { id: "NASB", name: "New American Standard Bible", short: "NASB" },
  { id: "CSB", name: "Christian Standard Bible", short: "CSB" },
  { id: "MSG", name: "The Message", short: "MSG" },
  { id: "AMP", name: "Amplified Bible", short: "AMP" },
  { id: "BSB", name: "Berean Standard Bible", short: "BSB" },
  { id: "ENGWEBP", name: "World English Bible", short: "WEB" },
];

const HIGHLIGHT_COLORS = ["#fef08a", "#bbf7d0", "#bae6fd", "#fbcfe8", "#e9d5ff"];

function extractVerseText(content) {
  if (!content) return "";
  return content
    .map(item => {
      if (typeof item === "string") return item;
      if (item?.text) return item.text;
      return "";
    })
    .join(" ")
    .trim();
}

function renderContent(content) {
  if (!content) return null;
  return content.map((item, i) => {
    if (item === null || item === undefined) return null;
    if (typeof item === "string") return <span key={i}>{item} </span>;
    if (typeof item === "object") {
      if (item.text) return <span key={i} className={item.poem ? "block ml-4 italic" : ""}>{item.text} </span>;
      if (item.lineBreak) return <br key={i} />;
      if (item.noteId !== undefined) return null;
    }
    return null;
  });
}

export default function BibleReader({ book, chapter, totalChapters, translation, onTranslationChange, onClose, onMarkRead, isRead }) {
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(chapter);
  const [user, setUser] = useState(null);
  const [savedVerseNums, setSavedVerseNums] = useState(new Set());
  const [savingVerse, setSavingVerse] = useState(null);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState("#fef08a");
  const [sharingVerse, setSharingVerse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const bookId = BOOK_ID_MAP[book?.name];

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) loadSavedVerses(u.email);
    });
  }, []);

  useEffect(() => { setCurrentChapter(chapter); }, [chapter, book]);

  useEffect(() => {
    if (!bookId || !currentChapter) return;
    setLoading(true);
    setChapterData(null);
    fetch(`https://bible.helloao.org/api/${translation}/${bookId}/${currentChapter}.json`)
      .then(r => r.json())
      .then(data => setChapterData(data))
      .finally(() => setLoading(false));
    if (user) loadSavedVerses(user.email);
  }, [bookId, currentChapter, translation]);

  const loadSavedVerses = async (email) => {
    const verses = await base44.entities.SavedVerse.filter({ user_email: email, book: book?.name, chapter: currentChapter });
    setSavedVerseNums(new Set(verses.map(v => v.verse_number)));
  };

  const handleVerseClick = async (verseItem) => {
    if (!user) return;
    const verseNum = verseItem.number;
    const verseText = extractVerseText(verseItem.content);
    const reference = `${book?.name} ${currentChapter}:${verseNum}`;

    if (savedVerseNums.has(verseNum)) {
      // Unsave
      const existing = await base44.entities.SavedVerse.filter({ user_email: user.email, book: book?.name, chapter: currentChapter, verse_number: verseNum });
      if (existing[0]) await base44.entities.SavedVerse.delete(existing[0].id);
      setSavedVerseNums(prev => { const s = new Set(prev); s.delete(verseNum); return s; });
      toast.info("Verse removed from saved.");
    } else {
      // Save
      setSavingVerse(verseNum);
      await base44.entities.SavedVerse.create({
        user_email: user.email,
        book: book?.name,
        chapter: currentChapter,
        verse_number: verseNum,
        verse_text: verseText,
        reference,
        highlight_color: selectedHighlightColor,
        translation,
      });
      setSavedVerseNums(prev => new Set([...prev, verseNum]));
      setSavingVerse(null);
      toast.success(`${reference} saved!`);
    }
  };

  const handleShareChapter = async () => {
    if (!user || !chapterData) return;
    const content = `📖 Reading ${book?.name} ${currentChapter} (${translation})\n\n"${book?.name} ${currentChapter} — may His Word speak to your heart today." ✝️`;
    await base44.entities.Post.create({
      content,
      author_name: user.full_name || "User",
      author_email: user.email,
      verse_reference: `${book?.name} ${currentChapter}`,
      likes: [], hidden_by: [], comment_count: 0, share_count: 0, is_shared: false,
    });
    toast.success("Shared to Feed!");
  };

  const handlePrev = () => setCurrentChapter(c => Math.max(1, c - 1));
  const handleNext = () => setCurrentChapter(c => Math.min(totalChapters, c + 1));

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-card shadow-sm shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-primary shrink-0" />
          <p className="font-semibold text-foreground text-sm truncate">{book?.name} {currentChapter}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <Select value={translation} onValueChange={onTranslationChange}>
            <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TRANSLATIONS.map(t => <SelectItem key={t.id} value={t.id}>{t.short} — {t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant={isRead ? "secondary" : "default"} onClick={() => onMarkRead(currentChapter, isRead)} className="h-8 text-xs gap-1 px-2">
            {isRead && <Check className="w-3 h-3" />}{isRead ? "Read ✓" : "Mark Read"}
          </Button>
          <Button size="icon" variant="ghost" onClick={handleShareChapter} className="h-8 w-8 shrink-0" title="Share to Feed">
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setShowSearch(s => !s)} className="h-8 w-8 shrink-0" title="Search in chapter">
            <Search className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 py-2 border-b bg-card/80">
          <Input
            autoFocus
            placeholder="Search verses in this chapter..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-8 text-sm"
          />
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-1">
              Showing verses matching "<strong>{searchQuery}</strong>"
            </p>
          )}
        </div>
      )}

      {/* Highlight color picker bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-card/50">
        <Highlighter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground shrink-0">Tap a verse to save · Color:</span>
        <div className="flex gap-1.5">
          {HIGHLIGHT_COLORS.map(c => (
            <button key={c} onClick={() => setSelectedHighlightColor(c)}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: c, borderColor: selectedHighlightColor === c ? "#374151" : "transparent" }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full" style={{ WebkitOverflowScrolling: "touch" }}>
        {loading ? (
          <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : chapterData ? (
          <div className="space-y-1 text-foreground leading-8 text-base">
            {chapterData.chapter?.content?.map((item, i) => {
              if (item.type === "heading") {
                if (searchQuery) return null;
                return <h3 key={i} className="font-display font-bold text-primary text-lg mt-6 mb-2">{item.content?.join(" ")}</h3>;
              }
              if (item.type === "verse") {
                // Filter by search query
                if (searchQuery) {
                  const verseText = extractVerseText(item.content).toLowerCase();
                  if (!verseText.includes(searchQuery.toLowerCase())) return null;
                }
                const isSaved = savedVerseNums.has(item.number);
                const isSaving = savingVerse === item.number;
                return (
                  <p key={i} className={cn(
                    "text-base leading-8 rounded-lg px-1 -mx-1 transition-all cursor-pointer group relative",
                    isSaved ? "ring-1 ring-inset ring-yellow-300" : "hover:bg-muted/40"
                  )}
                    style={isSaved ? { backgroundColor: selectedHighlightColor + "66" } : {}}
                    onClick={() => handleVerseClick(item)}
                  >
                    <sup className="text-primary font-semibold text-xs mr-1">{item.number}</sup>
                    {renderContent(item.content)}
                    {isSaving && <Loader2 className="inline w-3 h-3 animate-spin ml-1 text-primary" />}
                    {isSaved && !isSaving && <Heart className="inline w-3 h-3 ml-1 text-pink-500 fill-pink-500" />}
                  </p>
                );
              }
              if (item.type === "line_break") return <div key={i} className="h-2" />;
              return null;
            })}
          </div>
        ) : null}
      </div>

      {/* Navigation footer */}
      <div className="border-t bg-card px-4 py-3 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentChapter <= 1}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <span className="text-xs text-muted-foreground">Chapter {currentChapter} of {totalChapters}</span>
        <Button variant="outline" size="sm" onClick={handleNext} disabled={currentChapter >= totalChapters}>
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}