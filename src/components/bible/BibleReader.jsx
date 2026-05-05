import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  { id: "BSB", name: "Berean Standard Bible", short: "BSB" },
  { id: "ENGWEBP", name: "World English Bible", short: "WEB" },
  { id: "AAB", name: "Accessible Ancients Bible", short: "AAB" },
];

function renderContent(content) {
  if (!content) return null;
  return content.map((item, i) => {
    if (item === null || item === undefined) return null;
    if (typeof item === "string") return <span key={i}>{item} </span>;
    if (typeof item === "object") {
      if (item.text) return <span key={i} className={item.poem ? "block ml-4 italic" : ""}>{item.text} </span>;
      if (item.lineBreak) return <br key={i} />;
      if (item.noteId !== undefined) return null; // skip footnote markers
    }
    return null;
  });
}

export default function BibleReader({ book, chapter, totalChapters, translation, onTranslationChange, onClose, onMarkRead, isRead }) {
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(chapter);

  const bookId = BOOK_ID_MAP[book?.name];

  useEffect(() => {
    setCurrentChapter(chapter);
  }, [chapter, book]);

  useEffect(() => {
    if (!bookId || !currentChapter) return;
    setLoading(true);
    setChapterData(null);
    fetch(`https://bible.helloao.org/api/${translation}/${bookId}/${currentChapter}.json`)
      .then((r) => r.json())
      .then((data) => setChapterData(data))
      .finally(() => setLoading(false));
  }, [bookId, currentChapter, translation]);

  const handlePrev = () => setCurrentChapter((c) => Math.max(1, c - 1));
  const handleNext = () => setCurrentChapter((c) => Math.min(totalChapters, c + 1));

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-card shadow-sm shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-primary shrink-0" />
          <p className="font-semibold text-foreground text-sm truncate">
            {book?.name} {currentChapter}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Select value={translation} onValueChange={onTranslationChange}>
            <SelectTrigger className="h-8 text-xs w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSLATIONS.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.short} — {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant={isRead ? "secondary" : "default"}
            onClick={() => onMarkRead(currentChapter, isRead)}
            className="h-8 text-xs gap-1 px-2"
          >
            {isRead ? <Check className="w-3 h-3" /> : null}
            {isRead ? "Read ✓" : "Mark Read"}
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full" style={{WebkitOverflowScrolling: 'touch'}}>
        {loading ? (
          <div className="flex justify-center pt-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : chapterData ? (
          <div className="space-y-1 text-foreground leading-8 text-base">
            {chapterData.chapter?.content?.map((item, i) => {
              if (item.type === "heading") {
                return (
                  <h3 key={i} className="font-display font-bold text-primary text-lg mt-6 mb-2">
                    {item.content?.join(" ")}
                  </h3>
                );
              }
              if (item.type === "verse") {
                return (
                  <p key={i} className="text-base leading-8">
                    <sup className="text-primary font-semibold text-xs mr-1">{item.number}</sup>
                    {renderContent(item.content)}
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
        <span className="text-xs text-muted-foreground">
          Chapter {currentChapter} of {totalChapters}
        </span>
        <Button variant="outline" size="sm" onClick={handleNext} disabled={currentChapter >= totalChapters}>
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}