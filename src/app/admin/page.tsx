"use client";
import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { chartData } from "@/data/mock";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/utils";
import { useAdminAnalytics, useAdminDoctors, useAdminPatients, usePendingDoctors } from "@/hooks/useAdmin";

const AreaChart: any = dynamic(() => import("recharts").then((mod) => mod.AreaChart as any), { ssr: false });
const Area: any = dynamic(() => import("recharts").then((mod) => mod.Area as any), { ssr: false });
const XAxis: any = dynamic(() => import("recharts").then((mod) => mod.XAxis as any), { ssr: false });
const YAxis: any = dynamic(() => import("recharts").then((mod) => mod.YAxis as any), { ssr: false });
const CartesianGrid: any = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid as any), { ssr: false });
const Tooltip: any = dynamic(() => import("recharts").then((mod) => mod.Tooltip as any), { ssr: false });
const ResponsiveContainer: any = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer as any), { ssr: false });
const BarChart: any = dynamic(() => import("recharts").then((mod) => mod.BarChart as any), { ssr: false });
const Bar: any = dynamic(() => import("recharts").then((mod) => mod.Bar as any), { ssr: false });

export default function AdminDashboard() {
  const navigate = useRouter();
  const { data: analytics, isLoading } = useAdminAnalytics();
  const { data: doctors } = useAdminDoctors();
  const { data: patients } = useAdminPatients();
  const { data: pending } = usePendingDoctors();

  const totalPatients = patients?.length ?? 0;
  const totalDoctors = doctors?.length ?? 0;
  const totalAppointments = analytics?.totalAppointments ?? 0;
  const totalRevenue = analytics?.totalRevenue ?? 0;
  const pendingCount = pending?.length ?? 0;

  const metrics = [
    { value: totalPatients, label: "Bệnh nhân", suffix: "" },
    { value: totalDoctors, label: "Bác sĩ", suffix: "" },
    { value: totalAppointments, label: "Lịch khám", suffix: "" },
    {
      value: totalRevenue ? (totalRevenue / 1_000_000).toFixed(0) : 0,
      label: "Doanh thu",
      suffix: "M ₫",
    },
  ];

  const consoleLinks = [
    { label: "Người dùng", desc: "Quản lý bác sĩ & bệnh nhân", icon: Users, to: "/admin/users" },
    { label: "Lịch khám", desc: "Toàn bộ lịch hẹn hệ thống", icon: Calendar, to: "/admin/appointments" },
    { label: "Duyệt đơn nghỉ", desc: "Phê duyệt nghỉ phép bác sĩ", icon: FileText, to: "/admin/leaves" },
    { label: "Thống kê", desc: "Phân tích chuyên sâu", icon: BarChart3, to: "/admin/analytics" },
    { label: "Cài đặt", desc: "Cấu hình hệ thống", icon: Settings, to: "/admin/settings" },
  ];

  return (
    <DashboardLayout role="admin" title="Bảng điều hành">
      <header className="mb-6">
        <h1 className="text-3xl">Bảng điều hành</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Tổng quan vận hành toàn hệ thống MedCare.
        </p>
      </header>

      {/* Metric strip */}
      <div className="border-y border-border grid grid-cols-2 sm:grid-cols-4 mb-8">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={cn(
              "py-4 px-1 sm:px-4",
              i > 0 && "sm:border-l border-border",
              i >= 2 && "border-t sm:border-t-0 border-border",
            )}
          >
            <div className="font-display text-3xl tabular-nums leading-none">
              {isLoading ? "—" : m.value}
              {!isLoading && m.suffix && (
                <span className="text-lg text-muted-foreground"> {m.suffix}</span>
              )}
            </div>
            <div className="section-title mt-2">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Pending approval — operational alert */}
      {pendingCount > 0 && (
        <button
          onClick={() => navigate.push("/admin/users")}
          className="w-full mb-8 border border-warning/40 bg-warning/[0.06] rounded-md px-4 py-3 flex items-center gap-3 text-left hover:bg-warning/[0.1] transition-colors"
        >
          <span className="font-mono tabular-nums text-lg text-warning font-semibold">
            {pendingCount}
          </span>
          <span className="text-sm text-warning-foreground flex-1">
            bác sĩ đang chờ duyệt hồ sơ — cần xử lý.
          </span>
          <ChevronRight className="w-4 h-4 text-warning" />
        </button>
      )}

      {/* Command-center split: chart anchor + console nav */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-x-10 gap-y-8 items-start">
        <section className="space-y-8 min-w-0">
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-tight">
                Doanh thu theo tháng
              </h2>
              <span className="text-xs text-muted-foreground">7 tháng gần nhất</span>
            </div>
            <div className="card-elevated p-4">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData.revenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(32,60%,42%)" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="hsl(32,60%,42%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(200,12%,42%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(200,12%,42%)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000000}M`} />
                  <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} formatter={(v: number) => [`${(v / 1000000).toFixed(0)}M ₫`]} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(32,60%,42%)" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-tight">
                Tăng trưởng bệnh nhân
              </h2>
              <span className="text-xs text-muted-foreground">7 tháng gần nhất</span>
            </div>
            <div className="card-elevated p-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData.patientGrowth}>
                  <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(200,12%,42%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(200,12%,42%)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="patients" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Console nav rail */}
        <aside className="lg:sticky lg:top-4">
          <div className="section-title mb-2">Quản trị</div>
          <nav className="border border-border rounded-md overflow-hidden">
            {consoleLinks.map((item) => (
              <button
                key={item.to}
                onClick={() => navigate.push(item.to)}
                className="data-row group w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <item.icon
                  className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                  strokeWidth={1.75}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-tight">{item.label}</span>
                  <span className="block text-2xs text-muted-foreground mt-0.5 truncate">
                    {item.desc}
                  </span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground" />
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </DashboardLayout>
  );
}
