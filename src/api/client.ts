import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/redux/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const token =
    useAuthStore.getState().token ?? localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const SKIP_401_REDIRECT_PATHS = ["/auth/login", "/auth/change-password"];

let redirectInFlight = false;
let last429ToastAt = 0;

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window === "undefined") return Promise.reject(err);

    if (err.response?.status === 429) {
      const now = Date.now();
      if (now - last429ToastAt > 10_000) {
        last429ToastAt = now;
        toast.error("Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ít giây.");
      }
      return Promise.reject(err);
    }

    if (err.response?.status !== 401) return Promise.reject(err);

    const reqUrl: string = err.config?.url ?? "";
    if (SKIP_401_REDIRECT_PATHS.some((p) => reqUrl.includes(p))) {
      return Promise.reject(err);
    }

    const { pathname } = window.location;
    if (pathname === "/login" || pathname.startsWith("/login/")) {
      return Promise.reject(err);
    }
    if (redirectInFlight) return Promise.reject(err);
    redirectInFlight = true;

    localStorage.removeItem("auth_token");
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax;";
    document.cookie = "user_role=; path=/; max-age=0; SameSite=Lax;";

    const rawMsg = err.response?.data?.message;
    const message = Array.isArray(rawMsg) ? rawMsg.join(" ") : String(rawMsg ?? "");
    const isRevoked =
      /token\s+revoked/i.test(message) ||
      /invalid or inactive account/i.test(message);

    const reason = isRevoked ? "session_expired" : undefined;
    const returnTo = encodeURIComponent(pathname + window.location.search);
    const qs = new URLSearchParams({ redirect_url: returnTo });
    if (reason) qs.set("reason", reason);
    window.location.replace(`/login?${qs.toString()}`);
    return Promise.reject(err);
  }
);

export default api;
