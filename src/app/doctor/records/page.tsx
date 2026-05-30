"use client";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileText,
  Filter,
  Download,
  Printer,
  ChevronRight,
  Stethoscope,
  Calendar,
  Pill,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMyDoctorRecords } from "@/hooks/useMedicalRecords";
import { LocaleDate } from "@/components/shared/LocaleDate";
import type { MedicalRecord } from "@/types/api";

const PAGE_SIZE = 10;

/** Pull patient display name out of BE relation. */
function patientName(rec: MedicalRecord): string {
  return (
    rec.patient?.profile?.full_name ||
    rec.patient?.profile?.fullName ||
    "Bệnh nhân"
  );
}

/** First N drug lines from the prescription text — BE stores it as
 *  free-form multiline string, so we just split on newlines for a
 *  quick "drug name" preview. */
function prescriptionLines(rec: MedicalRecord): string[] {
  if (!rec.prescription) return [];
  return rec.prescription
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Take the first word/token of a drug line — usually the active
 *  ingredient (e.g. "Amoxicillin 500mg ..." → "Amoxicillin"). */
function firstToken(line: string): string {
  return line.split(/[\s,;-]/)[0] || line;
}

export default function DoctorRecordsArchive() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: records = [], isLoading } = useMyDoctorRecords();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      const diag = r.diagnosis?.toLowerCase() ?? "";
      const code = r.diagnostic_code?.toLowerCase() ?? "";
      const pname = patientName(r).toLowerCase();
      return diag.includes(q) || code.includes(q) || pname.includes(q);
    });
  }, [records, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const stats = useMemo(() => {
    const total = records.length;
    const monthCutoff = new Date();
    monthCutoff.setMonth(monthCutoff.getMonth() - 1);
    const recent = records.filter(
      (r) => new Date(r.created_at) >= monthCutoff,
    ).length;
    const withRx = records.filter((r) => !!r.prescription).length;
    return { total, recent, withRx };
  }, [records]);

  return (
    <DashboardLayout role="doctor" title="Kho hồ sơ bệnh án">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">
            Lưu trữ Hồ sơ Bệnh án
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hồ sơ do bạn tạo, lấy từ các ca khám đã hoàn thành
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2">
            <Download className="w-4 h-4" /> Xuất Excel
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-2">
            <Printer className="w-4 h-4" /> In báo cáo
          </Button>
        </div>
      </div>

      <div className="card-elevated p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo chẩn đoán, ICD-10, tên bệnh nhân..."
              className="pl-9 rounded-xl"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl gap-2" disabled>
              <Calendar className="w-4 h-4" /> Thời gian
            </Button>
            <Button variant="outline" className="rounded-xl gap-2" disabled>
              <Filter className="w-4 h-4" /> Bộ lọc nâng cao
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[140px]">Ngày khám</TableHead>
                <TableHead>Chẩn đoán</TableHead>
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Đơn thuốc</TableHead>
                <TableHead>Lời khuyên</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && paged.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-sm text-muted-foreground"
                  >
                    {search.trim()
                      ? "Không có kết quả phù hợp."
                      : "Chưa có hồ sơ bệnh án nào."}
                  </TableCell>
                </TableRow>
              )}
              {paged.map((record) => {
                const rxLines = prescriptionLines(record);
                return (
                  <TableRow
                    key={record.id}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <LocaleDate value={record.created_at} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">
                          {record.diagnosis}
                        </span>
                        {record.diagnostic_code && (
                          <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                            ICD-10: {record.diagnostic_code}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {patientName(record).charAt(0)}
                        </div>
                        <span className="text-sm">{patientName(record)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {rxLines.length === 0 ? (
                        <span className="text-[11px] italic text-muted-foreground">
                          Không kê đơn
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {rxLines.slice(0, 2).map((line, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-[10px] font-normal rounded-md px-1.5 py-0"
                            >
                              {firstToken(line)}
                            </Badge>
                          ))}
                          {rxLines.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{rxLines.length - 2} khác
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-[220px]">
                        {record.doctor_advice || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-muted-foreground">
            Hiển thị {paged.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
            {(safePage - 1) * PAGE_SIZE + paged.length} của {filtered.length} hồ
            sơ
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg h-8"
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg h-8"
            >
              Tiếp
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tổng số hồ sơ</p>
            <h4 className="text-xl font-bold">{stats.total}</h4>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-success/10 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Khám mới 30 ngày</p>
            <h4 className="text-xl font-bold">+{stats.recent}</h4>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-info/10 flex items-center justify-center">
            <Pill className="w-6 h-6 text-info" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Đơn thuốc đã cấp</p>
            <h4 className="text-xl font-bold">{stats.withRx}</h4>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
