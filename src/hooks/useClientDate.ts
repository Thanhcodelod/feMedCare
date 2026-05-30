"use client";

import { useEffect, useState } from "react";

export function useClientDate(): Date | null {
  const [date, setDate] = useState<Date | null>(null);
  useEffect(() => {
    setDate(new Date());
  }, []);
  return date;
}
