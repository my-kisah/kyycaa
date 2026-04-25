import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ActivityForm } from "@/components/admin/activity-form";

export const dynamic = "force-dynamic";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await prisma.activity.findUnique({ where: { id } });

  if (!activity) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Edit Konten</p>
        <h1 className="mt-2 font-display text-4xl text-rose-950">Perbarui detail cerita</h1>
      </div>
      <ActivityForm
        initialValues={{
          id: activity.id,
          title: activity.title,
          description: activity.description,
          category: activity.category,
          date: new Date(activity.date).toISOString().slice(0, 16),
          tags: activity.tags,
          status: activity.status,
          imageUrl: activity.imageUrl,
        }}
      />
    </div>
  );
}
