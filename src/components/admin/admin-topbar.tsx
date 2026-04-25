import { auth } from "@/auth";
import { LogoutButton } from "@/components/layout/logout-button";
import { Badge } from "@/components/ui/badge";

export async function AdminTopbar() {
  const session = await auth();

  return (
    <div className="luxe-panel aurora-grid rounded-[34px] px-6 py-6 md:px-8">
      <div className="ambient-orb orb-a" />
      <div className="ambient-orb orb-b" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Cerita Kita Admin</p>
          <h1 className="font-display text-4xl text-rose-950 md:text-5xl">Dashboard Admin</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-rose-800/75">
            Kelola kenangan, komentar, pengguna, dan analytics dari satu ruang kerja yang lebih halus, premium, dan profesional.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-[28px] border border-white/55 bg-white/55 px-4 py-3 shadow-[0_18px_36px_rgba(208,148,170,0.12)] backdrop-blur-xl">
          <Badge variant="warning">Admin</Badge>
          <div className="text-right text-sm text-rose-700/80">
            <p className="font-medium text-rose-950">{session?.user?.name}</p>
            <p>{session?.user?.email}</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
