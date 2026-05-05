import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/**
 * useAudioRoom — manages microphone capture + WebRTC mesh audio for a study room.
 *
 * @param {string} sessionId
 * @param {string} myEmail
 * @param {boolean} canSpeak  — true for hosts/speakers
 * @param {string[]} speakerEmails — current list of speaker+host emails to connect to
 */
export default function useAudioRoom(sessionId, myEmail, canSpeak, speakerEmails) {
  const [micOn, setMicOn] = useState(false);
  const [micError, setMicError] = useState(null);

  const localStream = useRef(null);
  const peers = useRef({}); // email → RTCPeerConnection
  const audioRefs = useRef({}); // email → <audio> element
  const processedSignals = useRef(new Set());

  // ── helpers ──────────────────────────────────────────────────────────────
  const getOrCreatePeer = useCallback((remoteEmail) => {
    if (peers.current[remoteEmail]) return peers.current[remoteEmail];

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peers.current[remoteEmail] = pc;

    // Send ICE candidates
    pc.onicecandidate = async (e) => {
      if (e.candidate) {
        await base44.entities.AudioSignal.create({
          session_id: sessionId,
          from_email: myEmail,
          to_email: remoteEmail,
          type: "ice-candidate",
          data: JSON.stringify(e.candidate),
        });
      }
    };

    // Play incoming audio
    pc.ontrack = (e) => {
      const stream = e.streams[0];
      if (!audioRefs.current[remoteEmail]) {
        const audio = document.createElement("audio");
        audio.autoplay = true;
        audio.playsInline = true;
        document.body.appendChild(audio);
        audioRefs.current[remoteEmail] = audio;
      }
      audioRefs.current[remoteEmail].srcObject = stream;
    };

    // Add local tracks if we have them
    if (localStream.current) {
      localStream.current.getTracks().forEach(t => pc.addTrack(t, localStream.current));
    }

    return pc;
  }, [sessionId, myEmail]);

  const closePeer = useCallback((remoteEmail) => {
    if (peers.current[remoteEmail]) {
      peers.current[remoteEmail].close();
      delete peers.current[remoteEmail];
    }
    if (audioRefs.current[remoteEmail]) {
      audioRefs.current[remoteEmail].remove();
      delete audioRefs.current[remoteEmail];
    }
  }, []);

  // ── start mic ─────────────────────────────────────────────────────────────
  const startMic = useCallback(async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.current = stream;
      // Add tracks to existing peers
      Object.entries(peers.current).forEach(([, pc]) => {
        stream.getTracks().forEach(t => {
          const senders = pc.getSenders();
          if (!senders.find(s => s.track?.kind === t.kind)) {
            pc.addTrack(t, stream);
          }
        });
      });
      setMicOn(true);
    } catch (err) {
      setMicError(err.message || "Microphone access denied");
    }
  }, []);

  const stopMic = useCallback(() => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(t => t.stop());
      localStream.current = null;
    }
    // Remove tracks from peers
    Object.values(peers.current).forEach(pc => {
      pc.getSenders().forEach(s => { try { pc.removeTrack(s); } catch (_) {} });
    });
    setMicOn(false);
  }, []);

  const toggleMic = useCallback(async () => {
    if (micOn) stopMic();
    else await startMic();
  }, [micOn, startMic, stopMic]);

  // ── initiate offers to all current speakers (when I join or my role changes) ──
  useEffect(() => {
    if (!canSpeak || !sessionId || !myEmail) return;

    const initPeers = async () => {
      for (const email of speakerEmails) {
        if (email === myEmail) continue;
        // Only the "lower" email initiates to avoid duplicate offers
        if (myEmail < email) {
          const pc = getOrCreatePeer(email);
          if (pc.signalingState === "stable" && !pc.localDescription) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await base44.entities.AudioSignal.create({
              session_id: sessionId,
              from_email: myEmail,
              to_email: email,
              type: "offer",
              data: JSON.stringify(offer),
            });
          }
        }
      }
    };

    initPeers();
  }, [canSpeak, sessionId, myEmail, speakerEmails.join(",")]);

  // ── signaling listener ────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId || !myEmail) return;

    const unsub = base44.entities.AudioSignal.subscribe(async (event) => {
      if (event.type !== "create") return;
      const sig = event.data;
      if (!sig || sig.session_id !== sessionId || sig.to_email !== myEmail) return;
      if (processedSignals.current.has(sig.id)) return;
      processedSignals.current.add(sig.id);

      const from = sig.from_email;

      if (sig.type === "offer") {
        const pc = getOrCreatePeer(from);
        await pc.setRemoteDescription(JSON.parse(sig.data));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await base44.entities.AudioSignal.create({
          session_id: sessionId,
          from_email: myEmail,
          to_email: from,
          type: "answer",
          data: JSON.stringify(answer),
        });
      } else if (sig.type === "answer") {
        const pc = peers.current[from];
        if (pc && pc.signalingState !== "stable") {
          await pc.setRemoteDescription(JSON.parse(sig.data));
        }
      } else if (sig.type === "ice-candidate") {
        const pc = peers.current[from];
        if (pc) {
          try { await pc.addIceCandidate(JSON.parse(sig.data)); } catch (_) {}
        }
      } else if (sig.type === "disconnect") {
        closePeer(from);
      }
    });

    return () => unsub();
  }, [sessionId, myEmail, getOrCreatePeer, closePeer]);

  // ── cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopMic();
      Object.keys(peers.current).forEach(closePeer);
      // Signal disconnect to peers
      if (sessionId && myEmail) {
        base44.entities.AudioSignal.create({
          session_id: sessionId,
          from_email: myEmail,
          to_email: "__broadcast__",
          type: "disconnect",
          data: "{}",
        }).catch(() => {});
      }
    };
  }, []);

  return { micOn, micError, toggleMic };
}