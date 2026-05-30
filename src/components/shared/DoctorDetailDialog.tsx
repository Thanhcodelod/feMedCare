"use client";
import { Star, Loader2, Clock, Users, Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/utils";
import { useDoctorReviews } from "@/hooks/useDoctors";
import { LocaleDate } from "@/components/shared/LocaleDate";
import type { Doctor } from "@/types/api";

interface DoctorDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor;
}

export function DoctorDetailDialog({
  open,
  onOpenChange,
  doctor,
}: DoctorDetailDialogProps) {
  const { data: reviews = [], isLoading } = useDoctorReviews(doctor.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={
                  doctor.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.id}`
                }
              />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                {doctor.fullName?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-lg">
                {doctor.fullName || "N/A"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {doctor.specialization}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-foreground">
                    {(doctor.averageRating ?? 0).toFixed(1)}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" /> {doctor.totalPatients ?? 0}{" "}
                  bệnh nhân
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />{" "}
                  {doctor.yearsOfExperience ?? doctor.experience_years ?? 0} năm
                </span>
                {doctor.consultation_fee && (
                  <span className="flex items-center gap-1 text-xs text-primary font-medium">
                    {Number(doctor.consultation_fee).toLocaleString("vi-VN")} VNĐ
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Bio */}
        {doctor.bio && (
          <div className="px-6 pb-4 pt-1">
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              "{doctor.bio}"
            </p>
          </div>
        )}

        {/* Rating summary bar */}
        <div className="px-6 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Đánh giá từ bệnh nhân</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {reviews.length} đánh giá
            </span>
          </div>
        </div>

        {/* Reviews list */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 pt-4 space-y-3">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && reviews.length === 0 && (
              <div className="text-center py-8">
                <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Chưa có đánh giá nào
                </p>
              </div>
            )}

            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-border p-3.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-muted text-xs font-semibold">
                        {review.patientName?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {review.patientName || "Unknown"}
                    </span>
                  </div>
                  <LocaleDate
                    value={review.createdAt}
                    className="text-xs text-muted-foreground"
                  />
                </div>
                <div className="flex gap-0.5 mb-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "w-3.5 h-3.5",
                        s <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/20",
                      )}
                    />
                  ))}
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
