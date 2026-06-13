"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { useAuthHydration } from "@/hooks/useAuthHydration";

const IS_SERVER = typeof window === "undefined";

function AuthHydrator() {
  useAuthHydration();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              if (IS_SERVER) return false;
              const status = error?.response?.status;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            staleTime: 2 * 60_000,
            gcTime: 5 * 60_000,
            enabled: !IS_SERVER,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications position="top-right" zIndex={9999} />
        <TooltipProvider>
          <AuthHydrator />
          {children}
          <Toaster />
        </TooltipProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
