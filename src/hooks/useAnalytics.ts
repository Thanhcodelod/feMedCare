import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/api/analytics";
import { useAuthHydration } from "@/hooks/useAuthHydration";

export const ANALYTICS_KEY = "analytics";

export function useDoctorPerformance(doctorId: string | null) {
  const isHydrated = useAuthHydration();
  return useQuery({
    queryKey: [ANALYTICS_KEY, "doctor", doctorId],
    queryFn: () => analyticsService.getDoctorPerformance(doctorId as string),
    enabled: isHydrated && !!doctorId,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
