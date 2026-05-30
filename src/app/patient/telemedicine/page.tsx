"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Mic, MicOff, Video, VideoOff, Phone, MessageSquare,
  Maximize2, Wifi, WifiOff, Clock, AlertCircle, Loader2, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/utils/utils";
import { useTelemedicine } from "@/hooks/useTelemedicine";
import { useAuthStore } from "@/redux/authStore";
import { toast } from "sonner";

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function PatientTelemedicineInner() {
  const searchParams = useSearchParams();
  const navigate = useRouter();
  const roomId = searchParams.get("room") || "";
  const user = useAuthStore((s) => s.user);
  const [chatInput, setChatInput] = useState("");

  const {
    connected, callActive, remoteUser, messages, callDuration,
    micOn, camOn, error, peerStatus, connectionQuality, canSend,
    localVideoRef, remoteVideoRef,
    toggleMic, toggleCam, sendMessage, endCall,
  } = useTelemedicine({ roomId, autoJoin: !!roomId, role: "patient" });

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Đã sao chép mã phòng");
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  const handleEndCall = () => {
    endCall();
    navigate.push("/patient/appointments");
  };

  if (!roomId) {
    return (
      <DashboardLayout role="patient" title="Tư vấn video">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="card-elevated p-8 max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Video className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Chưa có cuộc gọi</h2>
            <p className="text-sm text-muted-foreground">
              Vào cuộc gọi từ trang <strong>Lịch khám</strong> của bạn, hoặc sử dụng <strong>SOS Emergency</strong> khi cần cấp cứu.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate.push("/patient/appointments")}>
                Xem lịch khám
              </Button>
              <Button className="flex-1 bg-destructive hover:bg-destructive/90" onClick={() => navigate.push("/patient/sos")}>
                🚨 SOS
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="patient" title="Tư vấn video">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Tư vấn từ xa</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Kết nối với bác sĩ qua video</p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Không thể tham gia phòng tư vấn</p>
            <p className="text-xs opacity-90 mt-0.5">{error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg h-8"
            onClick={() => navigate.push("/patient/appointments")}
          >
            Về lịch khám
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ height: "calc(100vh - 220px)" }}>
        {/* Video area */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="flex-1 bg-gray-900 rounded-md relative overflow-hidden flex items-center justify-center">
            <video ref={remoteVideoRef} autoPlay playsInline className={cn("w-full h-full object-cover", !callActive && "hidden")} />
            {!callActive && (
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-3">
                  <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">BS</AvatarFallback>
                </Avatar>
                <p className="text-white font-semibold">
                  {peerStatus === "gone"
                    ? "Bác sĩ đã rời cuộc gọi"
                    : remoteUser?.name || "Đang chờ bác sĩ..."}
                </p>
                <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                  {peerStatus === "reconnecting" && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  {peerStatus === "reconnecting"
                    ? "Đang kết nối lại..."
                    : peerStatus === "gone"
                      ? "Cuộc gọi đã kết thúc"
                      : connected
                        ? "Đã kết nối, chờ video... (bác sĩ thường vào trong 1–2 phút)"
                        : "Đang kết nối..."}
                </p>
              </div>
            )}

            {callActive && peerStatus === "reconnecting" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm font-semibold">Đang kết nối lại với bác sĩ...</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Hệ thống sẽ tự khôi phục trong 30 giây
                  </p>
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                {connected ? (
                  <><div className="w-2 h-2 rounded-full bg-success animate-pulse" />Đã kết nối</>
                ) : (
                  <><WifiOff className="w-3 h-3 text-destructive" />Mất kết nối</>
                )}
              </span>
              {callActive && (
                <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                  <Clock className="w-3 h-3" />{formatDuration(callDuration)}
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={copyRoomCode}
                className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/70 transition-colors"
                title="Sao chép mã phòng"
              >
                <Copy className="w-3 h-3" />
                {roomId}
              </button>
              <span
                className={cn(
                  "flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full",
                  connectionQuality === "poor" && "text-destructive",
                  connectionQuality === "fair" && "text-warning",
                )}
              >
                {connectionQuality === "poor" ? (
                  <WifiOff className="w-3 h-3" />
                ) : (
                  <Wifi
                    className={cn(
                      "w-3 h-3",
                      connectionQuality === "good" && "text-success",
                      connectionQuality === "fair" && "text-warning",
                      connectionQuality === "unknown" && "text-gray-400",
                    )}
                  />
                )}
                {connectionQuality === "good"
                  ? "Mạng tốt"
                  : connectionQuality === "fair"
                    ? "Mạng yếu"
                    : connectionQuality === "poor"
                      ? "Mạng kém"
                      : "HD"}
              </span>
            </div>

            <div className="absolute bottom-4 right-4 w-36 h-24 bg-gray-700 rounded-xl border-2 border-white/20 overflow-hidden">
              <video ref={localVideoRef} autoPlay muted playsInline className={cn("w-full h-full object-cover", !camOn && "hidden")} />
              {!camOn && (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <div className="card-elevated p-4">
            <div className="flex items-center justify-center gap-3">
              <button onClick={toggleMic} className={cn("w-11 h-11 rounded-full flex items-center justify-center", micOn ? "bg-muted" : "bg-destructive text-white")}>
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button onClick={toggleCam} className={cn("w-11 h-11 rounded-full flex items-center justify-center", camOn ? "bg-muted" : "bg-destructive text-white")}>
                {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button onClick={() => {}} className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button onClick={() => {}} className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                <Maximize2 className="w-5 h-5" />
              </button>
              <div className="w-px h-8 bg-border mx-1" />
              <Button onClick={handleEndCall} className="bg-destructive hover:bg-destructive/90 text-white rounded-full px-6 h-11 gap-2">
                <Phone className="w-4 h-4" />Kết thúc
              </Button>
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <div className="card-elevated flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold">Chat với bác sĩ</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">Chưa có tin nhắn</p>
            )}
            {messages.map((msg, idx) => (
              <div key={`${msg.id}-${idx}`} className={cn("flex", msg.senderId === user?.id ? "justify-end" : "justify-start")}>
                <div className={cn("text-xs px-3 py-2 rounded-md max-w-[85%]", msg.senderId === user?.id ? "bg-primary text-white rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm")}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && canSend) { sendMessage(chatInput); setChatInput(""); } }}
              placeholder={canSend ? "Nhắn tin..." : "Đang chờ giới hạn tần suất..."}
              className="text-xs h-8 rounded-xl"
              disabled={!canSend}
            />
            <Button
              size="sm"
              className="h-8 rounded-xl px-3"
              disabled={!canSend}
              onClick={() => { sendMessage(chatInput); setChatInput(""); }}
            >
              Gửi
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PatientTelemedicine() {
  return (
    <Suspense fallback={null}>
      <PatientTelemedicineInner />
    </Suspense>
  );
}
