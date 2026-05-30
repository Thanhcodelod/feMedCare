"use client";
import { cn } from "@/utils/utils";
import { AppointmentStatus } from "@/data/mock";

// Clinical status chip — dot + label, no pill background by default.
// Reads like a workstation status indicator, not a marketing badge.
const config: Record<
  AppointmentStatus,
  { label: string; dot: string; text: string }
> = {
  pending: {
    label: "Chờ xác nhận",
    dot: "bg-warning",
    text: "text-warning",
  },
  confirmed: {
    label: "Đã xác nhận",
    dot: "bg-info",
    text: "text-info",
  },
  in_progress: {
    label: "Đang khám",
    dot: "bg-primary",
    text: "text-primary",
  },
  completed: {
    label: "Hoàn thành",
    dot: "bg-success",
    text: "text-success",
  },
  cancelled: {
    label: "Đã hủy",
    dot: "bg-muted-foreground/60",
    text: "text-muted-foreground",
  },
  no_show: {
    label: "Vắng",
    dot: "bg-destructive",
    text: "text-destructive",
  },
};

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium tracking-tight",
        cfg.text,
        className,
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)}
        aria-hidden
      />
      {cfg.label}
    </span>
  );
}
