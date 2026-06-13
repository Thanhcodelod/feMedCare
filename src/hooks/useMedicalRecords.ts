import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/notify";
import { medicalRecordService } from "@/api/medicalRecord";
import { useAuthHydration } from "@/hooks/useAuthHydration";
import type { UpdateMedicalRecordPayload } from "@/types/api";

export const MEDICAL_RECORDS_KEY = "medical-records";

// Medical records are append-only from the FE's perspective — a record
// is created when the doctor completes an appointment, and PATCH is
// the only mutation. Both write paths invalidate [MEDICAL_RECORDS_KEY],
// so an aggressive cache here is safe.
const MEDICAL_RECORDS_QUERY_OPTS = {
  staleTime: 10 * 60_000,
  gcTime: 30 * 60_000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export function useAllMedicalRecords() {
  const isHydrated = useAuthHydration();
  return useQuery({
    queryKey: [MEDICAL_RECORDS_KEY, "all"],
    queryFn: () => medicalRecordService.getAll(),
    enabled: isHydrated,
    ...MEDICAL_RECORDS_QUERY_OPTS,
  });
}

export function useMedicalRecord(id: string | null) {
  const isHydrated = useAuthHydration();
  return useQuery({
    queryKey: [MEDICAL_RECORDS_KEY, "detail", id],
    queryFn: () => medicalRecordService.getById(id as string),
    enabled: isHydrated && !!id,
    ...MEDICAL_RECORDS_QUERY_OPTS,
  });
}

export function useMyPatientRecords() {
  const isHydrated = useAuthHydration();
  return useQuery({
    queryKey: [MEDICAL_RECORDS_KEY, "patient", "me"],
    queryFn: () => medicalRecordService.getMyPatientRecords(),
    enabled: isHydrated,
    ...MEDICAL_RECORDS_QUERY_OPTS,
  });
}

export function useMyDoctorRecords() {
  const isHydrated = useAuthHydration();
  return useQuery({
    queryKey: [MEDICAL_RECORDS_KEY, "doctor", "me"],
    queryFn: () => medicalRecordService.getMyDoctorRecords(),
    enabled: isHydrated,
    ...MEDICAL_RECORDS_QUERY_OPTS,
  });
}

export function useUpdateMedicalRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMedicalRecordPayload;
    }) => medicalRecordService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [MEDICAL_RECORDS_KEY] });
      toast.success("Đã cập nhật hồ sơ bệnh án");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    },
  });
}

export function useDeleteMedicalRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicalRecordService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [MEDICAL_RECORDS_KEY] });
      toast.success("Đã xoá hồ sơ");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Xoá thất bại");
    },
  });
}
