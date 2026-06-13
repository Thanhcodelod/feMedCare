"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService, UserProfile } from "@/api/user";
import { toast } from "@/lib/notify";
import { useAuthStore } from "@/redux/authStore";
import { useAuthHydration } from "@/hooks/useAuthHydration";
import type {
  UpdateDoctorDetailsPayload,
  UpdateProfileMePayload,
  UpdatePatientDetailsMePayload,
} from "@/types/api";

const PROFILE_KEY = "profile";
const SPECIALIZATIONS_KEY = "specializations";

export function useProfile() {
  const isHydrated = useAuthHydration();
  return useQuery({
    queryKey: [PROFILE_KEY],
    queryFn: () => userService.getProfile(),
    enabled: isHydrated,
    // Profile rarely changes mid-session; mutations (PATCH /users/...)
    // invalidate [PROFILE_KEY] manually so we never serve stale data
    // after a real edit. Keep cache hot across navigations.
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useSpecializations() {
  const isHydrated = useAuthHydration();
  return useQuery({
    queryKey: [SPECIALIZATIONS_KEY],
    queryFn: () => userService.getSpecializations(),
    enabled: isHydrated,
    staleTime: 30 * 60_000,
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  const updateStoreUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: (payload: UpdateProfileMePayload) =>
      userService.updateMyProfile(payload),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: [PROFILE_KEY] });
      updateStoreUser({
        fullName: updated.fullName,
        phone: updated.phone,
        avatar: updated.avatar,
      });
      toast.success("Cập nhật hồ sơ thành công!");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Không thể cập nhật hồ sơ";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useUpdateMyDoctorDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDoctorDetailsPayload) =>
      userService.updateMyDoctorDetails(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROFILE_KEY] });
      toast.success("Đã cập nhật thông tin chuyên môn.");
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : raw || "Cập nhật thất bại.";
      toast.error(msg);
    },
  });
}

export function useUpdateMyPatientDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePatientDetailsMePayload) =>
      userService.updateMyPatientDetails(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROFILE_KEY] });
      toast.success("Đã cập nhật thông tin y tế.");
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : raw || "Cập nhật thất bại.";
      toast.error(msg);
    },
  });
}

export function useAdminUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: Partial<UserProfile>;
    }) => userService.update(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Đã cập nhật người dùng.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Cập nhật thất bại";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export const useUpdateProfile = useAdminUpdateUser;
export const useUpdatePatientDetails = useUpdateMyPatientDetails;
