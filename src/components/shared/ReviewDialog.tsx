"use client";
import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/utils";
import { useCreateReview } from "@/hooks/useReviews";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  /** Display-only — BE resolves the actual doctor from
   *  appointment.doctor_id and rejects any client-supplied id. */
  doctorName: string;
}

export function ReviewDialog({ open, onOpenChange, appointmentId, doctorName }: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const createReview = useCreateReview();

  const handleSubmit = () => {
    if (rating === 0) return;
    createReview.mutate(
      {
        appointment_id: appointmentId,
        rating,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setRating(0);
          setComment("");
        },
        onError: (err: any) => {
          // 409 = duplicate review. The dialog has no business staying
          // open after that — close it so the row's star badge can show.
          if (err?.response?.status === 409) {
            onOpenChange(false);
            setRating(0);
            setComment("");
          }
        },
      }
    );
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đánh giá bác sĩ</DialogTitle>
          <DialogDescription>Chia sẻ trải nghiệm khám với BS. {doctorName}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* Star rating */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors",
                    star <= displayRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {displayRating === 0 && "Chọn số sao"}
            {displayRating === 1 && "Rất không hài lòng"}
            {displayRating === 2 && "Không hài lòng"}
            {displayRating === 3 && "Bình thường"}
            {displayRating === 4 && "Hài lòng"}
            {displayRating === 5 && "Rất hài lòng"}
          </p>

          {/* Comment */}
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhận xét thêm về bác sĩ (không bắt buộc)..."
            className="resize-none"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground self-end">{comment.length}/500</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="flex-1 rounded-xl"
            disabled={rating === 0 || createReview.isPending}
            onClick={handleSubmit}
          >
            {createReview.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Gửi đánh giá
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
