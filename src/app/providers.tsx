"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // One retry only: with "Simulate API failure" on, three retries
        // would hide the error state behind several seconds of loading.
        retry: 1,
        // Data lives in localStorage, so a tab switch never makes it stale.
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  // useState so each browser tab gets one client that survives re-renders.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        // Sits above the 56px bottom tab bar on phones.
        mobileOffset={{ bottom: 72 }}
        toastOptions={{
          classNames: {
            toast:
              "bg-surface! text-ink! border-line! rounded-panel! shadow-float! font-sans! text-body!",
            actionButton: "bg-primary! text-on-primary! rounded-control!",
          },
        }}
      />
    </QueryClientProvider>
  );
}
