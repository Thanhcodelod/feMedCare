"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AlertTriangle, Phone, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSOS } from "@/hooks/useSOS";

export default function PatientSOS() {
  const navigate = useRouter();
  const [description, setDescription] = useState("");
  const { status, sosInfo, sendSOS } = useSOS({ role: "patient" });

  if (status === "matched" && sosInfo?.roomId) {
    navigate.push(`/patient/telemedicine?room=${sosInfo.roomId}`);
  }

  return (
    <DashboardLayout role="patient" title="SOS Emergency">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        {status === "idle" && (
          <div className="card-elevated p-8 max-w-lg w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold">SOS Cấp cứu từ xa</h1>
            <p className="text-sm text-muted-foreground">
              Hệ thống sẽ kết nối bạn với bác sĩ trực tuyến <strong>ngay lập tức</strong> để hướng dẫn sơ cứu qua video.
            </p>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả triệu chứng/tình huống (VD: đau ngực, khó thở, ngất xỉu...)"
              className="min-h-[100px] rounded-xl"
            />
            <Button
              size="lg"
              className="w-full bg-destructive hover:bg-destructive/90 text-white gap-2 text-base h-14"
              onClick={() => sendSOS(description)}
              disabled={!description.trim()}
            >
              <Phone className="w-5 h-5" />
              Gọi SOS ngay
            </Button>
            <p className="text-xs text-muted-foreground">
              ⚠️ Chỉ sử dụng trong trường hợp <strong>khẩn cấp thực sự</strong>
            </p>
          </div>
        )}

        {status === "searching" && (
          <div className="card-elevated p-8 max-w-md w-full text-center space-y-6">
            <Loader2 className="w-16 h-16 text-destructive animate-spin mx-auto" />
            <h2 className="text-xl font-bold">Đang tìm bác sĩ...</h2>
            <p className="text-sm text-muted-foreground">
              Hệ thống đang điều phối bác sĩ gần nhất. Vui lòng giữ bình tĩnh.
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs text-muted-foreground">Đang dispatch...</span>
            </div>
          </div>
        )}

        {status === "no_doctor" && (
          <div className="card-elevated p-8 max-w-md w-full text-center space-y-6">
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Không tìm thấy bác sĩ</h2>
            <p className="text-sm text-muted-foreground">
              Hiện không có bác sĩ trực tuyến. Vui lòng gọi <strong>115</strong> hoặc đến cơ sở y tế gần nhất.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
