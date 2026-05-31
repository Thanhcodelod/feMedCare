"use client";
import React from "react";
import Link from "next/link";
import { 
  Video,
  Calendar, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Star,
  Activity,
  PhoneCall,
  ChevronRight,
  Menu,
  Smartphone,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-card text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/medcare-logo.png" alt="MedCare" className="h-16 w-auto object-contain" />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dịch vụ</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Cách thức hoạt động</Link>
            <Link href="#doctors" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Bác sĩ</Link>
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Đăng nhập</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button className="px-6 bg-primary hover:bg-primary/90">
                Bắt đầu ngay <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-card border-b border-border p-4 space-y-4">
            <Link href="#features" className="block text-lg font-medium py-2">Dịch vụ</Link>
            <Link href="#how-it-works" className="block text-lg font-medium py-2">Cách thức hoạt động</Link>
            <Link href="#doctors" className="block text-lg font-medium py-2">Bác sĩ</Link>
            <Link href="/login" className="block text-lg font-medium py-2 text-primary">Đăng nhập / Đăng ký</Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden relative">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10 text-center lg:text-left">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1 rounded-full text-sm font-medium">
              Nền tảng chăm sóc sức khỏe 4.0
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              Chăm sóc sức khỏe <br />
              <span className="text-primary">trong tầm tay</span> của bạn
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Kết nối với các bác sĩ hàng đầu ngay lập tức qua video call. Đặt lịch khám, quản lý hồ sơ y tế và nhận đơn thuốc trực tuyến một cách an toàn và bảo mật.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/login">
                <Button size="lg" className="px-8 h-14 text-lg bg-primary hover:bg-primary/90">
                  Đặt lịch khám ngay
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="px-8 h-14 text-lg border-2 hover:bg-muted">
                  Tải ứng dụng
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-8 pt-8 justify-center lg:justify-start grayscale opacity-50">
               <div className="text-center">
                 <p className="text-2xl font-bold">10k+</p>
                 <p className="text-xs font-medium uppercase tracking-widest">Bệnh nhân</p>
               </div>
               <div className="w-px h-8 bg-border" />
               <div className="text-center">
                 <p className="text-2xl font-bold">500+</p>
                 <p className="text-xs font-medium uppercase tracking-widest">Bác sĩ</p>
               </div>
               <div className="w-px h-8 bg-border" />
               <div className="text-center">
                 <p className="text-2xl font-bold">4.9/5</p>
                 <p className="text-xs font-medium uppercase tracking-widest">Đánh giá</p>
               </div>
            </div>
          </div>

          <div className="relative lg:h-[600px] flex items-center justify-center">
             <div className="relative w-full aspect-square md:aspect-auto md:h-full max-w-xl bg-card rounded-md overflow-hidden ring-1 ring-border">
                <img 
                  src="/medcare_landing_hero_1776357154813.jpg"
                  alt="MedCare Hero" 
                  className="w-full h-full object-cover"
                />
                
                {/* Floating Cards */}
                <div className="absolute top-10 right-10 bg-card p-4 rounded-md border border-border">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success">
                         <Video className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-foreground">Cuộc gọi trực tuyến</p>
                         <p className="text-[10px] text-muted-foreground text-nowrap">Đang kết nối bác sĩ...</p>
                      </div>
                   </div>
                </div>

                <div className="absolute bottom-10 left-10 bg-card p-4 rounded-md border border-border">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning">
                         <Star className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-foreground">Uu tú hàng đầu</p>
                         <p className="text-[10px] text-muted-foreground">Xếp hạng 5 sao</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary font-bold text-sm tracking-widest uppercase mb-4">Các tính năng chính</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-6">Mọi thứ bạn cần cho sức khỏe của mình</h3>
            <p className="text-muted-foreground text-lg">Hệ thống tích hợp toàn diện giúp bạn quản lý hành trình chăm sóc sức khỏe một cách dễ dàng và hiệu quả nhất.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Tư vấn Video Call",
                desc: "Gặp bác sĩ mọi lúc, mọi nơi mà không cần di chuyển. Tiết kiệm thời gian và chi phí.",
                icon: Video,
                color: "bg-info",
              },
              {
                title: "Đặt lịch thông minh",
                desc: "Hệ thống tự động nhắc lịch và điều phối khung giờ phù hợp nhất với bạn.",
                icon: Calendar,
                color: "bg-primary",
              },
              {
                title: "Hồ sơ sức khỏe điện tử",
                desc: "Lưu trữ đơn thuốc, chẩn đoán và chỉ số sinh học an toàn trên nền tảng đám mây.",
                icon: Activity,
                color: "bg-rose-500",
              },
              {
                title: "SOS Khẩn cấp",
                desc: "Kết nối bác sĩ trực ngay lập tức trong các tình huống khẩn cấp cần sơ cứu.",
                icon: PhoneCall,
                color: "bg-red-600",
              },
              {
                title: "Bảo mật tuyệt đối",
                desc: "Dữ liệu được mã hóa đầu cuối, đảm bảo quyền riêng tư và an toàn thông tin y tế.",
                icon: ShieldCheck,
                color: "bg-emerald-500",
              },
              {
                title: "Đội ngũ chuyên gia",
                desc: "Hàng nghìn bác sĩ từ các bệnh viện lớn với đầy đủ bằng cấp xác minh.",
                icon: Users,
                color: "bg-amber-500",
              },
            ].map((f, i) => (
              <div key={i} className="group p-8 bg-card rounded-md border border-border transition-colors">
                <div className={cn("w-14 h-14 rounded-md flex items-center justify-center text-white mb-6", f.color)}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-3">{f.title}</h4>
                <p className="text-muted-foreground leading-relaxed mb-6">{f.desc}</p>
                <Link href="/login" className="inline-flex items-center text-primary font-bold text-sm group-hover:gap-2 transition-all">
                  Khám phá thêm <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
           <div className="bg-primary rounded-md p-12 md:p-24 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="10" cy="10" r="1" fill="white" />
                    <circle cx="30" cy="50" r="2" fill="white" />
                    <circle cx="80" cy="20" r="1.5" fill="white" />
                    <circle cx="90" cy="80" r="1" fill="white" />
                 </svg>
              </div>

              <div className="max-w-4xl relative z-10 flex flex-col md:flex-row items-center gap-12">
                 <div className="flex-1 space-y-6 text-center md:text-left">
                    <h2 className="text-3xl md:text-5xl font-bold leading-tight">Bạn là Bác sĩ? Hãy tham gia cùng mạng lưới MedCare ngay hôm nay.</h2>
                    <p className="text-primary-foreground/80 text-lg">Mở rộng phạm vi thăm khám, quản lý bệnh nhân khoa học và tăng thu nhập ổn định với nền tảng telemedicine hàng đầu.</p>
                    <div className="pt-4">
                       <Link href="/login">
                         <Button size="lg" variant="secondary" className="bg-card text-primary hover:bg-card/90 px-10 h-14 font-bold text-lg">
                           Đăng ký khám chữa bệnh
                         </Button>
                       </Link>
                    </div>
                 </div>
                 <div className="flex-shrink-0 grid grid-cols-2 gap-4">
                    <div className="bg-primary-foreground/10 p-6 rounded-md border border-primary-foreground/20">
                       <Users className="w-8 h-8 mb-2" />
                       <p className="text-2xl font-bold">500+</p>
                       <p className="text-xs font-medium uppercase opacity-60">Cộng tác viên</p>
                    </div>
                    <div className="bg-primary-foreground/10 p-6 rounded-md border border-primary-foreground/20">
                       <CheckCircle2 className="w-8 h-8 mb-2" />
                       <p className="text-2xl font-bold">100%</p>
                       <p className="text-xs font-medium uppercase opacity-60">Xác thực</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 pt-20 pb-10 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <div className="flex items-center gap-2">
                <img src="/medcare-logo.png" alt="MedCare" className="h-16 w-auto object-contain" />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nền tảng đặt lịch khám và tư vấn trực tuyến hàng đầu Việt Nam. Tận tâm vì sức khỏe cộng đồng.
              </p>
            </div>
            
            <div>
              <h5 className="font-bold mb-6">Liên kết</h5>
              <ul className="space-y-4 text-muted-foreground text-sm">
                <li><Link href="#" className="hover:text-primary transition-colors">Về chúng tôi</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Dịch vụ</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Bác sĩ</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Tuyển dụng</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-6">Hỗ trợ</h5>
              <ul className="space-y-4 text-muted-foreground text-sm">
                <li><Link href="#" className="hover:text-primary transition-colors">Trung tâm hỗ trợ</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Câu hỏi thường gặp</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-6">Tải ứng dụng</h5>
              <div className="space-y-3">
                 <div className="bg-slate-800 p-3 rounded-md flex items-center gap-3 cursor-pointer hover:bg-slate-700 transition-colors border border-slate-700">
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center"><Smartphone className="w-4 h-4" /></div>
                    <div>
                       <p className="text-[10px] text-muted-foreground font-bold uppercase">Download on the</p>
                       <p className="text-sm font-bold">App Store</p>
                    </div>
                 </div>
                 <div className="bg-slate-800 p-3 rounded-md flex items-center gap-3 cursor-pointer hover:bg-slate-700 transition-colors border border-slate-700">
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center"><Smartphone className="w-4 h-4" /></div>
                    <div>
                       <p className="text-[10px] text-muted-foreground font-bold uppercase">Get it on</p>
                       <p className="text-sm font-bold">Google Play</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-xs">
            <p>© 2026 MedCare ClinicFlow Connect. All rights reserved.</p>
            <div className="flex gap-6">
               <Link href="#" className="hover:text-white transition-colors">Facebook</Link>
               <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
               <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
