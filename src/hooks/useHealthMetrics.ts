import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/notify";
import { healthMetricService } from "@/api/healthMetric";
import { useAuthHydration } from "@/hooks/useAuthHydration";
import type { CreateHealthMetricPayload } from "@/types/api";

export const HEALTH_METRICS_KEY = "health-metrics";

export function useMyHealthStats() {
  const isHydrated = useAuthHydration();
  return useQuery({
    queryKey: [HEALTH_METRICS_KEY, "stats"],
    queryFn: () => healthMetricService.getMyStats(),
    enabled: isHydrated,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useCreateHealthMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHealthMetricPayload) =>
      healthMetricService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [HEALTH_METRICS_KEY] });
      toast.success("Đã ghi nhận chỉ số sức khoẻ");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Ghi nhận thất bại";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}
