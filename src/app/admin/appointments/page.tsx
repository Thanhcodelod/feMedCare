"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockAppointments } from "@/data/mock";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, MapPin, Clock } from "lucide-react";

export default function AdminAppointments() {
  return (
    <DashboardLayout role="admin" title="Lịch khám">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý lịch khám</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tất cả {mockAppointments.length} lịch khám trong hệ thống
        </p>
      </div>
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "Bệnh nhân",
                  "Bác sĩ",
                  "Ngày & Giờ",
                  "Hình thức",
                  "Lý do",
                  "Trạng thái",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-muted-foreground px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockAppointments.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border/50 hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={a.patientAvatar} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {a.patientName?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {a.patientName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {a.doctorName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {a.time} · {a.date}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${a.type === "video" ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {a.type === "video" ? (
                        <Video className="w-3.5 h-3.5" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5" />
                      )}
                      {a.type === "video" ? "Video" : "Trực tiếp"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[160px] truncate">
                    {a.reason}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
