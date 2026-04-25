import { ActivityForm } from "@/components/admin/activity-form";

export const dynamic = "force-dynamic";

export default function NewActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Tambah Konten</p>
        <h1 className="mt-2 font-display text-4xl text-rose-950">Publikasikan kenangan baru</h1>
      </div>
      <ActivityForm />
    </div>
  );
}
