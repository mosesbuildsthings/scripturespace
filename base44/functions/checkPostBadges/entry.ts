import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Triggered every time a Post record is created.
// Checks the specific user's total post count, then awards milestone badges instantly.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const userEmail = body?.data?.author_email;
    if (!userEmail) {
      return Response.json({ skipped: true, reason: 'no author_email in payload' });
    }

    // Count all posts by this user
    const userPosts = await base44.asServiceRole.entities.Post.filter({ author_email: userEmail });
    const postCount = userPosts.length;

    // Fetch existing badges to avoid duplicates
    const existingBadges = await base44.asServiceRole.entities.UserBadge.filter({ user_email: userEmail });
    const badgeTypes = new Set(existingBadges.map(b => b.badge_type));

    // Fetch user for notifications
    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    const user = users[0] || { email: userEmail, full_name: 'Friend' };
    const today = new Date().toISOString().split('T')[0];

    // ── Scripture Scholar: 50 posts ──
    if (postCount >= 50 && !badgeTypes.has('scripture_scholar')) {
      await base44.asServiceRole.entities.UserBadge.create({
        user_email: userEmail,
        badge_type: 'scripture_scholar',
        badge_name: 'Scripture Scholar',
        threshold_met: postCount,
        awarded_date: today,
      });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: userEmail,
        subject: '🎓 Scripture Scholar badge unlocked — 50 posts!',
        body: `Hi ${user.full_name || 'Friend'},\n\nYou've shared 50 posts on Scripture Space — you're a true Scripture Scholar!\n\nThis badge has been added to your profile. Thank you for enriching our community.\n\n— The Scripture Space Team`,
      });
      console.log(`[checkPostBadges] Awarded Scripture Scholar to ${userEmail} (${postCount} posts)`);
    }

    // ── Bible Expert: 250 posts ──
    if (postCount >= 250 && !badgeTypes.has('bible_expert')) {
      await base44.asServiceRole.entities.UserBadge.create({
        user_email: userEmail,
        badge_type: 'bible_expert',
        badge_name: 'Bible Expert',
        threshold_met: postCount,
        awarded_date: today,
      });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: userEmail,
        subject: '📚 Bible Expert badge unlocked — 250 posts!',
        body: `Hi ${user.full_name || 'Friend'},\n\nAn extraordinary 250 posts shared on Scripture Space — you are a Bible Expert!\n\nThis badge is now on your profile and visible to the community.\n\n— The Scripture Space Team`,
      });
      console.log(`[checkPostBadges] Awarded Bible Expert to ${userEmail} (${postCount} posts)`);
    }

    // ── Community Leader: 100 posts ──
    if (postCount >= 100 && !badgeTypes.has('community_leader')) {
      // Only award if also has scripture_scholar (combined milestone)
      if (badgeTypes.has('scripture_scholar') || postCount >= 100) {
        await base44.asServiceRole.entities.UserBadge.create({
          user_email: userEmail,
          badge_type: 'community_leader',
          badge_name: 'Community Leader',
          threshold_met: postCount,
          awarded_date: today,
        });
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: userEmail,
          subject: '👑 Community Leader badge unlocked!',
          body: `Hi ${user.full_name || 'Friend'},\n\nYour consistent presence and 100+ posts have made you a true Community Leader on Scripture Space!\n\nThis badge is now on your profile.\n\n— The Scripture Space Team`,
        });
        console.log(`[checkPostBadges] Awarded Community Leader to ${userEmail} (${postCount} posts)`);
      }
    }

    return Response.json({ success: true, postCount });
  } catch (error) {
    console.error('[checkPostBadges] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});