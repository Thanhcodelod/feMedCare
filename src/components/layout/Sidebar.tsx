"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  BarChart3,
  Settings,
  Video,
  LogOut,
  ChevronLeft,
  X,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { UserRole } from "@/data/mock";
import { useLogout } from "@/hooks/useAuth";

interface SidebarProps {
  role: UserRole;
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const doctorNav = [
  { label: "Tổng quan", icon: LayoutDashboard, to: "/doctor" },
  { label: "Lịch khám", icon: Calendar, to: "/doctor/appointments" },
  { label: "Bệnh nhân", icon: Users, to: "/doctor/patients" },
  { label: "Hồ sơ bệnh án", icon: FileText, to: "/doctor/records" },
  { label: "Telemedicine", icon: Video, to: "/doctor/telemedicine" },
  { label: "Thống kê", icon: BarChart3, to: "/doctor/analytics" },
  { label: "Lịch nghỉ phép", icon: Calendar, to: "/doctor/leaves" },
];

const patientNav = [
  { label: "Tổng quan", icon: LayoutDashboard, to: "/patient" },
  { label: "Đặt lịch khám", icon: Calendar, to: "/patient/book" },
  { label: "Lịch của tôi", icon: FileText, to: "/patient/appointments" },
  { label: "Hồ sơ y tế", icon: FileText, to: "/patient/records" },
  { label: "Tư vấn video", icon: Video, to: "/patient/telemedicine" },
];

const adminNav = [
  { label: "Tổng quan", icon: LayoutDashboard, to: "/admin" },
  { label: "Người dùng", icon: Users, to: "/admin/users" },
  { label: "Lịch khám", icon: Calendar, to: "/admin/appointments" },
  { label: "Duyệt đơn nghỉ", icon: FileText, to: "/admin/leaves" },
  { label: "Thống kê", icon: BarChart3, to: "/admin/analytics" },
  { label: "Cài đặt", icon: Settings, to: "/admin/settings" },
];

const nurseNav = [
  { label: "Hàng đợi hôm nay", icon: ClipboardList, to: "/nurse/queue" },
];

const navMap: Record<UserRole, typeof doctorNav> = {
  doctor: doctorNav,
  patient: patientNav,
  admin: adminNav,
  nurse: nurseNav,
};

const roleLabel: Record<UserRole, string> = {
  doctor: "Doctor Portal",
  patient: "Patient Portal",
  admin: "Admin Console",
  nurse: "Reception Desk",
};

export function Sidebar({
  role,
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const location = { pathname: usePathname() };
  const nav = navMap[role];
  const logout = useLogout();

  const isActive = (to: string) => {
    if (
      to === `/doctor` ||
      to === `/patient` ||
      to === `/admin` ||
      to === `/nurse`
    ) {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand block — square mark + role label in small caps */}
      <div
        className={cn(
          "flex items-center gap-3 px-5 h-14 border-b border-sidebar-border",
          collapsed && "justify-center px-0",
        )}
      >
        <img src="/medcare-logo.png" alt="MedCare" className="h-12 w-auto flex-shrink-0 object-contain" />
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-2xs text-muted-foreground uppercase tracking-[0.1em]">
              {roleLabel[role]}
            </div>
          </div>
        )}
      </div>

      {/* Nav — section caps separating workflow vs. tooling */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
        
        {nav.map((item) => (
          <Link
            key={item.to}
            href={item.to}
            prefetch={false}
            onClick={onMobileClose}
            className={cn(
              "sidebar-link group",
              isActive(item.to) && "sidebar-link-active",
              collapsed && "justify-center px-0",
            )}
          >
            <item.icon
              className={cn(
                "w-4 h-4 flex-shrink-0 transition-colors",
                isActive(item.to)
                  ? "text-sidebar-primary"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
              strokeWidth={1.75}
            />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer — collapse + logout. Settings folded in for less visual noise. */}
      <div className="px-3 pb-4 pt-3 border-t border-sidebar-border space-y-0.5">
        {!collapsed && (
          <div className="section-title px-3 mb-2">Tài khoản</div>
        )}
        <Link
          href={`/${role}/settings`}
          prefetch={false}
          onClick={onMobileClose}
          className={cn("sidebar-link group", collapsed && "justify-center px-0")}
        >
          <Settings
            className="w-4 h-4 flex-shrink-0 text-muted-foreground group-hover:text-foreground"
            strokeWidth={1.75}
          />
          {!collapsed && <span>Cài đặt</span>}
        </Link>
        <button
          onClick={() => {
            onMobileClose();
            logout.mutate();
          }}
          className={cn(
            "sidebar-link group w-full text-left",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut
            className="w-4 h-4 flex-shrink-0 text-muted-foreground group-hover:text-destructive"
            strokeWidth={1.75}
          />
          {!collapsed && (
            <span className="group-hover:text-destructive">Đăng xuất</span>
          )}
        </button>
        <button
          onClick={() => onCollapse(!collapsed)}
          className={cn(
            "sidebar-link w-full hidden lg:flex mt-1 opacity-50 hover:opacity-100",
            collapsed && "justify-center px-0",
          )}
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          <ChevronLeft
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground transition-transform",
              collapsed && "rotate-180",
            )}
            strokeWidth={2}
          />
          {!collapsed && <span className="text-xs">Thu gọn</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — narrower than typical SaaS, tighter density */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-[width] duration-150 flex-shrink-0",
          collapsed ? "w-[60px]" : "w-[220px]",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={onMobileClose} />
          <aside className="relative w-[240px] bg-sidebar border-r border-sidebar-border animate-slide-in-left flex flex-col">
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
