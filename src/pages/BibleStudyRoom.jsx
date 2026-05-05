import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Hand, Send, Radio, Crown, Users, MessageCircle, ArrowLeft, Phone, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import useAudioRoom from "@/hooks/useAudioRoom";

export default function BibleStudyRoom() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isQuestion, setIsQuestion] = useState(false);
  const chatRef = useRef(null);
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("id");

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  useEffect(() => {
    if (!sessionId) return;
    loadSession();
    loadMessages();

    const unsubSession = base44.entities.BibleStudySession.subscribe((event) => {
      if (event.id === sessionId || event.data?.id === sessionId) {
        if (event.type === "delete") {
          // Session was deleted (host ended it) — redirect all participants
          navigate("/BibleStudy");
          return;
        }
        if (event.data) setSession(event.data);
      }
    });
    const unsubChat = base44.entities.SessionChat.subscribe((event) => {
      if (event.type === "create" && event.data?.session_id === sessionId) {
        setMessages(prev => [...prev, event.data]);
      }
    });
    return () => { unsubSession(); unsubChat(); };
  }, [sessionId]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const loadSession = async () => {
    const results = await base44.entities.BibleStudySession.filter({ id: sessionId });
    setSession(results[0]);
  };

  const loadMessages = async () => {
    const msgs = await base44.entities.SessionChat.filter({ session_id: sessionId }, "created_date", 100);
    setMessages(msgs);
  };

  const myRole = () => {
    if (!session || !user) return "listener";
    if ((session.hosts || []).some(h => h.email === user.email)) return "host";
    if ((session.speakers || []).some(s => s.email === user.email)) return "speaker";
    return "listener";
  };

  const role = myRole();
  const hasRaisedHand = (session?.raised_hands || []).includes(user?.email);

  const isPanelistRole = role === "host" || role === "speaker";
  const speakerEmails = [
    ...(session?.hosts || []).map(h => h.email),
    ...(session?.speakers || []).map(s => s.email),
  ];
  const { micOn, micError, toggleMic } = useAudioRoom(
    sessionId,
    user?.email,
    isPanelistRole && session?.status === "live",
    speakerEmails
  );

  const raiseHand = async () => {
    if (!session || !user) return;
    const raised = session.raised_hands || [];
    const updated = hasRaisedHand ? raised.filter(e => e !== user.email) : [...raised, user.email];
    await base44.entities.BibleStudySession.update(session.id, { raised_hands: updated });
  };

  const approveAsSpeak = async (email, name) => {
    if (!session) return;
    const speakers = session.speakers || [];
    if (speakers.length >= 9) return alert("Maximum 9 speakers allowed.");
    const raised = (session.raised_hands || []).filter(e => e !== email);
    await base44.entities.BibleStudySession.update(session.id, {
      speakers: [...speakers, { email, name }],
      raised_hands: raised,
    });
  };

  const joinAsListener = async () => {
    if (!session || !user) return;
    const listeners = session.listeners || [];
    if (listeners.length >= 50) return alert("Maximum 50 listeners reached.");
    if (listeners.some(l => l.email === user.email)) return;
    await base44.entities.BibleStudySession.update(session.id, {
      listeners: [...listeners, { email: user.email, name: user.full_name || "User" }],
    });
  };

  const goLive = async () => {
    await base44.entities.BibleStudySession.update(session.id, { status: "live" });
  };

  const endSession = async () => {
    if (!window.confirm("End and delete this session for everyone?")) return;
    await base44.entities.BibleStudySession.delete(session.id);
    navigate("/BibleStudy");
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;
    await base44.entities.SessionChat.create({
      session_id: sessionId,
      author_email: user.email,
      author_name: user.full_name || "User",
      message: chatInput.trim(),
      is_question: isQuestion,
    });
    setChatInput("");
    setIsQuestion(false);
  };

  const hasJoinedRef = React.useRef(false);
  useEffect(() => {
    if (session && user && role === "listener" && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      joinAsListener();
    }
  }, [session?.id, user?.email]);

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <p className="text-muted-foreground">No session specified.</p>
        <Button onClick={() => navigate("/BibleStudy")}>Back to Bible Study</Button>
      </div>
    );
  }

  if (!session) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const isHost = role === "host";
  const isPanelist = role === "host" || role === "speaker";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/BibleStudy")}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {session.status === "live" && <span className="flex items-center gap-1 text-xs font-bold text-red-500"><Radio className="w-3 h-3 animate-pulse" /> LIVE</span>}
            <h1 className="font-display font-bold text-lg truncate">{session.title}</h1>
          </div>
          <p className="text-xs text-muted-foreground">{session.plan_title}</p>
        </div>
        {isHost && session.status === "scheduled" && (
          <Button size="sm" onClick={goLive} className="rounded-full gap-2 bg-red-500 hover:bg-red-600 text-white text-xs">
            <Radio className="w-3 h-3" /> Go Live
          </Button>
        )}
        {isHost && session.status === "live" && (
          <Button size="sm" variant="outline" onClick={endSession} className="rounded-full text-xs">
            <Phone className="w-3 h-3 mr-1 rotate-135" /> End
          </Button>
        )}
        {isPanelistRole && session.status === "live" && (
          <Button
            size="sm"
            variant={micOn ? "default" : "outline"}
            onClick={toggleMic}
            className={`rounded-full text-xs gap-1 ${micOn ? "bg-red-500 hover:bg-red-600 border-0 text-white" : ""}`}
          >
            {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            {micOn ? "Mute" : "Unmute"}
          </Button>
        )}
      </div>

      {/* Mic error */}
      {micError && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Microphone error: {micError}. Please allow microphone access and try again.</span>
        </div>
      )}

      {/* Hosts Panel */}
      <PanelSection title="Hosts" icon={<Crown className="w-4 h-4 text-yellow-500" />} members={session.hosts || []} maxCount={3} activeMic={micOn ? user?.email : null} />

      {/* Speakers Panel */}
      <PanelSection title="Speakers" icon={<Mic className="w-4 h-4 text-primary" />} members={session.speakers || []} maxCount={9} activeMic={micOn ? user?.email : null} />

      {/* Raised Hands (host only) */}
      {isHost && (session.raised_hands || []).length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-semibold flex items-center gap-2"><Hand className="w-4 h-4 text-yellow-500" /> Raised Hands</p>
          <div className="space-y-2">
            {(session.raised_hands || []).map(email => (
              <div key={email} className="flex items-center justify-between">
                <span className="text-sm">{email}</span>
                <Button size="sm" variant="outline" className="text-xs rounded-full" onClick={() => approveAsSpeak(email, email)}>
                  Add as Speaker
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listeners */}
      <div className="bg-card rounded-2xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Listeners <span className="text-muted-foreground font-normal">({(session.listeners || []).length}/50)</span>
          </p>
          {role === "listener" && (
            <Button size="sm" variant="outline" className="text-xs rounded-full gap-1" onClick={raiseHand}>
              <Hand className={`w-3 h-3 ${hasRaisedHand ? "text-yellow-500" : ""}`} />
              {hasRaisedHand ? "Lower Hand" : "Raise Hand"}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(session.listeners || []).slice(0, 20).map((l, i) => (
            <div key={i} className="flex items-center gap-1 bg-secondary rounded-full px-2 py-1">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{(l.name || "U")[0].toUpperCase()}</span>
              </div>
              <span className="text-xs">{l.name}</span>
            </div>
          ))}
          {(session.listeners || []).length > 20 && (
            <span className="text-xs text-muted-foreground self-center">+{(session.listeners || []).length - 20} more</span>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="bg-card rounded-2xl border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-semibold">Panel Chat</p>
        </div>
        <div ref={chatRef} className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground pt-8">No messages yet. Be the first to say something!</p>
          ) : messages.map((msg, i) => (
            <div key={i} className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary">{msg.author_name}</span>
                {msg.is_question && <Badge variant="outline" className="text-[10px] px-1 py-0">❓ Question</Badge>}
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {msg.created_date ? format(new Date(msg.created_date), "h:mm a") : ""}
                </span>
              </div>
              <p className="text-sm text-foreground">{msg.message}</p>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="border-t p-3 flex gap-2 items-center">
          <button type="button" onClick={() => setIsQuestion(q => !q)} className={`text-lg transition-opacity ${isQuestion ? "opacity-100" : "opacity-40"}`} title="Mark as question">❓</button>
          <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={isQuestion ? "Ask a question..." : "Say something..."} className="flex-1 text-sm" />
          <Button type="submit" size="icon" disabled={!chatInput.trim()}><Send className="w-4 h-4" /></Button>
        </form>
      </div>
    </div>
  );
}

function PanelSection({ title, icon, members, maxCount, activeMic }) {
  return (
    <div className="bg-card rounded-2xl border p-4 space-y-3">
      <p className="text-sm font-semibold flex items-center gap-2">
        {icon} {title} <span className="text-muted-foreground font-normal">({members.length}/{maxCount})</span>
      </p>
      {members.length === 0 ? (
        <p className="text-xs text-muted-foreground">No {title.toLowerCase()} yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {members.map((m, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center relative ${activeMic === m.email ? "ring-2 ring-green-500 ring-offset-1" : ""}`}>
                <span className="text-base font-bold text-primary">{(m.name || "U")[0].toUpperCase()}</span>
                {activeMic === m.email && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Mic className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </div>
              <span className="text-xs text-center max-w-[60px] truncate">{m.name}</span>
              {m.is_muted && <MicOff className="w-3 h-3 text-muted-foreground" />}
            </div>
          ))}
          {Array.from({ length: maxCount - members.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex flex-col items-center gap-1 opacity-30">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                <span className="text-lg text-muted-foreground">+</span>
              </div>
              <span className="text-xs text-muted-foreground">Open</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}