"use client";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Activity, 
  UserCheck, 
  Video, 
  Loader2, 
  Clock,
  ChevronRight,
  Download,
  Filter,
  Database
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/shared/StatsCard";
import { chartData } from "@/data/mock";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AreaChart: any = dynamic(() => import("recharts").then((mod) => mod.AreaChart as any), { ssr: false });
const Area: any = dynamic(() => import("recharts").then((mod) => mod.Area as any), { ssr: false });
const XAxis: any = dynamic(() => import("recharts").then((mod) => mod.XAxis as any), { ssr: false });
const YAxis: any = dynamic(() => import("recharts").then((mod) => mod.YAxis as any), { ssr: false });
const CartesianGrid: any = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid as any), { ssr: false });
const Tooltip: any = dynamic(() => import("recharts").then((mod) => mod.Tooltip as any), { ssr: false });
const ResponsiveContainer: any = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer as any), { ssr: false });
const BarChart: any = dynamic(() => import("recharts").then((mod) => mod.BarChart as any), { ssr: false });
const Bar: any = dynamic(() => import("recharts").then((mod) => mod.Bar as any), { ssr: false });
const Cell: any = dynamic(() => import("recharts").then((mod) => mod.Cell as any), { ssr: false });
const PieChart: any = dynamic(() => import("recharts").then((mod) => mod.PieChart as any), { ssr: false });
const Pie: any = dynamic(() => import("recharts").then((mod) => mod.Pie as any), { ssr: false });

import { useAdminAnalytics } from "@/hooks/useAdmin";

const specialtyData = [
  { name: "Tim mạch", value: 400 },
  { name: "Nội tiết", value: 300 },
  { name: "Nhi khoa", value: 300 },
  { name: "Thần kinh", value: 200 },
  { name: "Da liễu", value: 278 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AdminAnalytics() {
  const { data: stats, isLoading } = useAdminAnalytics();

  return (
    <DashboardLayout role="admin" title="Thống kê hệ thống">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Thống kê chuyên sâu</h1>
          <p className="text-sm text-muted-foreground mt-1">Phân tích dữ liệu hoạt động toàn hệ thống MedCare</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2 font-medium">
             <Filter className="w-4 h-4" /> Lọc dữ liệu
           </Button>
           <Button size="sm" className="gap-2 font-medium">
             <Download className="w-4 h-4" /> Xuất báo cáo
           </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Tổng doanh thu" value={stats?.totalRevenue ? `${(stats.totalRevenue / 1_000_000).toFixed(1)}M ₫` : "—"} icon={DollarSign} trend={{ value: 12, label: "tháng này" }} variant="primary" />
            <StatsCard title="Tỷ lệ hủy lịch" value="4.2%" icon={Activity} trend={{ value: -1.5, label: "giảm" }} variant="success" />
            <StatsCard title="Bệnh nhân mới" value="+128" icon={Users} trend={{ value: 8, label: "vs tuần trước" }} variant="info" />
            <StatsCard title="Bác sĩ active" value="95%" icon={UserCheck} trend={{ value: 2, label: "tăng" }} variant="warning" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="card-elevated p-6">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold text-foreground">Doanh thu & Lịch khám</h3>
                   <div className="flex gap-1 bg-muted p-1 rounded-md">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 rounded-md bg-card">Tháng</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 rounded-md">Tuần</Button>
                   </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                   <AreaChart data={chartData.revenue}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(192,50%,22%)" stopOpacity={0.12}/>
                          <stop offset="95%" stopColor="hsl(192,50%,22%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="hsl(36,14%,86%)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(200,12%,42%)" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(200,12%,42%)" }} tickFormatter={(v: number) => `${v / 1_000_000}M`} />
                      <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid hsl(36,14%,86%)', boxShadow: 'none', fontSize: 12 }} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(192,50%,22%)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>

             <div className="card-elevated p-6">
                <h3 className="font-bold text-foreground mb-6">Phân bổ chuyên khoa</h3>
                <div className="flex flex-col md:flex-row items-center gap-8">
                   <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                         <Pie data={specialtyData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {specialtyData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                         </Pie>
                         <Tooltip />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="space-y-3 w-full md:w-64">
                      {specialtyData.map((s, i) => (
                         <div key={s.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                               <span className="text-xs text-muted-foreground">{s.name}</span>
                            </div>
                            <span className="text-xs font-bold text-foreground">{(s.value / 14.78).toFixed(1)}%</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 card-elevated p-6">
                <h3 className="font-bold text-foreground mb-6">Bác sĩ nổi bật của tháng</h3>
                <div className="space-y-4">
                   {[
                      { name: "BS. Lê Mạnh Hùng", spec: "Tim mạch", rating: 4.9, appointments: 156, growth: "+12%" },
                      { name: "BS. Phạm Minh Anh", spec: "Nhi khoa", rating: 4.8, appointments: 142, growth: "+8%" },
                      { name: "BS. Trần Đức Hòa", spec: "Thần kinh", rating: 4.9, appointments: 128, growth: "+15%" },
                      { name: "BS. Nguyễn Bích Liên", spec: "Nội tiết", rating: 4.7, appointments: 115, growth: "+5%" },
                   ].map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                               {doc.name.charAt(3)}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-foreground">{doc.name}</p>
                               <p className="text-[10px] text-muted-foreground uppercase">{doc.spec}</p>
                            </div>
                         </div>
                         <div className="text-right flex items-center gap-8">
                            <div>
                               <p className="text-sm font-bold">{doc.appointments}</p>
                               <p className="text-[10px] text-success font-bold">{doc.growth}</p>
                            </div>
                            <div className="flex items-center gap-1 text-warning">
                               <span className="text-sm font-bold">{doc.rating}</span>
                               <span className="text-xs">⭐</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="card-elevated p-6 flex flex-col">
                <h3 className="font-bold text-foreground mb-6">Tình trạng hệ thống</h3>
                <div className="flex-1 space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs mb-1">
                         <span className="text-muted-foreground font-medium">Server Uptime (API)</span>
                         <span className="text-success font-bold">99.98%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                         <div className="bg-success h-full w-[99.9%]" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs mb-1">
                         <span className="text-muted-foreground font-medium">Băng thông Video Call</span>
                         <span className="text-primary font-bold">12 / 50 GB</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                         <div className="bg-primary h-full w-[24%]" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs mb-1">
                         <span className="text-muted-foreground font-medium">Lưu trữ ảnh & Hồ sơ</span>
                         <span className="text-warning font-bold">85%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                         <div className="bg-warning h-full w-[85%]" />
                      </div>
                   </div>
                </div>
                <Button variant="outline" className="w-full mt-8 text-xs gap-2">
                   <Database className="w-3 h-3" /> Quản lý tài nguyên
                </Button>
             </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
