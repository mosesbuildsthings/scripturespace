import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, payload } = await req.json();

    if (type === "comment_on_post") {
      const { post_id } = payload;

      const posts = await base44.asServiceRole.entities.Post.filter({ id: post_id });
      const post = posts[0];
      if (!post || !post.author_email) return Response.json({ ok: true });

      // Don't notify if the commenter is the post author
      if (post.author_email === user.email) return Response.json({ ok: true });

      // Verify the caller actually created a comment on this post; use DB content
      const comments = await base44.asServiceRole.entities.Comment.filter(
        { post_id, author_email: user.email },
        "-created_date",
        1
      );
      if (!comments.length) return Response.json({ error: "Forbidden" }, { status: 403 });

      const commenterName = user.full_name || "Someone";
      const commentContent = comments[0].content;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: post.author_email,
        subject: `💬 ${commenterName} commented on your post`,
        body: `Hi ${post.author_name || 'Friend'},\n\n${commenterName} replied to your post on Scripture Space:\n\n"${commentContent}"\n\nOpen the app to see the full conversation and reply.\n\n— The Scripture Space Team`
      });
      console.log(`Comment notification sent to ${post.author_email}`);

    } else if (type === "reply_to_prayer") {
      const { prayer_id } = payload;

      const prayers = await base44.asServiceRole.entities.PrayerRequest.filter({ id: prayer_id });
      const prayer = prayers[0];
      if (!prayer || !prayer.author_email) return Response.json({ ok: true });

      // Don't notify if the commenter is the prayer author
      if (prayer.author_email === user.email) return Response.json({ ok: true });

      // Use server-side identity; content is a fixed template, not client-supplied
      const commenterName = user.full_name || "Someone";
      const commentContent = `${commenterName} is now praying for your request.`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: prayer.author_email,
        subject: `🙏 Someone responded to your prayer request`,
        body: `Hi ${prayer.author_name || 'Friend'},\n\n${commenterName} responded to your prayer request "${prayer.title || 'your prayer'}" on Scripture Space:\n\n"${commentContent}"\n\nOpen the app to read their response and continue the conversation.\n\n— The Scripture Space Team`
      });
      console.log(`Prayer reply notification sent to ${prayer.author_email}`);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("sendNotificationEmail error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});