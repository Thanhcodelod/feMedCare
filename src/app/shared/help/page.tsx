"use client";
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Search, 
  ChevronDown, 
  HelpCircle, 
  ShieldCheck, 
  CreditCard, 
  Users, 
  Video, 
  MessageSquare,
  LifeBuoy,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/redux/authStore";
import { cn } from "@/utils/utils";

const faqs = [
  {
    category: "Bắt đầu",
    icon: LifeBuoy,
    items: [
      { q: "Làm thế nào để đặt lịch khám?", a: "Bạn chỉ cần vào mục 'Đặt lịch khám', chọn bác sĩ phù hợp, chọn thời gian và xác nhận. Nếu là khám online, bạn cần thanh toán trước bằng chuyển khoản ngân hàng qua mã QR." },
      { q: "Tôi có thể xem lại hồ sơ cũ ở đâu?", a: "Tất cả hồ sơ khám, đơn thuốc và ghi chú của bác sĩ đều được lưu trữ trong mục 'Hồ sơ y tế'." },
    ]
  },
  {
    category: "Thanh toán",
    icon: CreditCard,
    items: [
      { q: "Tôi có được hoàn tiền nếu hủy lịch?", a: "Chính sách hoàn tiền áp dụng khi bạn hủy lịch trước ít nhất 2h so với thời điểm khám dự kiến. Tiền sẽ được hoàn về ví/tài khoản trong 3-5 ngày làm việc." },
      { q: "Có những hình thức thanh toán nào?", a: "Hiện tại chúng tôi hỗ trợ chuyển khoản ngân hàng qua mã QR (quét VietQR bằng app ngân hàng bất kỳ) và thanh toán trực tiếp tại cơ sở y tế (đối với khám offline)." },
    ]
  },
  {
    category: "Telemedicine",
    icon: Video,
    items: [
      { q: "Tôi cần chuẩn bị gì cho buổi khám online?", a: "Hãy đảm bảo kết nối internet ổn định, micro và camera hoạt động tốt. Bạn nên ngồi ở nơi yên tĩnh và đủ ánh sáng." },
      { q: "Bác sĩ có thể kê đơn thuốc online không?", a: "Có, sau cuộc gọi video, bác sĩ sẽ gửi đơn thuốc điện tử vào hồ sơ của bạn. Bạn có thể dùng đơn này để mua thuốc tại các hiệu thuốc." },
    ]
  }
];

export default function HelpCenterPage() {
  const user = useAuthStore(s => s.user);
  const role = user?.role?.toLowerCase() || "patient";
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const toggleItem = (q: string) => {
    setOpenItems(prev => prev.includes(q) ? prev.filter(i => i !== q) : [...prev, q]);
  };

  return (
    <DashboardLayout role={role as any} title="Trung tâm hỗ trợ">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold font-heading">Xin chào, chúng tôi có thể giúp gì cho bạn?</h1>
          <div className="max-w-md mx-auto mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm câu hỏi hoặc vấn đề của bạn..." 
              className="pl-10 h-12 rounded-md border-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Gửi yêu cầu", icon: MessageSquare, color: "text-blue-500", desc: "Phản hồi trong 2h" },
            { label: "Hướng dẫn SD", icon: FileText, color: "text-rose-500", desc: "Xem video & tài liệu" },
            { label: "Bảo mật", icon: ShieldCheck, color: "text-emerald-500", desc: "Chính sách dữ liệu" },
          ].map(item => (
            <div key={item.label} className="card-elevated p-6 text-center group cursor-pointer hover:border-primary/40 transition-all">
              <div className={cn("w-12 h-12 rounded-md bg-muted flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform", item.color)}>
                <item.icon className="w-6 h-6" />
              </div>
              <h4 className="font-bold mb-1">{item.label}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary" /> Câu hỏi thường gặp
          </h3>

          {faqs.map(cat => (
            <div key={cat.category} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">
                <cat.icon className="w-4 h-4" /> {cat.category}
              </div>
              <div className="space-y-2">
                {cat.items.map(faq => (
                  <div 
                    key={faq.q} 
                    className="card-elevated overflow-hidden border border-slate-100"
                  >
                    <button 
                      onClick={() => toggleItem(faq.q)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-sm">{faq.q}</span>
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", openItems.includes(faq.q) && "rotate-180")} />
                    </button>
                    {openItems.includes(faq.q) && (
                      <div className="p-4 pt-0 text-sm text-muted-foreground bg-slate-50/50 animate-in slide-in-from-top-2">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-primary rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-2 text-center md:text-left">
              <h4 className="text-xl font-bold">Vẫn không tìm thấy câu trả lời?</h4>
              <p className="opacity-80 text-sm">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7 để giải đáp thắc mắc của bạn.</p>
           </div>
           <Button variant="secondary" className="rounded-full px-8 h-12 font-bold bg-white text-primary hover:bg-white/90">
             Liên hệ hỗ trợ ngay
           </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
