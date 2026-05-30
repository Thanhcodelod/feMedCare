"use client";
import { Star, Users, Clock, Wifi, WifiOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Doctor } from "@/types/api";
import { cn } from "@/utils/utils";

interface DoctorCardProps {
  doctor: any;
  onBook?: (id: string) => void;
  compact?: boolean;
}

export function DoctorCard({
  doctor,
  onBook,
  compact = false,
}: DoctorCardProps) {
  return (
    <div
      className={cn(
        "card-elevated hover:shadow-md transition-all duration-200 hover:scale-[1.01]",
        compact ? "p-3" : "p-5",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <Avatar className={cn(compact ? "w-10 h-10" : "w-12 h-12")}>
            <AvatarImage src={doctor.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {doctor.name?.charAt(0) || doctor.fullName?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
              doctor.available ? "bg-success" : "bg-muted-foreground",
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-semibold text-foreground truncate",
              compact ? "text-sm" : "text-base",
            )}
          >
            {doctor.name || doctor.fullName}
          </p>
          <p className="text-xs text-muted-foreground">{doctor.specialty || doctor.specialization}</p>
          {doctor.consultation_fee && (
            <p className="text-xs font-medium text-primary mt-0.5">
              {Number(doctor.consultation_fee).toLocaleString("vi-VN")} VNĐ
            </p>
          )}
          {!compact && (
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-warning text-warning" />
                {doctor.rating ?? doctor.averageRating ?? 0}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                {doctor.patients}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {doctor.experience || `${doctor.yearsOfExperience ?? 0} năm`}
              </span>
            </div>
          )}
        </div>
        {!compact && onBook && (
          <Button
            size="sm"
            className="h-8 text-xs rounded-xl"
            disabled={!doctor.available}
            onClick={() => onBook(doctor.id)}
          >
            {doctor.available || doctor.verifyStatus === "VERIFIED" ? "Đặt lịch" : "Bận"}
          </Button>
        )}
      </div>
    </div>
  );
}
