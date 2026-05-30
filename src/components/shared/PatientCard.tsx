"use client";
import { Phone, Calendar, Droplets, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Patient } from "@/data/mock";
import { cn } from "@/utils/utils";

interface PatientCardProps {
  patient: Patient;
  onView?: (id: string) => void;
  compact?: boolean;
}

export function PatientCard({
  patient,
  onView,
  compact = false,
}: PatientCardProps) {
  return (
    <div
      className={cn(
        "card-elevated hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.01]",
        compact ? "p-3" : "p-5",
      )}
      onClick={() => onView?.(patient.id)}
    >
      <div className="flex items-center gap-3">
        <Avatar
          className={cn(compact ? "w-10 h-10" : "w-12 h-12", "flex-shrink-0")}
        >
          <AvatarImage src={patient.avatar} />
          <AvatarFallback className="bg-success/10 text-success font-semibold text-sm">
            {patient.name?.charAt(0) || "P"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-semibold text-foreground truncate",
              compact ? "text-sm" : "text-base",
            )}
          >
            {patient.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {patient.diagnosis}
          </p>
          {!compact && (
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                {patient.gender}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Droplets className="w-3 h-3 text-destructive" />
                {patient.bloodType}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {patient.lastVisit}
              </span>
            </div>
          )}
        </div>
        {!compact && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs rounded-xl flex-shrink-0"
          >
            Xem hồ sơ
          </Button>
        )}
      </div>
    </div>
  );
}
