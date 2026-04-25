import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PasswordForm } from "@/components/auth/password-form";
import { ProfileForm } from "@/components/auth/profile-form";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteShell } from "@/components/layout/site-shell";
import { getInitials } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      username: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="floating-hearts min-h-screen pb-16">
      <SiteHeader />
      <SiteShell className="space-y-8 py-12">
        <div className="glass-card rounded-[36px] p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Pengaturan Akun</p>
          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f2a9c2,#bb6f9e)] text-2xl font-semibold text-white">
                {getInitials(user.name)}
              </div>
            )}
            <div>
              <h1 className="font-display text-5xl text-rose-950">{user.name}</h1>
              <p className="mt-2 text-base text-rose-800/78">@{user.username}</p>
              <p className="mt-1 text-sm text-rose-700/72">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ProfileForm
            initialValues={{
              name: user.name,
              username: user.username,
              email: user.email,
              image: user.image ?? "",
            }}
          />
          <PasswordForm />
        </div>
      </SiteShell>
    </div>
  );
}
