"use client";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  Calendar,
  User,
  FileText,
  Pill,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMyDoctorRecords } from "@/hooks/useMedicalRecords";
import { LocaleDate } from "@/components/shared/LocaleDate";
import { cn } from "@/utils/utils";
import type { MedicalRecord } from "@/types/api";

interface PatientSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  latestDiagnosis: string;
  latestVisit: string;
  visitCount: number;
  phone?: string;
  bloodType?: string;
  gender?: string;
  dateOfBirth?: string;
}

function patientNameFromRecord(rec: MedicalRecord): string {
  return (
    rec.patient?.profile?.full_name ||
    rec.patient?.profile?.fullName ||
    "Bệnh nhân"
  );
}

/**
 * Collapse the doctor's medical-record stream into one row per patient.
 * Most-recent record wins for "latest diagnosis"; visit count is the
 * total number of records for that patient.
 */
function groupByPatient(records: MedicalRecord[]): PatientSummary[] {
  const byId = new Map<string, PatientSummary>();
  // Sort by created_at desc so the first encounter of each patient is
  // the most recent — used as `latestDiagnosis`/`latestVisit`.
  const sorted = [...records].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  for (const rec of sorted) {
    const existing = byId.get(rec.patient_id);
    if (existing) {
      existing.visitCount += 1;
      continue;
    }
    const profile = rec.patient?.profile ?? {};
    byId.set(rec.patient_id, {
      id: rec.patient_id,
      name: patientNameFromRecord(rec),
      avatarUrl: profile.avatar_url,
      latestDiagnosis: rec.diagnosis,
      latestVisit: rec.created_at,
      visitCount: 1,
      phone: profile.phone,
      bloodType: profile.blood_type,
      gender: profile.gender,
      dateOfBirth: profile.date_of_birth,
    });
  }
  return Array.from(byId.values());
}

function ageFromDob(dob?: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const before = now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
  if (before) age -= 1;
  return age;
}

function prescriptionLines(rec: MedicalRecord): string[] {
  if (!rec.prescription) return [];
  return rec.prescription
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function DoctorPatients() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: records = [], isLoading } = useMyDoctorRecords();

  const patients = useMemo(() => groupByPatient(records), [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.latestDiagnosis.toLowerCase().includes(q),
    );
  }, [patients, search]);

  const selected = selectedId
    ? patients.find((p) => p.id === selectedId) ?? null
    : null;

  const selectedRecords = useMemo(() => {
    if (!selectedId) return [];
    return records
      .filter((r) => r.patient_id === selectedId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      );
  }, [records, selectedId]);

  return (
    <DashboardLayout role="doctor" title="Bệnh nhân">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Danh sách bệnh nhân</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {patients.length} bệnh nhân đã khám
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bệnh nhân..."
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {search.trim()
                  ? "Không có kết quả phù hợp."
                  : "Chưa có bệnh nhân nào."}
              </div>
            )}
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  "cursor-pointer rounded-md border-2 p-3 flex items-center gap-3 transition-colors",
                  selectedId === p.id
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/40 bg-background hover:border-primary/20",
                )}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={p.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {p.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.latestDiagnosis}
                  </p>
                </div>
                <span className="text-[14px] text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-muted">
                  {p.visitCount} lần
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selected ? (
            <div className="card-elevated h-full flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 rounded-md bg-muted/60 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Chọn bệnh nhân để xem chi tiết
                </p>
              </div>
            </div>
          ) : (
            <div className="card-elevated p-6 animate-fade-in">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selected.avatarUrl} />
                    <AvatarFallback className="text-xl bg-success/10 text-success font-bold">
                      {selected.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selected.latestDiagnosis}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {selected.bloodType && (
                        <span className="badge-info text-xs px-2 py-0.5 rounded-full font-medium">
                          {selected.bloodType}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {selected.gender || "—"}
                        {ageFromDob(selected.dateOfBirth) !== null && (
                          <> · {ageFromDob(selected.dateOfBirth)} tuổi</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Đóng chi tiết"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <InfoTile
                  label="Số ĐT"
                  value={selected.phone || "—"}
                  href={selected.phone ? `tel:${selected.phone}` : undefined}
                />
                <InfoTile label="Số lần khám" value={`${selected.visitCount}`} />
                <InfoTile
                  label="Ngày sinh"
                  value={
                    selected.dateOfBirth ? (
                      <LocaleDate value={selected.dateOfBirth} />
                    ) : (
                      "—"
                    )
                  }
                />
                <InfoTile
                  label="Khám lần cuối"
                  value={<LocaleDate value={selected.latestVisit} />}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">Lịch sử khám bệnh</h3>
                  <span className="badge-primary text-xs px-2 py-0.5 rounded-full font-medium">
                    {selectedRecords.length}
                  </span>
                </div>

                {selectedRecords.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground bg-muted/30 rounded-xl">
                    Chưa có hồ sơ khám bệnh
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {selectedRecords.map((rec) => {
                      const rxLines = prescriptionLines(rec);
                      return (
                        <div
                          key={rec.id}
                          className="bg-muted/30 rounded-xl p-4 border border-border/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold">
                              {rec.diagnosis}
                              {rec.diagnostic_code && (
                                <span className="ml-2 text-[14px] text-muted-foreground uppercase tracking-tight">
                                  ICD-10: {rec.diagnostic_code}
                                </span>
                              )}
                            </p>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <LocaleDate value={rec.created_at} />
                            </span>
                          </div>
                          {rec.treatment && (
                            <p className="text-xs text-muted-foreground mb-2">
                              Điều trị: {rec.treatment}
                            </p>
                          )}
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2">
                              <Pill className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-medium mb-0.5">
                                  Đơn thuốc:
                                </p>
                                {rxLines.length === 0 ? (
                                  <p className="text-xs italic text-muted-foreground">
                                    Bác sĩ đánh dấu không cần kê đơn
                                  </p>
                                ) : (
                                  rxLines.map((line, i) => (
                                    <p
                                      key={i}
                                      className="text-xs text-muted-foreground"
                                    >
                                      • {line}
                                    </p>
                                  ))
                                )}
                              </div>
                            </div>
                            {rec.doctor_advice && (
                              <div className="flex items-start gap-2">
                                <ClipboardList className="w-3.5 h-3.5 text-info mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">
                                  {rec.doctor_advice}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoTile({
  label,
  value,
  href,
}: {
  label: string;
  value: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <div className="bg-muted/40 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
  return href ? (
    <a href={href} className="block hover:opacity-80 transition-opacity">
      {inner}
    </a>
  ) : (
    inner
  );
}
