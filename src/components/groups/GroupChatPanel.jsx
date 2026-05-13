import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function GroupChatPanel({ group, user }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const qc = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["group_chat", group.id],
    queryFn: () => base44.entities.GroupMessage.filter({ group_id: group.id }, "created_date", 60),
    staleTime: 5_000,
    refetchInterval: 8_000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    setSending(true);
    await base44.entities.GroupMessage.create({
      group_id: group.id,
      author_email: user.email,
      author_name: user.full_name || user.email.split("@")[0],
      message: message.trim(),
    });
    setMessage("");
    qc.invalidateQueries({ queryKey: ["group_chat", group.id] });
    setSending(false);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold flex items-center gap-1.5">
        <MessageCircle className="w-3.5 h-3.5 text-primary" /> Group Chat
      </p>

      <div className="bg-muted/40 rounded-xl border h-56 overflow-y-auto p-3 space-y-2 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.author_email === user?.email;
            return (
              <div key={msg.id} className={cn("flex gap-2", isMe ? "justify-end" : "justify-start")}>
                {!isMe && (
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">
                      {(msg.author_name || "?")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className={cn("max-w-[75%] space-y-0.5", isMe ? "items-end" : "items-start", "flex flex-col")}>
                  {!isMe && (
                    <p className="text-[10px] text-muted-foreground font-medium">{msg.author_name}</p>
                  )}
                  <div className={cn(
                    "rounded-2xl px-3 py-1.5 text-xs leading-relaxed",
                    isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border rounded-tl-sm"
                  )}>
                    {msg.message}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {msg.created_date ? formatDistanceToNow(new Date(msg.created_date), { addSuffix: true }) : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Share encouragement…"
          className="flex-1 text-sm rounded-full h-9"
          disabled={!user}
        />
        <Button
          type="submit"
          size="icon"
          className="rounded-full h-9 w-9 shrink-0"
          disabled={sending || !message.trim() || !user}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
}