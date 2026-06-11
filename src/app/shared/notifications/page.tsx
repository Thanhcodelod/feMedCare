"use client";
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Bell, 
  CheckCircle, 
  Calendar, 
  MessageSquare, 
  AlertCircle, 
  Info,
  Clock,
  Video,
  ChevronRight,
  MoreVertical,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/redux/authStore";
import { cn } from "@/utils/utils";

const mockNotifications = [
  {
    id: "1",
    title: "Lịch khám đã được xác nhận",
    body: "Bác sĩ Lê Mạnh Hùng đã xác nhận lịch khám của bạn vào 09:00 ngày 20/04/2026.",
    type: "SUCCESS",
    timestamp: "10 phút trước",
    read: false,
    icon: Calendar
  },
  {
    id: "2",
    title: "Yêu cầu SOS mới",
    body: "Có bệnh nhân đang yêu cầu SOS khẩn cấp trong khu vực của bạn.",
    type: "DANGER",
    timestamp: "1 giờ trước",
    read: true,
    icon: AlertCircle
  },
  {
    id: "3",
    title: "Nhắc nhở cuộc gọi video",
    body: "Cuộc hẹn video của bạn sẽ bắt đầu sau 15 phút nữa. Hãy chuẩn bị sẵn sàng.",
    type: "INFO",
    timestamp: "4 giờ trước",
    read: true,
    icon: Video
  },
  {
     id: "4",
     title: "Tin nhắn mới từ bác sĩ",
     body: "Bác sĩ đã gửi cho bạn hướng dẫn sử dụng thuốc mới trong hồ sơ.",
     type: "PRIMARY",
     timestamp: "Hôm qua",
     read: true,
     icon: MessageSquare
  }
];

export default function NotificationsPage() {
  const user = useAuthStore(s => s.user);
  const role = user?.role?.toLowerCase() || "patient";
  const [notifications, setNotifications] = React.useState(mockNotifications);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <DashboardLayout role={role as any} title="Thông báo">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Thông báo <Badge className="bg-primary">{notifications.filter(n => !n.read).length}</Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Quản lý các cập nhật và thông báo từ hệ thống</p>
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" size="sm" onClick={markAllRead} className="text-primary hover:bg-primary/5 text-xs font-bold">
               Đánh dấu tất cả đã đọc
             </Button>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className={cn(
                "group relative card-elevated p-4 flex gap-4 items-start transition-all hover:border-primary/20 cursor-pointer",
                !n.read && "border-l-4 border-l-primary bg-primary/5"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                n.type === "SUCCESS" ? "bg-success/10 text-success" :
                n.type === "DANGER" ? "bg-destructive/10 text-destructive" :
                n.type === "PRIMARY" ? "bg-primary/10 text-primary" :
                "bg-info/10 text-info"
              )}>
                <n.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={cn("text-sm font-bold truncate", !n.read ? "text-foreground" : "text-muted-foreground")}>
                    {n.title}
                  </h4>
                  <span className="text-[14px] text-muted-foreground uppercase font-bold tracking-tight">{n.timestamp}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {n.body}
                </p>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                 <Button variant="ghost" size="icon" onClick={() => deleteNotif(n.id)} className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive">
                   <Trash2 className="w-4 h-4" />
                 </Button>
                 <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
               <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-muted-foreground font-medium">Bạn không có thông báo nào</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
           <Button variant="ghost" className="text-xs text-muted-foreground rounded-full">
             Tải thêm thông báo cũ hơn
           </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
