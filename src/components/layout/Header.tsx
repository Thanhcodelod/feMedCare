"use client";
import { useState, useEffect } from "react";
import { Search, Menu, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/redux/authStore";
import { useLogout } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMobileMenuOpen: () => void;
  title?: string;
}

const roleLabel: Record<string, string> = {
  DOCTOR: "Bác sĩ",
  PATIENT: "Bệnh nhân",
  ADMIN: "Quản trị viên",
};

export function Header({ onMobileMenuOpen, title }: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = mounted && user?.fullName ? user.fullName : "Người dùng";
  const initials = displayName.split(" ").pop()?.charAt(0) || "U";
  const roleText = mounted && user ? roleLabel[user.role] ?? user.role : "";

  return (
    <header className="h-14 bg-background/95 backdrop-blur-sm border-b border-border flex items-center gap-4 px-5 lg:px-8 sticky top-0 z-30">
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden -ml-1 p-2 hover:bg-muted transition-colors"
        aria-label="Mở menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {title && (
        <h2 className="text-sm font-semibold tracking-tight lg:hidden">{title}</h2>
      )}

      <div className="relative hidden md:flex flex-1 max-w-sm group">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Tìm bệnh nhân, lịch khám, hồ sơ…"
          className="pl-6 border-0 border-b border-transparent rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-foreground/40 h-9 text-sm placeholder:text-muted-foreground/70"
        />
      </div>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 cursor-pointer select-none -mr-1 px-2 py-1 hover:bg-muted transition-colors rounded-sm">
            <Avatar className="w-7 h-7 rounded-sm">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="rounded-sm text-2xs bg-primary text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold leading-tight">{displayName}</div>
              <div className="text-2xs text-muted-foreground uppercase tracking-wider mt-px">
                {roleText}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-md p-1">
          <div className="px-2 py-2">
            <p className="text-sm font-semibold leading-tight">{displayName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer rounded-sm text-sm"
            onClick={() => logout.mutate()}
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
