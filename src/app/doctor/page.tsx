"use client";
import {
  Calendar,
  Video,
  MapPin,
  ChevronRight,
  Users,
  FileText,
  BarChart3,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/redux/authStore";
import { useDoctorAppointments } from "@/hooks/useAppointments";
import { useClientDate } from "@/hooks/useClientDate";
import { cn } from "@/utils/utils";
import type { Appointment } from "@/types/api";

function startMs(a: Appointment): number {
  if (!a.date) return 0;
  const t = /^\d{2}:\d{2}$/.test(a.startTime) ? a.startTime : "00:00";
  const d = new Date(`${a.date}T${t}:00`);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

export default function DoctorDashboard() {
  const navigate = useRouter();
  const user = useAuthStore((s) => s.user);
  const now = useClientDate();
  const today = now ? now.toISOString().split("T")[0] : "";
  const nowMs = now ? now.getTime() : 0;

  const { data: appointments = [], isLoading } = useDoctorAppointments();

  const todayAppts = appointments
    .filter((a) => a.date === today)
    .sort((a, b) => startMs(a) - startMs(b));

  const pending = appointments.filter((a) => a.status === "PENDING").length;
  const completed = appointments.filter((a) => a.status === "COMPLETED").length;
  const videoTotal = appointments.filter((a) => a.type === "ONLINE").length;
  const totalToday = todayAppts.length;

  // Next appointment = first today's slot that hasn't started, else first.
  const nextAppt =
    todayAppts.find(
      (a) =>
        startMs(a) >= nowMs &&
        (a.status === "CONFIRMED" || a.status === "IN_PROGRESS"),
    ) ?? null;

  const greeting = (() => {
    if (!now) return "Xin chào";
    const h = now.getHours();
    if (h < 12) return "Chào buổi sáng";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  })();

  const todayLabel = now
    ? now.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })
    : "";

  const metrics = [
    { value: totalToday, label: "Ca hôm nay" },
    { value: pending, label: "Chờ xác nhận" },
    { value: completed, label: "Đã khám" },
    { value: videoTotal, label: "Video call" },
  ];

  const quickActions = [
    { label: "Lịch khám", icon: Calendar, to: "/doctor/appointments" },
    { label: "Phòng video", icon: Video, to: "/doctor/telemedicine" },
    { label: "Bệnh nhân", icon: Users, to: "/doctor/patients" },
    { label: "Hồ sơ bệnh án", icon: FileText, to: "/doctor/records" },
    { label: "Thống kê", icon: BarChart3, to: "/doctor/analytics" },
  ];

  return (
    <DashboardLayout role="doctor" title="Tổng quan">
      {/* Header — serif greeting, mono date, no emoji */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">
            {greeting},{" "}
            <span className="text-primary">
              BS. {user?.fullName?.split(" ").pop()}
            </span>
          </h1>
          <p
            className="text-sm text-muted-foreground mt-1.5 capitalize"
            suppressHydrationWarning
          >
            {todayLabel}
          </p>
        </div>
      </header>

      {/* Metric strip — one row, vertical separators, no KPI cards */}
      <div className="border-y border-border grid grid-cols-2 sm:grid-cols-4 mb-10">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={cn(
              "py-4 px-1 sm:px-4",
              i > 0 && "sm:border-l border-border",
              i === 2 && "border-t sm:border-t-0 border-border",
              i === 3 && "border-t sm:border-t-0 border-border",
            )}
          >
            <div className="font-display text-3xl tabular-nums leading-none">
              {isLoading ? "—" : m.value}
            </div>
            <div className="section-title mt-2">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Workstation split: queue (anchor) + rail */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-x-10 gap-y-8 items-start">
        {/* Today's queue — the anchor block */}
        <section className="min-w-0">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-tight">
              Hàng đợi hôm nay
            </h2>
            <button
              onClick={() => navigate.push("/doctor/appointments")}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Tất cả lịch khám <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Next-up highlight */}
          {nextAppt && (
            <div className="mb-5 border border-primary/30 bg-primary/[0.03] rounded-md p-4">
              <div className="section-title text-primary mb-2">
                Ca kế tiếp
              </div>
              <div className="flex items-center gap-4">
                <div className="font-mono tabular-nums text-2xl text-primary">
                  {nextAppt.startTime}
                </div>
                <Avatar className="w-10 h-10 rounded-md">
                  <AvatarImage
                    src={
                      nextAppt.patientAvatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${nextAppt.patientId}`
                    }
                  />
                  <AvatarFallback className="rounded-md bg-secondary text-foreground font-semibold">
                    {nextAppt.patientName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base leading-tight truncate">
                    {nextAppt.patientName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    {nextAppt.type === "ONLINE" ? (
                      <Video className="w-3 h-3" />
                    ) : (
                      <MapPin className="w-3 h-3" />
                    )}
                    {nextAppt.type === "ONLINE" ? "Video call" : "Trực tiếp"}
                    {nextAppt.reason ? ` · ${nextAppt.reason}` : ""}
                  </p>
                </div>
                {nextAppt.type === "ONLINE" && (
                  <button
                    onClick={() =>
                      navigate.push(
                        `/doctor/telemedicine?room=${encodeURIComponent(
                          nextAppt.appointmentCode || nextAppt.id,
                        )}`,
                      )
                    }
                    className="btn-primary"
                  >
                    Vào phòng
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Full day timeline */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              Đang tải lịch khám…
            </p>
          ) : todayAppts.length === 0 ? (
            <div className="border border-dashed border-border rounded-md py-12 text-center">
              <Calendar className="w-7 h-7 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Hôm nay không có lịch khám nào.
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-md overflow-hidden">
              {todayAppts.map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    "data-row flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40",
                    nextAppt?.id === a.id && "bg-primary/[0.03]",
                  )}
                >
                  <span className="font-mono tabular-nums text-sm text-muted-foreground w-12">
                    {a.startTime}
                  </span>
                  <span className="text-muted-foreground/40">
                    {a.type === "ONLINE" ? (
                      <Video className="w-3.5 h-3.5" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <span className="font-display text-sm flex-1 min-w-0 truncate">
                    {a.patientName}
                  </span>
                  <StatusBadge status={a.status.toLowerCase() as any} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right rail — quick actions as text links */}
        <aside className="lg:sticky lg:top-4 space-y-6">
          <div>
            <div className="section-title mb-2">Thao tác nhanh</div>
            <nav className="border border-border rounded-md overflow-hidden">
              {quickActions.map((item) => (
                <button
                  key={item.to}
                  onClick={() => navigate.push(item.to)}
                  className="data-row group w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <item.icon
                    className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
                    strokeWidth={1.75}
                  />
                  <span className="text-sm flex-1">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground" />
                </button>
              ))}
            </nav>
          </div>

          {pending > 0 && (
            <div className="border border-warning/30 bg-warning/[0.06] rounded-md p-3">
              <p className="text-sm text-warning-foreground">
                <span className="font-mono tabular-nums font-semibold">
                  {pending}
                </span>{" "}
                lịch chờ xác nhận thanh toán.
              </p>
            </div>
          )}
        </aside>
      </div>
    </DashboardLayout>
  );
}
