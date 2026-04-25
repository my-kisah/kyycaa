"use client";

import { useTransition } from "react";
import { logoutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      className={cn(className)}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await logoutAction();
        })
      }
    >
      {isPending ? "Keluar..." : "Logout"}
    </Button>
  );
}
