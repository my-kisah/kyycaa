import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ActivityStatus } from "@prisma/client";
import slugify from "slugify";
import { deleteImage, uploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { authorizeTelegramApi } from "@/lib/telegram-api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function revalidateContentPaths() {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath("/admin/analytics");
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) {
    throw new Error("Format foto tidak valid. Gunakan JPG, PNG, atau WEBP.");
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

async function createUniqueSlug(title: string, currentId: string) {
  const slugBase = slugify(title, { lower: true, strict: true }) || `telegram-${Date.now()}`;
  let slug = slugBase;
  let counter = 1;

  while (
    await prisma.activity.findFirst({
      where: {
        slug,
        NOT: { id: currentId },
      },
      select: { id: true },
    })
  ) {
    counter += 1;
    slug = `${slugBase}-${counter}`;
  }

  return slug;
}

export async function GET(request: Request, context: RouteContext) {
  const authError = authorizeTelegramApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const activity = await prisma.activity.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      description: true,
      imageUrl: true,
      imagePath: true,
      date: true,
      category: true,
      status: true,
      views: true,
      commentsCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!activity) {
    return NextResponse.json({ error: "Konten tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ content: activity });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authError = authorizeTelegramApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "toggle");
  const existing = await prisma.activity.findUnique({
    where: { id },
    select: { id: true, title: true, status: true, imagePath: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Konten tidak ditemukan." }, { status: 404 });
  }

  if (action === "update") {
    const data: Record<string, unknown> = {};

    if (typeof body.title === "string" && body.title.trim().length >= 3) {
      const title = body.title.trim();
      data.title = title;
      data.slug = await createUniqueSlug(title, existing.id);
    }

    if (typeof body.category === "string" && body.category.trim().length >= 2) {
      data.category = body.category.trim();
    }

    if (typeof body.body === "string" && body.body.trim().length >= 1) {
      const description = body.body.trim();
      data.description = description;
      data.excerpt = description.length > 160 ? `${description.slice(0, 157)}...` : description;
    }

    if (typeof body.imageUrl === "string" && /^https?:\/\//i.test(body.imageUrl)) {
      data.imageUrl = body.imageUrl.trim();
      data.imagePath = "";
      await deleteImage(existing.imagePath);
    } else if (typeof body.photo?.dataUrl === "string") {
      const image = parseDataUrl(body.photo.dataUrl);
      const file = new File([image.buffer], "telegram-edit-upload.jpg", {
        type: image.mimeType,
      });
      const uploaded = await uploadImage(file, "cerita-kita/telegram");
      data.imageUrl = uploaded.secure_url;
      data.imagePath = uploaded.public_id;
      await deleteImage(existing.imagePath);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Tidak ada data valid untuk diperbarui." }, { status: 400 });
    }

    const activity = await prisma.activity.update({
      where: { id },
      data,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        description: true,
        imageUrl: true,
        imagePath: true,
        date: true,
        category: true,
        status: true,
        views: true,
        commentsCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    revalidateContentPaths();

    return NextResponse.json({
      success: true,
      content: activity,
    });
  }

  const nextStatus =
    action === "hide"
      ? ActivityStatus.HIDDEN
      : action === "unhide"
        ? ActivityStatus.ACTIVE
        : existing.status === ActivityStatus.ACTIVE
          ? ActivityStatus.HIDDEN
          : ActivityStatus.ACTIVE;

  const activity = await prisma.activity.update({
    where: { id },
    data: { status: nextStatus },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      updatedAt: true,
    },
  });

  revalidateContentPaths();

  return NextResponse.json({
    success: true,
    content: activity,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const authError = authorizeTelegramApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const activity = await prisma.activity.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      imagePath: true,
    },
  });

  if (!activity) {
    return NextResponse.json({ error: "Konten tidak ditemukan." }, { status: 404 });
  }

  await prisma.activity.delete({
    where: { id },
  });
  await deleteImage(activity.imagePath);
  revalidateContentPaths();

  return NextResponse.json({
    success: true,
    deleted: {
      id: activity.id,
      title: activity.title,
    },
  });
}
