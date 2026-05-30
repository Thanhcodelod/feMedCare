"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/usePassword";
import { AUTH_FIELD_LIMITS } from "@/types/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const forgotMut = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    forgotMut.mutate({ email: trimmed });
  };

  if (forgotMut.isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-info/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card-elevated p-8 text-center">
            <div className="w-16 h-16 rounded-md bg-success/10 flex items-center justify-center mx-auto mb-6">
              <MailCheck className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-xl font-bold mb-3">Kiểm tra email của bạn</h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Nếu địa chỉ email <strong>{email}</strong> đã được đăng ký,
              chúng tôi vừa gửi link đặt lại mật khẩu.
              Link có hiệu lực trong 15 phút.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Không thấy email? Kiểm tra thư mục Spam hoặc thử lại sau vài phút.
            </p>
            <Link href="/login">
              <Button variant="outline" className="rounded-xl h-10 w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-info/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-md bg-primary flex items-center justify-center mx-auto mb-4 shadow-primary">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Quên mật khẩu?</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Nhập email đã đăng ký để nhận link đặt lại mật khẩu
          </p>
        </div>

        <div className="card-elevated p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1.5"
                maxLength={AUTH_FIELD_LIMITS.email}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl h-10 font-semibold"
              disabled={forgotMut.isPending}
            >
              {forgotMut.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Gửi link đặt lại
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/50 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
