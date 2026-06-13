"use client";
import { useState } from "react";
import { useAuthStore } from "@/redux/authStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Video,
  MapPin,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { useDoctors, useDoctorSchedule } from "@/hooks/useDoctors";
import { APPOINTMENTS_KEY, useBookAppointment } from "@/hooks/useAppointments";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { DoctorDetailDialog } from "@/components/shared/DoctorDetailDialog";
import { QrPaymentDialog } from "@/components/shared/QrPaymentDialog";
import { getDoctorId } from "@/api/normalize";
import { useQueryClient } from "@tanstack/react-query";
import type {
  BookAppointmentRequestPayload,
  CreateOrderResponse,
  Doctor,
  PaymentMethod,
} from "@/types/api";
import { useEffect } from "react";
import { toast } from "@/lib/notify";
import { CreditCard } from "lucide-react";

const specialties = [
  "Tất cả",
  "Tim mạch",
  "Nội tiết",
  "Thần kinh",
  "Da liễu",
  "Nhi khoa",
  "Tổng quát",
  "Tai mũi họng",
  "Mắt",
  "Răng hàm mặt",
];

const TODAY_ISO = new Date().toISOString().split("T")[0];

export function PatientBookAppointmentComponent() {
  const navigate = useRouter();
  const [step, setStep] = useState(0);
  const [specialty, setSpecialty] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [detailDoctor, setDetailDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(TODAY_ISO);
  const [selectedSlot, setSelectedSlot] = useState<{
    start_time: string;
    end_time: string;
  } | null>(null);
  const [appointmentType, setAppointmentType] = useState<"ONLINE" | "OFFLINE">(
    "ONLINE",
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "online" | "at_clinic" | null
  >(null);
  const [reason, setReason] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps =
    appointmentType === "ONLINE"
      ? ["Chọn bác sĩ", "Chọn thời gian", "Xác nhận & Thanh toán"]
      : ["Chọn bác sĩ", "Chọn thời gian", "Phương thức thanh toán", "Xác nhận"];

  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors({
    specialization: specialty !== "Tất cả" ? specialty : undefined,
    search: search || undefined,
  });

  const debouncedDate = useDebouncedValue(selectedDate, 300);
  const { data: scheduleData, isLoading: loadingSchedule } = useDoctorSchedule(
    getDoctorId(selectedDoctor),
    debouncedDate,
  );

  const bookMut = useBookAppointment();
  const qc = useQueryClient();
  const isSubmitting = bookMut.isPending;

  const [qrPayment, setQrPayment] = useState<{
    order: CreateOrderResponse;
    appointmentId: string;
  } | null>(null);

  const authUser = useAuthStore((state) => state.user);

  if (!mounted) {
    return null;
  }

  if (!authUser || authUser.role !== "PATIENT") {
    return (
      <DashboardLayout role="patient" title="Đặt lịch khám">
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <p className="text-destructive mb-4">
            Vui lòng đăng nhập với tài khoản bệnh nhân để đặt lịch khám.
          </p>
          <a href="/login" className="text-primary hover:underline font-medium">
            Đăng nhập ngay
          </a>
        </div>
      </DashboardLayout>
    );
  }

  const DEFAULT_CONSULTATION_FEE = 200000;
  const currentConsultationFee = selectedDoctor?.consultation_fee 
    ? Number(selectedDoctor.consultation_fee) 
    : DEFAULT_CONSULTATION_FEE;

  const handleBook = () => {
    if (!selectedDoctor || !selectedSlot) return;
    if (isSubmitting) return;

    const doctorId = getDoctorId(selectedDoctor);
    if (!doctorId) {
      toast.error("Không xác định được bác sĩ. Vui lòng chọn lại.");
      return;
    }

    let paymentMethodEnum: PaymentMethod;
    if (appointmentType === "ONLINE") {
      paymentMethodEnum = "ADVANCE_PAYMENT";
    } else {
      if (paymentMethod === "online") {
        paymentMethodEnum = "ADVANCE_PAYMENT";
      } else {
        paymentMethodEnum = "PAYMENT_AT_CLINIC";
      }
    }

    const shouldPayNow =
      appointmentType === "ONLINE" || paymentMethod === "online";

    const trimmedReason = reason.trim();
    const bookingPayload: BookAppointmentRequestPayload = {
      doctor_id: doctorId,
      appointment_date: selectedDate,
      start_time: selectedSlot.start_time,
      appointment_type: appointmentType,
      payment_method: paymentMethodEnum,
      ...(trimmedReason ? { patient_note: trimmedReason } : {}),
    };

    if (shouldPayNow) {
      bookMut.mutate(bookingPayload, {
        onSuccess: ({ appointment, order }) => {
          if (!order) {
            toast.error(
              "Không nhận được mã QR từ máy chủ. Vui lòng thử lại.",
            );
            return;
          }
          setQrPayment({ order, appointmentId: appointment.id });
        },
      });
    } else {
      bookMut.mutate(bookingPayload, {
        onSuccess: () => navigate.push("/patient/appointments"),
      });
    }
  };

  const handleQrPaid = () => {
    qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    toast.success("Thanh toán thành công!");
    setQrPayment(null);
    navigate.push("/patient/appointments");
  };

  return (
    <DashboardLayout role="patient" title="Đặt lịch khám">
      {/* Page header — serif title, generous top whitespace */}
      <header className="mb-8">
        <h1 className="text-3xl">Đặt lịch khám</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Chọn bác sĩ phù hợp, khung giờ trống và xác nhận lịch hẹn của bạn.
        </p>
      </header>

      <ol className="flex items-stretch border-y border-border mb-10">
        {steps.map((s, i) => {
          const state = i < step ? "done" : i === step ? "current" : "todo";
          return (
            <li
              key={s}
              className={cn(
                "flex-1 flex items-center gap-2.5 py-3 px-1 sm:px-3 border-r border-border last:border-r-0 relative",
                state === "current" &&
                  "after:absolute after:left-0 after:bottom-[-1px] after:h-px after:w-full after:bg-primary",
              )}
            >
              <span
                className={cn(
                  "font-mono text-xs tabular-nums",
                  state === "todo"
                    ? "text-muted-foreground/50"
                    : "text-primary",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "text-xs sm:text-sm tracking-tight hidden sm:block",
                  state === "todo"
                    ? "text-muted-foreground"
                    : "text-foreground font-medium",
                )}
              >
                {s}
              </span>
              {state === "done" && (
                <CheckCircle className="w-3.5 h-3.5 text-success ml-auto" />
              )}
            </li>
          );
        })}
      </ol>


      {step === 0 && (
        <div className="grid lg:grid-cols-[240px_1fr] gap-x-10 gap-y-6">

          <aside className="lg:sticky lg:top-4 lg:self-start space-y-5">
            <div>
              <div className="section-title mb-2">Tìm kiếm</div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tên bác sĩ…"
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <div>
              <div className="section-title mb-2">Chuyên khoa</div>
              <div className="flex flex-row flex-wrap lg:flex-col gap-0.5">
                {specialties.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpecialty(s)}
                    className={cn(
                      "text-left text-sm px-2.5 py-1.5 rounded-md transition-colors",
                      specialty === s
                        ? "bg-card text-primary font-medium shadow-[inset_2px_0_0_0_hsl(var(--primary))]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Doctor list — data rows, not card grid */}
          <section className="min-w-0">
            <div className="flex items-baseline justify-between mb-3">
              <div className="section-title">
                Bác sĩ {specialty !== "Tất cả" && `· ${specialty}`}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {doctors.length} kết quả
              </span>
            </div>

            {loadingDoctors ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : doctors.length === 0 ? (
              <div className="border border-dashed border-border rounded-md py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  Không tìm thấy bác sĩ phù hợp.
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-md overflow-hidden">
                {doctors.map((doc) => {
                  const active = selectedDoctor?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedDoctor(doc);
                        }
                      }}
                      className={cn(
                        "data-row group flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-colors",
                        active
                          ? "bg-primary/[0.04] shadow-[inset_3px_0_0_0_hsl(var(--primary))]"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <Avatar className="w-11 h-11 rounded-md flex-shrink-0">
                        <AvatarImage
                          src={
                            doc.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.id}`
                          }
                        />
                        <AvatarFallback className="rounded-md bg-secondary text-foreground font-semibold">
                          {doc.fullName?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="font-display text-base leading-tight truncate">
                          {doc.fullName || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {doc.specialization}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground tabular-nums">

                        </div>
                      </div>

                      <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="font-mono text-sm tabular-nums text-foreground">
                          {Number(
                            doc.consultation_fee || DEFAULT_CONSULTATION_FEE,
                          ).toLocaleString("vi-VN")}
                          <span className="text-muted-foreground"> ₫</span>
                        </span>
                        
                      </div>

                      <ChevronRight
                        className={cn(
                          "w-4 h-4 flex-shrink-0 transition-colors",
                          active
                            ? "text-primary"
                            : "text-muted-foreground/40 group-hover:text-muted-foreground",
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button disabled={!selectedDoctor} onClick={() => setStep(1)}>
                Tiếp tục <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </section>
        </div>
      )}

      {/* Step 2: Choose time */}
      {step === 1 && selectedDoctor && (
        <div className="grid lg:grid-cols-[1fr_300px] gap-x-10 gap-y-6 items-start">
          {/* Left: form */}
          <div className="space-y-8 min-w-0 order-2 lg:order-1">
            <section>
              <div className="section-title mb-3">Hình thức khám</div>
              <div className="inline-flex border border-border rounded-md p-0.5 bg-muted/40">
                {(
                  [
                    { value: "ONLINE", label: "Video Call", icon: Video },
                    { value: "OFFLINE", label: "Trực tiếp", icon: MapPin },
                  ] as const
                ).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setAppointmentType(type.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm rounded-[5px] transition-colors",
                      appointmentType === type.value
                        ? "bg-card text-foreground font-medium shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <type.icon className="w-3.5 h-3.5" />
                    {type.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {appointmentType === "ONLINE"
                  ? "Tư vấn từ xa qua video, thanh toán cọc trước."
                  : "Khám trực tiếp tại phòng khám."}
              </p>
            </section>

            <section className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="section-title mb-3">Ngày khám</div>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  min={TODAY_ISO}
                />
              </div>
              <div>
                <div className="section-title mb-3">Lý do khám</div>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="VD: Đau răng, ho kéo dài…"
                />
              </div>
            </section>

            <section>
              <div className="flex items-baseline justify-between mb-3">
                <div className="section-title">Khung giờ trống</div>
                <span className="text-xs text-muted-foreground">
                  Mỗi ca 30 phút
                </span>
              </div>
              {loadingSchedule ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tải khung giờ…
                </div>
              ) : !scheduleData?.availableSlots ||
                scheduleData.availableSlots.length === 0 ? (
                <div className="border border-dashed border-border rounded-md py-12 px-6 text-center">
                  <Calendar className="w-7 h-7 text-muted-foreground/60 mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">Không có lịch trống</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDoctor.fullName || "Bác sĩ"} không có ca khám ngày{" "}
                    {new Date(selectedDate).toLocaleDateString("vi-VN")}. Vui
                    lòng chọn ngày khác.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {scheduleData.availableSlots.map((slot) => {
                    const picked =
                      selectedSlot?.start_time === slot.start_time &&
                      selectedSlot?.end_time === slot.end_time;
                    return (
                      <button
                        key={`${slot.start_time}-${slot.end_time}`}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "py-2 rounded-md text-sm font-mono tabular-nums border transition-colors",
                          picked
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border bg-card hover:border-primary/40 hover:bg-primary/[0.04]",
                        )}
                      >
                        {slot.start_time}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
              </Button>
              <Button disabled={!selectedSlot} onClick={() => setStep(2)}>
                Tiếp tục <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Right: sticky doctor context */}
          <aside className="lg:sticky lg:top-4 order-1 lg:order-2 card-elevated p-4">
            <div className="section-title mb-3">Bác sĩ đã chọn</div>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 rounded-md">
                <AvatarImage
                  src={
                    selectedDoctor.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDoctor.id}`
                  }
                />
                <AvatarFallback className="rounded-md bg-secondary text-foreground font-semibold">
                  {selectedDoctor.fullName?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-display text-base leading-tight truncate">
                  {selectedDoctor.fullName || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedDoctor.specialization}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kinh nghiệm</span>
                <span className="tabular-nums">
                  {selectedDoctor.yearsOfExperience ??
                    selectedDoctor.experience_years ??
                    0}{" "}
                  năm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí khám</span>
                <span className="font-mono tabular-nums">
                  {currentConsultationFee.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>
            <button
              onClick={() => setStep(0)}
              className="mt-4 text-xs text-primary hover:underline"
            >
              ← Đổi bác sĩ khác
            </button>
          </aside>
        </div>
      )}

      {/* Step 3: Payment Method (only for OFFLINE) */}
      {step === 2 &&
        appointmentType === "OFFLINE" &&
        selectedDoctor &&
        selectedSlot && (
          <div className="max-w-lg">
            <div className="section-title mb-3">Phương thức thanh toán</div>
            <div className="border border-border rounded-md overflow-hidden mb-6">
              {(
                [
                  {
                    value: "at_clinic" as const,
                    label: "Thanh toán tại cơ sở",
                    desc: "Thanh toán bằng tiền mặt/thẻ khi đến khám",
                  },
                  {
                    value: "online" as const,
                    label: "Thanh toán qua QR",
                    desc: "Chuyển khoản ngân hàng trước qua mã VietQR",
                  },
                ]
              ).map((opt) => {
                const picked = paymentMethod === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setPaymentMethod(opt.value)}
                    className={cn(
                      "data-row w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors",
                      picked ? "bg-primary/[0.04]" : "hover:bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors",
                        picked ? "border-primary" : "border-muted-foreground/40",
                      )}
                    >
                      {picked && (
                        <span className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {opt.label}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {opt.desc}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
              </Button>
              <Button disabled={!paymentMethod} onClick={() => setStep(3)}>
                Tiếp tục <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

      {/* Step 4: Confirm (for OFFLINE) or Step 3 (for ONLINE) */}
      {((step === 2 && appointmentType === "ONLINE") ||
        (step === 3 && appointmentType === "OFFLINE")) &&
        selectedDoctor &&
        selectedSlot && (
          <div className="max-w-lg">
            <div className="section-title mb-3">Xác nhận lịch hẹn</div>
            <div className="border border-border rounded-md">
              {[
                { label: "Bác sĩ", value: selectedDoctor.fullName, serif: true },
                { label: "Chuyên khoa", value: selectedDoctor.specialization },
                {
                  label: "Ngày khám",
                  value: new Date(selectedDate).toLocaleDateString("vi-VN"),
                  mono: true,
                },
                {
                  label: "Giờ khám",
                  value: `${selectedSlot.start_time} – ${selectedSlot.end_time}`,
                  mono: true,
                },
                {
                  label: "Hình thức",
                  value:
                    appointmentType === "ONLINE" ? "Video Call" : "Trực tiếp",
                },
                ...(appointmentType === "OFFLINE" && paymentMethod
                  ? [
                      {
                        label: "Thanh toán",
                        value:
                          paymentMethod === "at_clinic"
                            ? "Tại cơ sở"
                            : "Qua QR",
                      },
                    ]
                  : []),
                { label: "Lý do", value: reason || "—" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="data-row flex items-center justify-between gap-4 px-4 py-3"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium text-right",
                      item.serif && "font-display text-base",
                      item.mono && "font-mono tabular-nums",
                    )}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
              {/* Fee — emphasized footer row */}
              <div className="flex items-center justify-between gap-4 px-4 py-3.5 bg-muted/40 border-t border-border">
                <span className="text-sm font-medium">Phí khám</span>
                <span className="font-mono tabular-nums text-lg text-primary">
                  {currentConsultationFee.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setStep(appointmentType === "ONLINE" ? 1 : 2)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
              </Button>
              <Button
                disabled={isSubmitting}
                className="flex-1"
                onClick={handleBook}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý…
                  </>
                ) : appointmentType === "ONLINE" ||
                  paymentMethod === "online" ? (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" /> Thanh toán & xác nhận
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" /> Xác nhận đặt lịch
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

      {/* Doctor detail dialog */}
      {detailDoctor && (
        <DoctorDetailDialog
          doctor={detailDoctor}
          open={!!detailDoctor}
          onOpenChange={() => setDetailDoctor(null)}
        />
      )}

      {/* In-app QR payment dialog — receives the order pre-created by
          POST /appointments/book, no separate POST /orders needed. */}
      {qrPayment && (
        <QrPaymentDialog
          open={!!qrPayment}
          onOpenChange={(open) => {
            if (!open) setQrPayment(null);
          }}
          order={qrPayment.order}
          appointmentId={qrPayment.appointmentId}
          onPaid={handleQrPaid}
        />
      )}
    </DashboardLayout>
  );
}
