import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all users
    const users = await base44.asServiceRole.entities.User.list();

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
    }

    return Response.json({ success: true, message: 'Badges awarded' });
  } catch (error) {
    console.error('Badge award error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});