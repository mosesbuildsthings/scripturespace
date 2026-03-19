import React, { useState, useEffect } from "react";
import { format } from "date-fns";

const SCRIPTURES = [
  { reference: "Psalm 23:1-3", text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.", reflection: "God's care for us is personal and complete — He provides rest, direction, and renewal for our weary souls." },
  { reference: "John 3:16", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.", reflection: "The entire gospel is captured here: God's love is so vast that He gave everything so we could have everything." },
  { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.", reflection: "When we surrender our plans to God, He straightens out the roads we could never navigate alone." },
  { reference: "Isaiah 40:31", text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.", reflection: "Waiting on God is never passive — it is the very act that replenishes our deepest strength." },
  { reference: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.", reflection: "Even in our hardest moments, God is weaving a purpose and a goodness we may not yet be able to see." },
  { reference: "Philippians 4:6-7", text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts.", reflection: "God's peace is not the absence of problems — it is a supernatural calm that stands guard over us in the middle of them." },
  { reference: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.", reflection: "Courage is not the absence of fear — it is choosing to move forward knowing God goes before you." },
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", reflection: "God's plans for your life are not an afterthought — they are deliberate, hopeful, and full of His goodness." },
  { reference: "Matthew 6:33", text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you.", reflection: "When we put God first, He takes responsibility for everything else we need." },
  { reference: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.", reflection: "In Christ, your past does not define you — your new identity in Him is your true and lasting reality." },
  { reference: "Psalm 46:10", text: "Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!", reflection: "In the stillness, we remember who is truly in control — and that is the greatest peace we can find." },
  { reference: "Galatians 5:22-23", text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law.", reflection: "The Spirit produces in us what we could never manufacture on our own — a life that reflects the very character of God." },
  { reference: "Hebrews 11:1", text: "Now faith is the assurance of things hoped for, the conviction of things not seen.", reflection: "Faith is not wishful thinking — it is a confident trust rooted in the unchanging character of God." },
  { reference: "Romans 12:2", text: "Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect.", reflection: "Transformation begins in the mind — as we fill it with God's truth, our entire life begins to change." },
  { reference: "1 Corinthians 13:4-5", text: "Love is patient and kind; love does not envy or boast; it is not arrogant or rude. It does not insist on its own way; it is not irritable or resentful.", reflection: "True love is a choice and a discipline — a daily decision to reflect God's heart toward the people around us." },
  { reference: "James 1:2-3", text: "Count it all joy, my brothers, when you meet trials of various kinds, for you know that the testing of your faith produces steadfastness.", reflection: "Trials are not detours from growth — they are the very path through which God builds an unshakeable faith." },
  { reference: "Psalm 119:105", text: "Your word is a lamp to my feet and a light to my path.", reflection: "God's Word doesn't always show us the whole journey at once — but it gives us exactly the light we need for each next step." },
  { reference: "John 14:6", text: "Jesus said to him, 'I am the way, and the truth, and the life. No one comes to the Father except through me.'", reflection: "Jesus is not merely one option among many — He is the definitive answer to every question about God, meaning, and eternity." },
  { reference: "Ephesians 2:8-9", text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.", reflection: "Salvation is entirely God's gift — we receive it with open hands, not earn it with striving hands." },
  { reference: "Psalm 34:8", text: "Oh, taste and see that the Lord is good! Blessed is the man who takes refuge in him!", reflection: "God's goodness is not just a theological truth to believe — it is a living reality to be personally experienced." },
  { reference: "Matthew 11:28-29", text: "Come to me, all who labor and are heavy laden, and I will give you rest. Take my yoke upon you, and learn from me, for I am gentle and lowly in heart, and you will find rest for your souls.", reflection: "Jesus invites the tired and burdened — not the strong and polished — and offers them something the world cannot: true soul rest." },
  { reference: "Lamentations 3:22-23", text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.", reflection: "Every morning is a fresh start with God — His mercies reset with the sunrise, and His faithfulness is never in short supply." },
  { reference: "1 John 4:19", text: "We love because he first loved us.", reflection: "Our capacity to love others flows directly from receiving God's love — we can only give what we have first been given." },
  { reference: "Colossians 3:23", text: "Whatever you do, work heartily, as for the Lord and not for men.", reflection: "When we work for an audience of One, even the most ordinary task becomes an act of worship." },
  { reference: "Psalm 27:1", text: "The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid?", reflection: "Fear loses its grip when we truly understand who God is — our light, our salvation, and our unshakeable fortress." },
  { reference: "Micah 6:8", text: "He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God?", reflection: "God's requirements are not complicated — justice, kindness, and humility before Him are the heartbeat of a life well lived." },
  { reference: "John 10:10", text: "The thief comes only to steal and kill and destroy. I came that they may have life and have it abundantly.", reflection: "Jesus did not come to give us a diminished, fearful existence — He came to give us a life that is rich, full, and overflowing." },
  { reference: "Romans 5:8", text: "But God shows his love for us in that while we were still sinners, Christ died for us.", reflection: "God did not wait until we were worthy — He loved us at our worst, and that love is what transforms us." },
  { reference: "Deuteronomy 31:6", text: "Be strong and courageous. Do not fear or be in dread of them, for it is the Lord your God who goes with you. He will not leave you or forsake you.", reflection: "Whatever you are facing today, you are not facing it alone — God has committed Himself to go with you all the way." },
  { reference: "Philippians 4:13", text: "I can do all things through him who strengthens me.", reflection: "This is not a promise of unlimited human achievement — it is a declaration that in Christ, we have access to a strength far beyond our own." },
];

const NATURE_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
  "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
];

function getDayIndex() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export default function ScriptureCard({ onReferenceLoaded }) {
  const dayIdx = getDayIndex();
  const scripture = SCRIPTURES[dayIdx % SCRIPTURES.length];
  const imageUrl = NATURE_IMAGES[dayIdx % NATURE_IMAGES.length];
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  useEffect(() => {
    if (onReferenceLoaded && scripture?.reference) onReferenceLoaded(scripture.reference);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg">
      {/* Image Section */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-primary/20 to-accent/30">
        <img src={imageUrl} alt="Scripture of the day" className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm rounded-xl px-4 py-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today</p>
          <p className="text-sm font-semibold text-foreground">{today}</p>
        </div>
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