"use client";

import { useState } from "react";
import { KeyRound, Loader2, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "@/hooks/usePassword";
import { PASSWORD_MIN_LENGTH, AUTH_FIELD_LIMITS } from "@/types/api";

interface ChangePasswordDialogProps {
  trigger?: React.ReactNode;
}

export function ChangePasswordDialog({ trigger }: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const changeMut = useChangePassword();

  const tooShort =
    newPassword.length > 0 && newPassword.length < PASSWORD_MIN_LENGTH;
  const mismatched =
    confirmPassword.length > 0 && confirmPassword !== newPassword;
  const sameAsOld =
    newPassword.length > 0 && newPassword === oldPassword;

  const canSubmit =
    oldPassword.length > 0 &&
    oldPassword.length <= AUTH_FIELD_LIMITS.password &&
    newPassword.length >= PASSWORD_MIN_LENGTH &&
    newPassword.length <= AUTH_FIELD_LIMITS.password &&
    confirmPassword === newPassword &&
    newPassword !== oldPassword &&
    !changeMut.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    changeMut.mutate(
      {
        old_password: oldPassword,
        new_password: newPassword,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOld(false);
    setShowNew(false);
    changeMut.reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && changeMut.isPending) return;
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="rounded-xl gap-2">
            <KeyRound className="w-4 h-4" /> Đổi mật khẩu
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>
            Sau khi đổi thành công, bạn sẽ bị đăng xuất khỏi mọi thiết bị và
            cần đăng nhập lại.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium" htmlFor="old-password">
              Mật khẩu hiện tại
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="old-password"
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-10"
                required
                maxLength={AUTH_FIELD_LIMITS.password}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showOld ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                tabIndex={-1}
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium" htmlFor="new-password">
              Mật khẩu mới
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
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
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {tooShort && (
              <p className="text-xs text-destructive mt-1.5">
                Mật khẩu phải có ít nhất {PASSWORD_MIN_LENGTH} ký tự.
              </p>
            )}
            {sameAsOld && !tooShort && (
              <p className="text-xs text-destructive mt-1.5">
                Mật khẩu mới phải khác mật khẩu hiện tại.
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium" htmlFor="confirm-new-password">
              Xác nhận mật khẩu mới
            </Label>
            <Input
              id="confirm-new-password"
              type={showNew ? "text" : "password"}
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={changeMut.isPending}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {changeMut.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Đổi mật khẩu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
