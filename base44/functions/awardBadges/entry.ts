import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all users and all Bible study plans once (reused per user)
    const [users, allPlans] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.BibleStudyPlan.list(),
    ]);

    for (const user of users) {
      // Count user posts
      const userPosts = await base44.asServiceRole.entities.Post.filter({
        author_email: user.email
      });
      const postCount = userPosts.length;

      // Count Bible reading days (unique days logged by this user)
      const bibleProgress = await base44.asServiceRole.entities.BibleProgress.filter({
        user_email: user.email
      });

      // Calculate current streak: consecutive days ending today or yesterday
      const readDatesSet = [...new Set(bibleProgress.map(p => p.read_date))].sort();
      const totalReadingDays = readDatesSet.length;
      let currentStreak = 0;
      if (readDatesSet.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const lastRead = readDatesSet[readDatesSet.length - 1];
        if (lastRead === today || lastRead === yesterday) {
          // Walk backwards counting consecutive days
          let checkDate = new Date(lastRead);
          for (let i = readDatesSet.length - 1; i >= 0; i--) {
            const expected = checkDate.toISOString().split('T')[0];
            if (readDatesSet[i] === expected) {
              currentStreak++;
              checkDate = new Date(checkDate.getTime() - 86400000);
            } else {
              break;
            }
          }
        }
      }

      // Count prayer participation
      const allPrayerRequests = await base44.asServiceRole.entities.PrayerRequest.list();
      const prayingCount = allPrayerRequests.filter(pr =>
        pr.praying_users && pr.praying_users.includes(user.email)
      ).length;

      // Check existing badges for this user
      const existingBadges = await base44.asServiceRole.entities.UserBadge.filter({
        user_email: user.email
      });
      const badgeTypes = existingBadges.map(b => b.badge_type);

      // Award Scripture Scholar (50+ posts)
      if (postCount >= 50 && !badgeTypes.includes('scripture_scholar')) {
        await base44.asServiceRole.entities.UserBadge.create({
          user_email: user.email,
          badge_type: 'scripture_scholar',
          badge_name: 'Scripture Scholar',
          threshold_met: postCount,
          awarded_date: new Date().toISOString().split('T')[0]
        });
        console.log(`Awarded Scripture Scholar to ${user.email} (${postCount} posts)`);
      }

      // Award Prayer Warrior (25+ prayer participations)
      if (prayingCount >= 25 && !badgeTypes.includes('prayer_warrior')) {
        await base44.asServiceRole.entities.UserBadge.create({
          user_email: user.email,
          badge_type: 'prayer_warrior',
          badge_name: 'Prayer Warrior',
          threshold_met: prayingCount,
          awarded_date: new Date().toISOString().split('T')[0]
        });
        console.log(`Awarded Prayer Warrior to ${user.email} (${prayingCount} prayers)`);
      }

      // Award Community Leader (both badges or 100+ posts + 50+ prayers)
      const hasBothBadges = badgeTypes.includes('scripture_scholar') && badgeTypes.includes('prayer_warrior');
      const highlightedMilestone = postCount >= 100 && prayingCount >= 50;
      if ((hasBothBadges || highlightedMilestone) && !badgeTypes.includes('community_leader')) {
        await base44.asServiceRole.entities.UserBadge.create({
          user_email: user.email,
          badge_type: 'community_leader',
          badge_name: 'Community Leader',
          threshold_met: postCount + prayingCount,
          awarded_date: new Date().toISOString().split('T')[0]
        });
        console.log(`Awarded Community Leader to ${user.email}`);
      }

      // Award Bible Expert (250+ posts in scripture/devotional topics)
      if (postCount >= 250 && !badgeTypes.includes('bible_expert')) {
        await base44.asServiceRole.entities.UserBadge.create({
          user_email: user.email,
          badge_type: 'bible_expert',
          badge_name: 'Bible Expert',
          threshold_met: postCount,
          awarded_date: new Date().toISOString().split('T')[0]
        });
        console.log(`Awarded Bible Expert to ${user.email} (${postCount} posts)`);
      }

      // Award Faithful Reader — 7-day streak
      if (currentStreak >= 7 && !badgeTypes.includes('faithful_reader')) {
        await base44.asServiceRole.entities.UserBadge.create({
          user_email: user.email,
          badge_type: 'faithful_reader',
          badge_name: 'Faithful Reader',
          threshold_met: currentStreak,
          awarded_date: new Date().toISOString().split('T')[0]
        });
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: "🏅 You earned the Faithful Reader badge!",
          body: `Hi ${user.full_name || 'Friend'},\n\nYou've read your Bible for 7 days in a row — incredible dedication!\n\nYou've earned the Faithful Reader badge on Scripture Space. Keep it up!\n\n— The Scripture Space Team`
        });
        console.log(`Awarded Faithful Reader to ${user.email} (streak: ${currentStreak})`);
      }

      // Award Devoted Disciple — 30-day streak
      if (currentStreak >= 30 && !badgeTypes.includes('devoted_disciple')) {
        await base44.asServiceRole.entities.UserBadge.create({
          user_email: user.email,
          badge_type: 'devoted_disciple',
          badge_name: 'Devoted Disciple',
          threshold_met: currentStreak,
          awarded_date: new Date().toISOString().split('T')[0]
        });
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: "🔥 30-day streak — You earned Devoted Disciple!",
          body: `Hi ${user.full_name || 'Friend'},\n\n30 days of consistent Bible reading — you are truly a Devoted Disciple!\n\nThis badge has been added to your Scripture Space profile. Keep walking in the Word.\n\n— The Scripture Space Team`
        });
        console.log(`Awarded Devoted Disciple to ${user.email} (streak: ${currentStreak})`);
      }

      // Award Word Keeper — 100 total reading days
      if (totalReadingDays >= 100 && !badgeTypes.includes('word_keeper')) {
        await base44.asServiceRole.entities.UserBadge.create({
          user_email: user.email,
          badge_type: 'word_keeper',
          badge_name: 'Word Keeper',
          threshold_met: totalReadingDays,
          awarded_date: new Date().toISOString().split('T')[0]
        });
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: "📖 100 days in the Word — Word Keeper badge unlocked!",
          body: `Hi ${user.full_name || 'Friend'},\n\nYou've completed 100 days of Bible reading on Scripture Space. That's a remarkable milestone!\n\nThe Word Keeper badge is now on your profile.\n\n— The Scripture Space Team`
        });
        console.log(`Awarded Word Keeper to ${user.email} (total days: ${totalReadingDays})`);
      }

      // ── Bible Study Plan Completion Logic ──
      // A plan is "completed" when the user has BibleProgress entries for every
      // book+chapter referenced in the plan's verses array (format: "Book Chapter").
      // Only check plans the user follows or created.
      const userPlans = allPlans.filter(plan =>
        plan.created_by === user.email ||
        (plan.followers || []).includes(user.email)
      );

      // Build a set of "Book|Chapter" keys the user has read
      const readKeys = new Set(bibleProgress.map(p => `${p.book}|${p.chapter}`));

      let completedPlanCount = 0;
      for (const plan of userPlans) {
        if (!plan.verses || plan.verses.length === 0) continue;
        // Each verse entry is a reference like "John 3:16" or "Genesis 1" — extract book+chapter
        const planKeys = plan.verses.map(v => {
          const parts = v.trim().split(' ');
          // Handle multi-word book names: "1 Corinthians 13:1" → book="1 Corinthians", chapter=13
          const lastPart = parts[parts.length - 1];
          const chapterNum = parseInt(lastPart.split(':')[0]);
          const book = parts.slice(0, parts.length - 1).join(' ');
          return isNaN(chapterNum) ? null : `${book}|${chapterNum}`;
        }).filter(Boolean);

        if (planKeys.length > 0 && planKeys.every(key => readKeys.has(key))) {
          completedPlanCount++;
        }
      }

      // Award Scripture Scholar upgrade: completed 1+ plan (if not already scripture_scholar)
      if (completedPlanCount >= 1 && !badgeTypes.includes('scripture_scholar')) {
        await base44.asServiceRole.entities.UserBadge.create({
          user_email: user.email,
          badge_type: 'scripture_scholar',
          badge_name: 'Scripture Scholar',
          threshold_met: completedPlanCount,
          awarded_date: new Date().toISOString().split('T')[0]
        });
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: "🎓 You completed a Bible Study Plan!",
          body: `Hi ${user.full_name || 'Friend'},\n\nYou've completed your first Bible study plan on Scripture Space — you're a true Scripture Scholar!\n\nThis badge has been added to your profile. Keep studying the Word.\n\n— The Scripture Space Team`
        });
        console.log(`Awarded Scripture Scholar to ${user.email} (completed ${completedPlanCount} plan(s))`);
      }

      // Award Bible Expert: completed 3+ plans
      if (completedPlanCount >= 3 && !badgeTypes.includes('bible_expert')) {
        await base44.asServiceRole.entities.UserBadge.create({
          user_email: user.email,
          badge_type: 'bible_expert',
          badge_name: 'Bible Expert',
          threshold_met: completedPlanCount,
          awarded_date: new Date().toISOString().split('T')[0]
        });
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: "📚 Bible Expert badge unlocked — 3 plans complete!",
          body: `Hi ${user.full_name || 'Friend'},\n\nYou've now completed 3 Bible study plans on Scripture Space. Your dedication to the Word is extraordinary!\n\nThe Bible Expert badge is now on your profile.\n\n— The Scripture Space Team`
        });
        console.log(`Awarded Bible Expert to ${user.email} (completed ${completedPlanCount} plans)`);
      }
    }

    return Response.json({ success: true, message: 'Badges awarded' });
  } catch (error) {
    console.error('Badge award error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});