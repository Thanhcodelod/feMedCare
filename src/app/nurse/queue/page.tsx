"use client";
import { useMemo, useState } from "react";
import {
  Clock,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  BadgeDollarSign,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CheckInDialog } from "@/components/nurse/CheckInDialog";
import { LocaleDate } from "@/components/shared/LocaleDate";
import { useTodayQueue } from "@/hooks/useNurse";
import { cn } from "@/utils/utils";
import type { AppointmentStatus, QueueItem } from "@/types/api";

const CHECK_INABLE: ReadonlySet<AppointmentStatus> = new Set([
  "PENDING",
  "CONFIRMED",
]);

function statusToBadge(status: AppointmentStatus) {
  return status.toLowerCase() as Lowercase<AppointmentStatus>;
}

function paymentSummary(item: QueueItem): {
  label: string;
  paid: boolean;
  pendingAdvance: boolean;
  amount?: number;
} {
  const order = item.orders[0];
  if (!order) {
    return { label: "Trả tại quầy", paid: false, pendingAdvance: false };
  }
  if (order.status === "PAID") {
    return {
      label: `Đã trả ${order.amount.toLocaleString("vi-VN")}₫`,
      paid: true,
      pendingAdvance: false,
      amount: order.amount,
    };
  }
  return {
    label: "Cọc chưa hoàn tất",
    paid: false,
    pendingAdvance: true,
  };
}

function isOverdue(item: QueueItem): boolean {
  if (item.status !== "PENDING" && item.status !== "CONFIRMED") return false;
  const [hh, mm] = item.start_time.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return false;
  const now = new Date();
  const apptStart = new Date(now);
  apptStart.setHours(hh, mm, 0, 0);
  return now.getTime() - apptStart.getTime() > 15 * 60_000;
}

export default function NurseQueuePage() {
  const { data: queue = [], isLoading, isFetching, refetch } = useTodayQueue();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return queue;
    return queue.filter((it) => {
      const name = it.patient.profile.full_name?.toLowerCase() ?? "";
      const phone = it.patient.profile.phone ?? "";
      const doctor = it.doctor.profile.full_name?.toLowerCase() ?? "";
      return (
        name.includes(q) || phone.includes(q) || doctor.includes(q)
      );
    });
  }, [queue, search]);

  const counts = useMemo(() => {
    const total = queue.length;
    const waiting = queue.filter(
      (i) => i.status === "PENDING" || i.status === "CONFIRMED",
    ).length;
    const inProgress = queue.filter((i) => i.status === "IN_PROGRESS").length;
    const done = queue.filter((i) => i.status === "COMPLETED").length;
    return { total, waiting, inProgress, done };
  }, [queue]);

  const openCheckIn = (item: QueueItem) => {
    setSelected(item);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout role="nurse" title="Quầy lễ tân">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hàng đợi hôm nay</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <LocaleDate value={new Date()} />
            {" · "}Tự cập nhật mỗi 30 giây
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl gap-2 self-start"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={cn("w-4 h-4", isFetching && "animate-spin")}
          />
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <SummaryCard label="Tổng" value={counts.total} icon={Clock} tone="info" />
        <SummaryCard
          label="Chờ check-in"
          value={counts.waiting}
          icon={AlertTriangle}
          tone="warning"
        />
        <SummaryCard
          label="Đang khám"
          value={counts.inProgress}
          icon={CheckCircle2}
          tone="primary"
        />
        <SummaryCard
          label="Hoàn thành"
          value={counts.done}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <div className="mb-4 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên bệnh nhân, SĐT, bác sĩ..."
          className="pl-9 h-9 text-sm"
        />
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "Giờ",
                  "Bệnh nhân",
                  "Bác sĩ",
                  "Thanh toán",
                  "Trạng thái",
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-muted-foreground px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && queue.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-sm text-muted-foreground"
                  >
                    {search.trim()
                      ? "Không có kết quả phù hợp."
                      : "Chưa có lịch nào hôm nay."}
                  </td>
                </tr>
              )}
              {filtered.map((item) => {
                const pay = paymentSummary(item);
                const overdue = isOverdue(item);
                const canCheckIn = CHECK_INABLE.has(item.status);
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-border/50 transition-colors",
                      overdue && "bg-warning/5 hover:bg-warning/10",
                      !overdue && "hover:bg-muted/20",
                    )}
                  >
                    <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                      {item.start_time}
                      <span className="text-muted-foreground">
                        –{item.end_time}
                      </span>
                      {overdue && (
                        <p className="text-[15px] text-warning mt-0.5 font-medium">
                          Quá giờ &gt; 15 phút
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold">
                        {item.patient.profile.full_name}
                      </p>
                      {item.patient.profile.phone && (
                        <a
                          href={`tel:${item.patient.profile.phone}`}
                          className="text-xs text-muted-foreground hover:text-primary"
                        >
                          {item.patient.profile.phone}
                        </a>
                      )}
                      {item.patient_note && (
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-[220px] truncate">
                          {item.patient_note}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium">
                        {item.doctor.profile.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.doctor.specialization}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <PaymentPill
                        paid={pay.paid}
                        pendingAdvance={pay.pendingAdvance}
                        label={pay.label}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={statusToBadge(item.status)} />
                    </td>
                    <td className="px-4 py-3">
                      {canCheckIn ? (
                        <Button
                          size="sm"
                          className="h-7 text-xs rounded-lg"
                          onClick={() => openCheckIn(item)}
                        >
                          Check-in
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CheckInDialog
        item={selected}
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setSelected(null);
        }}
      />
    </DashboardLayout>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "info" | "warning" | "primary" | "success";
}) {
  const ring =
    tone === "info"
      ? "bg-info/10 text-info"
      : tone === "warning"
        ? "bg-warning/10 text-warning"
        : tone === "primary"
          ? "bg-primary/10 text-primary"
          : "bg-success/10 text-success";
  return (
    <div className="card-elevated p-4 flex items-center gap-3">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          ring,
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function PaymentPill({
  paid,
  pendingAdvance,
  label,
}: {
  paid: boolean;
  pendingAdvance: boolean;
  label: string;
}) {
  if (paid) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">
        <BadgeDollarSign className="w-3 h-3" /> {label}
      </span>
    );
  }
  if (pendingAdvance) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">
        <AlertTriangle className="w-3 h-3" /> {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-info/10 text-info font-medium">
      <Wallet className="w-3 h-3" /> {label}
    </span>
  );
}
