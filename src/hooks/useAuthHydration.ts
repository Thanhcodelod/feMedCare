"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/redux/authStore";

let rehydratePromise: Promise<void> | null = null;
let alreadyHydrated = false;

function ensureRehydrate(): Promise<void> {
  if (alreadyHydrated) return Promise.resolve();
  if (rehydratePromise) return rehydratePromise;
  rehydratePromise = (async () => {
    try {
      const result = useAuthStore.persist?.rehydrate?.();
      if (result && typeof (result as Promise<unknown>).then === "function") {
        await result;
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Auth rehydrate failed", err);
      }
    } finally {
      alreadyHydrated = true;
    }
  })();
  return rehydratePromise;
}

export function useAuthHydration() {
  const [isHydrated, setIsHydrated] = useState(alreadyHydrated);

  useEffect(() => {
    if (alreadyHydrated) {
      setIsHydrated(true);
      return;
    }
    let cancelled = false;
    ensureRehydrate().finally(() => {
      if (!cancelled) setIsHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return isHydrated;
}
