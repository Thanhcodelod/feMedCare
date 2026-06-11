"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useMyPatientRecords } from "@/hooks/useMedicalRecords";
import {
  FileText,
  Pill,
  ClipboardList,
  Loader2,
  Stethoscope,
  Calendar,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocaleDate } from "@/components/shared/LocaleDate";
import type { MedicalRecord } from "@/types/api";
import { useMemo } from "react";

/** Doctor display name from BE relation, fall back to a friendly placeholder. */
function doctorName(rec: MedicalRecord): string {
  return (
    rec.doctor?.profile?.full_name ||
    rec.doctor?.profile?.fullName ||
    "Bác sĩ"
  );
}

/** Prescription is a free-form multiline string on BE. Split into
 *  display lines; null/empty means the doctor opted out of a prescription. */
function prescriptionLines(rec: MedicalRecord): string[] {
  if (!rec.prescription) return [];
  return rec.prescription
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function hasPrescription(rec: MedicalRecord): boolean {
  return prescriptionLines(rec).length > 0;
}

export default function PatientRecords() {
  const { data: records = [], isLoading } = useMyPatientRecords();

  // Newest first — BE doesn't guarantee an order on this endpoint.
  const sorted = useMemo(
    () =>
      [...records].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      ),
    [records],
  );

  const stats = useMemo(() => {
    const total = sorted.length;
    const online = sorted.filter(
      (r) => r.appointment?.appointment_type === "ONLINE",
    ).length;
    const offline = sorted.filter(
      (r) => r.appointment?.appointment_type === "OFFLINE",
    ).length;
    const doctors = new Set(sorted.map((r) => r.doctor_id)).size;
    return { total, online, offline, doctors };
  }, [sorted]);

  const specializations = useMemo(
    () =>
      Array.from(
        new Set(
          sorted
            .map((r) => r.doctor?.specialization)
            .filter((s): s is string => Boolean(s)),
        ),
      ),
    [sorted],
  );

  const withPrescription = sorted.filter(hasPrescription);

  return (
    <DashboardLayout role="patient" title="Hồ sơ y tế">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hồ sơ y tế</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hồ sơ bệnh án do bác sĩ đã hoàn thành ca khám và cấp cho bạn
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Đang tải hồ sơ…
          </span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="card-elevated text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Chưa có hồ sơ y tế</p>
          <p className="text-sm text-muted-foreground mt-1">
            Hồ sơ sẽ xuất hiện sau khi bác sĩ hoàn thành ca khám và cấp
            cho bạn
          </p>
        </div>
      ) : (
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList>
            <TabsTrigger value="history">
              Lịch sử khám ({sorted.length})
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              Đơn thuốc ({withPrescription.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-4">
                {sorted.map((rec) => (
                  <RecordCard key={rec.id} record={rec} />
                ))}
              </div>

              <div className="space-y-4">
                <div className="card-elevated p-5">
                  <h3 className="text-sm font-semibold mb-4">Thống kê</h3>
                  {[
                    { label: "Tổng lần khám", value: stats.total },
                    { label: "Khám online", value: stats.online },
                    { label: "Khám offline", value: stats.offline },
                    { label: "Bác sĩ đã khám", value: stats.doctors },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between py-2 border-b border-border/40 last:border-0"
                    >
                      <span className="text-xs text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="text-xs font-semibold">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {specializations.length > 0 && (
                  <div className="card-elevated p-5">
                    <h3 className="text-sm font-semibold mb-3">
                      Chuyên khoa đã khám
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {specializations.map((spec) => (
                        <Badge
                          key={spec}
                          variant="secondary"
                          className="rounded-lg text-xs"
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prescriptions">
            <div className="space-y-4">
              {withPrescription.length === 0 ? (
                <div className="card-elevated text-center py-12">
                  <Pill className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Chưa có đơn thuốc nào
                  </p>
                </div>
              ) : (
                withPrescription.map((rec) => (
                  <PrescriptionCard key={rec.id} record={rec} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
}

function RecordCard({ record }: { record: MedicalRecord }) {
  const date =
    record.appointment?.appointment_date || record.created_at;
  const start = record.appointment?.start_time;
  const end = record.appointment?.end_time;
  const type = record.appointment?.appointment_type;
  const lines = prescriptionLines(record);

  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{record.diagnosis}</h3>
            {record.diagnostic_code && (
              <p className="text-[14px] text-muted-foreground uppercase tracking-tight mt-0.5">
                ICD-10: {record.diagnostic_code}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              BS. {doctorName(record)}
              {record.doctor?.specialization &&
                ` · ${record.doctor.specialization}`}
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <LocaleDate value={date} />
              </span>
              {start && end && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {start} - {end}
                </span>
              )}
              {type && (
                <Badge
                  variant={type === "ONLINE" ? "default" : "secondary"}
                  className="rounded-md text-[14px] px-1.5 py-0"
                >
                  {type}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {record.treatment && (
        <div className="bg-muted/40 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Stethoscope className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Phương pháp điều trị
            </span>
          </div>
          <p className="text-sm">{record.treatment}</p>
        </div>
      )}

      <div className="bg-muted/40 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Pill className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Đơn thuốc
          </span>
        </div>
        {lines.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            Bác sĩ đánh dấu không cần kê đơn cho ca khám này
          </p>
        ) : (
          <div className="space-y-1.5">
            {lines.map((line, i) => (
              <div key={i} className="text-sm flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                <span>{line}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {record.doctor_advice && (
        <div className="bg-muted/40 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <ClipboardList className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lời khuyên của bác sĩ
            </span>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {record.doctor_advice}
          </p>
        </div>
      )}
    </div>
  );
}

function PrescriptionCard({ record }: { record: MedicalRecord }) {
  const date =
    record.appointment?.appointment_date || record.created_at;
  const lines = prescriptionLines(record);

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2">
            Đơn thuốc — <LocaleDate value={date} />
          </h3>
          <p className="text-xs text-muted-foreground">
            BS. {doctorName(record)} · {record.diagnosis}
          </p>
        </div>
        <Badge variant="outline" className="rounded-lg text-xs">
          {lines.length} dòng
        </Badge>
      </div>

      <div className="space-y-1.5">
        {lines.map((line, i) => (
          <div
            key={i}
            className="text-sm flex items-start gap-2 py-1.5 border-b border-border/40 last:border-0"
          >
            <span className="text-muted-foreground w-5 flex-shrink-0">
              {i + 1}.
            </span>
            <span>{line}</span>
          </div>
        ))}
      </div>

      {record.doctor_advice && (
        <p className="mt-3 text-xs italic text-muted-foreground">
          Lời khuyên: {record.doctor_advice}
        </p>
      )}
    </div>
  );
}
