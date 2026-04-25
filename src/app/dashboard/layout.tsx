import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SessionEnforcer } from "@/components/auth/session-enforcer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "USER" && session.user.bannedAt) {
    const reason = encodeURIComponent(
      session.user.banReason ?? "Tidak ada alasan yang ditulis admin.",
    );
    redirect(`/account-frozen?reason=${reason}`);
  }

  return (
    <>
      <SessionEnforcer />
      {children}
    </>
  );
}
