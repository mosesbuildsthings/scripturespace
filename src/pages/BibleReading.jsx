import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Flame, Target, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BibleBookSelector, { ALL_BOOKS, TOTAL_CHAPTERS } from "@/components/bible/BibleBookSelector";
import ChapterGrid from "@/components/bible/ChapterGrid";
import BibleReader, { TRANSLATIONS } from "@/components/bible/BibleReader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays } from "date-fns";

export default function BibleReading() {
  const [user, setUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [translation, setTranslation] = useState("BSB");
  const [readerChapter, setReaderChapter] = useState(null); // chapter number to read
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.preferred_translation) setTranslation(u.preferred_translation);
    });
  }, []);

  const { data: progress = [] } = useQuery({
    queryKey: ["bible-progress", user?.email],
    queryFn: () => base44.entities.BibleProgress.filter({ user_email: user.email }),
    enabled: !!user,
  });

  // Map of book -> array of read chapter numbers
  const readChaptersMap = useMemo(() => {
    const map = {};
    for (const entry of progress) {
      if (!map[entry.book]) map[entry.book] = [];
      map[entry.book].push(entry.chapter);
    }
    return map;
  }, [progress]);

  const totalRead = progress.length;

  const streak = useMemo(() => {
    const dates = new Set(progress.map((p) => p.read_date));
    let count = 0;
    let day = new Date();
    while (true) {
      const key = format(day, "yyyy-MM-dd");
      if (dates.has(key)) {
        count++;
        day = subDays(day, 1);
      } else {
        if (count === 0) {
          day = subDays(day, 1);
          const key2 = format(day, "yyyy-MM-dd");
          if (dates.has(key2)) { count++; day = subDays(day, 1); continue; }
        }
        break;
      }
    }
    return count;
  }, [progress]);

  const handleToggle = async (chapter, isRead) => {
    if (!user || !selectedBook) return;
    setToggling(true);
    const today = format(new Date(), "yyyy-MM-dd");
    if (isRead) {
      const entry = progress.find(
        (p) => p.book === selectedBook.name && p.chapter === chapter
      );
      if (entry) await base44.entities.BibleProgress.delete(entry.id);
    } else {
      await base44.entities.BibleProgress.create({
        user_email: user.email,
        book: selectedBook.name,
        chapter,
        read_date: today,
      });
    }
    await queryClient.invalidateQueries({ queryKey: ["bible-progress", user?.email] });
    setToggling(false);
  };

  const handleTranslationChange = async (val) => {
    setTranslation(val);
    if (user) await base44.auth.updateMe({ preferred_translation: val });
  };

  const selectedReadChapters = selectedBook
    ? readChaptersMap[selectedBook.name] || []
    : [];

  const readerIsRead = readerChapter
    ? selectedReadChapters.includes(readerChapter)
    : false;

  const percentDone = Math.round((totalRead / TOTAL_CHAPTERS) * 100);
  const booksCompleted = ALL_BOOKS.filter(
    (b) => (readChaptersMap[b.name] || []).length === b.chapters
  ).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Reader overlay */}
      {readerChapter && selectedBook && (
        <BibleReader
          book={selectedBook}
          chapter={readerChapter}
          totalChapters={selectedBook.chapters}
          translation={translation}
          onTranslationChange={handleTranslationChange}
          onClose={() => setReaderChapter(null)}
          onMarkRead={handleToggle}
          isRead={readerIsRead}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Bible Reading
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Read, mark chapters, and track your journey through Scripture.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Translation:</span>
          <Select value={translation} onValueChange={handleTranslationChange}>
            <SelectTrigger className="h-8 text-xs w-36">
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Target className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{percentDone}%</p>
            <p className="text-xs text-muted-foreground">Bible Read</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{booksCompleted}</p>
            <p className="text-xs text-muted-foreground">Books Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall progress bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Overall Progress — {totalRead} of {TOTAL_CHAPTERS} chapters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${percentDone}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right">{percentDone}% complete</p>
        </CardContent>
      </Card>

      {/* Chapter grid for selected book */}
      {selectedBook && (
        <Card>
          <CardContent className="pt-5">
            <ChapterGrid
              book={selectedBook}
              readChapters={selectedReadChapters}
              onToggle={handleToggle}
              onRead={(ch) => setReaderChapter(ch)}
              loading={toggling}
            />
          </CardContent>
        </Card>
      )}

      {/* Book selector */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Select a Book</CardTitle>
          <p className="text-xs text-muted-foreground">
            Tap a book to see its chapters. Green = complete, amber = in progress.
          </p>
        </CardHeader>
        <CardContent>
          <BibleBookSelector
            selectedBook={selectedBook}
            onSelect={(book) => { setSelectedBook(book); setReaderChapter(null); }}
            readChaptersMap={readChaptersMap}
          />
        </CardContent>
      </Card>
    </div>
  );
}