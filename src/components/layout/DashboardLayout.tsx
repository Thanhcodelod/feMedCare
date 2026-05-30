"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { UserRole } from "@/data/mock";

interface DashboardLayoutProps {
  role: UserRole;
  children: React.ReactNode;
  title?: string;
}

let hasMountedOnce = false;

export function DashboardLayout(props: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(hasMountedOnce);
  useEffect(() => {
    hasMountedOnce = true;
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <DashboardShell {...props} />;
}

function DashboardShell({ role, children, title }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role={role}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuOpen={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-10 lg:py-8">
          <div className="max-w-[1320px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
