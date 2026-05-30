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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useMyLeaves, useSubmitLeave, useCancelLeave } from "@/hooks/useLeaveRequests";
import { useClientDate } from "@/hooks/useClientDate";
import { LocaleDate } from "@/components/shared/LocaleDate";
import type { LeaveSession } from "@/types/api";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export default function DoctorLeavesPage() {
  const { data: leaves = [], isLoading } = useMyLeaves();
  const submitLeaveMut = useSubmitLeave();
  const cancelLeaveMut = useCancelLeave();
  const now = useClientDate();
  const minDate = now ? now.toISOString().split("T")[0] : undefined;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leafToCancel, setLeafToCancel] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [session, setSession] = useState<LeaveSession>("FULL_DAY");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    submitLeaveMut.mutate(
      { date, session, reason },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setDate("");
          setSession("FULL_DAY");
          setReason("");
        },
      }
    );
  };

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

  return (
    <DashboardLayout role="doctor" title="Quản lý nghỉ phép">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lịch nghỉ phép</h1>
          <p className="text-sm text-muted-foreground">
            Gửi và quản lý các yêu cầu nghỉ phép của bạn
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Đăng ký nghỉ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Đăng ký nghỉ phép</DialogTitle>
                <DialogDescription>
                  Vui lòng chọn ngày và ca nghỉ. Lưu ý: Bạn không thể xin nghỉ nếu đã có lịch hẹn trong khoảng thời gian này.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Ngày nghỉ *</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    min={minDate}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="session">Ca nghỉ *</Label>
                  <Select 
                    value={session} 
                    onValueChange={(v) => setSession(v as LeaveSession)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ca nghỉ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORNING">Sáng (07:00 - 12:00)</SelectItem>
                      <SelectItem value="AFTERNOON">Chiều (13:00 - 17:00)</SelectItem>
                      <SelectItem value="FULL_DAY">Cả ngày</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason">Lý do</Label>
                  <Textarea
                    id="reason"
                    placeholder="Nhập lý do nghỉ phép..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={submitLeaveMut.isPending}>
                  {submitLeaveMut.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Gửi yêu cầu
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
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
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Bạn chưa có yêu cầu nghỉ phép nào.
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setLeafToCancel(leave.id);
                          setConfirmOpen(true);
                        }}
                        disabled={cancelLeaveMut.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
        title="Hủy yêu cầu nghỉ"
        description="Bạn có chắc chắn muốn hủy yêu cầu nghỉ này không? Hành động này không thể hoàn tác."
        variant="destructive"
        confirmText="Hủy yêu cầu"
        isLoading={cancelLeaveMut.isPending}
        onConfirm={() => {
          if (leafToCancel) {
            cancelLeaveMut.mutate(leafToCancel, {
              onSuccess: () => {
                setConfirmOpen(false);
                setLeafToCancel(null);
              },
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
