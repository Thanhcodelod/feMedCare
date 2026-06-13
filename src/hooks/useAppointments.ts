import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "@/lib/notify";
import { appointmentService } from "@/api/appointment";
import { useAuthHydration } from "@/hooks/useAuthHydration";
import { useAuthStore } from "@/redux/authStore";
import { ORDERS_KEY } from "@/hooks/usePayment";
import type { BookAppointmentPayload, BookAppointmentRequestPayload, CompleteAppointmentPayload } from "@/types/api";

export const APPOINTMENTS_KEY = "appointments";

type MyListParams = { status?: string; page?: number; limit?: number };
type DoctorListParams = { status?: string; date?: string; page?: number; limit?: number };
type HistoryParams = { limit?: number; offset?: number; sort?: string };

/**
 * Shared cache policy for appointment lists. Trades real-time freshness
 * for far fewer GET round-trips:
 *  - staleTime 10m: appointment lists don't churn minute-to-minute. Any
 *    user-driven change (book/cancel/complete/review) already invalidates
 *    APPOINTMENTS_KEY manually, so cache is always fresh after writes.
 *  - gcTime 30m: keep cached rows in memory across route changes so
 *    navigating back to /patient/appointments after a quick detour is
 *    instant and silent (no GET).
 *  - refetchOnMount false: cache hit doesn't trigger a network call —
 *    crucial because /patient (dashboard) + /patient/appointments BOTH
 *    consume this query; without this, the second mount always refetches.
 *  - refetchOnReconnect false: a wifi blip shouldn't burst-fetch every
 *    open tab back to BE; user can pull-to-refresh manually if needed.
 */
const APPOINTMENT_LIST_QUERY_OPTS = {
  staleTime: 10 * 60_000,
  gcTime: 30 * 60_000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export function useMyAppointments(params?: MyListParams) {
  const isHydrated = useAuthHydration();
  // Gate on token presence — without it the axios interceptor sends a
  // request without Authorization, BE returns 401/empty, and we'd
  // cache that empty result for 10 minutes.
  const token = useAuthStore((s) => s.token);
  const stable = useMemo<MyListParams>(
    () => ({ status: params?.status, page: params?.page, limit: params?.limit }),
    [params?.status, params?.page, params?.limit],
  );
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, "my", stable],
    queryFn: () => appointmentService.getMyAppointments(stable),
    enabled: isHydrated && !!token,
    ...APPOINTMENT_LIST_QUERY_OPTS,
  });
}

export function useDoctorAppointments(params?: DoctorListParams) {
  const isHydrated = useAuthHydration();
  const token = useAuthStore((s) => s.token);
  const stable = useMemo<DoctorListParams>(
    () => ({
      status: params?.status,
      date: params?.date,
      page: params?.page,
      limit: params?.limit,
    }),
    [params?.status, params?.date, params?.page, params?.limit],
  );
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, "doctor", stable],
    queryFn: () => appointmentService.getDoctorAppointments(stable),
    enabled: isHydrated && !!token,
    ...APPOINTMENT_LIST_QUERY_OPTS,
  });
}

export function usePatientHistory(patientId: string, params?: HistoryParams) {
  const isHydrated = useAuthHydration();
  const token = useAuthStore((s) => s.token);
  const stable = useMemo<HistoryParams>(
    () => ({ limit: params?.limit, offset: params?.offset, sort: params?.sort }),
    [params?.limit, params?.offset, params?.sort],
  );
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, "history", patientId, stable],
    queryFn: () => appointmentService.getPatientHistory(patientId, stable),
    enabled: isHydrated && !!token && !!patientId,
    ...APPOINTMENT_LIST_QUERY_OPTS,
  });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookAppointmentPayload | BookAppointmentRequestPayload) =>
      appointmentService.book(payload),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
      if (!result.order) {
        toast.success("Đặt lịch thành công!");
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Đặt lịch thất bại";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useCompleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: CompleteAppointmentPayload;
    }) => appointmentService.complete(appointmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
      toast.success("Đã hoàn thành ca khám. Đơn thuốc đã được gửi qua email.");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: string | { id: string; reason?: string }) => {
      if (typeof input === "string") {
        return appointmentService.cancel(input);
      }
      return appointmentService.cancel(input.id, { reason: input.reason });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [ORDERS_KEY] });
      toast.success("Đã hủy lịch khám");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Hủy lịch thất bại");
    },
  });
}

export function useMyHistory(params?: HistoryParams) {
  const isHydrated = useAuthHydration();
  const token = useAuthStore((s) => s.token);
  const stable = useMemo<HistoryParams>(
    () => ({ limit: params?.limit, offset: params?.offset, sort: params?.sort }),
    [params?.limit, params?.offset, params?.sort],
  );
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, "history", "me", stable],
    queryFn: () => appointmentService.getMyHistory(stable),
    enabled: isHydrated && !!token,
    ...APPOINTMENT_LIST_QUERY_OPTS,
  });
}
