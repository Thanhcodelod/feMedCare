import { useCallback, useEffect, useRef, useState } from "react";
import {
  connectSocket,
  disconnectSocket,
  fetchIceServers,
  getSocket,
  RTC_CONFIG,
  SocketEvents,
  SOCKET_FORCE_LOGOUT_MESSAGES,
  type ChatMessage,
} from "@/services/teleconsultationService";
import { useAuthStore } from "@/redux/authStore";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/notify";

interface UseTelemedicineOptions {
  roomId: string;
  autoJoin?: boolean;
  role?: "doctor" | "patient";
}

export function useTelemedicine({
  roomId,
  autoJoin = true,
  role,
}: UseTelemedicineOptions) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const resolvedRole: "doctor" | "patient" =
    role ?? (user?.role === "DOCTOR" ? "doctor" : "patient");
  const isInitiator = resolvedRole === "doctor";

  const [connected, setConnected] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [remoteUser, setRemoteUser] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // R1: tri-state peer presence so the UI can show a 30s reconnecting
  // grace period instead of jumping to "left the call" on a brief blip.
  const [peerStatus, setPeerStatus] = useState<
    "idle" | "live" | "reconnecting" | "gone"
  >("idle");
  // R3: rolling network quality derived from inbound RTP stats.
  const [connectionQuality, setConnectionQuality] = useState<
    "unknown" | "good" | "fair" | "poor"
  >("unknown");
  // R5: when set, the Send button is disabled until the timestamp passes
  // — flipped on by a rate-limit error from BE.
  const [sendDisabledUntil, setSendDisabledUntil] = useState<number>(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  // Mirror `error` into a ref so sendMessage's stable closure can read
  // the latest value without re-creating on every error change.
  const errorRef = useRef<string | null>(null);
  errorRef.current = error;
  // Tracks whether BE has accepted us into the room (true when we
  // receive MESSAGE_HISTORY after joinRoom). Chat is gated on this,
  // NOT on the generic `error` state — a media-device error must not
  // block chat because chat travels over the signaling channel only.
  const roomJoinedRef = useRef(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Serializes WebRTC negotiation steps. Two offers arriving close
  // together would interleave their `await pc.setLocalDescription(...)`
  // calls, and the second one's `setLocalDescription` would land while
  // the PC is back in `stable` — throwing InvalidStateError. We chain
  // each handler onto this promise so they execute one at a time.
  const negotiationLockRef = useRef<Promise<void>>(Promise.resolve());
  // R2: ICE config fetched from BE (STUN + TURN). Falls back to the
  // static STUN-only RTC_CONFIG until the first fetch resolves.
  const iceConfigRef = useRef<RTCConfiguration>(RTC_CONFIG);
  // R1: 30s grace timer + last-known peer id so userJoined can clear it
  // when the same user reconnects.
  const peerGraceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPeerIdRef = useRef<string | null>(null);
  // R3: previous quality bucket, used to throttle "Mạng kém" toasts to
  // one fire per good→poor transition.
  const lastQualityRef = useRef<"unknown" | "good" | "fair" | "poor">(
    "unknown",
  );
  // R3: cumulative stats counters from the previous getStats() tick so
  // we can compute deltas (lost vs total packets in the last 5s window).
  const prevStatsRef = useRef<{
    packetsLost: number;
    packetsReceived: number;
  } | null>(null);

  const startMedia = useCallback(async () => {
    const tryGet = async (
      constraints: MediaStreamConstraints,
    ): Promise<MediaStream | null> => {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        return null;
      }
    };

    let stream =
      (await tryGet({ video: true, audio: true })) ||
      (await tryGet({ video: false, audio: true })) ||
      (await tryGet({ video: true, audio: false }));

    if (!stream) {
      setError(
        "Không phát hiện camera/microphone. Vui lòng kiểm tra kết nối thiết bị và quyền truy cập của trình duyệt.",
      );
      return null;
    }

    setMicOn(stream.getAudioTracks().length > 0);
    setCamOn(stream.getVideoTracks().length > 0);

    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, []);

  const stopMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
  }, []);

  const createPeerConnection = useCallback(() => {
    const socket = getSocket();
    // Use the BE-provided iceServers (STUN + TURN). On first call the
    // ref may still be the static fallback if the fetch hasn't resolved
    // — that's fine, the call will still work over STUN for most users
    // and we don't want to block PC creation on the network.
    const pc = new RTCPeerConnection(iceConfigRef.current);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit(SocketEvents.ICE_CANDIDATE, {
          roomId,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setCallActive(true);
        timerRef.current = setInterval(() => {
          setCallDuration((d) => d + 1);
        }, 1000);
      }
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        setCallActive(false);
      }
    };

    // ICE restart when the underlying transport dies. Without this, a
    // brief network blip leaves the PC stuck in `failed` forever — user
    // sees video frozen with no way back short of refresh. restartIce()
    // triggers a fresh negotiation that re-gathers candidates and reuses
    // existing tracks (no flicker).
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") {
        console.warn(
          "[useTelemedicine] ICE failed — restarting",
        );
        try {
          pc.restartIce();
        } catch (err) {
          console.error("[useTelemedicine] restartIce failed:", err);
        }
      }
    };

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    pcRef.current = pc;
    return pc;
  }, [roomId]);

  const createOffer = useCallback(() => {
    const run = async () => {
      // First-level guard: any existing PC means negotiation already
      // started or finished — re-running createOffer would either
      // glare or setLocalDescription on a non-stable PC.
      if (pcRef.current) {
        console.debug(
          "[useTelemedicine] Skip createOffer; PC already exists",
        );
        return;
      }
      const pc = createPeerConnection();
      if (pc.signalingState !== "stable") {
        console.debug(
          "[useTelemedicine] Skip createOffer; signalingState=",
          pc.signalingState,
        );
        return;
      }
      try {
        const offer = await pc.createOffer();
        if (pc.signalingState !== "stable") {
          console.debug(
            "[useTelemedicine] Skip setLocalDescription(offer); state=",
            pc.signalingState,
          );
          return;
        }
        await pc.setLocalDescription(offer);
        getSocket().emit(SocketEvents.OFFER, { roomId, offer });
      } catch (err) {
        if ((err as Error).name === "InvalidStateError") {
          console.debug(
            "[useTelemedicine] createOffer state race:",
            (err as Error).message,
          );
        } else {
          console.error("[useTelemedicine] createOffer failed:", err);
        }
      }
    };
    negotiationLockRef.current = negotiationLockRef.current
      .catch(() => undefined)
      .then(run);
  }, [roomId, createPeerConnection]);

  const handleOffer = useCallback(
    (data: { offer: RTCSessionDescriptionInit }) => {
      const run = async () => {
        const pc = pcRef.current || createPeerConnection();
        try {
          if (pc.signalingState !== "stable") {
            await Promise.all([
              pc.setLocalDescription({ type: "rollback" } as any),
              pc.setRemoteDescription(new RTCSessionDescription(data.offer)),
            ]);
          } else {
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.offer),
            );
          }
          if (pc.signalingState !== "have-remote-offer") {
            console.debug(
              "[useTelemedicine] Skip createAnswer; signalingState=",
              pc.signalingState,
            );
            return;
          }
          const answer = await pc.createAnswer();
          // Re-check immediately before setLocalDescription — between
          // `await createAnswer` and here another offer/answer could
          // have flipped us back to `stable`. Skip in that case
          // instead of throwing.
          if (pc.signalingState !== "have-remote-offer") {
            console.debug(
              "[useTelemedicine] Skip setLocalDescription(answer); state=",
              pc.signalingState,
            );
            return;
          }
          await pc.setLocalDescription(answer);
          getSocket().emit(SocketEvents.ANSWER, { roomId, answer });
        } catch (err) {
          if ((err as Error).name === "InvalidStateError") {
            console.debug(
              "[useTelemedicine] handleOffer state race:",
              (err as Error).message,
            );
          } else {
            console.error("[useTelemedicine] handleOffer failed:", err);
          }
        }
      };
      // Chain onto the serialized negotiation queue so concurrent
      // offers don't interleave their state transitions.
      negotiationLockRef.current = negotiationLockRef.current
        .catch(() => undefined)
        .then(run);
    },
    [roomId, createPeerConnection]
  );

  const handleAnswer = useCallback(
    (data: { answer: RTCSessionDescriptionInit }) => {
      const run = async () => {
        const pc = pcRef.current;
        if (!pc) return;
        if (pc.signalingState !== "have-local-offer") {
          console.debug(
            "[useTelemedicine] Skip answer; signalingState=",
            pc.signalingState,
          );
          return;
        }
        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(data.answer),
          );
        } catch (err) {
          if ((err as Error).name === "InvalidStateError") {
            console.debug(
              "[useTelemedicine] Late answer ignored:",
              (err as Error).message,
            );
          } else {
            console.error("[useTelemedicine] handleAnswer failed:", err);
          }
        }
      };
      negotiationLockRef.current = negotiationLockRef.current
        .catch(() => undefined)
        .then(run);
    },
    []
  );

  const handleCandidate = useCallback(
    async (data: { candidate: RTCIceCandidateInit }) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.warn("[useTelemedicine] addIceCandidate skipped:", err);
      }
    },
    []
  );

  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }, []);

  const toggleCam = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      // Gate on actual room membership, NOT on the generic `error`
      // state — a camera/mic NotFoundError must not silence chat.
      if (!roomJoinedRef.current) {
        toast.warning("Đang kết nối phòng chat, vui lòng đợi...");
        return;
      }
      // No optimistic append: BE persists the message and echoes it
      // back via NEW_MESSAGE with its own UUID. Local optimistic IDs
      // would collide with the echo on first send, AND not match the
      // history loaded via MESSAGE_HISTORY after a reload.
      getSocket().emit(SocketEvents.SEND_MESSAGE, { roomId, content });
    },
    [roomId]
  );

  const endCall = useCallback(() => {
    getSocket().emit(SocketEvents.END_CALL, { roomId });
    pcRef.current?.close();
    pcRef.current = null;
    stopMedia();
    if (timerRef.current) clearInterval(timerRef.current);
    setCallActive(false);
    setCallDuration(0);
  }, [roomId, stopMedia]);

  // R3: poll inbound video stats every 5s and bucket into good/fair/poor.
  // Toasts once per good→poor transition so the user knows the call is
  // degrading without spamming notifications when it stays poor.
  useEffect(() => {
    if (!callActive) {
      setConnectionQuality("unknown");
      lastQualityRef.current = "unknown";
      prevStatsRef.current = null;
      return;
    }
    const intervalId = setInterval(async () => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        const stats = await pc.getStats();
        let packetsLost = 0;
        let packetsReceived = 0;
        let jitter = 0;
        let framesPerSecond = 0;
        stats.forEach((report: any) => {
          if (
            report.type === "inbound-rtp" &&
            report.kind === "video" &&
            !report.isRemote
          ) {
            packetsLost = report.packetsLost ?? 0;
            packetsReceived = report.packetsReceived ?? 0;
            jitter = report.jitter ?? 0;
            framesPerSecond = report.framesPerSecond ?? 0;
          }
        });

        // Compute deltas vs the previous tick so a long-running call
        // doesn't penalize early packet loss forever.
        const prev = prevStatsRef.current;
        const dLost = prev ? packetsLost - prev.packetsLost : packetsLost;
        const dReceived = prev
          ? packetsReceived - prev.packetsReceived
          : packetsReceived;
        prevStatsRef.current = { packetsLost, packetsReceived };

        const lossRatio =
          dReceived + dLost > 0 ? dLost / (dReceived + dLost) : 0;

        let bucket: "good" | "fair" | "poor";
        if (lossRatio > 0.05 || (framesPerSecond > 0 && framesPerSecond < 10)) {
          bucket = "poor";
        } else if (lossRatio > 0.02 || jitter > 0.03) {
          bucket = "fair";
        } else {
          bucket = "good";
        }

        setConnectionQuality(bucket);
        if (
          (lastQualityRef.current === "good" || lastQualityRef.current === "unknown") &&
          bucket === "poor"
        ) {
          toast.warning("Mạng kém — chất lượng video có thể giảm.");
        }
        lastQualityRef.current = bucket;
      } catch {
        // getStats can reject if PC closed between checks; ignore.
      }
    }, 5_000);
    return () => clearInterval(intervalId);
  }, [callActive]);

  // R5: warn before closing the tab while a call is active. Browsers
  // ignore custom messages on modern Chrome/Firefox but still show a
  // generic confirm dialog when returnValue is set.
  useEffect(() => {
    if (!callActive) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [callActive]);

  useEffect(() => {
    if (!autoJoin || !roomId) return;

    const socket = connectSocket();
    let joined = false;

    // BE emits READY only after handleConnection finishes verifying the
    // JWT and populating client.data. Anything emitted earlier hits
    // unauth'd context → "You are not a participant" or Prisma panic.
    const emitJoin = () => {
      if (joined) return;
      joined = true;
      setConnected(true);
      socket.emit(SocketEvents.JOIN_ROOM, { appointmentCode: roomId });
    };
    const onReady = () => emitJoin();
    const onDisconnect = () => {
      setConnected(false);
      joined = false;
      // Socket dropped — we are no longer in any room. Reset so the
      // next sendMessage shows the "kết nối lại" toast.
      roomJoinedRef.current = false;
    };
    const onMessageHistory = (data: { messages: ChatMessage[] }) => {
      // Receiving history is BE's implicit ack that joinRoom succeeded
      // and we're now a member of the room. Flip the gate so sendMessage
      // can proceed.
      roomJoinedRef.current = true;
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    };
    const onUserJoined = (data: { userId: string }) => {
      // BE no longer sends `userName` — backfill from the first chat
      // message instead. Dedupe by id so StrictMode dev re-fires and BE
      // re-broadcasts don't trigger a fresh offer when the peer is
      // already known.
      let firstSeen = false;
      setRemoteUser((prev) => {
        if (prev?.id === data.userId) return prev;
        firstSeen = true;
        return { id: data.userId, name: "" };
      });
      lastPeerIdRef.current = data.userId;

      // R1: if this is the SAME peer reconnecting within the grace
      // window, cancel the pending "gone" timer and flip back to live.
      if (peerGraceTimerRef.current) {
        clearTimeout(peerGraceTimerRef.current);
        peerGraceTimerRef.current = null;
      }
      setPeerStatus("live");

      // Only create an offer when we don't already have a PC in flight.
      // pcRef.current existing means we already started negotiation.
      if (isInitiator && firstSeen && !pcRef.current) {
        createOffer();
      }
    };
    const onPeerDisconnected = (data: { userId: string }) => {
      // R1: don't tear the UI down immediately — give the peer 30s to
      // reconnect (wifi blip, browser tab reload, transient socket
      // drop). If they come back via userJoined, the timer is cancelled.
      if (lastPeerIdRef.current && lastPeerIdRef.current !== data.userId) {
        // Disconnect event for a stale user; ignore.
        return;
      }
      setPeerStatus("reconnecting");
      if (peerGraceTimerRef.current) clearTimeout(peerGraceTimerRef.current);
      peerGraceTimerRef.current = setTimeout(() => {
        setPeerStatus("gone");
        setRemoteUser(null);
        setCallActive(false);
        peerGraceTimerRef.current = null;
      }, 30_000);
    };
    const onNewMessage = (msg: ChatMessage) => {
      // Adopt the peer's name on the first chat we receive — backfills
      // what `userJoined` no longer carries.
      if (msg.senderId !== user?.id) {
        setRemoteUser((prev) =>
          prev?.id === msg.senderId && !prev.name
            ? { ...prev, name: msg.senderName ?? "" }
            : prev,
        );
      }
      // Append every message (including own — BE echoes own messages
      // back too, and we removed local optimistic append). Dedupe by id.
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };
    const onCallEnded = () => {
      pcRef.current?.close();
      pcRef.current = null;
      setCallActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    const onError = (payload: unknown) => {
      const msg =
        typeof payload === "string"
          ? payload
          : (payload as { message?: string })?.message ||
            "Không thể tham gia phòng tư vấn.";
      // Hard auth failures — BE has just disconnected this socket.
      // Wipe local session and bounce to login.
      if (SOCKET_FORCE_LOGOUT_MESSAGES.has(msg)) {
        disconnectSocket();
        logout();
        router.push("/login?reason=session_expired");
        return;
      }
      // R5: rate limit on sendMessage — disable Send for 2s so the user
      // stops mashing the button and BE quota recovers.
      if (msg.toLowerCase().includes("rate limit") && msg.includes("sendMessage")) {
        setSendDisabledUntil(Date.now() + 2_000);
        toast.warning("Bạn gửi tin quá nhanh. Vui lòng đợi 2 giây.");
        return;
      }
      setError(msg);
    };

    const init = async () => {
      // R2: fetch dynamic ICE config (STUN + TURN) in parallel with
      // media. Falls back to STUN-only on network failure.
      const [, iceConfig] = await Promise.all([
        startMedia(),
        fetchIceServers(),
      ]);
      iceConfigRef.current = iceConfig;
      socket.on(SocketEvents.READY, onReady);
      socket.on("disconnect", onDisconnect);
      socket.on(SocketEvents.MESSAGE_HISTORY, onMessageHistory);
      socket.on(SocketEvents.USER_JOINED, onUserJoined);
      socket.on(SocketEvents.PEER_DISCONNECTED, onPeerDisconnected);
      socket.on(SocketEvents.OFFER, handleOffer);
      socket.on(SocketEvents.ANSWER, handleAnswer);
      socket.on(SocketEvents.ICE_CANDIDATE, handleCandidate);
      socket.on(SocketEvents.NEW_MESSAGE, onNewMessage);
      socket.on(SocketEvents.CALL_ENDED, onCallEnded);
      socket.on(SocketEvents.ERROR, onError);

      // The singleton socket may already be connected (and BE may have
      // already emitted READY) by the time this effect runs — e.g. user
      // navigates from one telemedicine page to another. We'd miss the
      // ready event in that case. emitJoin() is idempotent (`joined`
      // flag), so it's safe to call here AND have onReady fire later
      // after a reconnect.
      if (socket.connected) {
        emitJoin();
      }
    };

    init();

    return () => {
      socket.off(SocketEvents.READY, onReady);
      socket.off("disconnect", onDisconnect);
      socket.off(SocketEvents.MESSAGE_HISTORY, onMessageHistory);
      socket.off(SocketEvents.USER_JOINED, onUserJoined);
      socket.off(SocketEvents.PEER_DISCONNECTED, onPeerDisconnected);
      socket.off(SocketEvents.OFFER, handleOffer);
      socket.off(SocketEvents.ANSWER, handleAnswer);
      socket.off(SocketEvents.ICE_CANDIDATE, handleCandidate);
      socket.off(SocketEvents.NEW_MESSAGE, onNewMessage);
      socket.off(SocketEvents.CALL_ENDED, onCallEnded);
      socket.off(SocketEvents.ERROR, onError);
      if (peerGraceTimerRef.current) {
        clearTimeout(peerGraceTimerRef.current);
        peerGraceTimerRef.current = null;
      }
      endCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, autoJoin]);

  return {
    connected,
    callActive,
    remoteUser,
    messages,
    callDuration,
    micOn,
    camOn,
    error,
    peerStatus,
    connectionQuality,
    sendDisabledUntil,
    canSend: Date.now() >= sendDisabledUntil,
    roomId,
    localVideoRef,
    remoteVideoRef,
    toggleMic,
    toggleCam,
    sendMessage,
    endCall,
  };
}
