"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeComment } from "@/lib/sanitize";
import { commentSchema } from "@/lib/validators";

const ALLOWED_REACTIONS = new Set(["❤️", "👍", "🥺", "🔥"]);

async function refreshCommentSurfaces(slug: string) {
  revalidatePath(`/memories/${slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/comments");
}

export async function addCommentAction(payload: {
  contentId: string;
  commentText: string;
  slug: string;
  parentId?: string;
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

  if (parsed.data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parsed.data.parentId },
      select: { id: true, contentId: true, parentId: true },
    });

    if (!parent || parent.contentId !== parsed.data.contentId) {
      return { error: "Komentar induk tidak ditemukan." };
    }

    if (parent.parentId) {
      return { error: "Balasan hanya bisa satu tingkat agar percakapan tetap rapi." };
    }
  }

  await prisma.comment.create({
    data: {
      contentId: parsed.data.contentId,
      userId: session.user.id,
      parentId: parsed.data.parentId,
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

  await refreshCommentSurfaces(payload.slug);

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

  const descendants = await prisma.comment.findMany({
    where: {
      OR: [{ id: payload.commentId }, { parentId: payload.commentId }],
    },
    select: { id: true },
  });

  await prisma.comment.delete({
    where: { id: payload.commentId },
  });

  await prisma.activity.update({
    where: { id: payload.contentId },
    data: {
      commentsCount: {
        decrement: descendants.length,
      },
    },
  });

  const slug = payload.slug ?? comment.content.slug;

  await refreshCommentSurfaces(slug);

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

export async function toggleCommentReactionAction(payload: {
  commentId: string;
  contentId: string;
  slug: string;
  emoji: string;
}) {
  const session = await auth();

  if (!session?.user) {
    return { error: "Silakan login terlebih dahulu untuk memberikan reaksi." };
  }

  if (!payload.commentId || !payload.contentId || !payload.slug) {
    return { error: "Data reaksi tidak lengkap." };
  }

  if (!ALLOWED_REACTIONS.has(payload.emoji)) {
    return { error: "Reaksi tidak dikenali." };
  }

  const existing = await prisma.commentReaction.findUnique({
    where: {
      commentId_userId_emoji: {
        commentId: payload.commentId,
        userId: session.user.id,
        emoji: payload.emoji,
      },
    },
  });

  if (existing) {
    await prisma.commentReaction.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.commentReaction.create({
      data: {
        commentId: payload.commentId,
        userId: session.user.id,
        emoji: payload.emoji,
      },
    });
  }

  await refreshCommentSurfaces(payload.slug);

  return {
    success: existing ? "Reaksi dihapus." : "Reaksi ditambahkan.",
  };
}
