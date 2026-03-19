import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const CACHE_KEY = "scripture_cache";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { date, scripture, imageUrl } = JSON.parse(raw);
    if (date === getTodayKey()) return { scripture, imageUrl };
  } catch {}
  return null;
}

function saveCache(scripture, imageUrl) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ date: getTodayKey(), scripture, imageUrl }));
}

export default function ScriptureCard({ onReferenceLoaded }) {
  const cached = loadCache();
  const [scripture, setScripture] = useState(cached?.scripture || null);
  const [imageUrl, setImageUrl] = useState(cached?.imageUrl || null);
  const [loading, setLoading] = useState(!cached);
  const [imageLoading, setImageLoading] = useState(!cached);

  useEffect(() => {
    if (cached) {
      if (onReferenceLoaded && cached.scripture?.reference) onReferenceLoaded(cached.scripture.reference);
      setImageLoading(false);
    } else {
      fetchScripture();
    }
  }, []);

  const fetchScripture = async () => {
    setLoading(true);
    setImageLoading(true);

    // Get today's scripture via LLM with internet context
    const today = format(new Date(), "MMMM d, yyyy");
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Bible scripture assistant. Today is ${today}, day ${dayOfYear} of the year. 
      Provide the scripture reading for today from a standard 1-Year Bible reading plan. 
      Pick a meaningful verse or short passage (2-4 verses) from today's reading.
      Also provide a brief, uplifting reflection (1-2 sentences).`,
      response_json_schema: {
        type: "object",
        properties: {
          reference: { type: "string", description: "The Bible verse reference, e.g. 'Psalm 23:1-4'" },
          text: { type: "string", description: "The full scripture text" },
          reflection: { type: "string", description: "A brief uplifting reflection on the verse" },
          season_description: { type: "string", description: "A brief description of the current season/time for image generation, e.g. 'early spring morning with blooming flowers'" }
        }
      },
      add_context_from_internet: true,
      model: "gemini_3_flash"
    });

    setScripture(result);
    setLoading(false);
    if (onReferenceLoaded && result?.reference) onReferenceLoaded(result.reference);

    // Generate AI image based on scripture/season
    const imageResult = await base44.integrations.Core.GenerateImage({
      prompt: `A serene, peaceful Christian-themed landscape painting. ${result.season_description}. Warm golden light, soft watercolor style, gentle earth tones and warm hues. Beautiful nature scene that evokes peace, comfort, and God's creation. No text, no people, no faces. Artistic, painterly quality.`
    });

    setImageUrl(imageResult.url);
    setImageLoading(false);
  };

  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg">
      {/* Image Section */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-primary/20 to-accent/30">
        {imageLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Generating today's image...</p>
            </div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Scripture of the day"
            className="w-full h-full object-cover"
          />
        ) : null}
        {/* Date overlay */}
        <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm rounded-xl px-4 py-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today</p>
          <p className="text-sm font-semibold text-foreground">{today}</p>
        </div>
      </div>

      {/* Scripture Content */}
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading today's scripture...</span>
          </div>
        ) : scripture ? (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                Today's Scripture
              </p>
              <h2 className="text-xl font-display font-bold text-foreground">
                {scripture.reference}
              </h2>
            </div>
            <blockquote className="border-l-4 border-primary/40 pl-4 py-1">
              <p className="text-base leading-relaxed text-foreground/90 italic font-light">
                "{scripture.text}"
              </p>
            </blockquote>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {scripture.reflection}
            </p>
          </>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchScripture}
          className="text-muted-foreground hover:text-primary"
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Scripture
        </Button>
      </div>
    </div>
  );
}