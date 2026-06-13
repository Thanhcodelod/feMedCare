"use client";
import { cn } from "@/utils/utils";
import type { Appointment, OrderStatus, PaymentMethod } from "@/types/api";

// Suy ra trạng thái thanh toán của một lịch khám từ phương thức + danh sách
// order SePay đính kèm. Dùng chung cho màn bệnh nhân / bác sĩ / y tá.
type PayState =
  | "paid" // đã thanh toán (order PAID)
  | "unpaid" // trả trước nhưng chưa thanh toán xong (chưa có order / order PENDING)
  | "failed" // order thất bại
  | "at_clinic"; // thanh toán tại quầy (không cần trả trước online)

const config: Record<
  PayState,
  { label: string; dot: string; text: string }
> = {
  paid: { label: "Đã thanh toán", dot: "bg-success", text: "text-success" },
  unpaid: {
    label: "Chưa thanh toán",
    dot: "bg-warning",
    text: "text-warning",
  },
  failed: {
    label: "Thanh toán thất bại",
    dot: "bg-destructive",
    text: "text-destructive",
  },
  at_clinic: {
    label: "Thanh toán tại quầy",
    dot: "bg-muted-foreground/60",
    text: "text-muted-foreground",
  },
};

// Chấp nhận hoặc cả object appointment, hoặc các mảnh dữ liệu rời (cho nurse
// queue dùng cấu trúc khác). orders[0] là order mới nhất.
interface PaymentStatusBadgeProps {
  paymentMethod?: PaymentMethod;
  orders?: { status: OrderStatus }[];
  className?: string;
}

function derivePayState(
  paymentMethod?: PaymentMethod,
  orders?: { status: OrderStatus }[],
): PayState {
  // Khám trả tại quầy → không có khái niệm "chưa thanh toán online".
  if (paymentMethod === "PAYMENT_AT_CLINIC") return "at_clinic";

  const latest = orders && orders.length > 0 ? orders[0] : undefined;
  if (latest?.status === "PAID") return "paid";
  if (latest?.status === "FAILED") return "failed";
  // ADVANCE_PAYMENT mà chưa có order hoặc order còn PENDING → chưa thanh toán.
  return "unpaid";
}

export function PaymentStatusBadge({
  paymentMethod,
  orders,
  className,
}: PaymentStatusBadgeProps) {
  const cfg = config[derivePayState(paymentMethod, orders)];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium tracking-tight",
        cfg.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} aria-hidden />
      {cfg.label}
    </span>
  );
}

// Tiện ích: lấy badge thanh toán trực tiếp từ một Appointment đã chuẩn hoá.
export function AppointmentPaymentBadge({
  appointment,
  className,
}: {
  appointment: Pick<Appointment, "payment_method" | "orders">;
  className?: string;
}) {
  return (
    <PaymentStatusBadge
      paymentMethod={appointment.payment_method}
      orders={appointment.orders}
      className={className}
    />
  );
}
