"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/redux/authStore";
import {
  useProfile,
  useUpdateProfile,
  useUpdatePatientDetails,
} from "@/hooks/useUser";
import { EMERGENCY_CONTACT_LIMITS } from "@/types/api";
import {
  User,
  Droplets,
  ShieldCheck,
  History,
  Activity,
  Save,
  PlusCircle,
  AlertCircle,
  Loader2,
  Scale,
  CreditCard,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangePasswordDialog } from "@/components/shared/ChangePasswordDialog";

const HealthMetricsCharts = dynamic(
  () =>
    import("@/components/patient/HealthMetricsCharts").then(
      (m) => m.HealthMetricsCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodType: z.string().optional(),
  address: z.string().optional(),
});

const emergencyContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ tên")
    .max(EMERGENCY_CONTACT_LIMITS.name, `Tối đa ${EMERGENCY_CONTACT_LIMITS.name} ký tự`),
  phone: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại")
    .max(EMERGENCY_CONTACT_LIMITS.phone, `Tối đa ${EMERGENCY_CONTACT_LIMITS.phone} ký tự`),
  relationship: z
    .string()
    .trim()
    .max(EMERGENCY_CONTACT_LIMITS.relationship, `Tối đa ${EMERGENCY_CONTACT_LIMITS.relationship} ký tự`)
    .optional()
    .or(z.literal("")),
});

