"use client";

/**
 * Lớp thông báo dùng Mantine notifications, nhưng giữ NGUYÊN bề mặt API của
 * sonner (`toast.success/error/warning/info`) để các nơi gọi cũ không phải sửa.
 *
 * Chỉ cần đổi dòng import:
 *   import { toast } from "sonner";   →   import { toast } from "@/lib/notify";
 *
 * Nhãn loại thông báo đặt bằng TIẾNG VIỆT (Thành công / Lỗi / Cảnh báo / Thông tin).
 */
import React from "react";
import { notifications } from "@mantine/notifications";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info as InfoIcon,
} from "lucide-react";

type Message = React.ReactNode;

// Tương thích đối số thứ 2 kiểu sonner (chỉ dùng vài trường phổ biến).
interface ToastOptions {
  description?: React.ReactNode;
  duration?: number; // ms; sonner mặc định ~4000
  id?: string;
}

const ICON_SIZE = 18;

function show(
  title: string,
  message: Message,
  color: string,
  icon: React.ReactNode,
  opts?: ToastOptions,
): string {
  return notifications.show({
    title,
    message: (message ?? opts?.description ?? "") as React.ReactNode,
    color,
    icon,
    withBorder: true,
    autoClose: opts?.duration ?? 4000,
    ...(opts?.id ? { id: opts.id } : {}),
  });
}

export const toast = {
  success: (message: Message, opts?: ToastOptions) =>
    show("Thành công", message, "green", <CheckCircle2 size={ICON_SIZE} />, opts),

  error: (message: Message, opts?: ToastOptions) =>
    show("Lỗi", message, "red", <XCircle size={ICON_SIZE} />, opts),

  warning: (message: Message, opts?: ToastOptions) =>
    show("Cảnh báo", message, "yellow", <AlertTriangle size={ICON_SIZE} />, opts),

  info: (message: Message, opts?: ToastOptions) =>
    show("Thông tin", message, "blue", <InfoIcon size={ICON_SIZE} />, opts),

  // Gọi trực tiếp toast("...") như sonner: thông báo trung tính, không tiêu đề.
  message: (message: Message, opts?: ToastOptions) =>
    show("", message, "gray", <InfoIcon size={ICON_SIZE} />, opts),

  // Đóng một/tất cả thông báo (tương thích sonner.dismiss).
  dismiss: (id?: string) =>
    id ? notifications.hide(id) : notifications.clean(),
};

export type Toast = typeof toast;
export default toast;
