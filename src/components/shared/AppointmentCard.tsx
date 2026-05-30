"use client";
import { Video, MapPin, Clock, MoreVertical, Phone, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./StatusBadge";
import { Appointment } from "@/data/mock";
import { cn } from "@/utils/utils";

interface AppointmentCardProps {
  appointment: Appointment;
  viewAs?: "doctor" | "patient";
  onStartCall?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onCancel?: (id: string) => void;
  compact?: boolean;
}

export function AppointmentCard({ appointment, viewAs = "doctor", onStartCall, onViewDetails, onCancel, compact = false }: AppointmentCardProps) {
  const name = viewAs === "doctor" ? appointment.patientName : appointment.doctorName;
  const avatar = viewAs === "doctor" ? appointment.patientAvatar : undefined;
  const subtitle = viewAs === "doctor" ? appointment.reason : appointment.doctorSpecialty;

  return (
    <div className={cn(
      "card-elevated p-4 hover:shadow-md transition-all duration-200 group",
      compact ? "p-3" : "p-4"
    )}>
      <div className="flex items-start gap-3">
        <Avatar className={cn(compact ? "w-9 h-9" : "w-10 h-10", "flex-shrink-0")}>
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
            {name.split(" ").pop()?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {appointment.time}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {appointment.type === "video" ? (
                <><Video className="w-3 h-3 text-primary" /><span className="text-primary">Video</span></>
              ) : (
                <><MapPin className="w-3 h-3" />Trực tiếp</>
              )}
            </span>
          </div>

          {!compact && (
            <div className="flex items-center gap-2 mt-3">
              {appointment.status === "confirmed" && appointment.type === "video" && (
                <Button
                  size="sm"
                  className="h-7 text-xs rounded-lg px-3"
                  onClick={() => onStartCall?.(appointment.id)}
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Bắt đầu call
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs rounded-lg px-3"
                onClick={() => onViewDetails?.(appointment.id)}
              >
                <Eye className="w-3 h-3 mr-1" />
                Chi tiết
              </Button>
              {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs rounded-lg px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onCancel?.(appointment.id)}
                >
                  Hủy
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
