import api from "./client";
import type { CheckInPayload, QueueItem } from "@/types/api";

export const nurseService = {
  /** GET /appointments/today/queue — NURSE / ADMIN. Sorted by start_time. */
  getTodayQueue: async (): Promise<QueueItem[]> => {
    const { data } = await api.get<QueueItem[]>("/appointments/today/queue");
    return Array.isArray(data) ? data : [];
  },

  /**
   * POST /appointments/:id/check-in — flips PENDING/CONFIRMED → IN_PROGRESS.
   * BE rejects with 409 if status is already terminal (COMPLETED/CANCELLED/
   * NO_SHOW) or already IN_PROGRESS, and 400 if `payment_confirmed !== true`.
   */
  checkIn: async (
    appointmentId: string,
    payload: CheckInPayload,
  ): Promise<QueueItem> => {
    const { data } = await api.post<QueueItem>(
      `/appointments/${appointmentId}/check-in`,
      payload,
    );
    return data;
  },
};
