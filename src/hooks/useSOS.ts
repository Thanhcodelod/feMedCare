"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  SocketEvents,
  SOCKET_FORCE_LOGOUT_MESSAGES,
} from "@/services/teleconsultationService";
import { useAuthStore } from "@/redux/authStore";

interface UseSOSOptions {
  role: "patient" | "doctor";
}

interface SOSInfo {
  roomId: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  description?: string;
}

export function useSOS({ role }: UseSOSOptions) {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "searching" | "matched" | "no_doctor"
  >("idle");
  const [sosInfo, setSosInfo] = useState<SOSInfo | null>(null);
  const [incomingSOS, setIncomingSOS] = useState<SOSInfo | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    const socket = connectSocket();

    const onReady = () => {
      readyRef.current = true;
    };
    const onDisconnect = () => {
      readyRef.current = false;
    };
    const onDispatched = (data: SOSInfo) => setIncomingSOS(data);
    const onAccepted = (data: SOSInfo) => {
      setSosInfo(data);
      setStatus("matched");
    };
    const onNoDoctor = () => setStatus("no_doctor");
    const onError = (err: unknown) => {
      const msg =
        typeof err === "string"
          ? err
          : (err as { message?: string })?.message ?? "Unknown SOS error";
      // BE has just disconnected this socket — wipe session.
      if (SOCKET_FORCE_LOGOUT_MESSAGES.has(msg)) {
        disconnectSocket();
        logout();
        router.push("/login?reason=session_expired");
        return;
      }
      console.error("SOS error:", msg);
    };

    socket.on(SocketEvents.READY, onReady);
    socket.on("disconnect", onDisconnect);
    if (role === "doctor") {
      socket.on(SocketEvents.SOS_DISPATCHED, onDispatched);
    }
    socket.on(SocketEvents.SOS_ACCEPTED, onAccepted);
    socket.on(SocketEvents.SOS_NO_DOCTOR, onNoDoctor);
    socket.on(SocketEvents.ERROR, onError);

    return () => {
      socket.off(SocketEvents.READY, onReady);
      socket.off("disconnect", onDisconnect);
      socket.off(SocketEvents.SOS_DISPATCHED, onDispatched);
      socket.off(SocketEvents.SOS_ACCEPTED, onAccepted);
      socket.off(SocketEvents.SOS_NO_DOCTOR, onNoDoctor);
      socket.off(SocketEvents.ERROR, onError);
    };
  }, [role, logout, router]);

  // BE auto-fills patientId/patientName/doctorId/doctorName from the JWT
  // on its side and includes them in the SOS_DISPATCHED / SOS_ACCEPTED
  // events. Sending them again here would be rejected by the BE's
  // `forbidNonWhitelisted` ValidationPipe ("property X should not exist").
  const sendSOS = useCallback((description: string) => {
    setStatus("searching");
    getSocket().emit(SocketEvents.SOS_REQUEST, { description });
  }, []);

  const acceptSOS = useCallback((roomId: string) => {
    getSocket().emit(SocketEvents.SOS_ACCEPT, { roomId });
    setIncomingSOS(null);
  }, []);

  return { status, sosInfo, incomingSOS, sendSOS, acceptSOS };
}