export default function PatientSettings() {
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const updateProfile = useUpdateProfile();
  const updatePatientDetails = useUpdatePatientDetails();
  const [activeTab, setActiveTab] = useState("profile");

  const emergencyForm = useForm<z.infer<typeof emergencyContactSchema>>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: { name: "", phone: "", relationship: "" },
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dateOfBirth: (user as any)?.dateOfBirth || "",
      gender: (user as any)?.gender || "Male",
      bloodType: (user as any)?.bloodType || "O+",
    },
  });

  useEffect(() => {
    const data = profile || user;
    if (data) {
      form.reset({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        dateOfBirth: (data as any).dateOfBirth?.split('T')[0] || "",
        gender: (data as any).gender || "Male",
        bloodType: (data as any).bloodType || "O+",
      });
    }
  }, [profile, user, form]);

  useEffect(() => {
    const ec = profile?.emergencyContact;
    if (!ec) return;
    emergencyForm.reset({
      name: ec.name || "",
      phone: ec.phone || "",
      relationship: ec.relationship || "",
    });
  }, [profile?.id, profile?.emergencyContact, emergencyForm]);

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (!user?.id) return;
    updateProfile.mutate({ userId: user.id, payload: values });
  };

  const onSubmitEmergency = (values: z.infer<typeof emergencyContactSchema>) => {
    const { name, phone, relationship } = values;
    updatePatientDetails.mutate({
      emergency_contact: {
        name,
        phone,
        ...(relationship ? { relationship } : {}),
      },
    });
  };

  if (loadingProfile) {
    return (
      <DashboardLayout role="patient" title="Hồ sơ cá nhân">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="patient" title="Hồ sơ & Sức khỏe">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">Hồ sơ sức khỏe</h1>
          <p className="text-muted-foreground mt-1">Nơi quản lý dữ liệu y tế cá nhân và các chỉ số sinh học của bạn.</p>
        </div>
        <div className="flex gap-2 items-center">
           <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1.5 rounded-full text-sm">
             <ShieldCheck className="w-4 h-4 mr-2" /> Bảo mật 2 lớp: Đã kích hoạt
           </Badge>
           <ChangePasswordDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Bio Card */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <Card className="border border-border overflow-hidden bg-card">
            <CardContent className="pt-8 text-center">
              <div className="relative inline-block group mb-6">
                <Avatar className="w-32 h-32 ring-1 ring-border">
                  <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} />
                  <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                    {user?.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <span className="text-white text-xs font-bold">Thay đổi</span>
                </div>
              </div>
              <h3 className="font-bold text-xl mb-1">{user?.fullName}</h3>
              <p className="text-xs text-muted-foreground font-mono mb-4 uppercase tracking-widest">PATIENT ID: {user?.id?.slice(-8).toUpperCase()}</p>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-3 bg-card rounded-md border border-border text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-[14px] text-muted-foreground uppercase font-bold">Nhóm máu</span>
                  </div>
                  <span className="text-sm font-bold">{profile?.bloodType || "O+"}</span>
                </div>
                <div className="p-3 bg-card rounded-md border border-border text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="w-3.5 h-3.5 text-info" />
                    <span className="text-[14px] text-muted-foreground uppercase font-bold">BMI</span>
                  </div>
                  <span className="text-sm font-bold">22.5 (Bình thường)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Mục tiêu sức khỏe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Giảm cân</span>
                  <span className="font-bold">69.0 / 68kg</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[85%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Uống nước (Lít/ngày)</span>
                  <span className="font-bold">1.5 / 2.0L</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="bg-info h-full w-[75%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs Area */}
        <div className="lg:col-span-8 xl:col-span-9">
          <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-muted/30 p-1 rounded-md h-14 mb-8">
              <TabsTrigger value="profile" className="px-8 h-12 data-[state=active]:bg-card">
                <User className="w-4 h-4 mr-2" /> Hồ sơ cá nhân
              </TabsTrigger>
              <TabsTrigger value="health" className="px-8 h-12 data-[state=active]:bg-card">
                <Activity className="w-4 h-4 mr-2" /> Chỉ số sức khỏe
              </TabsTrigger>
              <TabsTrigger value="history" className="px-8 h-12 data-[state=active]:bg-card">
                <History className="w-4 h-4 mr-2" /> Tiền sử y khoa
              </TabsTrigger>
              <TabsTrigger value="insurance" className="px-8 h-12 data-[state=active]:bg-card">
                <CreditCard className="w-4 h-4 mr-2" /> Bảo hiểm
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 animate-in fade-in duration-150">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Thông tin định danh</CardTitle>
                  <CardDescription>Cập nhật thông tin liên hệ và định danh chính xác để thuận tiện cho việc đặt lịch.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Họ và tên</FormLabel>
                              <FormControl>
                                <Input placeholder="Nguyễn Văn A" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="email@example.com" {...field} disabled className="bg-muted/30" />
                              </FormControl>
                              <FormDescription>Email không thể thay đổi</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số điện thoại</FormLabel>
                              <FormControl>
                                <Input placeholder="09xx xxx xxx" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ngày sinh</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Giới tính</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn giới tính" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Male">Nam</SelectItem>
                                  <SelectItem value="Female">Nữ</SelectItem>
                                  <SelectItem value="Other">Khác</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bloodType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nhóm máu</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn nhóm máu" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="A+">A+</SelectItem>
                                  <SelectItem value="A-">A-</SelectItem>
                                  <SelectItem value="B+">B+</SelectItem>
                                  <SelectItem value="B-">B-</SelectItem>
                                  <SelectItem value="O+">O+</SelectItem>
                                  <SelectItem value="O-">O-</SelectItem>
                                  <SelectItem value="AB+">AB+</SelectItem>
                                  <SelectItem value="AB-">AB-</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end pt-4 border-t border-border/50">
                        <Button type="submit" className="px-12 h-11" disabled={updateProfile.isPending}>
                          {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                          Lưu hồ sơ
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    Liên hệ khẩn cấp
                  </CardTitle>
                  <CardDescription>
                    Người sẽ được thông báo khi bạn gặp tình huống cấp cứu. Bắt buộc có tên và số điện thoại.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...emergencyForm}>
                    <form
                      onSubmit={emergencyForm.handleSubmit(onSubmitEmergency)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={emergencyForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Họ và tên</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nguyễn Văn B"
                                  maxLength={EMERGENCY_CONTACT_LIMITS.name}
                                  className="rounded-md"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={emergencyForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số điện thoại</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="09xx xxx xxx"
                                  inputMode="tel"
                                  maxLength={EMERGENCY_CONTACT_LIMITS.phone}
                                  className="rounded-md"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={emergencyForm.control}
                          name="relationship"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mối quan hệ (tuỳ chọn)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Vd: Bố, Mẹ, Anh/Chị..."
                                  maxLength={EMERGENCY_CONTACT_LIMITS.relationship}
                                  className="rounded-md"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end pt-4 border-t border-border/50">
                        <Button
                          type="submit"
                          className="px-12 h-11"
                          disabled={updatePatientDetails.isPending}
                        >
                          {updatePatientDetails.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Lưu liên hệ khẩn cấp
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Metrics Tab — charts chunk only fetched when opened */}
            <TabsContent value="health">
              {activeTab === "health" && <HealthMetricsCharts />}
            </TabsContent>

            {/* Medical History Tab */}
            <TabsContent value="history" className="animate-in fade-in duration-150">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Lịch sử bệnh lý & Phẫu thuật</CardTitle>
                  <CardDescription>Ghi lại các sự kiện y khoa quan trọng để bác sĩ có cái nhìn tổng quát khi khám bệnh.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="relative border-l-2 border-primary/20 ml-4 py-4 space-y-12">
                      <div className="relative pl-10">
                         <div className="absolute left-[-11px] top-1 w-5 h-5 rounded-full bg-primary ring-4 ring-primary/10" />
                         <div className="flex flex-col gap-1">
                            <span className="text-[14px] font-bold text-primary uppercase tracking-wider">Tháng 08 / 2023</span>
                            <h4 className="font-bold text-lg">Phẫu thuật mổ ruột thừa</h4>
                            <p className="text-sm text-muted-foreground max-w-2xl">Thực hiện tại Bệnh viện Đa khoa thành phố. Kỹ thuật nội soi, hồi phục nhanh sau 10 ngày.</p>
                            <div className="flex gap-2 mt-2">
                               <Badge variant="outline" className="text-[14px] rounded-lg">Cấp cứu</Badge>
                               <Badge variant="outline" className="text-[14px] rounded-lg">Hậu phẫu</Badge>
                            </div>
                         </div>
                      </div>
                      <div className="relative pl-10">
                         <div className="absolute left-[-11px] top-1 w-5 h-5 rounded-full bg-primary/40 ring-4 ring-primary/5" />
                         <div className="flex flex-col gap-1">
                            <span className="text-[14px] font-bold text-muted-foreground uppercase tracking-wider">Năm 2021</span>
                            <h4 className="font-bold text-lg">Điều trị sốt xuất huyết</h4>
                            <p className="text-sm text-muted-foreground max-w-2xl">Điều trị nội trú 7 ngày tại trung tâm y tế quận. Không để lại di chứng.</p>
                         </div>
                      </div>
                   </div>
                   <Button variant="outline" className="w-full mt-12 rounded-md border-dashed h-12 gap-2">
                     <PlusCircle className="w-5 h-5" /> Thêm sự kiện y khoa mới
                   </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insurance Tab */}
            <TabsContent value="insurance" className="animate-in fade-in duration-150">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative group">
                     {/* The Insurance Card UI */}
                     <div className="aspect-[1.586/1] w-full bg-primary rounded-md p-8 text-white overflow-hidden relative">                        <div className="flex justify-between items-start relative mb-12">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                                 <ShieldCheck className="w-6 h-6" />
                              </div>
                              <span className="font-bold text-lg tracking-tight">MedCare Premium</span>
                           </div>
                           <span className="text-xs opacity-80 font-bold uppercase tracking-widest">Health Insurance</span>
                        </div>
                        <div className="relative space-y-2">
                           <span className="text-xs opacity-60 font-medium uppercase tracking-widest">Card Holder</span>
                           <h4 className="text-2xl font-bold tracking-tight uppercase">{user?.fullName}</h4>
                        </div>
                        <div className="flex justify-between items-end mt-12 relative">
                           <div className="space-y-1">
                              <span className="text-[14px] opacity-60 uppercase font-bold tracking-widest">Card Number</span>
                              <p className="text-xl font-mono tracking-widest">8010 •••• •••• 1234</p>
                           </div>
                           <div className="text-right space-y-1">
                              <span className="text-[14px] opacity-60 uppercase font-bold tracking-widest">Expires</span>
                              <p className="text-sm font-bold">12 / 2025</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <Card className="border border-border">
                        <CardHeader>
                           <CardTitle className="text-lg">Chi tiết bảo hiểm</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex justify-between py-3 border-b border-border/50">
                              <span className="text-sm text-muted-foreground">Nhà cung cấp</span>
                              <span className="text-sm font-bold">Bảo Việt Insurance</span>
                           </div>
                           <div className="flex justify-between py-3 border-b border-border/50">
                              <span className="text-sm text-muted-foreground">Loại hợp đồng</span>
                              <span className="text-sm font-bold">Khám sức khỏe toàn diện</span>
                           </div>
                           <div className="flex justify-between py-3 border-b border-border/50">
                              <span className="text-sm text-muted-foreground">Tình trạng</span>
                              <Badge className="bg-success/20 text-success border-none shadow-none">Đang kích hoạt</Badge>
                           </div>
                        </CardContent>
                     </Card>
                     <Button variant="outline" className="w-full rounded-md h-12 gap-2">
                        <PlusCircle className="w-5 h-5" /> Cập nhật thẻ mới
                     </Button>
                  </div>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
