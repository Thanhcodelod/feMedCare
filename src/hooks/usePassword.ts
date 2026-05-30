"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/api/auth";
import { useAuthStore } from "@/redux/authStore";
import { extractApiError, formatRetryAfter } from "@/utils/error";
import { disconnectSocket } from "@/services/teleconsultationService";
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "@/types/api";

export function useChangePassword() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authService.changePassword(payload),
    onSuccess: () => {
      disconnectSocket();
      logout();
      qc.clear();
      toast.success("Đã đổi mật khẩu. Vui lòng đăng nhập lại.");
      router.replace("/login?reason=password_changed");
    },
    onError: (err) => {
      const { status, message, retryAfterSec } = extractApiError(err);
      if (status === 401) {
        toast.error("Mật khẩu hiện tại không đúng.");
      } else if (status === 400) {
        toast.error(message || "Dữ liệu không hợp lệ.");
      } else if (status === 429) {
        toast.error(
          `Bạn đã thử đổi mật khẩu quá nhiều lần. Vui lòng thử lại sau ${formatRetryAfter(retryAfterSec)}.`
        );
      } else {
        toast.error(message);
      }
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      authService.forgotPassword(payload),
    onError: (err) => {
      const { status, message, retryAfterSec } = extractApiError(err);
      if (status === 429) {
        toast.error(
          `Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau ${formatRetryAfter(retryAfterSec)}.`
        );
      } else if (status === 400) {
        toast.error(message || "Email không hợp lệ.");
      } else {
        toast.error(message);
      }
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      authService.resetPassword(payload),
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
      router.replace("/login?reason=password_reset");
    },
    onError: (err) => {
      const { status, retryAfterSec } = extractApiError(err);
      if (status === 400) {
        toast.error("Link đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu link mới.");
      } else if (status === 429) {
        toast.error(`Quá nhiều lần thử. Vui lòng đợi ${formatRetryAfter(retryAfterSec)}.`);
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    },
  });
}
