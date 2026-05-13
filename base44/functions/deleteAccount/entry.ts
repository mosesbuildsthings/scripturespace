import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.email;
    console.log(`[deleteAccount] Starting deletion for: ${email}`);

    // Delete all entity records belonging to this user in parallel
    const deleteByEmail = async (entityName, field) => {
      try {
        const records = await base44.asServiceRole.entities[entityName].filter({ [field]: email });
        await Promise.all(records.map(r => base44.asServiceRole.entities[entityName].delete(r.id)));
        console.log(`[deleteAccount] Deleted ${records.length} ${entityName} records`);
      } catch (err) {
        console.error(`[deleteAccount] Error deleting ${entityName}:`, err.message);
      }
    };

    await Promise.all([
      deleteByEmail('Post', 'author_email'),
      deleteByEmail('JournalEntry', 'user_email'),
      deleteByEmail('Goal', 'user_email'),
      deleteByEmail('SavedVerse', 'user_email'),
      deleteByEmail('BibleProgress', 'user_email'),
      deleteByEmail('PrayerRequest', 'author_email'),
      deleteByEmail('UserBadge', 'user_email'),
      deleteByEmail('UserProfile', 'user_email'),
      deleteByEmail('DirectMessage', 'from_email'),
      deleteByEmail('Comment', 'author_email'),
      deleteByEmail('Subscription', 'user_email'),
    ]);

    // Remove user from groups they lead or are a member of
    try {
      const groups = await base44.asServiceRole.entities.Group.list();
      for (const group of groups) {
        const updates = {};
        if (group.leader_email === email) {
          updates.leader_email = null;
        }
        if ((group.members || []).includes(email)) {
          updates.members = group.members.filter(m => m !== email);
        }
        if (Object.keys(updates).length > 0) {
          await base44.asServiceRole.entities.Group.update(group.id, updates);
        }
      }
    } catch (err) {
      console.error('[deleteAccount] Error cleaning groups:', err.message);
    }

    // Remove user from follower/following lists of other profiles
    try {
      const profiles = await base44.asServiceRole.entities.UserProfile.list();
      for (const profile of profiles) {
        const hasFollower = (profile.followers || []).includes(email);
        const hasFollowing = (profile.following || []).includes(email);
        if (hasFollower || hasFollowing) {
          await base44.asServiceRole.entities.UserProfile.update(profile.id, {
            followers: (profile.followers || []).filter(e => e !== email),
            following: (profile.following || []).filter(e => e !== email),
          });
        }
      }
    } catch (err) {
      console.error('[deleteAccount] Error cleaning profiles:', err.message);
    }

    console.log(`[deleteAccount] All data deleted for: ${email}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('[deleteAccount] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});