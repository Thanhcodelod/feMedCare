"use client";
import {
  Calendar,
  Video,
  MapPin,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LocaleDate } from "@/components/shared/LocaleDate";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/redux/authStore";
import { useMyAppointments } from "@/hooks/useAppointments";
import { useDoctors } from "@/hooks/useDoctors";
import { cn } from "@/utils/utils";
import type { Appointment } from "@/types/api";

function apptStartMs(a: Appointment): number {
  if (!a.date) return 0;
  const t = a.startTime && /^\d{2}:\d{2}$/.test(a.startTime)
    ? a.startTime
    : "00:00";
  const d = new Date(`${a.date}T${t}:00`);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function PatientDashboard() {
  const navigate = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: appointments = [], isLoading: loadingAppts } =
    useMyAppointments();
  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors();

  const now = Date.now();

  const upcoming = appointments
    .filter((a) => a.status === "CONFIRMED" || a.status === "IN_PROGRESS")
    .filter((a) => apptStartMs(a) >= now)
    .sort((a, b) => apptStartMs(a) - apptStartMs(b));

  const upcomingWithinWeek = upcoming.filter(
    (a) => apptStartMs(a) <= now + SEVEN_DAYS_MS,
  );
  const completed = appointments.filter((a) => a.status === "COMPLETED");
  const completedVideo = completed.filter((a) => a.type === "ONLINE").length;

  const metrics = [
    { value: upcomingWithinWeek.length, label: "Sắp tới (7 ngày)" },
    { value: completed.length, label: "Đã khám" },
    { value: completedVideo, label: "Video call" },
  ];

  return (
    <DashboardLayout role="patient" title="Tổng quan">
      {/* Header — serif, no emoji */}
      <header className="mb-6">
        <h1 className="text-3xl">
          Xin chào,{" "}
          <span className="text-primary">{user?.fullName}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Theo dõi lịch khám và chăm sóc sức khoẻ của bạn.
        </p>
      </header>

      {/* Metric strip */}
      <div className="border-y border-border grid grid-cols-3 mb-10">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={cn("py-4 px-1 sm:px-4", i > 0 && "border-l border-border")}
          >
            <div className="font-display text-3xl tabular-nums leading-none">
              {loadingAppts ? "—" : m.value}
            </div>
            <div className="section-title mt-2">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-x-10 gap-y-8 items-start">
        {/* Upcoming — anchor */}
        <section className="min-w-0">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-tight">
              Lịch khám sắp tới
            </h2>
            <button
              onClick={() => navigate.push("/patient/appointments")}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Tất cả <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {loadingAppts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="border border-dashed border-border rounded-md py-12 text-center">
              <Calendar className="w-7 h-7 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Bạn chưa có lịch khám sắp tới.
              </p>
              <Button size="sm" onClick={() => navigate.push("/patient/book")}>
                Đặt lịch ngay
              </Button>
            </div>
          ) : (
            <div className="border border-border rounded-md overflow-hidden">
              {upcoming.map((a, idx) => (
                <div
                  key={a.id}
                  className={cn(
                    "data-row flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40",
                    idx === 0 && "bg-primary/[0.03]",
                  )}
                >
                  <div className="text-center w-14 flex-shrink-0">
                    <div className="font-mono tabular-nums text-sm leading-none">
                      {a.startTime}
                    </div>
                    <div className="text-2xs text-muted-foreground mt-1">
                      <LocaleDate
                        value={a.date}
                        options={{ day: "2-digit", month: "2-digit" }}
                      />
                    </div>
                  </div>
                  <Avatar className="w-9 h-9 rounded-md flex-shrink-0">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${a.doctorId}`}
                    />
                    <AvatarFallback className="rounded-md bg-secondary text-foreground text-xs font-semibold">
                      {a.doctorName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm leading-tight truncate">
                      {a.doctorName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      {a.type === "ONLINE" ? (
                        <Video className="w-3 h-3" />
                      ) : (
                        <MapPin className="w-3 h-3" />
                      )}
                      {a.doctorSpecialization}
                    </p>
                  </div>
                  <StatusBadge status={a.status.toLowerCase() as any} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Rail — book CTA + suggested doctors */}
        <aside className="lg:sticky lg:top-4 space-y-6">
          <div className="bg-primary text-primary-foreground rounded-md p-5">
            <h3 className="font-display text-lg leading-tight">Đặt lịch khám</h3>
            <p className="text-xs text-primary-foreground/75 mt-1.5 mb-4">
              Chọn bác sĩ chuyên khoa và khung giờ phù hợp.
            </p>
            <Button
              variant="outline"
              className="w-full bg-card text-primary border-0 hover:bg-card/90"
              onClick={() => navigate.push("/patient/book")}
            >
              Đặt lịch ngay
            </Button>
          </div>

          <div>
            <div className="section-title mb-2">Bác sĩ nổi bật</div>
            {loadingDoctors ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="border border-border rounded-md overflow-hidden">
                {doctors.slice(0, 4).map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => navigate.push("/patient/book")}
                    className="data-row group w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="w-8 h-8 rounded-md flex-shrink-0">
                      <AvatarImage
                        src={
                          doc.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.id}`
                        }
                      />
                      <AvatarFallback className="rounded-md bg-secondary text-foreground text-xs font-semibold">
                        {(doc.fullName || doc.name || "?").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm leading-tight truncate">
                        {doc.fullName || doc.name}
                      </p>
                      <p className="text-2xs text-muted-foreground truncate">
                        {doc.specialization} · {(doc.averageRating ?? 0).toFixed(1)} ★
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
