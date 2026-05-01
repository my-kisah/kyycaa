import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeTelegramApi } from "@/lib/telegram-api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = authorizeTelegramApi(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 5), 1), 20);

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      content: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return NextResponse.json({
    comments: comments.map((comment) => ({
      id: comment.id,
      storyTitle: comment.content.title,
      storySlug: comment.content.slug,
      name: comment.userName,
      body: comment.commentText,
      createdAt: comment.createdAt,
    })),
  });
}
