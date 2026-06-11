"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/redux/authStore";
import { useProfile, useUpdateProfile } from "@/hooks/useUser";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Save, 
  Loader2,
  Stethoscope,
  Briefcase,
  GraduationCap,
  DollarSign,
  Star,
  FileText,
  BadgeCheck,
  ChevronRight,
  AlertCircle,
  Laptop
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
  FormDescription
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordDialog } from "@/components/shared/ChangePasswordDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const doctorProfileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  specialization: z.string().min(2, "Chuyên khoa không được để trống"),
  yearsOfExperience: z.number().min(0, "Số năm kinh nghiệm không thể âm"),
  licenseNumber: z.string().optional(),
  consultation_fee: z.string().optional(),
  bio: z.string().optional(),
});

export default function DoctorSettings() {
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [activeTab, setActiveTab] = useState("profile");

  const form = useForm<z.infer<typeof doctorProfileSchema>>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      specialization: user?.specialization || "",
      yearsOfExperience: user?.yearsOfExperience || 0,
      licenseNumber: user?.licenseNumber || "",
      consultation_fee: user?.consultation_fee?.toString() || "0",
      bio: user?.bio || "",
    },
  });

  useEffect(() => {
    const data = profile || user;
    if (data) {
      form.reset({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        specialization: (data as any).specialization || "",
        yearsOfExperience: (data as any).yearsOfExperience || 0,
        licenseNumber: (data as any).licenseNumber || "",
        consultation_fee: (data as any).consultation_fee?.toString() || "0",
        bio: (data as any).bio || "",
      });
    }
  }, [profile, user, form]);

  const onSubmit = (values: z.infer<typeof doctorProfileSchema>) => {
    if (!user?.id) return;
    updateProfile.mutate({ userId: user.id, payload: values });
  };

  if (loadingProfile) {
    return (
      <DashboardLayout role="doctor" title="Cài đặt">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor" title="Hồ sơ chuyên môn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">Hồ sơ bác sĩ</h1>
          <p className="text-muted-foreground mt-1">Quản lý danh tiếng và thông tin chuyên môn của bạn.</p>
        </div>
        <div className="flex gap-2 items-center">
           <Badge variant="outline" className="bg-success/5 text-success border-success/20 px-4 py-1.5 rounded-full text-sm">
             <BadgeCheck className="w-4 h-4 mr-2" /> Trạng thái: Đã xác minh bằng cấp
           </Badge>
           <ChangePasswordDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Info Card */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <Card className="border border-border bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="pt-8 text-center pb-8">
              <Avatar className="w-32 h-32 ring-1 ring-border mx-auto mb-6">
                <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} />
                <AvatarFallback className="text-3xl font-bold bg-card text-white">
                  {user?.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-xl mb-1">{user?.fullName}</h3>
              <p className="text-xs opacity-70 mb-6 uppercase tracking-widest">{profile?.specialization || "Chưa cập nhật chuyên khoa"}</p>
              
              <div className="flex justify-center gap-6 border-t border-white/10 pt-6">
                <div className="text-center">
                  <p className="text-xl font-bold">{profile?.averageRating || 5.0}</p>
                  <p className="text-[14px] opacity-70 uppercase font-bold tracking-tight">Đánh giá</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{profile?.totalPatients || 0}</p>
                  <p className="text-[14px] opacity-70 uppercase font-bold tracking-tight">Bệnh nhân</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{profile?.yearsOfExperience || 0}</p>
                  <p className="text-[14px] opacity-70 uppercase font-bold tracking-tight">Kinh nghiệm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Star className="w-4 h-4 text-warning" /> Huy hiệu & Thành tích
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-warning/10 flex items-center justify-center text-warning">
                     <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">Bác sĩ ưu tú 2024</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                     <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">15+ Công trình nghiên cứu</span>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Areas */}
        <div className="lg:col-span-8 xl:col-span-9">
          <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
             <TabsList className="w-full justify-start bg-muted/30 p-1 rounded-md h-14 mb-8">
              <TabsTrigger value="profile" className="px-8 h-12 data-[state=active]:bg-card">
                <User className="w-4 h-4 mr-2" /> Thông tin chuyên môn
              </TabsTrigger>
              <TabsTrigger value="bio" className="px-8 h-12 data-[state=active]:bg-card">
                <FileText className="w-4 h-4 mr-2" /> Giới thiệu (Bio)
              </TabsTrigger>
              <TabsTrigger value="security" className="px-8 h-12 data-[state=active]:bg-card">
                <ShieldCheck className="w-4 h-4 mr-2" /> Bảo mật
              </TabsTrigger>
            </TabsList>

            {/* Professional Info Tab */}
            <TabsContent value="profile" className="space-y-6 animate-in fade-in duration-150">
               <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card className="border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
                        <CardDescription>Thông tin hiển thị trên trang đặt lịch và tìm kiếm bác sĩ.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Họ và tên</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                              <FormLabel>Email chuyên môn</FormLabel>
                              <FormControl>
                                <Input {...field} disabled className="bg-muted/30" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số điện thoại liên hệ</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="licenseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số chứng chỉ hành nghề</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>Dùng để xác thực chuyên môn trên hệ thống.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Card className="border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Kinh nghiệm & Phí khám</CardTitle>
                        <CardDescription>Các thông số này ảnh hưởng đến việc phân phối lịch hẹn.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="specialization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chuyên khoa chính</FormLabel>
                              <FormControl>
                                <Input placeholder="VD: Tim mạch, Nội tiết..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="yearsOfExperience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số năm kinh nghiệm</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="consultation_fee"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Phí khám tư vấn (VNĐ)
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input {...field} placeholder="VD: 200000" className="pl-10 h-12 text-lg font-bold text-primary" />
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₫</span>
                                </div>
                              </FormControl>
                              <FormDescription>Lưu ý: Phí này đã bao gồm VAT và phí dịch vụ sàn.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="px-12 h-12 font-bold" disabled={updateProfile.isPending}>
                          {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                          Cập nhật hồ sơ bác sĩ
                        </Button>
                      </div>
                  </form>
               </Form>
            </TabsContent>

            {/* Bio Tab */}
            <TabsContent value="bio" className="animate-in fade-in duration-150">
               <Card className="border border-border">
                  <CardHeader>
                    <CardTitle>Tiểu sử bác sĩ</CardTitle>
                    <CardDescription>Viết một đoạn giới thiệu ngắn gọn về kinh nghiệm, bằng cấp và triết lý chữa bệnh của bạn.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Hãy mô tả hành trình chuyên môn của bạn..." 
                                className="min-h-[300px] rounded-md p-6 text-base leading-relaxed" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="p-4 bg-muted/30 rounded-md flex items-start gap-3">
                         <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                         <p className="text-xs text-muted-foreground">Tip: Một tiểu sử chi tiết và tâm huyết sẽ tăng tỷ lệ bệnh nhân lựa chọn bạn lên đến 40%.</p>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button onClick={form.handleSubmit(onSubmit)} className="px-12 h-12" disabled={updateProfile.isPending}>
                          Lưu giới thiệu
                        </Button>
                      </div>
                  </CardContent>
               </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-primary" /> Mật khẩu & Đăng nhập
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                       <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Mật khẩu</span>
                       <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 text-xs">Thay đổi</Button>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                       <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Xác thực 2 lớp</span>
                       <Badge variant="secondary" className="bg-success/10 text-success border-none">Bật</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                       <Briefcase className="w-4 h-4 text-info" /> Thiết bị đăng nhập
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/30 p-3 rounded-md flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center"><Laptop className="w-4 h-4 text-muted-foreground" /></div>
                          <div>
                             <p className="text-xs font-bold">MacBook Pro M2</p>
                             <p className="text-[14px] text-muted-foreground">Hà Nội, Việt Nam · Đang online</p>
                          </div>
                       </div>
                       <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-destructive">Đăng xuất tất cả thiết bị khác</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
