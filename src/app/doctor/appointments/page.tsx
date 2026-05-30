"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Clock,
  User,
  Phone,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  COMPLETE_APPOINTMENT_LIMITS,
} from "@/types/api";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils/utils";
import {
  useDoctorAppointments,
  useCancelAppointment,
} from "@/hooks/useAppointments";
import { useAuthStore } from "@/redux/authStore";
import { useClientDate } from "@/hooks/useClientDate";
import type { Appointment } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCompleteAppointment } from "@/hooks/useAppointments";

type StatusFilter = "all" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const statusTabs: { label: string; value: StatusFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xác nhận", value: "PENDING" },
  { label: "Đã xác nhận", value: "CONFIRMED" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

export default function DoctorAppointments() {
  const navigate = useRouter();
  const user = useAuthStore((s) => s.user);
  const now = useClientDate();
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [diagnosticCode, setDiagnosticCode] = useState("");
  const [treatment, setTreatment] = useState("");
  const [noPrescription, setNoPrescription] = useState(false);
  const [prescription, setPrescription] = useState("");
  const [advice, setAdvice] = useState("");

  const resetCompleteForm = () => {
    setDiagnosis("");
    setDiagnosticCode("");
    setTreatment("");
    setNoPrescription(false);
    setPrescription("");
    setAdvice("");
  };

  // Pre-flight validation matching the BE DTO. Returns the first
  // user-facing error message, or null when the form is submittable.
  const validateComplete = (): string | null => {
    if (!diagnosis.trim()) return "Vui lòng nhập chẩn đoán";
    if (diagnosis.length > COMPLETE_APPOINTMENT_LIMITS.diagnosis) {
      return `Chẩn đoán tối đa ${COMPLETE_APPOINTMENT_LIMITS.diagnosis} ký tự`;
    }
    if (
      diagnosticCode &&
      diagnosticCode.length > COMPLETE_APPOINTMENT_LIMITS.diagnostic_code
    ) {
      return `Mã ICD-10 tối đa ${COMPLETE_APPOINTMENT_LIMITS.diagnostic_code} ký tự`;
    }
    if (
      treatment &&
      treatment.length > COMPLETE_APPOINTMENT_LIMITS.treatment
    ) {
      return `Phương pháp điều trị tối đa ${COMPLETE_APPOINTMENT_LIMITS.treatment} ký tự`;
    }
    if (advice && advice.length > COMPLETE_APPOINTMENT_LIMITS.advice) {
      return `Lời khuyên tối đa ${COMPLETE_APPOINTMENT_LIMITS.advice} ký tự`;
    }
    if (!noPrescription) {
      if (!prescription.trim()) {
        return 'Vui lòng nhập đơn thuốc hoặc tích "Không cần kê đơn"';
      }
      if (prescription.length > COMPLETE_APPOINTMENT_LIMITS.prescription) {
        return `Đơn thuốc tối đa ${COMPLETE_APPOINTMENT_LIMITS.prescription} ký tự`;
      }
    }
    return null;
  };

  const { data: appointments = [], isLoading } = useDoctorAppointments();
  const cancelMut = useCancelAppointment();
  const completeMut = useCompleteAppointment();

  const filtered = appointments.filter((a) => {
    const matchStatus = activeTab === "all" || a.status === activeTab;
    const matchSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      (a.reason || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts: Record<StatusFilter, number> = {
    all: appointments.length,
    PENDING: appointments.filter((a) => a.status === "PENDING").length,
    CONFIRMED: appointments.filter((a) => a.status === "CONFIRMED").length,
    COMPLETED: appointments.filter((a) => a.status === "COMPLETED").length,
    CANCELLED: appointments.filter((a) => a.status === "CANCELLED").length,
  };

  const handleComplete = () => {
    if (!selectedAppt) return;
    const err = validateComplete();
    if (err) {
      toast.error(err);
      return;
    }
    completeMut.mutate(
      {
        appointmentId: selectedAppt.id,
        payload: {
          diagnosis: diagnosis.trim(),
          ...(diagnosticCode.trim()
            ? { diagnostic_code: diagnosticCode.trim() }
            : {}),
          ...(treatment.trim() ? { treatment: treatment.trim() } : {}),
          ...(advice.trim() ? { advice: advice.trim() } : {}),
          // Omit `prescription` entirely when the doctor opted out —
          // BE's @IsNotEmpty rejects empty strings, so an explicit
          // absence is the only valid signal.
          ...(noPrescription
            ? {}
            : { prescription: prescription.trim() }),
        },
      },
      {
        onSuccess: () => {
          setCompleteDialogOpen(false);
          resetCompleteForm();
        },
      },
    );
  };

  return (
    <DashboardLayout role="doctor" title="Lịch khám">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý lịch khám</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý và theo dõi tất cả lịch hẹn của bạn
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bệnh nhân, lý do khám..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => {}} className="h-9 rounded-xl gap-2" suppressHydrationWarning>
          <Calendar className="w-4 h-4" />
          {now ? now.toLocaleDateString("vi-VN") : ""}
        </Button>
        <Button variant="outline" size="sm" onClick={() => {}} className="h-9 rounded-xl gap-2">
          <Filter className="w-4 h-4" /> Lọc
        </Button>
        <Button
          size="sm"
          className="h-9 rounded-xl ml-auto"
          onClick={() => navigate.push("/doctor/telemedicine")}
        >
          <Video className="w-4 h-4 mr-2" /> Video call ngay
        </Button>
      </div>

      <div className="flex gap-1 mb-5 bg-muted/40 rounded-xl p-1 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab.value
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                activeTab === tab.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "Bệnh nhân",
                  "Ngày & Giờ",
                  "Hình thức",
                  "Lý do",
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
              {isLoading && (
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
                    Không có lịch khám nào
                  </td>
                </tr>
              )}
              {filtered.map((appt) => (
                <tr
                  key={appt.id}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={appt.patientAvatar} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {appt.patientName?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {appt.patientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          #{appt.appointmentCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{appt.startTime}</p>
                        <p className="text-xs text-muted-foreground">
                          {appt.date}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium",
                        appt.type === "ONLINE"
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {appt.type === "ONLINE" ? (
                        <Video className="w-3.5 h-3.5" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5" />
                      )}
                      {appt.type === "ONLINE" ? "Video" : "Trực tiếp"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground max-w-[160px] truncate">
                      {appt.reason || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={appt.status.toLowerCase() as any} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {appt.status === "CONFIRMED" && (
                        <>
                          {appt.type === "ONLINE" && (
                            <Button
                              size="sm"
                              className="h-7 text-xs rounded-lg"
                              onClick={() =>
                                navigate.push(
                                  `/doctor/telemedicine?room=${encodeURIComponent(appt.appointmentCode)}`,
                                )
                              }
                            >
                              <Phone className="w-3 h-3 mr-1" /> Bắt đầu
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs rounded-lg text-success border-success/30"
                            onClick={() => {
                              setSelectedAppt(appt);
                              setCompleteDialogOpen(true);
                            }}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành
                          </Button>
                        </>
                      )}
                      {appt.status === "PENDING" && (
                        <span
                          className="h-7 px-2 inline-flex items-center text-xs rounded-lg bg-warning/10 text-warning-foreground border border-warning/20"
                          title="Lịch sẽ tự xác nhận khi bệnh nhân hoàn tất thanh toán hoặc khi tới giờ khám tại cơ sở"
                        >
                          Chờ thanh toán
                        </span>
                      )}
                      {(appt.status === "PENDING" ||
                        appt.status === "CONFIRMED") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs rounded-lg text-destructive"
                          disabled={cancelMut.isPending}
                          onClick={() => cancelMut.mutate(appt.id)}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs rounded-lg"
                        onClick={() => navigate.push("/doctor/patients")}
                      >
                        <User className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Hiển thị {filtered.length}/{appointments.length} lịch khám
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => {}} className="w-7 h-7 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="icon" onClick={() => {}} className="w-7 h-7 rounded-lg text-xs">
              1
            </Button>
            <Button variant="ghost" size="icon" onClick={() => {}} className="w-7 h-7 rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Complete Appointment Dialog */}
      <Dialog
        open={completeDialogOpen}
        onOpenChange={(open) => {
          setCompleteDialogOpen(open);
          if (!open) resetCompleteForm();
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hoàn thành ca khám</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Chẩn đoán *</Label>
              <Textarea
                className="mt-1.5"
                placeholder="VD: Viêm phế quản cấp..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={3}
                maxLength={COMPLETE_APPOINTMENT_LIMITS.diagnosis}
              />
              <p className="text-[11px] text-muted-foreground text-right mt-1">
                {diagnosis.length}/{COMPLETE_APPOINTMENT_LIMITS.diagnosis}
              </p>
            </div>

            <div>
              <Label>Mã ICD-10 (tùy chọn)</Label>
              <Input
                className="mt-1.5"
                placeholder="VD: J20.9"
                value={diagnosticCode}
                onChange={(e) => setDiagnosticCode(e.target.value)}
                maxLength={COMPLETE_APPOINTMENT_LIMITS.diagnostic_code}
              />
            </div>

            <div>
              <Label>Phương pháp điều trị (tùy chọn)</Label>
              <Textarea
                className="mt-1.5"
                placeholder="VD: Súc miệng nước muối + nghỉ ngơi"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                rows={2}
                maxLength={COMPLETE_APPOINTMENT_LIMITS.treatment}
              />
            </div>

            <label className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 cursor-pointer">
              <Checkbox
                checked={noPrescription}
                onCheckedChange={(v) => {
                  const checked = v === true;
                  setNoPrescription(checked);
                  if (checked) setPrescription("");
                }}
                className="mt-0.5"
              />
              <span className="text-sm">
                Không cần kê đơn thuốc cho ca khám này
              </span>
            </label>

            <div className={cn(noPrescription && "opacity-50")}>
              <Label>
                Đơn thuốc{" "}
                {!noPrescription && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                className={cn(
                  "mt-1.5",
                  noPrescription && "bg-muted cursor-not-allowed",
                )}
                placeholder={
                  noPrescription
                    ? "(Đã đánh dấu không kê đơn)"
                    : "VD:\nAmoxicillin 500mg, 1 viên × 3 lần/ngày, 7 ngày\nParacetamol 500mg, khi sốt > 38.5°C"
                }
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                rows={5}
                maxLength={COMPLETE_APPOINTMENT_LIMITS.prescription}
                disabled={noPrescription}
              />
              {!noPrescription && (
                <p className="text-[11px] text-muted-foreground text-right mt-1">
                  {prescription.length}/
                  {COMPLETE_APPOINTMENT_LIMITS.prescription}
                </p>
              )}
            </div>

            <div>
              <Label>Lời khuyên cho bệnh nhân (tùy chọn)</Label>
              <Textarea
                className="mt-1.5"
                placeholder="VD: Uống nhiều nước. Tái khám nếu sốt > 39°C"
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                rows={2}
                maxLength={COMPLETE_APPOINTMENT_LIMITS.advice}
              />
            </div>

            {!noPrescription && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                Đơn thuốc điện tử sẽ được gửi qua email cho bệnh nhân.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompleteDialogOpen(false)}
              disabled={completeMut.isPending}
            >
              Hủy
            </Button>
            <Button
              disabled={completeMut.isPending}
              onClick={handleComplete}
            >
              {completeMut.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Xác nhận hoàn thành
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
