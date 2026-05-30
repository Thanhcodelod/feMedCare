import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/redux/authStore";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8888";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${WS_URL}/teleconsultation`, {
      auth: (cb) => {
        const token = useAuthStore.getState().token;
        cb({ token });
      },
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export const SocketEvents = {
  // Auth gating: BE emits READY after handleConnection finishes verifying
  // the JWT and populating client.data. Only after READY is it safe to
  // emit anything that depends on auth state (joinRoom, sosRequest…).
  READY: "ready",

  JOIN_ROOM: "joinRoom",
  ROOM_JOINED: "roomJoined",
  MESSAGE_HISTORY: "messageHistory",
  USER_JOINED: "userJoined",
  PEER_DISCONNECTED: "peerDisconnected",

  SOS_REQUEST: "sosRequest",
  SOS_DISPATCHED: "sosDispatched",
  SOS_ACCEPT: "sosAccept",
  SOS_ACCEPTED: "sosAccepted",
  SOS_NO_DOCTOR: "sosNoDoctor",

  OFFER: "offer",
  ANSWER: "answer",
  ICE_CANDIDATE: "iceCandidate",

  SEND_MESSAGE: "sendMessage",
  NEW_MESSAGE: "newMessage",

  END_CALL: "endCall",
  CALL_ENDED: "callEnded",

  ERROR: "error",
} as const;

export const SOCKET_FORCE_LOGOUT_MESSAGES: ReadonlySet<string> = new Set([
  "Account disabled",
  "Token revoked",
]);

/**
 * STUN-only fallback. Used as the initial config and the safety net if
 * /teleconsultation/ice-servers is unreachable. ~30% of users on
 * symmetric-NAT networks (corporate, some 4G carriers) need TURN to
 * actually establish — those go through `fetchIceServers()` below.
 */
export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface IceServersCache {
  config: RTCConfiguration;
  fetchedAt: number;
}

const ICE_CACHE_TTL_MS = 12 * 60 * 60_000; // 12h — BE TURN creds last 24h
let iceCache: IceServersCache | null = null;
let iceInFlight: Promise<RTCConfiguration> | null = null;

/**
 * GET /teleconsultation/ice-servers. Returns STUN + ephemeral TURN
 * creds signed by the BE (HMAC TURN REST). Cached 12h in-memory; on
 * network failure falls back to the static STUN-only config so an
 * outage in the auth endpoint doesn't block calls entirely.
 */
export async function fetchIceServers(): Promise<RTCConfiguration> {
  if (iceCache && Date.now() - iceCache.fetchedAt < ICE_CACHE_TTL_MS) {
    return iceCache.config;
  }
  if (iceInFlight) return iceInFlight;

  // Lazy-load to avoid a hard import cycle with src/api/client.
  iceInFlight = (async () => {
    try {
      const { default: api } = await import("@/api/client");
      const { data } = await api.get<RTCConfiguration>(
        "/teleconsultation/ice-servers",
      );
      const config: RTCConfiguration = {
        iceServers: Array.isArray(data?.iceServers)
          ? data.iceServers
          : RTC_CONFIG.iceServers,
      };
      iceCache = { config, fetchedAt: Date.now() };
      return config;
    } catch (err) {
      console.warn(
        "[teleconsultation] ice-servers fetch failed, using STUN-only:",
        err,
      );
      return RTC_CONFIG;
    } finally {
      iceInFlight = null;
    }
  })();

  return iceInFlight;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface SOSRequest {
  patientId: string;
  patientName: string;
  description: string;
  location?: string;
}
