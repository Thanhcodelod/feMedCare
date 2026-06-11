"use client";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, BadgeDollarSign, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCheckIn } from "@/hooks/useNurse";
import type { QueueItem } from "@/types/api";

interface CheckInDialogProps {
  item: QueueItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NOTE_MAX = 500;

export function CheckInDialog({ item, open, onOpenChange }: CheckInDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState("");
  const checkIn = useCheckIn();

  useEffect(() => {
    if (!open) {
      setConfirmed(false);
      setNote("");
      checkIn.reset();
    }
  }, [open, checkIn]);

  if (!item) return null;

  const order = item.orders[0];
  const isAdvancePaid = order?.status === "PAID";
  const isAdvancePending = order && order.status !== "PAID";
  const payAtClinic = !order;

  const handleSubmit = () => {
    if (!confirmed || checkIn.isPending) return;
    checkIn.mutate(
      {
        appointmentId: item.id,
        payload: {
          payment_confirmed: true,
          ...(note.trim() ? { note: note.trim() } : {}),
        },
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Check-in: {item.patient.profile.full_name} — {item.start_time}
          </DialogTitle>
          <DialogDescription>
            Xác nhận bệnh nhân đã đến quầy và đã hoàn tất thanh toán trước
            khi chuyển trạng thái sang "Đang khám".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <section className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Thông tin
            </p>
            <InfoRow label="Bác sĩ">
              {item.doctor.profile.full_name}
              <span className="text-muted-foreground">
                {" "}
                · {item.doctor.specialization}
              </span>
            </InfoRow>
            <InfoRow label="Số điện thoại">
              {item.patient.profile.phone ? (
                <a
                  href={`tel:${item.patient.profile.phone}`}
                  className="text-primary hover:underline"
                >
                  {item.patient.profile.phone}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </InfoRow>
            {item.patient_note && (
              <InfoRow label="Ghi chú BN">{item.patient_note}</InfoRow>
            )}
          </section>

          <section className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Thanh toán
            </p>
            {isAdvancePaid && order && (
              <div className="flex items-start gap-2 rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-success-foreground">
                <BadgeDollarSign className="w-4 h-4 mt-0.5 shrink-0 text-success" />
                <div>
                  <p className="font-semibold">Đã thanh toán cọc</p>
                  <p className="text-xs">
                    Số tiền: {order.amount.toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>
            )}
            {isAdvancePending && order && (
              <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-warning-foreground">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-warning" />
                <div>
                  <p className="font-semibold">Cọc chưa hoàn tất</p>
                  <p className="text-xs">
                    Trạng thái đơn: {order.status}. Vui lòng kiểm tra lại
                    trước khi check-in.
                  </p>
                </div>
              </div>
            )}
            {payAtClinic && (
              <div className="flex items-start gap-2 rounded-lg border border-info/20 bg-info/10 px-3 py-2 text-info-foreground">
                <Wallet className="w-4 h-4 mt-0.5 shrink-0 text-info" />
                <div>
                  <p className="font-semibold">Thanh toán tại quầy</p>
                  <p className="text-xs">
                    Thu tiền mặt/POS trước khi tick xác nhận bên dưới.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-2">
            <label
              htmlFor="payment-confirm"
              className="flex items-start gap-2 cursor-pointer"
            >
              <Checkbox
                id="payment-confirm"
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(v === true)}
                className="mt-0.5"
              />
              <span className="text-sm">
                Tôi xác nhận bệnh nhân đã đến quầy và đã hoàn tất thanh toán.
              </span>
            </label>

            <div className="space-y-1.5">
              <Label htmlFor="reception-note" className="text-xs">
                Ghi chú quầy (tùy chọn)
              </Label>
              <Textarea
                id="reception-note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
                placeholder="VD: Bệnh nhân quên mang BHYT, đi cùng người nhà…"
                className="resize-none text-sm min-h-[72px] rounded-xl"
                maxLength={NOTE_MAX}
              />
              <p className="text-[15px] text-muted-foreground text-right">
                {note.length}/{NOTE_MAX}
              </p>
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={checkIn.isPending}
          >
            Hủy
          </Button>
          <Button
            className="rounded-xl"
            onClick={handleSubmit}
            disabled={!confirmed || checkIn.isPending}
          >
            {checkIn.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý
              </>
            ) : (
              "Xác nhận check-in"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="flex-1 font-medium">{children}</span>
    </div>
  );
}
