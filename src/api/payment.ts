import api from "./client";
import type {
  CreateOrderPayload,
  CreateOrderResponse,
  OrderStatus,
  OrderStatusResponse,
} from "@/types/api";

function pick<T = unknown>(obj: any, keys: string[], fallback?: T): T {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k] as T;
  }
  return fallback as T;
}

function normalizeCreateResponse(raw: any): CreateOrderResponse {
  return {
    orderId: pick<string>(raw, ["orderId", "order_id", "id"], ""),
    amount: Number(pick(raw, ["amount", "total"], 0)),
    transferCode: pick<string>(
      raw,
      ["transferCode", "transfer_code", "memo", "content", "description"],
      "",
    ),
    qrUrl: pick<string>(
      raw,
      ["qrUrl", "qr_url", "qrCodeUrl", "qr_code_url", "qrcodeUrl"],
      "",
    ),
    appointmentId:
      pick<string | undefined>(
        raw,
        ["appointmentId", "appointment_id"],
        undefined,
      ) || undefined,
  };
}

function normalizeStatusResponse(raw: any): OrderStatusResponse {
  const status = pick<OrderStatus>(raw, ["status"], "PENDING");
  const success = pick<boolean | undefined>(raw, ["success"], undefined);
  const appointmentId = pick<string | null | undefined>(
    raw,
    ["appointmentId", "appointment_id"],
    undefined,
  );
  return {
    orderId: pick<string>(raw, ["orderId", "order_id", "id"], ""),
    amount: Number(pick(raw, ["amount", "total"], 0)),
    status,
    transferCode: pick<string>(
      raw,
      ["transferCode", "transfer_code", "memo", "content"],
      "",
    ),
    success: typeof success === "boolean" ? success : status === "PAID",
    appointmentId:
      appointmentId === undefined ? null : appointmentId ?? null,
    createdAt: pick<string>(raw, ["createdAt", "created_at"], ""),
    updatedAt: pick<string>(raw, ["updatedAt", "updated_at"], ""),
  };
}

export const orderService = {
  create: async (
    payload: CreateOrderPayload,
  ): Promise<CreateOrderResponse> => {
    const { data } = await api.post("/orders", payload);
    return normalizeCreateResponse(data);
  },

  getStatus: async (orderId: string): Promise<OrderStatusResponse> => {
    const { data } = await api.get(`/orders/${orderId}`);
    return normalizeStatusResponse(data);
  },
};
