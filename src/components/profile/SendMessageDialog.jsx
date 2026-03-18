import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Send } from "lucide-react";

export default function SendMessageDialog({ open, onClose, toProfile, currentUser }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !currentUser || !toProfile) return;
    setSending(true);
    await base44.entities.DirectMessage.create({
      from_email: currentUser.email,
      from_name: currentUser.full_name || "User",
      to_email: toProfile.user_email,
      to_name: toProfile.user_name || "User",
      message: message.trim().slice(0, 100),
    });
    setSending(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage("");
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Message {toProfile?.user_name}</DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="text-center py-6 text-green-600 font-medium">Message sent!</div>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, 100))}
              placeholder="Write a message (max 100 characters)..."
              className="min-h-[80px] text-sm resize-none"
              maxLength={100}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{message.length}/100</span>
              <Button size="sm" className="gap-2 rounded-full" onClick={handleSend} disabled={sending || !message.trim()}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}