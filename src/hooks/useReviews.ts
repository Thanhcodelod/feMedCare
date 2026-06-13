import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/notify";
import { reviewService } from "@/api/review";
import { DOCTORS_KEY } from "@/hooks/useDoctors";
import { APPOINTMENTS_KEY } from "@/hooks/useAppointments";
import type { CreateReviewPayload } from "@/types/api";

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewService.create(payload),
    onSuccess: (data) => {
      // BE returns the created Review with `doctorId` populated (it
      // looked it up from appointment.doctor_id). Use that to scope
      // invalidation precisely; broad DOCTORS_KEY invalidation refreshes
      // the rating average on lists too.
      if (data?.doctorId) {
        qc.invalidateQueries({
          queryKey: [DOCTORS_KEY, data.doctorId, "reviews"],
        });
      }
      qc.invalidateQueries({ queryKey: [DOCTORS_KEY] });
      // Refetch the patient's appointment list so the "Đánh giá" CTA
      // flips to "Đã đánh giá" without a manual reload — the appointment
      // row now carries the review relation.
      qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
      toast.success("Cảm ơn bạn đã đánh giá!");
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : raw || "Gửi đánh giá thất bại";
      // 409 = BE đã có review cho lịch này — FE đang hiển thị nút sai
      // (BE list endpoint chưa trả `review` relation). Refetch list để
      // ô badge stars hiện ra, đồng thời thông báo nhẹ thay vì error đỏ.
      if (status === 409) {
        qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
        toast.info("Bạn đã đánh giá lịch khám này rồi.");
        return;
      }
      toast.error(msg);
    },
  });
}
