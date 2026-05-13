import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Triggered every time a BibleProgress record is created.
// Checks the specific user's streak and total days, then awards milestone badges instantly.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const userEmail = body?.data?.user_email;
    if (!userEmail) {
      return Response.json({ skipped: true, reason: 'no user_email in payload' });
    }

    // Fetch all reading records for this user
    const bibleProgress = await base44.asServiceRole.entities.BibleProgress.filter({ user_email: userEmail });

    // Unique sorted read dates
    const readDatesSet = [...new Set(bibleProgress.map(p => p.read_date))].sort();
    const totalReadingDays = readDatesSet.length;

    // Calculate current streak (consecutive days ending today or yesterday)
    let currentStreak = 0;
    if (readDatesSet.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const lastRead = readDatesSet[readDatesSet.length - 1];
      if (lastRead === today || lastRead === yesterday) {
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

    // Fetch existing badges to avoid duplicates
    const existingBadges = await base44.asServiceRole.entities.UserBadge.filter({ user_email: userEmail });
    const badgeTypes = new Set(existingBadges.map(b => b.badge_type));

    // Fetch user for email notifications
    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    const user = users[0] || { email: userEmail, full_name: 'Friend' };
    const today = new Date().toISOString().split('T')[0];

    // ── Faithful Reader: 7-day streak ──
    if (currentStreak >= 7 && !badgeTypes.has('faithful_reader')) {
      await base44.asServiceRole.entities.UserBadge.create({
        user_email: userEmail,
        badge_type: 'faithful_reader',
        badge_name: 'Faithful Reader',
        threshold_met: currentStreak,
        awarded_date: today,
      });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: userEmail,
        subject: '🏅 You earned the Faithful Reader badge!',
        body: `Hi ${user.full_name || 'Friend'},\n\nYou've read your Bible for 7 days in a row — incredible dedication!\n\nYou've earned the Faithful Reader badge on Scripture Space. Keep it up!\n\n— The Scripture Space Team`,
      });
      console.log(`[checkReadingBadges] Awarded Faithful Reader to ${userEmail} (streak: ${currentStreak})`);
    }

    // ── Devoted Disciple: 30-day streak ──
    if (currentStreak >= 30 && !badgeTypes.has('devoted_disciple')) {
      await base44.asServiceRole.entities.UserBadge.create({
        user_email: userEmail,
        badge_type: 'devoted_disciple',
        badge_name: 'Devoted Disciple',
        threshold_met: currentStreak,
        awarded_date: today,
      });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: userEmail,
        subject: '🔥 30-day streak — You earned Devoted Disciple!',
        body: `Hi ${user.full_name || 'Friend'},\n\n30 days of consistent Bible reading — you are truly a Devoted Disciple!\n\nThis badge has been added to your Scripture Space profile. Keep walking in the Word.\n\n— The Scripture Space Team`,
      });
      console.log(`[checkReadingBadges] Awarded Devoted Disciple to ${userEmail} (streak: ${currentStreak})`);
    }

    // ── Word Keeper: 100 total reading days ──
    if (totalReadingDays >= 100 && !badgeTypes.has('word_keeper')) {
      await base44.asServiceRole.entities.UserBadge.create({
        user_email: userEmail,
        badge_type: 'word_keeper',
        badge_name: 'Word Keeper',
        threshold_met: totalReadingDays,
        awarded_date: today,
      });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: userEmail,
        subject: '📖 100 days in the Word — Word Keeper badge unlocked!',
        body: `Hi ${user.full_name || 'Friend'},\n\nYou've completed 100 days of Bible reading on Scripture Space. That's a remarkable milestone!\n\nThe Word Keeper badge is now on your profile.\n\n— The Scripture Space Team`,
      });
      console.log(`[checkReadingBadges] Awarded Word Keeper to ${userEmail} (total: ${totalReadingDays})`);
    }

    return Response.json({ success: true, streak: currentStreak, totalDays: totalReadingDays });
  } catch (error) {
    console.error('[checkReadingBadges] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});