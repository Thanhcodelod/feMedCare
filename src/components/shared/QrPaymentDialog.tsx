"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Loader2,
  QrCode,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  ORDER_TIMEOUT_MS,
  useOrderStatus,
} from "@/hooks/usePayment";
import { orderService } from "@/api/payment";
import type { CreateOrderResponse } from "@/types/api";

interface QrPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: CreateOrderResponse | null;
  amount?: number;
  appointmentId?: string;
  onPaid?: () => void;
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function QrPaymentDialog({
  open,
  onOpenChange,
  order: orderProp,
  amount,
  appointmentId,
  onPaid,
}: QrPaymentDialogProps) {
  const [order, setOrder] = useState<CreateOrderResponse | null>(
    orderProp ?? null,
  );
  const [createdAt, setCreatedAt] = useState<number | null>(
    orderProp ? Date.now() : null,
  );
  const [now, setNow] = useState<number>(() => Date.now());
  const [expired, setExpired] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFailed, setCreateFailed] = useState(false);

  const { data: statusData, errorStatus, refetch: refetchStatus } = useOrderStatus(
    order && order.orderId && !expired ? order.orderId : null,
  );
  const isPaid = statusData?.success === true || statusData?.status === "PAID";
  const status = isPaid
    ? "PAID"
    : (statusData?.status ?? "PENDING");
  const ownershipError = errorStatus === 403;
  const isRateLimited = errorStatus === 429;

  const orderRef = useRef<CreateOrderResponse | null>(null);
  orderRef.current = order;
  const openRef = useRef(open);
  openRef.current = open;
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (!orderProp) return;
    if (orderRef.current?.orderId === orderProp.orderId) return;
    setOrder(orderProp);
    setCreatedAt(Date.now());
    setExpired(false);
    setIsCreating(false);
    setCreateFailed(false);
  }, [open, orderProp]);

  useEffect(() => {
    if (!open) {
      inFlightRef.current = false;
      return;
    }
    if (orderProp) return;
    if (orderRef.current || inFlightRef.current) return;
    if (typeof amount !== "number") return;

    inFlightRef.current = true;
    setIsCreating(true);
    setCreateFailed(false);

    orderService
      .create({ amount, appointmentId })
      .then((data) => {
        if (!openRef.current) return;
        setOrder(data);
        setCreatedAt(Date.now());
        setExpired(false);
      })
      .catch((err: any) => {
        if (!openRef.current) return;
        const msg = err?.response?.data?.message || "Không thể tạo đơn thanh toán";
        toast.error(Array.isArray(msg) ? msg[0] : msg);
        setCreateFailed(true);
      })
      .finally(() => {
        inFlightRef.current = false;
        if (!openRef.current) return;
        setIsCreating(false);
      });
  }, [open, amount, appointmentId, orderProp]);

  useEffect(() => {
    if (open) return;
    setOrder(null);
    setCreatedAt(null);
    setExpired(false);
    setIsCreating(false);
    setCreateFailed(false);
  }, [open]);

  useEffect(() => {
    if (!open || !createdAt || expired || status !== "PENDING") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [open, createdAt, expired, status]);

  useEffect(() => {
    if (!createdAt || expired) return;
    if (now - createdAt > ORDER_TIMEOUT_MS) setExpired(true);
  }, [now, createdAt, expired]);

  useEffect(() => {
    if (isPaid) onPaid?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid]);

  const remainingMs = useMemo(() => {
    if (!createdAt) return ORDER_TIMEOUT_MS;
    return Math.max(0, ORDER_TIMEOUT_MS - (now - createdAt));
  }, [createdAt, now]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Đã sao chép nội dung chuyển khoản");
    } catch {
      toast.error("Không thể sao chép. Vui lòng copy thủ công.");
    }
  };

  const handleRetry = () => {
    setOrder(null);
    setCreatedAt(null);
    setExpired(false);
    setCreateFailed(false);
    inFlightRef.current = false;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && isPaid) return;
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" /> Thanh toán qua QR
          </DialogTitle>
          <DialogDescription>
            Quét mã QR hoặc chuyển khoản theo nội dung bên dưới. Hệ thống tự
            phát hiện khi tiền về (thường dưới 10 giây).
          </DialogDescription>
        </DialogHeader>

        {isCreating && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang tạo đơn…</p>
          </div>
        )}

        {createFailed && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <XCircle className="w-10 h-10 text-destructive" />
            <p className="text-sm font-medium">Không tạo được đơn thanh toán</p>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={handleRetry}
            >
              Thử lại
            </Button>
          </div>
        )}

        {order && !order.qrUrl && !expired && !ownershipError && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <XCircle className="w-10 h-10 text-destructive" />
            <p className="text-sm font-medium">Phản hồi đơn không hợp lệ</p>
            <p className="text-xs text-muted-foreground">
              Hệ thống không nhận được mã QR. Vui lòng đóng và thử lại.
            </p>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
          </div>
        )}

        {order && order.qrUrl && status === "PENDING" && !expired && !ownershipError && (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white border border-border rounded-xl p-3 shadow-sm">
              <Image
                src={order.qrUrl}
                alt="Mã QR thanh toán"
                width={260}
                height={260}
                priority
                unoptimized
                className="w-[260px] h-[260px] object-contain"
              />
            </div>

            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-muted/40">
                <span className="text-muted-foreground">Số tiền</span>
                <span className="font-semibold">
                  {order.amount.toLocaleString("vi-VN")}₫
                </span>
              </div>

              <div className="px-4 py-3 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
                <p className="text-xs text-muted-foreground mb-1">
                  Nội dung chuyển khoản (bắt buộc)
                </p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-base font-bold text-primary break-all">
                    {order.transferCode}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-lg shrink-0"
                    onClick={() => handleCopy(order.transferCode)}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                  </Button>
                </div>
              </div>

              {/* The 6-char fingerprint inside the memo is how the webhook
                  links the transfer back to this specific user's order.
                  Any edit — even a stray space — breaks that match. */}
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning-foreground">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-warning" />
                <span>
                  Giữ <span className="font-semibold">nguyên nội dung chuyển khoản</span>.
                  Nếu sửa hoặc gõ thiếu ký tự, hệ thống sẽ không tự phát hiện
                  được tiền và bạn phải liên hệ hỗ trợ.
                </span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Vui lòng thanh toán trong{" "}
                <span className="font-semibold text-foreground">
                  {formatRemaining(remainingMs)}
                </span>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                {isRateLimited
                  ? "Đang chờ xác nhận (kết nối chậm, tần suất cập nhật giảm)…"
                  : "Đang chờ xác nhận từ ngân hàng…"}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-xl mx-auto"
                onClick={() => refetchStatus()}
              >
                Tôi đã chuyển khoản — Kiểm tra ngay
              </Button>
            </div>
          </div>
        )}

        {order && status === "PAID" && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
              Thanh toán thành công
            </p>
            <p className="text-sm text-muted-foreground">
              Lịch khám của bạn đã được xác nhận.
            </p>
          </div>
        )}

        {order && ownershipError && !isPaid && (
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <XCircle className="w-12 h-12 text-destructive" />
            <p className="text-sm font-medium">Đơn hàng không thuộc tài khoản này</p>
            <p className="text-xs text-muted-foreground">
              Có vẻ phiên đăng nhập đã thay đổi. Vui lòng đóng và đặt lại từ
              đầu.
            </p>
            <Button
              className="rounded-xl mt-2"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
          </div>
        )}

        {order && !ownershipError && (status === "FAILED" || expired) && (
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <XCircle className="w-12 h-12 text-destructive" />
            <p className="text-sm font-medium">
              {expired
                ? "Đơn hàng đã hết hạn"
                : "Giao dịch không thành công"}
            </p>
            <p className="text-xs text-muted-foreground">
              {expired
                ? "Vui lòng tạo đơn mới để thử lại."
                : "Ngân hàng đã từ chối giao dịch. Vui lòng thử lại."}
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
              <Button className="rounded-xl" onClick={handleRetry}>
                Tạo đơn mới
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
