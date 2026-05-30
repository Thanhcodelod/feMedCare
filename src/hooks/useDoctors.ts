import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { doctorService } from "@/api/doctor";
import { useAuthHydration } from "@/hooks/useAuthHydration";

export const DOCTORS_KEY = "doctors";

export function useDoctors(params?: {
  specialization?: string;
  search?: string;
}) {
  const isHydrated = useAuthHydration();
  const stable = useMemo(
    () => ({
      specialization: params?.specialization,
      search: params?.search,
    }),
    [params?.specialization, params?.search],
  );
  return useQuery({
    queryKey: [DOCTORS_KEY, stable],
    queryFn: () => doctorService.getAll(stable),
    enabled: isHydrated,
    staleTime: 5 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useDoctor(id: string) {
  const isHydrated = useAuthHydration();
  return useQuery({
    queryKey: [DOCTORS_KEY, id],
    queryFn: () => doctorService.getById(id),
    enabled: isHydrated && !!id,
    staleTime: 5 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useDoctorSchedule(doctorId: string, date: string) {
  const isHydrated = useAuthHydration();
  return useQuery({
    queryKey: [DOCTORS_KEY, doctorId, "schedule", date],
    queryFn: () => doctorService.getSchedule(doctorId, date),
    enabled: isHydrated && !!doctorId && !!date,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useDoctorReviews(doctorId: string) {
  const isHydrated = useAuthHydration();
  return useQuery({
    queryKey: [DOCTORS_KEY, doctorId, "reviews"],
    queryFn: () => doctorService.getReviews(doctorId),
    enabled: isHydrated && !!doctorId,
    staleTime: 5 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
