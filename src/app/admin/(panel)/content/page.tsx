import Link from "next/link";
import { deleteActivityAction, toggleActivityVisibilityAction } from "@/actions/activity-actions";
import { ActivityCard } from "@/components/memories/activity-card";
import { ConfirmDialogButton } from "@/components/ui/confirm-dialog-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminActivityList } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: "all" | "ACTIVE" | "HIDDEN" }>;
}) {
  const params = await searchParams;
  const activities = await getAdminActivityList(params.status ?? "all");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Kelola Konten</p>
          <h1 className="mt-2 font-display text-4xl text-rose-950">Semua konten romantis</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/content?status=all">
            <Button variant={params.status === "all" || !params.status ? "primary" : "secondary"}>
              Semua
            </Button>
          </Link>
          <Link href="/admin/content?status=ACTIVE">
            <Button variant={params.status === "ACTIVE" ? "primary" : "secondary"}>
              Active
            </Button>
          </Link>
          <Link href="/admin/content?status=HIDDEN">
            <Button variant={params.status === "HIDDEN" ? "primary" : "secondary"}>
              Hidden
            </Button>
          </Link>
          <Link href="/admin/content/new">
            <Button>Tambah Konten</Button>
          </Link>
        </div>
      </div>

      {activities.length ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {activities.map((activity) => (
            <div key={activity.id} className="space-y-4">
              <ActivityCard activity={activity} adminMode />
              <div className="flex flex-wrap gap-3">
                <Link href={`/admin/content/${activity.id}/edit`}>
                  <Button variant="secondary">Edit</Button>
                </Link>
                <ConfirmDialogButton
                  title={activity.status === "ACTIVE" ? "Sembunyikan konten?" : "Tampilkan konten?"}
                  description="Perubahan ini akan langsung memengaruhi daftar konten yang terlihat oleh user."
                  confirmLabel={activity.status === "ACTIVE" ? "Sembunyikan" : "Tampilkan"}
                  triggerLabel={activity.status === "ACTIVE" ? "Sembunyikan" : "Tampilkan"}
                  variant="secondary"
                  action={toggleActivityVisibilityAction}
                  payload={activity.id}
                />
                <ConfirmDialogButton
                  title="Hapus konten ini?"
                  description="Konten dan komentar terkait akan dihapus secara permanen."
                  confirmLabel="Hapus permanen"
                  triggerLabel="Hapus"
                  action={deleteActivityAction}
                  payload={activity.id}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum ada konten"
          description="Tambahkan konten pertama Anda dari halaman Tambah Konten agar dashboard user mulai terisi."
        />
      )}
    </div>
  );
}
