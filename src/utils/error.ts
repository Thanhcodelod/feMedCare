import type { AxiosError } from "axios";

export interface NormalizedApiError {
  status: number;
  message: string;
  raw?: string | string[];
  retryAfterSec?: number;
}

const DEFAULT_MSG = "Có lỗi xảy ra, vui lòng thử lại.";

export function extractApiError(err: unknown): NormalizedApiError {
  const axiosErr = err as AxiosError<{ message?: string | string[]; statusCode?: number }>;
  const status = axiosErr?.response?.status ?? 0;
  const raw = axiosErr?.response?.data?.message;

  let message = DEFAULT_MSG;
  if (Array.isArray(raw)) message = raw.join("; ");
  else if (typeof raw === "string" && raw.length > 0) message = raw;
  else if (typeof axiosErr?.message === "string" && axiosErr.message.length > 0) {
    message = axiosErr.message;
  }

  const retryAfterHeader = axiosErr?.response?.headers?.["retry-after"];
  const retryAfterSec = retryAfterHeader
    ? Math.max(0, parseInt(String(retryAfterHeader), 10) || 0)
    : undefined;

  return { status, message, raw, retryAfterSec };
}

export function formatRetryAfter(sec: number | undefined): string {
  if (!sec || sec <= 0) return "vài phút";
  if (sec < 60) return `${sec} giây`;
  const minutes = Math.ceil(sec / 60);
  return `${minutes} phút`;
}
