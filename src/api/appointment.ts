import api from "./client";
import { normalizeAppointment } from "./normalize";
import type {
  Appointment,
  BookAppointmentPayload,
  BookAppointmentRequestPayload,
  BookAppointmentResponse,
  CompleteAppointmentPayload,
  CreateOrderResponse,
} from "@/types/api";

function pickField<T = unknown>(
  obj: any,
  keys: string[],
  fallback: T,
): T {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k] as T;
  }
  return fallback;
}

function normalizeEmbeddedOrder(raw: any): CreateOrderResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const orderId = pickField<string>(raw, ["orderId", "order_id", "id"], "");
  if (!orderId) return null;
  return {
    orderId,
    amount: Number(pickField(raw, ["amount", "total"], 0)),
    transferCode: pickField<string>(
      raw,
      ["transferCode", "transfer_code", "memo", "content"],
      "",
    ),
    qrUrl: pickField<string>(
      raw,
      ["qrUrl", "qr_url", "qrCodeUrl", "qr_code_url"],
      "",
    ),
  };
}

export const appointmentService = {
  book: async (
    payload: BookAppointmentPayload | BookAppointmentRequestPayload
  ): Promise<BookAppointmentResponse> => {
    const { data } = await api.post<any>("/appointments/book", payload);

    const rawAppointment = data?.appointment ?? data;
    const rawOrder = data?.order ?? null;

    return {
      appointment: normalizeAppointment(rawAppointment),
      order: normalizeEmbeddedOrder(rawOrder),
      requires_payment: Boolean(
        data?.requires_payment ?? rawAppointment?.requires_payment ?? false,
      ),
      payment_method:
        data?.payment_method ??
        rawAppointment?.payment_method ??
        "PAYMENT_AT_CLINIC",
      message: typeof data?.message === "string" ? data.message : undefined,
    };
  },

  complete: async (
    appointmentId: string,
    payload: CompleteAppointmentPayload
  ): Promise<Appointment> => {
    const { data } = await api.post<any>(
      `/appointments/${appointmentId}/complete`,
      payload
    );
    return normalizeAppointment(data);
  },

  getMyAppointments: async (
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<Appointment[]> => {
    const { data } = await api.get<any[]>(
      `/appointments/my-appointments/patient`,
      { params }
    );
    return (data || []).map(normalizeAppointment);
  },

  getDoctorAppointments: async (
    params?: { status?: string; date?: string; page?: number; limit?: number }
  ): Promise<Appointment[]> => {
    const { data } = await api.get<any[]>(
      `/appointments/my-appointments/doctor`,
      { params }
    );
    return (data || []).map(normalizeAppointment);
  },

  getMyHistory: async (
    params?: { limit?: number; offset?: number; sort?: string }
  ): Promise<Appointment[]> => {
    const { data } = await api.get<any[]>(`/appointments/patient-history`, {
      params,
    });
    return (data || []).map(normalizeAppointment);
  },

  getPatientHistory: async (
    patientId: string,
    params?: { limit?: number; offset?: number; sort?: string }
  ): Promise<Appointment[]> => {
    const { data } = await api.get<any[]>(
      `/appointments/patient-history/${patientId}`,
      { params }
    );
    return (data || []).map(normalizeAppointment);
  },

  cancel: async (
    appointmentId: string,
    payload?: { reason?: string }
  ): Promise<Appointment> => {
    const { data } = await api.patch<any>(
      `/appointments/${appointmentId}/cancel`,
      payload ?? {}
    );
    return normalizeAppointment(data);
  },
};
