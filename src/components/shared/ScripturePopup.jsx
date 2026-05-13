import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Regex to detect scripture references in text
// Matches patterns like: John 3:16, Psalm 23:1-4, Gen 1:1, Romans 8:28-30, 1 Cor 13:4
const SCRIPTURE_REGEX = /\b((?:1|2|3)\s)?([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s(\d+):(\d+)(?:-(\d+))?\b/g;

const BOOK_ALIASES = {
  Gen: "Genesis", Exo: "Exodus", Lev: "Leviticus", Num: "Numbers", Deu: "Deuteronomy",
  Josh: "Joshua", Judg: "Judges", Ruth: "Ruth", Sam: "Samuel", Kgs: "Kings",
  Chr: "Chronicles", Ezra: "Ezra", Neh: "Nehemiah", Est: "Esther", Job: "Job",
  Ps: "Psalms", Psalm: "Psalms", Prov: "Proverbs", Eccl: "Ecclesiastes",
  Song: "Song of Solomon", Isa: "Isaiah", Jer: "Jeremiah", Lam: "Lamentations",
  Ezek: "Ezekiel", Dan: "Daniel", Hos: "Hosea", Joel: "Joel", Amos: "Amos",
  Oba: "Obadiah", Jon: "Jonah", Mic: "Micah", Nah: "Nahum", Hab: "Habakkuk",
  Zeph: "Zephaniah", Hag: "Haggai", Zech: "Zechariah", Mal: "Malachi",
  Matt: "Matthew", Mat: "Matthew", Mk: "Mark", Lk: "Luke", Jn: "John",
  Acts: "Acts", Rom: "Romans", Cor: "Corinthians", Gal: "Galatians",
  Eph: "Ephesians", Phil: "Philippians", Col: "Colossians", Thess: "Thessalonians",
  Tim: "Timothy", Tit: "Titus", Phlm: "Philemon", Heb: "Hebrews",
  Jas: "James", Pet: "Peter", Rev: "Revelation",
};

async function fetchVerses(book, chapter, verseStart, verseEnd) {
  const end = verseEnd || verseStart;
  const prevVerse = verseStart > 1 ? verseStart - 1 : null;
  const nextVerse = end + 1;

  const prompt = `Return the Bible verses (BSB translation) for ${book} chapter ${chapter} verses ${prevVerse ? `${prevVerse}, ` : ""}${verseStart}${end !== verseStart ? `-${end}` : ""}, and ${nextVerse}.
Format as JSON with this exact structure:
{
  "verses": [
    { "verse": <number>, "text": "<verse text>" }
  ]
}
Only include the verses listed. No extra text.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        verses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              verse: { type: "number" },
              text: { type: "string" }
            }
          }
        }
      }
    }
  });
  return result.verses || [];
}

function ScriptureTooltip({ reference, book, chapter, verseStart, verseEnd, onClose }) {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    fetchVerses(book, chapter, verseStart, verseEnd).then(v => {
      setVerses(v);
      setLoading(false);
    });
  }, [book, chapter, verseStart, verseEnd]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const mainVerses = verses.filter(v => v.verse >= verseStart && v.verse <= (verseEnd || verseStart));
  const prevVerseData = verses.find(v => v.verse === verseStart - 1);
  const nextVerseData = verses.find(v => v.verse === (verseEnd || verseStart) + 1);

  return (
    <div
      ref={ref}
      className="absolute z-50 w-80 bg-card border shadow-xl rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150"
      style={{ bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-primary">{reference}</span>
          <span className="text-[10px] text-muted-foreground">BSB</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {prevVerseData && (
            <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-border pl-2">
              <span className="font-semibold not-italic mr-1">{prevVerseData.verse}</span>
              {prevVerseData.text}
            </p>
          )}
          {mainVerses.map(v => (
            <p key={v.verse} className="text-sm text-foreground leading-relaxed border-l-2 border-primary pl-2">
              <span className="font-bold text-primary mr-1">{v.verse}</span>
              {v.text}
            </p>
          ))}
          {nextVerseData && (
            <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-border pl-2">
              <span className="font-semibold not-italic mr-1">{nextVerseData.verse}</span>
              {nextVerseData.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ScriptureChip({ match, fullMatch }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1 text-primary text-xs font-semibold bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
      >
        <BookOpen className="w-3 h-3" />
        {fullMatch}
      </button>
      {open && (
        <ScriptureTooltip
          reference={fullMatch}
          book={match.book}
          chapter={match.chapter}
          verseStart={match.verseStart}
          verseEnd={match.verseEnd}
          onClose={() => setOpen(false)}
        />
      )}
    </span>
  );
}

// Parse text and replace scripture references with interactive chips
export function parseScriptureText(text) {
  if (!text) return text;

  const parts = [];
  let lastIndex = 0;
  const regex = /\b((?:(?:1|2|3)\s)?)([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s(\d+):(\d+)(?:-(\d+))?\b/g;
  let m;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index));
    }

    const prefix = m[1].trim();
    const bookRaw = (prefix ? prefix + " " : "") + m[2];
    const book = BOOK_ALIASES[m[2]] ? (prefix ? prefix + " " : "") + BOOK_ALIASES[m[2]] : bookRaw;
    const chapter = parseInt(m[3]);
    const verseStart = parseInt(m[4]);
    const verseEnd = m[5] ? parseInt(m[5]) : null;
    const fullMatch = m[0];

    parts.push(
      <ScriptureChip
        key={`${m.index}`}
        fullMatch={fullMatch}
        match={{ book, chapter, verseStart, verseEnd }}
      />
    );

    lastIndex = m.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}