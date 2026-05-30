"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Stethoscope, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { AUTH_FIELD_LIMITS } from "@/types/api";
import { cn } from "@/utils/utils";
import { toast } from "sonner";

type Mode = "login" | "register";

const REASON_MESSAGES: Record<string, { tone: "info" | "success" | "warning"; text: string }> = {
  session_expired: {
    tone: "warning",
    text: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  },
  password_changed: {
    tone: "success",
    text: "Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại bằng mật khẩu mới.",
  },
  password_reset: {
    tone: "success",
    text: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập.",
  },
};

function ReasonBanner() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const info = reason ? REASON_MESSAGES[reason] : null;
  if (!info) return null;
  const Icon = info.tone === "success" ? CheckCircle2 : AlertCircle;
  const classes =
    info.tone === "success"
      ? "bg-success/10 text-success border-success/20"
      : info.tone === "warning"
        ? "bg-warning/10 text-warning border-warning/30"
        : "bg-info/10 text-info border-info/20";
  return (
    <div
      role="status"
      className={cn("mb-4 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm", classes)}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{info.text}</span>
    </div>
  );
}

function LoginInner() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPass, setShowPass] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedLoginEmail = loginEmail.trim();
  const loginEmailInvalid =
    loginEmail.length > 0 && !EMAIL_REGEX.test(trimmedLoginEmail);
  const canSubmitLogin =
    EMAIL_REGEX.test(trimmedLoginEmail) && loginPassword.length > 0;

  useEffect(() => {
    if (registerMutation.isSuccess) {
      toast.success("Đăng ký thành công. Vui lòng đăng nhập.");
      setMode("login");
    }
    if (registerMutation.isError) {
      const raw = (registerMutation.error as any)?.response?.data?.message;
      const msg =
        (Array.isArray(raw) ? raw[0] : raw) ||
        (registerMutation.error as Error)?.message ||
        "Lỗi không xác định";
      toast.error(`Đăng ký thất bại: ${msg}`);
    }
  }, [
    registerMutation.isSuccess,
    registerMutation.isError,
    registerMutation.error,
  ]);

  if (loginMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-info/5 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitLogin || loginMutation.isPending) return;
    loginMutation.mutate({
      email: trimmedLoginEmail,
      password: loginPassword,
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = regPhone.trim();
    registerMutation.mutate({
      fullName: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      ...(trimmedPhone ? { phone: trimmedPhone } : {}),
    });
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-info/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-md bg-primary flex items-center justify-center mx-auto mb-4 shadow-primary">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">MedCare</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hệ thống Đặt lịch & Telemedicine
          </p>
        </div>
        <div className="card-elevated p-6">
          <ReasonBanner />
          <div className="flex gap-1 mb-6 bg-muted/40 rounded-xl p-1">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                  mode === m
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {m === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={cn(
                    "mt-1.5",
                    loginEmailInvalid && "border-destructive focus-visible:ring-destructive",
                  )}
                  aria-invalid={loginEmailInvalid || undefined}
                  maxLength={AUTH_FIELD_LIMITS.email}
                  required
                />
                {loginEmailInvalid && (
                  <p className="text-xs text-destructive mt-1.5">
                    Email chưa đúng định dạng.
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium">Mật khẩu</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pr-10"
                    maxLength={AUTH_FIELD_LIMITS.password}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-right mt-1.5">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl h-10 font-semibold"
                disabled={isPending || !canSubmitLogin}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Đăng nhập
              </Button>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">

              <div>
                <Label className="text-sm font-medium">Họ và tên</Label>
                <Input
                  placeholder="Nguyễn Văn A"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="mt-1.5"
                  maxLength={AUTH_FIELD_LIMITS.fullName}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="mt-1.5"
                    maxLength={AUTH_FIELD_LIMITS.email}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Số điện thoại</Label>
                  <Input
                    placeholder="0912345678"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="mt-1.5"
                    maxLength={AUTH_FIELD_LIMITS.phone}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Mật khẩu</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="Tối thiểu 8 ký tự"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={AUTH_FIELD_LIMITS.passwordMin}
                    maxLength={AUTH_FIELD_LIMITS.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl h-10 font-semibold"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Tạo tài khoản
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
