import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { Download, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const SCRIPTURES = [
  { reference: "Psalm 23:1-3", text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.", reflection: "God's care for us is personal and complete — He provides rest, direction, and renewal for our weary souls.", imagePrompt: "Lush green meadow with a gentle stream winding through it, soft golden light, peaceful and serene, painterly style" },
  { reference: "John 3:16", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.", reflection: "The entire gospel is captured here: God's love is so vast that He gave everything so we could have everything.", imagePrompt: "Majestic sunrise over mountains with golden rays bursting through clouds, heavenly light beams, awe-inspiring and divine" },
  { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.", reflection: "When we surrender our plans to God, He straightens out the roads we could never navigate alone.", imagePrompt: "A winding forest path bathed in warm sunlight filtering through ancient trees, inviting and peaceful" },
  { reference: "Isaiah 40:31", text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.", reflection: "Waiting on God is never passive — it is the very act that replenishes our deepest strength.", imagePrompt: "Eagle soaring high above dramatic mountain peaks and clouds, freedom and majesty, golden hour light" },
  { reference: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.", reflection: "Even in our hardest moments, God is weaving a purpose and a goodness we may not yet be able to see.", imagePrompt: "Storm clouds parting to reveal radiant golden sunlight over a tranquil lake, hope after darkness" },
  { reference: "Philippians 4:6-7", text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.", reflection: "God's peace is not the absence of problems — it is a supernatural calm that stands guard over us in the middle of them.", imagePrompt: "Misty calm mountain lake at dawn, mirror-like water reflection, serene and utterly peaceful" },
  { reference: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.", reflection: "Courage is not the absence of fear — it is choosing to move forward knowing God goes before you.", imagePrompt: "Lone hiker standing on a rugged mountain summit at sunrise, brave and triumphant, vast landscape below" },
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", reflection: "God's plans for your life are not an afterthought — they are deliberate, hopeful, and full of His goodness.", imagePrompt: "A golden sunrise road stretching toward the horizon through open fields of wildflowers, hope and future" },
  { reference: "Matthew 6:33", text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you.", reflection: "When we put God first, He takes responsibility for everything else we need.", imagePrompt: "Colorful wildflower meadow under a bright blue sky with soft clouds, abundant and joyful nature" },
  { reference: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.", reflection: "In Christ, your past does not define you — your new identity in Him is your true and lasting reality.", imagePrompt: "Butterfly emerging from chrysalis on a spring branch with blossoms, transformation and new life" },
  { reference: "Psalm 46:10", text: "Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!", reflection: "In the stillness, we remember who is truly in control — and that is the greatest peace we can find.", imagePrompt: "Serene waterfall in a quiet forest clearing, soft mist, absolute stillness and tranquility" },
  { reference: "Galatians 5:22-23", text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control.", reflection: "The Spirit produces in us what we could never manufacture on our own — a life that reflects the very character of God.", imagePrompt: "Lush orchard with vibrant colorful fruits hanging from sunlit trees, abundance and fruitfulness" },
  { reference: "Hebrews 11:1", text: "Now faith is the assurance of things hoped for, the conviction of things not seen.", reflection: "Faith is not wishful thinking — it is a confident trust rooted in the unchanging character of God.", imagePrompt: "Breathtaking starry night sky with the Milky Way over a dark mountain silhouette, faith in the unseen" },
  { reference: "Romans 12:2", text: "Do not be conformed to this world, but be transformed by the renewal of your mind.", reflection: "Transformation begins in the mind — as we fill it with God's truth, our entire life begins to change.", imagePrompt: "Sunlight breaking through dense forest canopy, rays of light illuminating the transformation of nature" },
  { reference: "1 Corinthians 13:4-5", text: "Love is patient and kind; love does not envy or boast; it is not arrogant or rude.", reflection: "True love is a choice and a discipline — a daily decision to reflect God's heart toward the people around us.", imagePrompt: "Soft pink cherry blossoms in full bloom against a pastel sky, gentle beauty and unconditional love" },
  { reference: "James 1:2-3", text: "Count it all joy, my brothers, when you meet trials of various kinds, for you know that the testing of your faith produces steadfastness.", reflection: "Trials are not detours from growth — they are the very path through which God builds an unshakeable faith.", imagePrompt: "Rocky ocean shoreline with powerful waves crashing, dramatic yet beautiful, strength through storms" },
  { reference: "Psalm 119:105", text: "Your word is a lamp to my feet and a light to my path.", reflection: "God's Word doesn't always show us the whole journey at once — but it gives us exactly the light we need for each next step.", imagePrompt: "Lantern glowing warmly on a dark forest path at night, guiding light in darkness, intimate and hopeful" },
  { reference: "John 14:6", text: "Jesus said to him, 'I am the way, and the truth, and the life. No one comes to the Father except through me.'", reflection: "Jesus is not merely one option among many — He is the definitive answer to every question about God, meaning, and eternity.", imagePrompt: "Narrow ancient stone path leading through a garden gate toward radiant golden light, the one true way" },
  { reference: "Ephesians 2:8-9", text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God.", reflection: "Salvation is entirely God's gift — we receive it with open hands, not earn it with striving hands.", imagePrompt: "Open hands receiving golden light from above in a misty morning landscape, grace and gift" },
  { reference: "Psalm 34:8", text: "Oh, taste and see that the Lord is good! Blessed is the man who takes refuge in him!", reflection: "God's goodness is not just a theological truth to believe — it is a living reality to be personally experienced.", imagePrompt: "Sunlit golden harvest field with warm amber hues, abundance and goodness of creation" },
  { reference: "Matthew 11:28-29", text: "Come to me, all who labor and are heavy laden, and I will give you rest.", reflection: "Jesus invites the tired and burdened — not the strong and polished — and offers them something the world cannot: true soul rest.", imagePrompt: "Peaceful wooden bench by a calm lake at sunset, invitation to rest, soft warm colors" },
  { reference: "Lamentations 3:22-23", text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.", reflection: "Every morning is a fresh start with God — His mercies reset with the sunrise, and His faithfulness is never in short supply.", imagePrompt: "Stunning sunrise over misty mountains with warm orange and pink hues, new mercies every morning" },
  { reference: "1 John 4:19", text: "We love because he first loved us.", reflection: "Our capacity to love others flows directly from receiving God's love — we can only give what we have first been given.", imagePrompt: "Warm golden sunset over a calm ocean horizon, love and warmth radiating from the light" },
  { reference: "Colossians 3:23", text: "Whatever you do, work heartily, as for the Lord and not for men.", reflection: "When we work for an audience of One, even the most ordinary task becomes an act of worship.", imagePrompt: "Craftsman's hands shaping clay on a potter's wheel, purposeful work, warm studio light" },
  { reference: "Psalm 27:1", text: "The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life.", reflection: "Fear loses its grip when we truly understand who God is — our light, our salvation, and our unshakeable fortress.", imagePrompt: "Lighthouse standing firm against a dramatic stormy sea at night with a beam of light cutting through darkness" },
  { reference: "Micah 6:8", text: "He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God?", reflection: "God's requirements are not complicated — justice, kindness, and humility before Him are the heartbeat of a life well lived.", imagePrompt: "Quiet country village path with humble stone walls and wildflowers, simplicity and humble beauty" },
  { reference: "John 10:10", text: "I came that they may have life and have it abundantly.", reflection: "Jesus did not come to give us a diminished, fearful existence — He came to give us a life that is rich, full, and overflowing.", imagePrompt: "Vibrant lush tropical waterfall with rich green ferns and colorful flowers, abundant overflowing life" },
  { reference: "Romans 5:8", text: "But God shows his love for us in that while we were still sinners, Christ died for us.", reflection: "God did not wait until we were worthy — He loved us at our worst, and that love is what transforms us.", imagePrompt: "Silhouette of a cross on a hilltop at sunset with dramatic red and purple sky, sacrifice and love" },
  { reference: "Deuteronomy 31:6", text: "Be strong and courageous. Do not fear or be in dread of them, for it is the Lord your God who goes with you. He will not leave you or forsake you.", reflection: "Whatever you are facing today, you are not facing it alone — God has committed Himself to go with you all the way.", imagePrompt: "Two figures walking together on a cliff edge trail at sunrise, companionship and courage, never alone" },
  { reference: "Philippians 4:13", text: "I can do all things through him who strengthens me.", reflection: "This is not a promise of unlimited human achievement — it is a declaration that in Christ, we have access to a strength far beyond our own.", imagePrompt: "Mountain climber reaching the summit with arms raised in triumph, breathtaking alpine panorama behind" },
];

// Use today's date string as the cache key so it regenerates each new day
function getTodayKey() {
  return format(new Date(), "yyyy-MM-dd");
}

function getDayIndex() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function ScriptureCard({ onReferenceLoaded }) {
  const dayIdx = getDayIndex();
  const scripture = SCRIPTURES[dayIdx % SCRIPTURES.length];
  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const todayKey = getTodayKey();
  const cacheKey = `scripture_image_${todayKey}`;

  const [imageUrl, setImageUrl] = useState(() => localStorage.getItem(cacheKey) || null);
  const [imageLoading, setImageLoading] = useState(!localStorage.getItem(cacheKey));
  const [downloading, setDownloading] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (onReferenceLoaded && scripture?.reference) onReferenceLoaded(scripture.reference);
  }, []);

  useEffect(() => {
    // Clear old cached images (keys from previous days)
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("scripture_image_") && key !== cacheKey) {
        localStorage.removeItem(key);
      }
    }

    if (localStorage.getItem(cacheKey)) {
      setImageUrl(localStorage.getItem(cacheKey));
      setImageLoading(false);
      return;
    }

    // Generate a new AI image for today
    setImageLoading(true);
    base44.integrations.Core.GenerateImage({
      prompt: `${scripture.imagePrompt}. Spiritual, uplifting, beautiful, high quality digital art, no text, no people, cinematic lighting.`,
    }).then(({ url }) => {
      localStorage.setItem(cacheKey, url);
      setImageUrl(url);
      setImageLoading(false);
    }).catch(() => {
      setImageLoading(false);
    });
  }, [cacheKey]);

  const handleDownload = async () => {
    if (!imageUrl) return;
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");

      // Draw background image
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      ctx.drawImage(img, 0, 0, 1080, 1080);

      // Dark gradient overlay at bottom
      const grad = ctx.createLinearGradient(0, 400, 0, 1080);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.4, "rgba(0,0,0,0.65)");
      grad.addColorStop(1, "rgba(0,0,0,0.88)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      // Reference pill
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.roundRect(60, 600, 300, 44, 22);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px serif";
      ctx.fillText(scripture.reference, 80, 629);

      // Verse text (word-wrap)
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "italic 32px serif";
      const words = `"${scripture.text}"`.split(" ");
      const maxWidth = 960;
      let line = "";
      let y = 690;
      for (const word of words) {
        const test = line + word + " ";
        if (ctx.measureText(test).width > maxWidth && line) {
          ctx.fillText(line.trim(), 60, y);
          line = word + " ";
          y += 46;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line.trim(), 60, y);

      // App watermark
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "18px sans-serif";
      ctx.fillText("BibleSocial", 60, 1040);

      // Trigger download
      const link = document.createElement("a");
      link.download = `verse-${todayKey}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
    }
    setDownloading(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg">
      {/* Image Section */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-primary/20 to-accent/30">
        {imageLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-muted/30">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Generating today's image...</p>
          </div>
        ) : imageUrl ? (
          <img ref={imgRef} src={imageUrl} alt="Scripture of the day" className="w-full h-full object-cover" crossOrigin="anonymous" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/30">
            <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm rounded-xl px-4 py-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today</p>
          <p className="text-sm font-semibold text-foreground">{today}</p>
        </div>
        {imageUrl && !imageLoading && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownload}
            disabled={downloading}
            className="absolute bottom-3 right-3 gap-1.5 text-xs rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
          >
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {downloading ? "Saving..." : "Download"}
          </Button>
        )}
      </div>

      {/* Scripture Content */}
      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Today's Scripture</p>
          <h2 className="text-xl font-display font-bold text-foreground">{scripture.reference}</h2>
        </div>
        <blockquote className="border-l-4 border-primary/40 pl-4 py-1">
          <p className="text-base leading-relaxed text-foreground/90 italic font-light">"{scripture.text}"</p>
        </blockquote>
        <p className="text-sm text-muted-foreground leading-relaxed">{scripture.reflection}</p>
      </div>
    </div>
  );
}