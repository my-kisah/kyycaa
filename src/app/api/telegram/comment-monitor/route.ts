import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MonitorState = {
  lastCommentId?: string;
  initialized?: boolean;
};

function token() {
  const value = process.env.TELEGRAM_BOT_TOKEN;
  if (!value) throw new Error("TELEGRAM_BOT_TOKEN belum dikonfigurasi.");
  return value;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendAdminMessage(text: string) {
  const adminId = process.env.TELEGRAM_ADMIN_ID;
  if (!adminId) throw new Error("TELEGRAM_ADMIN_ID belum dikonfigurasi.");

  await fetch(`https://api.telegram.org/bot${token()}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: adminId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
}

async function loadState(): Promise<MonitorState> {
  const record = await prisma.telegramBotSession.findUnique({
    where: { chatId: "comment-monitor" },
  });

  if (!record) return {};

  try {
    return JSON.parse(record.data);
  } catch {
    return {};
  }
}

async function saveState(state: MonitorState) {
  await prisma.telegramBotSession.upsert({
    where: { chatId: "comment-monitor" },
    update: { data: JSON.stringify(state) },
    create: { chatId: "comment-monitor", data: JSON.stringify(state) },
  });
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  const latest = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      content: { select: { title: true, slug: true } },
    },
  });

  const newest = latest[0];
  if (!newest) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const state = await loadState();
  if (!state.initialized) {
    await saveState({ initialized: true, lastCommentId: newest.id });
    return NextResponse.json({ ok: true, initialized: true, sent: 0 });
  }

  const newComments = [];
  for (const comment of latest) {
    if (comment.id === state.lastCommentId) break;
    newComments.push(comment);
  }

  for (const comment of newComments.reverse()) {
    await sendAdminMessage(
      [
        "<b>Komentar Baru</b>",
        `Cerita: ${escapeHtml(comment.content.title)}`,
        `Nama: ${escapeHtml(comment.userName)}`,
        `Komentar: ${escapeHtml(comment.commentText)}`,
        `Waktu: ${escapeHtml(comment.createdAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }))}`,
        comment.content.slug ? `URL: ${escapeHtml(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/memories/${comment.content.slug}`)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  await saveState({ initialized: true, lastCommentId: newest.id });
  return NextResponse.json({ ok: true, sent: newComments.length });
}
