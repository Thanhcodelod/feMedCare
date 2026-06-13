import { useMutation, useQuery } from "@tanstack/react-query";
import { orderService } from "@/api/payment";
import type { CreateOrderPayload, OrderStatusResponse } from "@/types/api";
import { toast } from "@/lib/notify";

export const ORDERS_KEY = "orders";

export const ORDER_POLL_INTERVAL_MS = 8_000;

export const ORDER_POLL_BACKOFF_MS = 30_000;

const NOT_FOUND_GRACE_RETRIES = 3;

export const ORDER_TIMEOUT_MS = 15 * 60 * 1000;

export function useCreateOrder() {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderService.create(payload),
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Không thể tạo đơn thanh toán";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

interface OrderStatusState {
  data: OrderStatusResponse | null;
  errorStatus: number;
  isPolling: boolean;
  refetch: () => void;
}

export function useOrderStatus(orderId: string | null): OrderStatusState {
  const query = useQuery<OrderStatusResponse, any>({
    queryKey: [ORDERS_KEY, orderId],
    queryFn: () => orderService.getStatus(orderId as string),
    enabled: !!orderId,
    staleTime: 0,
    gcTime: 5 * 60_000,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 404) return failureCount < NOT_FOUND_GRACE_RETRIES;
      if (status === 401 || status === 403) return false;
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
    refetchInterval: (q) => {
      const data = q.state.data as OrderStatusResponse | undefined;
      const status = (q.state.error as any)?.response?.status as
        | number
        | undefined;
      const errorCount = q.state.errorUpdateCount;

      if (status === 401 || status === 403) return false;

      if (status === 404 && errorCount > NOT_FOUND_GRACE_RETRIES) return false;

      if (status === 429) return ORDER_POLL_BACKOFF_MS;

      if (data?.success === true) return false;
      if (data?.status === "PAID" || data?.status === "FAILED") return false;

      return ORDER_POLL_INTERVAL_MS;
    },
  });

  const errorStatus = (query.error as any)?.response?.status ?? 0;
  const data = query.data ?? null;
  const isTerminal =
    !!data && (data.success || data.status !== "PENDING");
  const isTerminalError =
    errorStatus === 401 ||
    errorStatus === 403 ||
    (errorStatus === 404 &&
      query.errorUpdateCount > NOT_FOUND_GRACE_RETRIES);

  return {
    data,
    errorStatus,
    isPolling: !!orderId && !isTerminal && !isTerminalError,
    refetch: () => {
      query.refetch();
    },
  };
}
