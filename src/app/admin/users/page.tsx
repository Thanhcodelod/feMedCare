"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, Star, Mail, Phone, Trash2, Edit, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/utils/utils";
import { useAdminDoctors, useAdminPatients, useDeleteUser, useRegisterDoctor, useVerifyDoctor } from "@/hooks/useAdmin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LocaleDate } from "@/components/shared/LocaleDate";

type Tab = "doctors" | "patients";

export default function AdminUsers() {
  const [tab, setTab] = useState<Tab>("doctors");
  const [search, setSearch] = useState("");

  const { data: doctorsData = [], isLoading: loadingDoctors } = useAdminDoctors({ search: search || undefined });
  const { data: patientsData = [], isLoading: loadingPatients } = useAdminPatients({ search: search || undefined });
  const deleteMut = useDeleteUser();

  const registerDoctorMut = useRegisterDoctor();
  const verifyDoctorMut = useVerifyDoctor();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [openAddDoctor, setOpenAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    specialization: "",
    experience_years: 0,
    bio: "",
    consultation_fee: 0,
    qualifications: [] as string[]
  });

  const handleCreateDoctor = async () => {
    try {
      const data = await registerDoctorMut.mutateAsync(newDoctor);
      const createdDoctorId = data?.user?.doctorId;
      
      if (createdDoctorId) {
        await verifyDoctorMut.mutateAsync({ doctorId: createdDoctorId, status: "VERIFIED" });
      }

      setOpenAddDoctor(false);
      setNewDoctor({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        specialization: "",
        experience_years: 0,
        bio: "",
        consultation_fee: 0,
        qualifications: []
      });
    } catch (error) {
      console.error("Lỗi quy trình tạo bác sĩ:", error);
    }
  };

  const isLoading = tab === "doctors" ? loadingDoctors : loadingPatients;
  const patientsList = Array.isArray(patientsData) ? patientsData : [];
  const doctorsList = Array.isArray(doctorsData) ? doctorsData : [];
  const verifiedDoctorsCount = doctorsList.filter((d: any) => d.verifyStatus === 'VERIFIED').length;

  return (
    <DashboardLayout role="admin" title="Người dùng">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-sm text-muted-foreground mt-1 text-balance">
            <span className="font-semibold text-foreground">{doctorsData.filter((d: any) => d.verifyStatus === 'VERIFIED').length}</span> bác sĩ đã duyệt · 
            <span className="font-semibold text-foreground ml-1">{patientsList.length}</span> bệnh nhân

          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}} className="gap-2 h-10 px-4 border-dashed">
            <Mail className="w-4 h-4" /> Gửi thông báo
          </Button>
          <Dialog open={openAddDoctor} onOpenChange={setOpenAddDoctor}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-10 px-4">
                <UserPlus className="w-4 h-4" /> Thêm bác sĩ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Đăng ký tài khoản Bác sĩ mới</DialogTitle>
                <DialogDescription>
                  Nhập đầy đủ thông tin chuyên môn để hệ thống tạo hồ sơ bác sĩ hoàn chỉnh.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input value={newDoctor.email} onChange={e => setNewDoctor({...newDoctor, email: e.target.value})} placeholder="doctor@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu *</Label>
                  <Input type="password" value={newDoctor.password} onChange={e => setNewDoctor({...newDoctor, password: e.target.value})} placeholder="••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Họ & Tên *</Label>
                  <Input value={newDoctor.fullName} onChange={e => setNewDoctor({...newDoctor, fullName: e.target.value})} placeholder="BS. Nguyễn Văn A" />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại *</Label>
                  <Input value={newDoctor.phone} onChange={e => setNewDoctor({...newDoctor, phone: e.target.value})} placeholder="090..." />
                </div>
                <div className="space-y-2">
                  <Label>Chuyên khoa *</Label>
                  <Input value={newDoctor.specialization} onChange={e => setNewDoctor({...newDoctor, specialization: e.target.value})} placeholder="Cardiology" />
                </div>
                <div className="space-y-2">
                  <Label>Kinh nghiệm (năm)</Label>
                  <Input type="number" value={newDoctor.experience_years} onChange={e => setNewDoctor({...newDoctor, experience_years: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <Label>Phí tư vấn</Label>
                  <Input type="number" value={newDoctor.consultation_fee} onChange={e => setNewDoctor({...newDoctor, consultation_fee: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Giới thiệu (Bio)</Label>
                  <Textarea value={newDoctor.bio} onChange={e => setNewDoctor({...newDoctor, bio: e.target.value})} placeholder="Mô tả về bác sĩ..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAddDoctor(false)}>Hủy</Button>
                <Button onClick={handleCreateDoctor} disabled={registerDoctorMut.isPending}>
                  {registerDoctorMut.isPending ? "Đang xử lý..." : "Đăng ký Bác sĩ"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-1 mb-4 bg-muted/40 rounded-md p-1 w-fit">
        {[
          { value: "doctors" as Tab, label: `Bác sĩ (${doctorsData.length})`, badge: false },
          { value: "patients" as Tab, label: `Bệnh nhân (${patientsList.length})`, badge: false },
        ].map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
              tab === t.value ? "bg-card ring-1 ring-border" : "text-muted-foreground hover:bg-card"
            )}
          >
            {t.label}
            {t.badge && <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />}
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm..." className="pl-9 h-9 text-sm" />
      </div>

      <div className="card-elevated overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {tab === "doctors" && ["Bác sĩ", "Chuyên khoa", "Kinh nghiệm", "Bệnh nhân", "Đánh giá", "Trạng thái", "Thao tác"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}
              {tab === "patients" && ["Bệnh nhân", "Email", "SĐT", "Giới tính", "Ngày sinh", "Thao tác"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}

            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
            )}

            {/* Doctors tab */}
            {!isLoading && tab === "doctors" && doctorsList.map((d: any) => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <Avatar className="w-8 h-8 ring-2 ring-card">
                        <AvatarImage src={d.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.id}`} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{d.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card",
                        d.verifyStatus === "VERIFIED" ? "bg-success" : "bg-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{d.fullName}</p>
                      <p className="text-[14px] text-muted-foreground uppercase tracking-wider">{d.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-balance">{d.specialization}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{d.yearsOfExperience} năm</td>
                <td className="px-4 py-3 text-sm font-medium">{d.totalPatients || 0}</td>
                <td className="px-4 py-3 text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-warning text-warning" />
                    {typeof d.averageRating === 'number' ? d.averageRating.toFixed(1) : "0.0"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-[15px] font-bold px-2 py-0.5 rounded-full inline-block min-w-[80px] text-center",
                    d.verifyStatus === "VERIFIED" ? "bg-success/10 text-success border border-success/20" : 
                    d.verifyStatus === "PENDING" ? "bg-warning/10 text-warning border border-warning/20" : 
                    "bg-destructive/10 text-destructive border border-destructive/20"
                  )}>
                    {d.verifyStatus === "VERIFIED" ? "Đã duyệt" : d.verifyStatus === "PENDING" ? "Chờ duyệt" : "Từ chối"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end mr-4">
                    {d.verifyStatus === "PENDING" && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 text-xs text-success hover:bg-success/10 flex items-center gap-1"
                        onClick={() => verifyDoctorMut.mutate({ doctorId: d.id, status: "VERIFIED" })}
                        disabled={verifyDoctorMut.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Xác nhận
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => {}} className="w-8 h-8"><Edit className="w-4 h-4 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/5"
                      onClick={() => {
                        setUserToDelete(d.userId || d.id);
                        setConfirmDeleteOpen(true);
                      }}
                    ><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && tab === "doctors" && doctorsList.length === 0 && (
              <tr><td colSpan={7} className="text-center py-20 text-sm text-muted-foreground">Không tìm thấy bác sĩ nào</td></tr>
            )}

            {/* Patients tab */}
            {!isLoading && tab === "patients" && patientsList.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 text-balance">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-8 h-8 ring-2 ring-card">
                      <AvatarImage src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} />
                      <AvatarFallback className="text-xs bg-success/10 text-success">{p.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div><p className="text-sm font-semibold">{p.fullName}</p><p className="text-[14px] text-muted-foreground uppercase tracking-wider font-mono">{p.id.substring(0,8)}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.email}</td>
                <td className="px-4 py-3 text-sm font-medium">{p.phone || "—"}</td>
                <td className="px-4 py-3 text-sm">{p.gender === "MALE" ? "Nam" : p.gender === "FEMALE" ? "Nữ" : "Khác"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  <LocaleDate value={p.dateOfBirth} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end mr-4">
                    <Button variant="ghost" size="icon" onClick={() => {}} className="w-8 h-8"><Edit className="w-4 h-4 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/5"
                      onClick={() => {
                        setUserToDelete(p.userId || p.id);
                        setConfirmDeleteOpen(true);
                      }}
                    ><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && tab === "patients" && patientsList.length === 0 && (
              <tr><td colSpan={6} className="text-center py-20 text-sm text-muted-foreground">Chưa có bệnh nhân nào</td></tr>
            )}

          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={tab === "doctors" ? "Xóa bác sĩ" : "Xóa bệnh nhân"}
        description={
          tab === "doctors"
            ? "Bạn có chắc chắn muốn xóa bác sĩ này không? Tất cả dữ liệu liên quan sẽ bị xóa sạch."
            : "Bạn có chắc chắn muốn xóa bệnh nhân này không?"
        }
        variant="destructive"
        confirmText="Xác nhận xóa"
        isLoading={deleteMut.isPending}
        onConfirm={() => {
          if (userToDelete) {
            deleteMut.mutate(
              { userId: userToDelete },
              {
                onSuccess: () => {
                  setConfirmDeleteOpen(false);
                  setUserToDelete(null);
                },
              }
            );
          }
        }}
      />
    </DashboardLayout>
  );
}
