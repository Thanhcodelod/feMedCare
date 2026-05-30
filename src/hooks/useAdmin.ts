import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService } from "@/api/admin";

export const ADMIN_KEY = "admin";

// Same caching rationale as APPOINTMENT_LIST_QUERY_OPTS in
// useAppointments.ts: admin list pages fire 4 queries concurrently
// (analytics + doctors + patients + pending). Aggressive caching is
// safe because every admin mutation invalidates [ADMIN_KEY].
const ADMIN_QUERY_OPTS = {
  staleTime: 10 * 60_000,
  gcTime: 30 * 60_000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export function useAdminAnalytics() {
  return useQuery({
    queryKey: [ADMIN_KEY, "analytics"],
    queryFn: () => adminService.getAnalytics(),
    ...ADMIN_QUERY_OPTS,
  });
}

export function usePendingDoctors() {
  return useQuery({
    queryKey: [ADMIN_KEY, "pending-doctors"],
    queryFn: () => adminService.getPendingDoctors(),
    ...ADMIN_QUERY_OPTS,
  });
}

export function useAdminDoctors(params?: { search?: string; role?: string }) {
  return useQuery({
    queryKey: [ADMIN_KEY, "doctors", params],
    queryFn: () => adminService.getAllUsers({ ...params, role: "DOCTOR" }),
    ...ADMIN_QUERY_OPTS,
  });
}

export function useAdminPatients(params?: { search?: string }) {
  return useQuery({
    queryKey: [ADMIN_KEY, "patients", params],
    queryFn: () => adminService.getAllUsers({ ...params, role: "PATIENT" }),
    ...ADMIN_QUERY_OPTS,
  });
}

export function useRegisterDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => adminService.registerDoctor(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ADMIN_KEY] });
      toast.success("Đã đăng ký bác sĩ thành công");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Đăng ký bác sĩ thất bại");
    },
  });
}

export function useVerifyDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      doctorId,
      status,
    }: {
      doctorId: string;
      status: "VERIFIED" | "REJECTED";
    }) => adminService.verifyDoctor(doctorId, status),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: [ADMIN_KEY] });
      toast.success(status === "VERIFIED" ? "Đã duyệt bác sĩ" : "Đã từ chối bác sĩ");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      adminService.deleteUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ADMIN_KEY] });
      toast.success("Đã xóa người dùng");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Xóa thất bại");
    },
  });
}
