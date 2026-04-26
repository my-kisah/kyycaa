"use server";

import { revalidatePath } from "next/cache";
import { ActivityStatus } from "@prisma/client";
import slugify from "slugify";
import { auth } from "@/auth";
import { deleteImage, uploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/utils";
import { activitySchema, validateImageFile, validateImageUrl } from "@/lib/validators";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Akses admin ditolak.");
  }

  return session.user;
}

export async function saveActivityAction(formData: FormData) {
  try {
    const admin = await requireAdmin();

    const raw = {
      id: String(formData.get("id") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      date: String(formData.get("date") ?? ""),
      category: String(formData.get("category") ?? ""),
      tags: String(formData.get("tags") ?? ""),
      status: String(formData.get("status") ?? "ACTIVE"),
      externalImageUrl: String(formData.get("imageUrl") ?? "").trim(),
    };

    const parsed = activitySchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Data konten tidak valid." };
    }

    const file = formData.get("image") as File | null;
    const fileError = validateImageFile(file);
    if (fileError) {
      return { error: fileError };
    }

    const externalImageUrl = raw.externalImageUrl;
    const imageUrlError = validateImageUrl(externalImageUrl);
    if (imageUrlError) {
      return { error: imageUrlError };
    }

    const activityId = parsed.data.id || undefined;
    const existing = activityId
      ? await prisma.activity.findUnique({ where: { id: activityId } })
      : null;

    if (!existing && (!file || file.size === 0) && !externalImageUrl) {
      return { error: "Pilih upload file atau isi link gambar untuk konten baru." };
    }

    let imageUrl = existing?.imageUrl;
    let imagePath = existing?.imagePath;

    if (externalImageUrl) {
      imageUrl = externalImageUrl;

      if (existing?.imagePath) {
        await deleteImage(existing.imagePath);
      }

      imagePath = "";
    } else if (file && file.size > 0) {
      const uploaded = await uploadImage(file);
      imageUrl = uploaded.secure_url;
      imagePath = uploaded.public_id;

      if (existing?.imagePath) {
        await deleteImage(existing.imagePath);
      }
    }

    const slugBase = slugify(parsed.data.title, { lower: true, strict: true });
    let slug = slugBase;

    if (!existing || existing.slug !== slugBase) {
      let counter = 1;
      while (
        await prisma.activity.findFirst({
          where: {
            slug,
            ...(existing ? { NOT: { id: existing.id } } : {}),
          },
          select: { id: true },
        })
      ) {
        counter += 1;
        slug = `${slugBase}-${counter}`;
      }
    }

    const excerpt =
      parsed.data.description.length > 160
        ? `${parsed.data.description.slice(0, 157)}...`
        : parsed.data.description;

    const data = {
      title: parsed.data.title,
      slug,
      excerpt,
      description: parsed.data.description,
      imageUrl: imageUrl ?? "",
      imagePath: imagePath ?? "",
      date: new Date(parsed.data.date),
      category: parsed.data.category,
      tags: parseTags(parsed.data.tags),
      status: parsed.data.status as ActivityStatus,
    };

    if (existing) {
      await prisma.activity.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.activity.create({
        data: {
          ...data,
          createdById: admin.id,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/content");
    revalidatePath("/admin/analytics");

    return { success: existing ? "Konten berhasil diperbarui." : "Konten berhasil dipublikasikan." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan konten.";
    return { error: message };
  }
}

export async function toggleActivityVisibilityAction(id: string) {
  try {
    await requireAdmin();

    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!activity) {
      return { error: "Konten tidak ditemukan." };
    }

    await prisma.activity.update({
      where: { id },
      data: {
        status:
          activity.status === ActivityStatus.ACTIVE
            ? ActivityStatus.HIDDEN
            : ActivityStatus.ACTIVE,
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/content");
    revalidatePath("/admin/analytics");

    return { success: "Status konten berhasil diperbarui." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Gagal mengubah status konten.",
    };
  }
}

export async function deleteActivityAction(id: string) {
  try {
    const admin = await requireAdmin();
    void admin;

    const activity = await prisma.activity.findUnique({
      where: { id },
      select: {
        imagePath: true,
        slug: true,
      },
    });

    if (!activity) {
      return { error: "Konten tidak ditemukan." };
    }

    await prisma.activity.delete({
      where: { id },
    });

    await deleteImage(activity.imagePath);

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/content");
    revalidatePath("/admin/analytics");

    return { success: "Konten berhasil dihapus." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Gagal menghapus konten.",
    };
  }
}
