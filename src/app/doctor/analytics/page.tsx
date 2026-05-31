"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { chartData, mockAppointments } from "@/data/mock";
import dynamic from "next/dynamic";

const AreaChart: any = dynamic(() => import("recharts").then((mod) => mod.AreaChart as any), { ssr: false });
const Area: any = dynamic(() => import("recharts").then((mod) => mod.Area as any), { ssr: false });
const XAxis: any = dynamic(() => import("recharts").then((mod) => mod.XAxis as any), { ssr: false });
const YAxis: any = dynamic(() => import("recharts").then((mod) => mod.YAxis as any), { ssr: false });
const CartesianGrid: any = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid as any), { ssr: false });
const Tooltip: any = dynamic(() => import("recharts").then((mod) => mod.Tooltip as any), { ssr: false });
const ResponsiveContainer: any = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer as any), { ssr: false });
const BarChart: any = dynamic(() => import("recharts").then((mod) => mod.BarChart as any), { ssr: false });
const Bar: any = dynamic(() => import("recharts").then((mod) => mod.Bar as any), { ssr: false });
const PieChart: any = dynamic(() => import("recharts").then((mod) => mod.PieChart as any), { ssr: false });
const Pie: any = dynamic(() => import("recharts").then((mod) => mod.Pie as any), { ssr: false });
const Cell: any = dynamic(() => import("recharts").then((mod) => mod.Cell as any), { ssr: false });
const Legend: any = dynamic(() => import("recharts").then((mod) => mod.Legend as any), { ssr: false });
import { TrendingUp, Users, Calendar, Video, Star } from "lucide-react";

const satisfactionData = [
  { name: "Rất hài lòng", value: 58, color: "hsl(var(--success))" },
  { name: "Hài lòng", value: 28, color: "hsl(var(--info))" },
  { name: "Bình thường", value: 10, color: "hsl(var(--warning))" },
  { name: "Chưa hài lòng", value: 4, color: "hsl(var(--destructive))" },
];

export default function DoctorAnalytics() {
  const completedCount = mockAppointments.filter(a => a.status === "completed").length;
  const videoCount = mockAppointments.filter(a => a.type === "video").length;

  return (
    <DashboardLayout role="doctor" title="Thống kê">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Thống kê & Báo cáo</h1>
        <p className="text-sm text-muted-foreground mt-1">Tổng quan hiệu suất khám bệnh</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng ca tháng này", value: "89", change: "+12%", icon: Calendar, color: "text-primary" },
          { label: "Bệnh nhân mới", value: "37", change: "+8%", icon: Users, color: "text-success" },
          { label: "Video calls", value: "65", change: "+22%", icon: Video, color: "text-purple" },
          { label: "Đánh giá TB", value: "4.9 ⭐", change: "+0.1", icon: Star, color: "text-warning" },
        ].map(kpi => (
          <div key={kpi.label} className="card-elevated p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-success font-medium mt-1">
              <TrendingUp className="w-3 h-3 inline mr-0.5" />{kpi.change} vs tháng trước
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Patient growth */}
        <div className="card-elevated p-5">
          <h3 className="text-sm font-semibold mb-1">Tăng trưởng bệnh nhân</h3>
          <p className="text-xs text-muted-foreground mb-4">7 tháng gần nhất</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData.patientGrowth}>
              <defs>
                <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
              <Area type="monotone" dataKey="patients" stroke="hsl(var(--info))" strokeWidth={2} fill="url(#patientGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment by day */}
        <div className="card-elevated p-5">
          <h3 className="text-sm font-semibold mb-1">Lịch khám theo ngày</h3>
          <p className="text-xs text-muted-foreground mb-4">Tuần này</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData.appointmentsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
              <Bar dataKey="appointments" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Satisfaction */}
        <div className="card-elevated p-5">
          <h3 className="text-sm font-semibold mb-1">Mức độ hài lòng</h3>
          <p className="text-xs text-muted-foreground mb-4">Từ đánh giá bệnh nhân</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={satisfactionData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {satisfactionData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {satisfactionData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                  <span className="text-xs font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment types */}
        <div className="card-elevated p-5">
          <h3 className="text-sm font-semibold mb-1">Hình thức khám</h3>
          <p className="text-xs text-muted-foreground mb-4">Video vs Trực tiếp</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={chartData.appointmentTypes} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {chartData.appointmentTypes.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {chartData.appointmentTypes.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                  <span className="text-xs font-semibold">{item.value}%</span>
                </div>
              ))}
              <div className="mt-2 bg-muted/40 rounded-md p-3">
                <p className="text-xs text-muted-foreground">Tổng ca hoàn thành</p>
                <p className="text-xl font-bold text-primary">{completedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
