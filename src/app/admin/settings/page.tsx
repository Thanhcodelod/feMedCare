"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Shield, Users, Settings, Bell, Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/utils";
import { ChangePasswordDialog } from "@/components/shared/ChangePasswordDialog";

const roles = [
  { name: "Admin", permissions: ["Quản lý người dùng", "Xem báo cáo", "Cấu hình hệ thống", "Quản lý lịch khám"], color: "badge-destructive" },
  { name: "Doctor", permissions: ["Quản lý lịch khám của mình", "Xem hồ sơ bệnh nhân", "Video call", "Tạo đơn thuốc"], color: "badge-primary" },
  { name: "Patient", permissions: ["Đặt lịch khám", "Xem hồ sơ của mình", "Video call", "Chat với bác sĩ"], color: "badge-success" },
];

export default function AdminSettings() {
  return (
    <DashboardLayout role="admin" title="Cài đặt">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý vai trò, quyền hạn và cấu hình</p>
        </div>
        <ChangePasswordDialog />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* RBAC */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Phân quyền hệ thống (RBAC)</h3>
          </div>
          <div className="space-y-4">
            {roles.map(role => (
              <div key={role.name} className="bg-muted/40 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", role.color)}>{role.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => {}} className="h-7 text-xs">Chỉnh sửa</Button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {role.permissions.map(p => (
                    <div key={p} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />{p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System config */}
        <div className="space-y-4">
          <div className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-4"><Globe className="w-4 h-4 text-info" /><h3 className="text-sm font-semibold">Cấu hình chung</h3></div>
            <div className="space-y-3">
              {[
                { label: "Tên hệ thống", value: "MedCare Telemedicine" },
                { label: "URL Backend API", value: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888" },
                { label: "Múi giờ", value: "Asia/Ho_Chi_Minh (GMT+7)" },
              ].map(item => (
                <div key={item.label}>
                  <label className="text-xs text-muted-foreground mb-1 block">{item.label}</label>
                  <Input defaultValue={item.value} className="h-8 text-sm" />
                </div>
              ))}
              <Button size="sm" onClick={() => {}} className="mt-2">Lưu cấu hình</Button>
            </div>
          </div>

          <div className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-warning" /><h3 className="text-sm font-semibold">Thông báo hệ thống</h3></div>
            {[
              { label: "Gửi email xác nhận lịch", enabled: true },
              { label: "Nhắc nhở trước 24h", enabled: true },
              { label: "Thông báo hủy lịch", enabled: true },
              { label: "Báo cáo hàng tuần", enabled: false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <span className="text-sm">{item.label}</span>
                <div className={cn("w-10 h-5 rounded-full relative cursor-pointer transition-colors", item.enabled ? "bg-primary" : "bg-muted")}>
                  <div className={cn("w-4 h-4 bg-card rounded-full absolute top-0.5 transition-transform", item.enabled ? "translate-x-5" : "translate-x-0.5")} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
