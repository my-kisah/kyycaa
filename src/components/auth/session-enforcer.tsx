"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export function SessionEnforcer() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  useEffect(() => {
    const interval = window.setInterval(() => {
      void update();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [update]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session?.user || !session.user.id || session.user.deleted) {
      void signOut({ redirect: false }).finally(() => {
        router.replace("/login");
      });
      return;
    }

    if (session.user.role === "USER" && session.user.bannedAt) {
      const reason = encodeURIComponent(
        session.user.banReason ?? "Tidak ada alasan yang ditulis admin.",
      );
      void signOut({ redirect: false }).finally(() => {
        router.replace(`/account-frozen?reason=${reason}`);
      });
    }
  }, [router, session, status]);

  return null;
}
