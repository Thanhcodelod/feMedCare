"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Loader2, Check, X, Filter, Search } from "lucide-react";
import { useAllLeaves, useUpdateLeaveStatus } from "@/hooks/useLeaveRequests";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import type { LeaveStatus } from "@/types/api";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LocaleDate } from "@/components/shared/LocaleDate";

export default function AdminLeavesPage() {
  const { data: leaves = [], isLoading } = useAllLeaves();
  const updateStatusMut = useUpdateLeaveStatus();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "ALL">("ALL");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<{ id: string; status: LeaveStatus } | null>(null);

  const filteredLeaves = leaves.filter((leave) => {
    const matchSearch = (leave.doctor_name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (leave.reason || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || leave.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="text-amber-500 border-amber-500 bg-amber-50">Chờ duyệt</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="text-green-500 border-green-500 bg-green-50">Đã duyệt</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="text-red-500 border-red-500 bg-red-50">Từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSessionLabel = (s: string) => {
    switch (s) {
      case "MORNING": return "Sáng";
      case "AFTERNOON": return "Chiều";
      case "FULL_DAY": return "Cả ngày";
      default: return s;
    }
  };

  const handleStatusUpdate = (id: string, status: LeaveStatus) => {
    setSelectedLeave({ id, status });
    setConfirmOpen(true);
  };

  return (
    <DashboardLayout role="admin" title="Duyệt đơn nghỉ phép">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Duyệt đơn nghỉ phép</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý và phê duyệt các yêu cầu nghỉ phép từ bác sĩ
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên bác sĩ, lý do..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select 
            value={statusFilter} 
            onValueChange={(v) => setStatusFilter(v as any)}
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Lọc trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bác sĩ</TableHead>
              <TableHead>Ngày nghỉ</TableHead>
              <TableHead>Ca nghỉ</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredLeaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy yêu cầu nghỉ nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">
                    {leave.doctor_name || "Bác sĩ"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <LocaleDate value={leave.date} />
                    </div>
                  </TableCell>
                  <TableCell>{getSessionLabel(leave.session)}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={leave.reason}>
                    {leave.reason || "—"}
                  </TableCell>
                  <TableCell>{getStatusBadge(leave.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <LocaleDate value={leave.createdAt} variant="datetime" />
                  </TableCell>
                  <TableCell className="text-right">
                    {leave.status === "PENDING" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                          onClick={() => handleStatusUpdate(leave.id, "APPROVED")}
                          disabled={updateStatusMut.isPending}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleStatusUpdate(leave.id, "REJECTED")}
                          disabled={updateStatusMut.isPending}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={selectedLeave?.status === "APPROVED" ? "Phê duyệt yêu cầu" : "Từ chối yêu cầu"}
        description={
          selectedLeave?.status === "APPROVED"
            ? "Bạn có chắc chắn muốn phê duyệt yêu cầu nghỉ phép này không?"
            : "Bạn có chắc chắn muốn từ chối yêu cầu nghỉ phép này không?"
        }
        variant={selectedLeave?.status === "APPROVED" ? "default" : "destructive"}
        confirmText={selectedLeave?.status === "APPROVED" ? "Phê duyệt" : "Từ chối"}
        isLoading={updateStatusMut.isPending}
        onConfirm={() => {
          if (selectedLeave) {
            updateStatusMut.mutate(
              { id: selectedLeave.id, payload: { status: selectedLeave.status } },
              {
                onSuccess: () => {
                  setConfirmOpen(false);
                  setSelectedLeave(null);
                },
              }
            );
          }
        }}
      />
    </DashboardLayout>
  );
}
