"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Monitor,
  MessageSquare,
  Maximize2,
  Wifi,
  WifiOff,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/utils/utils";
import { useTelemedicine } from "@/hooks/useTelemedicine";
import { useSOS } from "@/hooks/useSOS";
import { useAuthStore } from "@/redux/authStore";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy } from "lucide-react";

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function DoctorTelemedicineInner() {
  const searchParams = useSearchParams();
  const navigate = useRouter();
  const roomId = searchParams.get("room") || "";
  const user = useAuthStore((s) => s.user);

  const [notes, setNotes] = useState("");
  const [tab, setTab] = useState<"info" | "notes" | "chat">("info");
  const [chatInput, setChatInput] = useState("");

  const { incomingSOS, acceptSOS } = useSOS({ role: "doctor" });

  const {
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
    canSend,
    localVideoRef,
    remoteVideoRef,
    toggleMic,
    toggleCam,
    sendMessage,
    endCall,
  } = useTelemedicine({ roomId, autoJoin: !!roomId, role: "doctor" });

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
    navigate.push("/doctor/appointments");
  };

  if (!roomId) {
    return (
      <DashboardLayout role="doctor" title="Telemedicine">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Telemedicine</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Chờ cuộc gọi hoặc tiếp nhận SOS
          </p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          {incomingSOS ? (
            <div className="card-elevated p-8 max-w-md w-full text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
              </div>
              <h2 className="text-xl font-bold">🚨 SOS Emergency</h2>
              <p className="text-sm text-muted-foreground">
                Bệnh nhân <strong>{incomingSOS.patientName}</strong> đang cần hỗ
                trợ cấp cứu!
              </p>
              <Button
                size="lg"
                className="w-full bg-destructive hover:bg-destructive/90"
                onClick={() => acceptSOS(incomingSOS.roomId)}
              >
                Tiếp nhận cuộc gọi SOS
              </Button>
            </div>
          ) : (
            <div className="card-elevated p-8 max-w-md w-full text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Video className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Sẵn sàng tư vấn</h2>
              <p className="text-sm text-muted-foreground">
                Vào cuộc gọi từ trang <strong>Lịch khám</strong> hoặc chờ tiếp
                nhận SOS Emergency.
              </p>
              <Badge variant="outline" className="gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Đang lắng nghe SOS
              </Badge>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor" title="Video Call">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Telemedicine</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tư vấn từ xa — Phòng:{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
            {roomId}
          </code>
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Không thể tham gia phòng tư vấn</p>
            <p className="text-xs opacity-90 mt-0.5">{error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg h-8"
            onClick={() => navigate.push("/doctor/appointments")}
          >
            Về lịch khám
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
        {/* Main video area */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="flex-1 bg-gray-900 rounded-md relative overflow-hidden">
            {/* Remote video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={cn(
                "w-full h-full object-cover",
                !callActive && "hidden",
              )}
            />
            {!callActive && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-3">
                    <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                      {remoteUser?.name?.charAt(0) || "BN"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white font-semibold">
                    {peerStatus === "gone"
                      ? "Bệnh nhân đã rời cuộc gọi"
                      : remoteUser?.name || "Đang chờ bệnh nhân..."}
                  </p>
                  <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                    {peerStatus === "reconnecting" && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    {peerStatus === "reconnecting"
                      ? "Đang kết nối lại..."
                      : peerStatus === "gone"
                        ? "Vui lòng kết thúc và liên hệ lại sau"
                        : connected
                          ? "Đã kết nối, chờ video... (bệnh nhân thường vào trong 1–2 phút)"
                          : "Đang kết nối..."}
                  </p>
                </div>
              </div>
            )}

            {/* R1 overlay: peer mid-reconnect while video frame is frozen */}
            {callActive && peerStatus === "reconnecting" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm font-semibold">Đang kết nối lại với bệnh nhân...</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Hệ thống sẽ tự khôi phục trong 30 giây
                  </p>
                </div>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                {connected ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Đã kết nối
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-destructive" />
                    Mất kết nối
                  </>
                )}
              </span>
              {callActive && (
                <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  {formatDuration(callDuration)}
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

            {/* Self PIP */}
            <div className="absolute bottom-4 right-4 w-36 h-24 bg-gray-700 rounded-xl border-2 border-white/20 overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={cn("w-full h-full object-cover", !camOn && "hidden")}
              />
              {!camOn && (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="card-elevated p-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleMic}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-colors",
                  micOn
                    ? "bg-muted hover:bg-muted/80"
                    : "bg-destructive text-white",
                )}
              >
                {micOn ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={toggleCam}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-colors",
                  camOn
                    ? "bg-muted hover:bg-muted/80"
                    : "bg-destructive text-white",
                )}
              >
                {camOn ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <VideoOff className="w-5 h-5" />
                )}
              </button>
              <button onClick={() => {}} className="w-11 h-11 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </button>
              <button onClick={() => {}} className="w-11 h-11 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center">
                <Maximize2 className="w-5 h-5" />
              </button>
              <div className="w-px h-8 bg-border mx-1" />
              <Button
                onClick={handleEndCall}
                className="bg-destructive hover:bg-destructive/90 text-white rounded-full px-6 h-11 gap-2"
              >
                <Phone className="w-4 h-4" />
                Kết thúc
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar panel */}
        <div className="lg:col-span-1 card-elevated flex flex-col">
          <div className="flex border-b border-border p-1.5 gap-1">
            {(["info", "notes", "chat"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors",
                  tab === t
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "info"
                  ? "Bệnh nhân"
                  : t === "notes"
                    ? "Ghi chú"
                    : `Chat (${messages.length})`}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {tab === "info" && remoteUser && (
              <div className="space-y-4">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-2">
                    <AvatarFallback className="bg-success/10 text-success text-lg font-bold">
                      {remoteUser.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-sm">
                    {remoteUser.name || "Unknown"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {}}
                  className="w-full rounded-xl text-xs"
                >
                  Xem hồ sơ đầy đủ
                </Button>
              </div>
            )}

            {tab === "notes" && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Ghi chú cuộc khám
                </p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  className="resize-none text-sm min-h-[200px] rounded-xl"
                />
                <Button size="sm" onClick={() => {}} className="w-full rounded-xl">
                  Lưu ghi chú
                </Button>
              </div>
            )}

            {tab === "chat" && (
              <div className="flex flex-col h-full space-y-3">
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {messages.map((msg, idx) => (
                    <div
                      key={`${msg.id}-${idx}`}
                      className={cn(
                        "flex",
                        msg.senderId === user?.id
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "text-xs px-3 py-2 rounded-md max-w-[80%]",
                          msg.senderId === user?.id
                            ? "bg-primary text-white rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm",
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canSend) {
                        sendMessage(chatInput);
                        setChatInput("");
                      }
                    }}
                    placeholder={
                      canSend ? "Nhắn tin..." : "Đang chờ giới hạn tần suất..."
                    }
                    className="text-xs h-8 rounded-xl"
                    disabled={!canSend}
                  />
                  <Button
                    size="sm"
                    className="h-8 rounded-xl px-3"
                    disabled={!canSend}
                    onClick={() => {
                      sendMessage(chatInput);
                      setChatInput("");
                    }}
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function DoctorTelemedicine() {
  return (
    <Suspense fallback={null}>
      <DoctorTelemedicineInner />
    </Suspense>
  );
}
