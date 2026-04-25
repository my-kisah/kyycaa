"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeComment } from "@/lib/sanitize";
import { commentSchema } from "@/lib/validators";

export async function addCommentAction(payload: {
  contentId: string;
  commentText: string;
  slug: string;
}) {
  const session = await auth();

  if (!session?.user) {
    return { error: "Silakan login terlebih dahulu untuk berkomentar." };
  }

  const parsed = commentSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Komentar tidak valid." };
  }

  const cleanText = sanitizeComment(parsed.data.commentText);
  if (!cleanText) {
    return { error: "Komentar tidak boleh kosong." };
  }

  await prisma.comment.create({
    data: {
      contentId: parsed.data.contentId,
      userId: session.user.id,
      userName: session.user.name ?? "Pengguna",
      userPhoto: session.user.image,
      commentText: cleanText,
    },
  });

  await prisma.activity.update({
    where: { id: parsed.data.contentId },
    data: {
      commentsCount: {
        increment: 1,
      },
    },
  });

  revalidatePath(`/memories/${payload.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/comments");

  return { success: "Komentar berhasil ditambahkan." };
}

export async function deleteCommentAction(payload: {
  commentId: string;
  contentId: string;
  slug?: string;
}) {
  const session = await auth();

  if (!session?.user) {
    return { error: "Sesi login tidak ditemukan." };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: payload.commentId },
    include: {
      content: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!comment) {
    return { error: "Komentar tidak ditemukan." };
  }

  const canDelete =
    session.user.role === "ADMIN" || comment.userId === session.user.id;

  if (!canDelete) {
    return { error: "Anda tidak memiliki akses untuk menghapus komentar ini." };
  }

  await prisma.comment.delete({
    where: { id: payload.commentId },
  });

  await prisma.activity.update({
    where: { id: payload.contentId },
    data: {
      commentsCount: {
        decrement: 1,
      },
    },
  });

  const slug = payload.slug ?? comment.content.slug;

  revalidatePath(`/memories/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/comments");

  return { success: "Komentar berhasil dihapus." };
}

export async function deleteCommentByPayloadAction(payload: string) {
  const parsed = JSON.parse(payload) as {
    commentId: string;
    contentId: string;
    slug?: string;
  };

  return deleteCommentAction(parsed);
}
