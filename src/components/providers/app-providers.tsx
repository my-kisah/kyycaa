"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.4)",
            background: "rgba(255,248,251,0.95)",
            color: "#53374f",
          },
        }}
      />
    </SessionProvider>
  );
}
