import { adminDeleteUserAction } from "@/actions/auth-actions";
import { AdminCreateForm } from "@/components/admin/admin-create-form";
import { UserPasswordResetForm } from "@/components/admin/user-password-reset-form";
import { UserBanForm } from "@/components/admin/user-ban-form";
import { ConfirmDialogButton } from "@/components/ui/confirm-dialog-button";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const users = await prisma.user.findMany({
    where: {
      role: "USER",
    },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      bannedAt: true,
      banReason: true,
      createdAt: true,
      lastLoginAt: true,
      passwordHash: true,
    },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]">
        <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Pengaturan</p>
        <h1 className="mt-2 font-display text-4xl text-rose-950">Konfigurasi sistem admin</h1>
        <div className="mt-6 space-y-4 text-sm leading-8 text-rose-800/82">
          <p>
            Akun admin bootstrap masih bisa ditentukan dari environment variable <code>ADMIN_EMAILS</code>,
            tetapi admin baru juga dapat dibuat langsung dari dashboard ini tanpa register publik.
          </p>
          <p>
            Sistem autentikasi saat ini menggunakan username atau email plus
            password. Password pengguna tidak bisa dilihat kembali karena disimpan
            dalam bentuk hash yang aman.
          </p>
          <p>
            Jika admin perlu membantu user, gunakan reset password di bawah ini
            untuk menetapkan password baru tanpa pernah mengetahui password lama.
          </p>
          <p>
            Password admin maupun user selalu disimpan dalam bentuk hash aman,
            jadi tidak tersedia dalam bentuk plaintext di database aplikasi ini.
          </p>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]">
        <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Akun Admin</p>
        <h2 className="mt-2 font-display text-4xl text-rose-950">Tambah admin baru</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-rose-800/82">
          Buat akun admin langsung dari dashboard tanpa register publik. Password
          akun admin baru akan langsung di-hash aman saat disimpan.
        </p>
        <div className="mt-6">
          <AdminCreateForm />
        </div>
      </section>

      <section
        id="users"
        className="rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]"
      >
        <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Pengguna</p>
        <h2 className="mt-2 font-display text-4xl text-rose-950">Kelola akun user</h2>
        <div className="mt-6 space-y-5">
          {users.map((user) => (
            <div
              key={user.id}
              className="hover-glow rounded-[26px] border border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,251,0.94))] p-5 shadow-[0_18px_40px_rgba(206,140,170,0.1)]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-rose-950">
                    {user.name} (User)
                  </p>
                  <p className="text-sm text-rose-700/80">
                    @{user.username} • {user.email}
                  </p>
                  <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
                    Terdaftar {formatDate(user.createdAt, "dd MMM yyyy, HH:mm")}
                  </p>
                  <p className="text-sm text-rose-700/72">
                    Password tersimpan: {user.passwordHash ? "Ya (hash aman)" : "Tidak"}
                  </p>
                  <p className="text-sm text-rose-700/72">
                    Status akun: {user.bannedAt ? "Dibekukan" : "Aktif"}
                  </p>
                  {user.bannedAt ? (
                    <p className="text-sm text-rose-700/72">
                      Alasan pembekuan: {user.banReason ?? "Tidak ada alasan yang ditulis admin."}
                    </p>
                  ) : null}
                  <p className="text-sm text-rose-700/72">
                    Login terakhir:{" "}
                    {user.lastLoginAt
                      ? formatDate(user.lastLoginAt, "dd MMM yyyy, HH:mm")
                      : "Belum pernah login"}
                  </p>
                </div>
                <div className="w-full md:w-auto">
                  <div className="flex flex-col gap-3">
                    <UserPasswordResetForm userId={user.id} />
                    {user.role !== "ADMIN" ? (
                      <UserBanForm
                        userId={user.id}
                        banned={Boolean(user.bannedAt)}
                        initialReason={user.banReason}
                      />
                    ) : null}
                    {user.role !== "ADMIN" ? (
                      <ConfirmDialogButton
                        title="Hapus akun pengguna?"
                        description={`Akun ${user.name} akan dihapus permanen. Komentar miliknya juga ikut terhapus, dan jumlah komentar pada konten terkait akan diperbarui.`}
                        confirmLabel="Hapus akun"
                        triggerLabel="Hapus akun"
                        action={adminDeleteUserAction}
                        payload={user.id}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
