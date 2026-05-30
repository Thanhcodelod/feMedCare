"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiLogin, apiRegister } from "@/api/auth";
import { authService } from "@/api/auth";
import { useAuthStore } from "@/redux/authStore";
import type { LoginPayload, RegisterPayload } from "@/types/api";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => apiLogin(payload),
    onSuccess: (data) => {
      const token = data.access_token;
      const backendUser = data.user;

      if (!token || !backendUser) {
        toast.error("Lỗi: không nhận được token hoặc user từ server");
        return;
      }

      const user: typeof backendUser = {
        ...backendUser,
        fullName: backendUser.profile?.fullName || backendUser.profile?.full_name || backendUser.fullName || backendUser.full_name || "User",
        phone: backendUser.profile?.phone || backendUser.phone,
      };

      // Wipe any cache from a previous session BEFORE setAuth so the
      // upcoming queries on the destination page fetch fresh data
      // scoped to the new user (BE returns JWT-scoped lists — leaking
      // a different user's cached appointments is a real bug we hit
      // when the same browser tab logged in/out across accounts).
      qc.clear();
      setAuth(token, user);
      const role = user.role;
      const dest =
        role === "DOCTOR" ? "/doctor" :
        role === "ADMIN" ? "/admin" :
        role === "NURSE" ? "/nurse/queue" :
        "/patient";
      navigate.prefetch(dest);
      toast.success(`Chào mừng, ${user.fullName}!`);
      navigate.push(dest);
    },
    onError: (err: any) => {
      const msg = (err?.message as string) || "Đăng nhập thất bại";
      toast.error(msg);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => apiRegister(payload),
    onSuccess: (data) => {
      const token = data.access_token;
      const backendUser = data.user;
      
      if (!token || !backendUser) {
        toast.error("Lỗi: không nhận được token hoặc user từ server");
        return;
      }
      
      const user: typeof backendUser = {
        ...backendUser,
        fullName: backendUser.profile?.fullName || backendUser.profile?.full_name || backendUser.fullName || backendUser.full_name || "User",
        phone: backendUser.profile?.phone || backendUser.phone,
      };
      
      setAuth(token, user);
      toast.success("Đăng ký thành công!");
      const role = user.role;
      if (role === "DOCTOR") navigate.push("/doctor");
      else navigate.push("/patient");
    },
    onError: (err: any) => {
      const msg = (err?.message as string) || "Đăng ký thất bại";
      toast.error(msg);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      qc.clear();
      navigate.push("/login");
      toast.success("Đã đăng xuất");
    },
    onError: (err: any) => {
      const msg = (err?.message as string) || "Đăng xuất thất bại";
      toast.error(msg);
      logout();
      qc.clear();
      navigate.push("/login");
    },
  });
}