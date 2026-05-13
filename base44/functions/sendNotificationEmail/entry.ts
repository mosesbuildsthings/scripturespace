import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { type, payload } = await req.json();

    if (type === "comment_on_post") {
      // payload: { post_id, commenter_name, comment_content }
      const { post_id, commenter_name, comment_content } = payload;

      const posts = await base44.asServiceRole.entities.Post.filter({ id: post_id });
      const post = posts[0];
      if (!post || !post.author_email) return Response.json({ ok: true });

      // Don't notify if the commenter is the post author
      if (post.author_email === payload.commenter_email) return Response.json({ ok: true });

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: post.author_email,
        subject: `💬 ${commenter_name} commented on your post`,
        body: `Hi ${post.author_name || 'Friend'},\n\n${commenter_name} replied to your post on Scripture Space:\n\n"${comment_content}"\n\nOpen the app to see the full conversation and reply.\n\n— The Scripture Space Team`
      });
      console.log(`Comment notification sent to ${post.author_email}`);

    } else if (type === "reply_to_prayer") {
      // payload: { prayer_id, commenter_name, commenter_email, comment_content }
      const { prayer_id, commenter_name, commenter_email, comment_content } = payload;

      const prayers = await base44.asServiceRole.entities.PrayerRequest.filter({ id: prayer_id });
      const prayer = prayers[0];
      if (!prayer || !prayer.author_email) return Response.json({ ok: true });

      // Don't notify if the commenter is the prayer author
      if (prayer.author_email === commenter_email) return Response.json({ ok: true });

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: prayer.author_email,
        subject: `🙏 Someone responded to your prayer request`,
        body: `Hi ${prayer.author_name || 'Friend'},\n\n${commenter_name} responded to your prayer request "${prayer.title || 'your prayer'}" on Scripture Space:\n\n"${comment_content}"\n\nOpen the app to read their response and continue the conversation.\n\n— The Scripture Space Team`
      });
      console.log(`Prayer reply notification sent to ${prayer.author_email}`);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("sendNotificationEmail error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});