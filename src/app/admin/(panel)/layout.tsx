import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SessionEnforcer } from "@/components/auth/session-enforcer";
import { SiteShell } from "@/components/layout/site-shell";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard?denied=admin");
  }

  return (
    <div className="floating-hearts min-h-screen py-8">
      <SessionEnforcer />
      <SiteShell className="space-y-6">
        <AdminTopbar />
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <div className="space-y-6">{children}</div>
        </div>
      </SiteShell>
    </div>
  );
}
