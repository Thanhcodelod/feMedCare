"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/redux/authStore";
import type { UserRole } from "@/types/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const location = { pathname: usePathname() };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return; // Wait for hydration

    if (!isAuthenticated) {
      router.push("/login?redirect_url=" + location.pathname);
    } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      const roleMap: Record<UserRole, string> = {
        DOCTOR: "/doctor",
        PATIENT: "/patient",
        ADMIN: "/admin",
        NURSE: "/nurse/queue",
      };
      router.push(roleMap[user.role] || "/login");
    }
  }, [
    isHydrated,
    isAuthenticated,
    user,
    allowedRoles,
    router,
    location.pathname,
  ]);

  if (!isHydrated || (!isAuthenticated && isHydrated)) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
