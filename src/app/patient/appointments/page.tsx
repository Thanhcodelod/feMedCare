"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Calendar, Loader2, Star } from "lucide-react";
import { cn } from "@/utils/utils";
import {
  useMyAppointments,
  useCancelAppointment,
} from "@/hooks/useAppointments";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReviewDialog } from "@/components/shared/ReviewDialog";
import type { Appointment } from "@/types/api";

type StatusFilter =
  | "all"
  | "UPCOMING"
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED";

const tabs: { label: string; value: StatusFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Sắp tới", value: "UPCOMING" },
  { label: "Chờ xác nhận", value: "PENDING" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

/** Compose appointment date + start time into a comparable epoch ms. */
function apptStartMs(a: Appointment): number {
  if (!a.date) return 0;
  const t = a.startTime && /^\d{2}:\d{2}$/.test(a.startTime)
    ? a.startTime
    : "00:00";
  const d = new Date(`${a.date}T${t}:00`);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

/** "Sắp tới" = CONFIRMED/IN_PROGRESS AND start time still in the future.
 *  Past CONFIRMED slots stay in "Tất cả" (BE flips them to NO_SHOW
 *  later via cron) but are visually marked as overdue. */
function isUpcoming(a: Appointment, now: number): boolean {
  if (a.status !== "CONFIRMED" && a.status !== "IN_PROGRESS") return false;
  return apptStartMs(a) >= now;
}

function isOverdue(a: Appointment, now: number): boolean {
  if (a.status !== "CONFIRMED" && a.status !== "PENDING") return false;
  return apptStartMs(a) < now;
}

export default function PatientAppointments() {
  const navigate = useRouter();
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const [reviewAppt, setReviewAppt] = useState<Appointment | null>(null);
  const { data: appointments = [], isLoading } = useMyAppointments();
  const cancelMut = useCancelAppointment();

  const now = Date.now();

  const counts: Record<StatusFilter, number> = {
    all: appointments.length,
    UPCOMING: appointments.filter((a) => isUpcoming(a, now)).length,
    PENDING: appointments.filter((a) => a.status === "PENDING").length,
    COMPLETED: appointments.filter((a) => a.status === "COMPLETED").length,
    CANCELLED: appointments.filter((a) => a.status === "CANCELLED").length,
  };

  const filtered = appointments
    .filter((a) => {
      if (activeTab === "all") return true;
      if (activeTab === "UPCOMING") return isUpcoming(a, now);
      return a.status === activeTab;
    })
    // Newest activity first: sort by appointment start desc so the most
    // relevant items are on top regardless of tab.
    .sort((a, b) => apptStartMs(b) - apptStartMs(a));

  return (
    <DashboardLayout role="patient" title="Lịch của tôi">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lịch khám của tôi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {appointments.length} lịch hẹn tổng cộng
          </p>
        </div>
        <Button
          className="rounded-xl"
          onClick={() => navigate.push("/patient/book")}
        >
          <Calendar className="w-4 h-4 mr-2" /> Đặt lịch mới
        </Button>
      </div>

      <div className="flex gap-1 mb-5 bg-muted/40 rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab.value
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                activeTab === tab.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="grid gap-3">
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 card-elevated">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Không có lịch khám</p>
            <Button
              size="sm"
              className="mt-3 rounded-xl"
              onClick={() => navigate.push("/patient/book")}
            >
              Đặt lịch ngay
            </Button>
          </div>
        )}
        {filtered.map((appt: Appointment) => {
          const overdue = isOverdue(appt, now);
          return (
          <div
            key={appt.id}
            className={cn(
              "card-elevated p-4 flex items-center gap-4",
              overdue && "bg-warning/5",
            )}
          >
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appt.doctorId}`}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {appt.doctorName?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">
                {appt.doctorName || "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">
                {appt.doctorSpecialization}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">
                  📅 {appt.date} · {appt.startTime}
                </span>
                <span className="text-xs text-muted-foreground">
                  {appt.type === "ONLINE" ? "🎥 Video" : "📍 Trực tiếp"}
                </span>
              </div>
              {appt.reason && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  📝 {appt.reason}
                </p>
              )}
              {appt.status === "CANCELLED" && appt.cancellationReason && (
                <p className="text-xs text-destructive mt-0.5">
                  ⚠ Lý do huỷ: {appt.cancellationReason}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <StatusBadge status={appt.status.toLowerCase() as any} />
              {overdue && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                  Quá hạn
                </span>
              )}
              <div className="flex gap-1.5">
                {!overdue && appt.status === "CONFIRMED" && appt.type === "ONLINE" && (() => {
                  const today = new Date().toISOString().slice(0, 10);
                  const canJoin = appt.date === today;
                  return (
                    <Button
                      size="sm"
                      className="h-7 text-xs rounded-lg"
                      disabled={!canJoin}
                      title={
                        canJoin
                          ? undefined
                          : `Phòng chỉ mở vào ngày khám (${appt.date})`
                      }
                      onClick={() =>
                        navigate.push(
                          `/patient/telemedicine?room=${encodeURIComponent(
                            appt.appointmentCode || appt.id,
                          )}`,
                        )
                      }
                    >
                      Tham gia
                    </Button>
                  );
                })()}
                {appt.status === "COMPLETED" &&
                  (appt.review ? (
                    <div
                      className="flex items-center gap-1 px-2 h-7 rounded-lg bg-success/10 text-success text-xs font-medium"
                      title={
                        appt.review.comment
                          ? `Đã đánh giá: "${appt.review.comment}"`
                          : "Đã đánh giá"
                      }
                    >
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "w-3 h-3",
                            s <= appt.review!.rating
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/30",
                          )}
                        />
                      ))}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs rounded-lg"
                      onClick={() => setReviewAppt(appt)}
                    >
                      <Star className="w-3 h-3 mr-1" /> Đánh giá
                    </Button>
                  ))}
                {!overdue &&
                  (appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs rounded-lg text-destructive border-destructive/30"
                      disabled={cancelMut.isPending}
                      onClick={() => cancelMut.mutate(appt.id)}
                    >
                      {cancelMut.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Hủy"
                      )}
                    </Button>
                  )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {reviewAppt && (
        <ReviewDialog
          open={!!reviewAppt}
          onOpenChange={(open) => !open && setReviewAppt(null)}
          appointmentId={reviewAppt.id}
          doctorName={reviewAppt.doctorName}
        />
      )}
    </DashboardLayout>
  );
}
