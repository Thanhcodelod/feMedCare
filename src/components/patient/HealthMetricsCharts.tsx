"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Heart, PlusCircle, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const weightData = [
  { date: "01/01", weight: 72 },
  { date: "15/01", weight: 71.5 },
  { date: "01/02", weight: 70.8 },
  { date: "15/02", weight: 70.2 },
  { date: "01/03", weight: 69.5 },
  { date: "15/03", weight: 69.0 },
];

const bpData = [
  { date: "01/03", sys: 120, dia: 80 },
  { date: "05/03", sys: 118, dia: 78 },
  { date: "10/03", sys: 125, dia: 82 },
  { date: "15/03", sys: 122, dia: 80 },
  { date: "20/03", sys: 115, dia: 75 },
  { date: "25/03", sys: 119, dia: 79 },
];

export function HealthMetricsCharts() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Scale className="w-4 h-4 text-success" /> Cân nặng
              </CardTitle>
              <CardDescription>
                Theo dõi cân nặng 3 tháng gần nhất
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground"
            >
              <PlusCircle className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={["dataMin - 2", "dataMax + 2"]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "6px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--success))"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "hsl(var(--success))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Heart className="w-4 h-4 text-destructive" /> Huyết áp (mmHg)
              </CardTitle>
              <CardDescription>Chỉ số tâm thu và tâm trương</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground"
            >
              <PlusCircle className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bpData}>
                  <defs>
                    <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--destructive))"
                        stopOpacity={0.1}
                      />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={["dataMin - 10", "dataMax + 10"]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "6px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sys"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSys)"
                    name="Tâm thu"
                  />
                  <Area
                    type="monotone"
                    dataKey="dia"
                    stroke="hsl(var(--info))"
                    strokeWidth={2}
                    fillOpacity={0}
                    name="Tâm trương"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-sm font-bold">
              Dị ứng & Phản ứng
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="destructive" className="rounded-md px-4 py-1">
              Hải sản (Nặng)
            </Badge>
            <Badge variant="destructive" className="rounded-md px-4 py-1">
              Phấn hoa
            </Badge>
            <Badge variant="destructive" className="rounded-md px-4 py-1">
              Penicillin
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="border-dashed"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" /> Thêm mới
            </Button>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Bệnh mạn tính</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-none rounded-md px-4 py-1"
            >
              Viêm xoang
            </Badge>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-none rounded-md px-4 py-1"
            >
              Đau dạ dày
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="border-dashed"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" /> Thêm mới
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
