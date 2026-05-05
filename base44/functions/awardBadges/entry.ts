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
    }

    return Response.json({ success: true, message: 'Badges awarded' });
  } catch (error) {
    console.error('Badge award error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});