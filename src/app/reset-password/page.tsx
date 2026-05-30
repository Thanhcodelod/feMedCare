"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  KeyRound,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks/usePassword";
import {
  RESET_TOKEN_REGEX,
  PASSWORD_MIN_LENGTH,
  AUTH_FIELD_LIMITS,
} from "@/types/api";

function InvalidLinkView() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-info/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card-elevated p-8 text-center">
          <div className="w-16 h-16 rounded-md bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold mb-3">Link không hợp lệ</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.
          </p>
          <div className="space-y-2">
            <Link href="/forgot-password">
              <Button className="w-full rounded-xl h-10">Yêu cầu link mới</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full rounded-xl h-10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordForm({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const resetMut = useResetPassword();

  const mismatched =
    confirmPassword.length > 0 && confirmPassword !== newPassword;
  const tooShort =
    newPassword.length > 0 && newPassword.length < PASSWORD_MIN_LENGTH;
  const tooLong = newPassword.length > AUTH_FIELD_LIMITS.password;

  const canSubmit =
    newPassword.length >= PASSWORD_MIN_LENGTH &&
    newPassword.length <= AUTH_FIELD_LIMITS.password &&
    confirmPassword === newPassword &&
    !resetMut.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    resetMut.mutate({ token, new_password: newPassword });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-info/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-md bg-primary flex items-center justify-center mx-auto mb-4 shadow-primary">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <div className="card-elevated p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium" htmlFor="new-password">
                Mật khẩu mới
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="new-password"
                  type={show ? "text" : "password"}
                  placeholder={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  maxLength={AUTH_FIELD_LIMITS.password}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {tooShort && (
                <p className="text-xs text-destructive mt-1.5">
                  Mật khẩu phải có ít nhất {PASSWORD_MIN_LENGTH} ký tự.
                </p>
              )}
              {tooLong && (
                <p className="text-xs text-destructive mt-1.5">
                  Mật khẩu không được vượt quá {AUTH_FIELD_LIMITS.password} ký tự.
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium" htmlFor="confirm-password">
                Xác nhận mật khẩu mới
              </Label>
              <Input
                id="confirm-password"
                type={show ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1.5"
                required
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={AUTH_FIELD_LIMITS.password}
              />
              {mismatched && (
                <p className="text-xs text-destructive mt-1.5">
                  Mật khẩu nhập lại không khớp.
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl h-10 font-semibold"
              disabled={!canSubmit}
            >
              {resetMut.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Đặt lại mật khẩu
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

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token");
  const token = useMemo(() => {
    if (!rawToken) return null;
    return RESET_TOKEN_REGEX.test(rawToken) ? rawToken : null;
  }, [rawToken]);

  if (!token) return <InvalidLinkView />;
  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
