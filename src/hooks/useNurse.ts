"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/notify";
import { nurseService } from "@/api/nurse";
import { useAuthHydration } from "@/hooks/useAuthHydration";
import type { CheckInPayload } from "@/types/api";

export const NURSE_QUEUE_KEY = "nurse-queue";

/**
 * 30s auto-refresh follows the BE doc — long enough to stay well below
 * the throttle (300/min/IP) and short enough to surface SePay-confirmed
 * orders + cron-driven NO_SHOW transitions without manual intervention.
 */
const QUEUE_REFETCH_MS = 30_000;

export function useTodayQueue() {
  const isHydrated = useAuthHydration();
  return useQuery({
    queryKey: [NURSE_QUEUE_KEY, "today"],
    queryFn: () => nurseService.getTodayQueue(),
    enabled: isHydrated,
    staleTime: 15_000,
    refetchInterval: QUEUE_REFETCH_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: CheckInPayload;
    }) => nurseService.checkIn(appointmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NURSE_QUEUE_KEY] });
      toast.success("Đã check-in thành công");
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : raw || "Check-in thất bại";
      toast.error(msg);
    },
  });
}
