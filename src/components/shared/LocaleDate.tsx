"use client";

import { useEffect, useState } from "react";

interface LocaleDateProps {
  value?: string | number | Date | null;
  variant?: "date" | "datetime";
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  fallback?: string;
  className?: string;
}

export function LocaleDate({
  value,
  variant = "date",
  locale = "vi-VN",
  options,
  fallback = "—",
  className,
}: LocaleDateProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!value) return <span className={className}>{fallback}</span>;
  if (!mounted) {
    return (
      <span className={className} suppressHydrationWarning>
        {fallback}
      </span>
    );
  }

  const date = value instanceof Date ? value : new Date(value);
  const formatted =
    variant === "datetime"
      ? date.toLocaleString(locale, options)
      : date.toLocaleDateString(locale, options);

  return <span className={className}>{formatted}</span>;
}
