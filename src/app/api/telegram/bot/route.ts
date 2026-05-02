import { NextResponse } from "next/server";
import os from "node:os";
import { ActivityStatus, Role } from "@prisma/client";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { deleteImage, uploadImage } from "@/lib/cloudinary";
import { parseTags } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramMessage = {
  message_id: number;
  chat: { id: number | string };
  from?: { id: number; first_name?: string };
  text?: string;
  photo?: Array<{ file_id: string; file_unique_id: string; width: number; height: number }>;
};

type TelegramCallbackQuery = {
  id: string;
  from: { id: number };
  data?: string;
  message?: TelegramMessage & { caption?: string };
};

type TelegramUpdate = {
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

type BotSession = {
  trackedMessageIds: number[];
  flow?: {
    type: "add" | "edit";
    step: "title" | "category" | "dateYear" | "dateMonth" | "dateDay" | "dateHour" | "photo" | "body" | "preview" | "editField";
    data: Record<string, unknown>;
  } | null;
  drafts: Array<{
    id: number;
    title: string;
    category: string;
    body: string;
    photo: Record<string, unknown>;
    date?: string;
    createdAt: string;
  }>;
  lastDraftId: number;
};

const menuFeatures = [
  { number: 1, label: "Status Website", action: "menu:status" },
  { number: 2, label: "Ping / Speed Test", action: "menu:ping" },
  { number: 3, label: "Komentar", action: "menu:comments" },
  { number: 4, label: "Tambah Konten", action: "menu:add" },
  { number: 5, label: "Draft", action: "menu:drafts" },
  { number: 6, label: "Publish Draft", action: "menu:publish_drafts" },
  { number: 7, label: "Kelola Konten", action: "menu:manage" },
  { number: 8, label: "Database", action: "menu:database" },
  { number: 9, label: "Help", action: "menu:help" },
];

const menuRows = [
  menuFeatures.slice(0, 3).map((feature) => ({
    text: String(feature.number),
    callback_data: `menu:number:${feature.number}`,
  })),
  menuFeatures.slice(3, 6).map((feature) => ({
    text: String(feature.number),
    callback_data: `menu:number:${feature.number}`,
  })),
  menuFeatures.slice(6, 9).map((feature) => ({
    text: String(feature.number),
    callback_data: `menu:number:${feature.number}`,
  })),
];

const backToMenuRows = [[{ text: "Kembali ke List Menu", callback_data: "menu:home" }]];

function token() {
  const value = process.env.TELEGRAM_BOT_TOKEN;
  if (!value) throw new Error("TELEGRAM_BOT_TOKEN belum dikonfigurasi.");
  return value;
}

function apiUrl(method: string) {
  return `https://api.telegram.org/bot${token()}/${method}`;
}

function defaultSession(): BotSession {
  return {
    trackedMessageIds: [],
    flow: null,
    drafts: [],
    lastDraftId: 0,
  };
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function truncate(value: string, length = 420) {
  return value.length > length ? `${value.slice(0, length - 3)}...` : value;
}

function formatDuration(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days ? `${days} hari ` : ""}${hours} jam ${minutes} menit`;
}

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unit]}`;
}

async function getDatabaseStorageInfo() {
  const sizeResult = await prisma.$queryRawUnsafe<Array<{ size: bigint }>>("select pg_database_size(current_database()) as size").catch(() => []);
  const sizeBytes = Number(sizeResult[0]?.size ?? 0);
  const limitMb = Number(process.env.DATABASE_STORAGE_LIMIT_MB || 500);
  const limitBytes = limitMb * 1024 * 1024;
  const usagePercent = limitBytes > 0 ? (sizeBytes / limitBytes) * 100 : 0;

  return {
    sizeBytes,
    limitMb,
    usagePercent,
  };
}

async function timed<T>(task: () => Promise<T>) {
  const started = Date.now();
  const result = await task();
  return {
    result,
    ms: Date.now() - started,
  };
}

async function telegram(method: string, payload: Record<string, unknown>) {
  const response = await fetch(apiUrl(method), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.description ?? `Telegram ${method} gagal.`);
  }

  return data.result;
}

async function telegramForm(method: string, formData: FormData) {
  const response = await fetch(apiUrl(method), {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.description ?? `Telegram ${method} gagal.`);
  }

  return data.result;
}

async function safeTelegram(method: string, payload: Record<string, unknown>) {
  try {
    return await telegram(method, payload);
  } catch {
    return null;
  }
}

async function loadSession(chatId: string): Promise<BotSession> {
  const record = await prisma.telegramBotSession.findUnique({ where: { chatId } });
  if (!record) return defaultSession();

  try {
    return { ...defaultSession(), ...JSON.parse(record.data) };
  } catch {
    return defaultSession();
  }
}

async function saveSession(chatId: string, session: BotSession) {
  await prisma.telegramBotSession.upsert({
    where: { chatId },
    update: { data: JSON.stringify(session) },
    create: { chatId, data: JSON.stringify(session) },
  });
}

function track(session: BotSession, message: { message_id?: number } | null) {
  if (!message?.message_id) return;
  session.trackedMessageIds = [...new Set([...session.trackedMessageIds, message.message_id])].slice(-40);
}

async function deleteTracked(chatId: string, session: BotSession, except?: number) {
  const ids = [...new Set(session.trackedMessageIds)].filter((id) => id !== except);
  session.trackedMessageIds = except ? [except] : [];

  for (const id of ids) {
    await safeTelegram("deleteMessage", { chat_id: chatId, message_id: id });
  }
}

async function animateAndDelete(chatId: string, messageId?: number) {
  if (!messageId) return;

  await safeTelegram("editMessageReplyMarkup", {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: { inline_keyboard: [] },
  });

  const frames = [
    "Mengganti tampilan...\n\n[##########] 100%",
    "Menghapus panel lama...\n\n[#######---] 70%",
    "Panel lama mulai hilang...\n\n[####------] 40%",
    "Hampir bersih...\n\n[#---------] 10%",
  ];

  for (const text of frames) {
    await safeTelegram("editMessageCaption", { chat_id: chatId, message_id: messageId, caption: text });
    await safeTelegram("editMessageText", { chat_id: chatId, message_id: messageId, text });
    await new Promise((resolve) => setTimeout(resolve, 160));
  }

  await safeTelegram("deleteMessage", { chat_id: chatId, message_id: messageId });
}

function keyboard(rows: Array<Array<{ text: string; callback_data: string }>>) {
  return { reply_markup: { inline_keyboard: rows } };
}

function chunkRows<T>(items: T[], size: number, map: (item: T) => { text: string; callback_data: string }) {
  const rows: Array<Array<{ text: string; callback_data: string }>> = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size).map(map));
  }
  return rows;
}

function dateParts(flow: NonNullable<BotSession["flow"]>) {
  const parts = (flow.data.dateParts ?? {}) as Record<string, number>;
  return parts;
}

function selectedDateText(parts: Record<string, number>) {
  const year = parts.year ? String(parts.year) : "----";
  const month = parts.month ? String(parts.month).padStart(2, "0") : "--";
  const day = parts.day ? String(parts.day).padStart(2, "0") : "--";
  const hour = parts.hour !== undefined ? String(parts.hour).padStart(2, "0") : "--";
  return `${year}-${month}-${day} ${hour}:00 WIB`;
}

function buildSelectedDate(parts: Record<string, number>) {
  if (!parts.year || !parts.month || !parts.day || parts.hour === undefined) return null;
  return new Date(`${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}T${String(parts.hour).padStart(2, "0")}:00:00+07:00`);
}

function dateKeyboard(step: "dateYear" | "dateMonth" | "dateDay" | "dateHour", flow: NonNullable<BotSession["flow"]>) {
  const parts = dateParts(flow);
  const now = new Date();
  const currentYear = now.getFullYear();

  if (step === "dateYear") {
    return keyboard(chunkRows(Array.from({ length: currentYear - 2021 + 1 }, (_, index) => 2021 + index), 3, (year) => ({
      text: String(year),
      callback_data: `date:year:${year}`,
    })));
  }

  if (step === "dateMonth") {
    return keyboard(chunkRows(Array.from({ length: 12 }, (_, index) => index + 1), 4, (month) => ({
      text: String(month).padStart(2, "0"),
      callback_data: `date:month:${month}`,
    })));
  }

  if (step === "dateDay") {
    const days = new Date(parts.year, parts.month, 0).getDate();
    return keyboard(chunkRows(Array.from({ length: days }, (_, index) => index + 1), 7, (day) => ({
      text: String(day).padStart(2, "0"),
      callback_data: `date:day:${day}`,
    })));
  }

  return keyboard(chunkRows(Array.from({ length: 24 }, (_, index) => index), 6, (hour) => ({
    text: `${String(hour).padStart(2, "0")}:00`,
    callback_data: `date:hour:${hour}`,
  })));
}

async function askDatePart(chatId: string, session: BotSession, step: "dateYear" | "dateMonth" | "dateDay" | "dateHour") {
  const flow = session.flow;
  if (!flow) return;

  const labels = {
    dateYear: "Pilih tahun konten:",
    dateMonth: "Pilih bulan konten:",
    dateDay: "Pilih tanggal konten:",
    dateHour: "Pilih jam konten:",
  };

  flow.step = step;
  await sendMessage(chatId, session, [
    `<b>${labels[step]}</b>`,
    `Tanggal sementara: ${escapeHtml(selectedDateText(dateParts(flow)))}`,
  ].join("\n"), dateKeyboard(step, flow));
}

function menuActionFromNumber(value: string) {
  const feature = menuFeatures.find((item) => String(item.number) === value.trim());
  return feature?.action ?? null;
}

function normalizeMenuAction(data: string) {
  if (!data.startsWith("menu:number:")) return data;
  return menuActionFromNumber(data.split(":")[2] ?? "") ?? data;
}

async function sendMessage(chatId: string, session: BotSession, text: string, extra = {}) {
  const message = await telegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
  track(session, message);
}

function dataImageToBlob(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) return null;

  const extension = match[1].split("/")[1].replace("jpeg", "jpg");
  return {
    blob: new Blob([Buffer.from(match[2], "base64")], { type: match[1] }),
    filename: `content-preview.${extension}`,
  };
}

async function sendPhoto(chatId: string, session: BotSession, photo: string, caption: string, extra = {}) {
  const normalizedPhoto = String(photo || "").trim();
  const finalCaption = truncate(caption, 950);

  try {
    if (normalizedPhoto.startsWith("data:image/")) {
      const input = dataImageToBlob(normalizedPhoto);
      if (!input) throw new Error("Format data image tidak valid.");

      const formData = new FormData();
      formData.set("chat_id", chatId);
      formData.set("photo", input.blob, input.filename);
      formData.set("caption", finalCaption);
      formData.set("parse_mode", "HTML");
      Object.entries(extra as Record<string, unknown>).forEach(([key, value]) => {
        formData.set(key, typeof value === "string" ? value : JSON.stringify(value));
      });

      const message = await telegramForm("sendPhoto", formData);
      track(session, message);
      return;
    }

    if (!normalizedPhoto) {
      throw new Error("Foto kosong.");
    }

    const message = await telegram("sendPhoto", {
      chat_id: chatId,
      photo: normalizedPhoto,
      caption: finalCaption,
      parse_mode: "HTML",
      ...extra,
    });
    track(session, message);
  } catch {
    await sendMessage(chatId, session, caption, extra);
  }
}

function menuText() {
  const lines = menuFeatures.map((feature) => {
    const number = String(feature.number).padStart(2, " ");
    return `| ${number} | ${feature.label}`;
  });

  return [
    "<b>DEPOIZON ADMIN</b>",
    "Saya depoizon asisten monitoring yang siap untuk membantu kamu.",
    "",
    "<pre>",
    "+----[ MENU FITUR ]----+",
    "| Page 1/1 - Total 9   |",
    "+----------------------+",
    ...lines,
    "+----------------------+",
    "</pre>",
    "<i>Pilih nomor fitur lewat tombol di bawah.</i>",
  ].join("\n");
}

async function sendMenu(
  chatId: string,
  session: BotSession,
  origin: string,
  caption?: string,
  rows?: Array<Array<{ text: string; callback_data: string }>>,
) {
  const finalCaption = caption ?? menuText();
  const finalRows = rows ?? (caption ? backToMenuRows : menuRows);

  await sendPhoto(chatId, session, `${origin}/depoizon-menu.jpg`, finalCaption, keyboard(finalRows));
}

function isAdmin(update: TelegramUpdate) {
  const id = update.message?.from?.id ?? update.callback_query?.from.id;
  return id && String(id) === String(process.env.TELEGRAM_ADMIN_ID);
}

function chatIdFrom(update: TelegramUpdate) {
  return String(update.message?.chat.id ?? update.callback_query?.message?.chat.id ?? "");
}

function incomingMessageId(update: TelegramUpdate) {
  return update.message?.message_id ?? update.callback_query?.message?.message_id;
}

async function resolveAdminUser() {
  const configuredEmail = process.env.TELEGRAM_ADMIN_EMAIL?.toLowerCase();
  if (configuredEmail) {
    const user = await prisma.user.findUnique({ where: { email: configuredEmail }, select: { id: true } });
    if (user) return user;
  }
  return prisma.user.findFirst({ where: { role: Role.ADMIN }, orderBy: { createdAt: "asc" }, select: { id: true } });
}

async function createUniqueSlug(title: string, currentId?: string) {
  const slugBase = slugify(title, { lower: true, strict: true }) || `telegram-${Date.now()}`;
  let slug = slugBase;
  let counter = 1;

  while (
    await prisma.activity.findFirst({
      where: { slug, ...(currentId ? { NOT: { id: currentId } } : {}) },
      select: { id: true },
    })
  ) {
    counter += 1;
    slug = `${slugBase}-${counter}`;
  }

  return slug;
}

async function telegramPhotoToDataUrl(fileId: string) {
  const file = await telegram("getFile", { file_id: fileId });
  const filePath = file?.file_path;
  if (!filePath) throw new Error("Gagal membaca file foto Telegram.");

  const response = await fetch(`https://api.telegram.org/file/bot${token()}/${filePath}`);
  const arrayBuffer = await response.arrayBuffer();
  const mime = response.headers.get("content-type")?.startsWith("image/")
    ? response.headers.get("content-type")
    : "image/jpeg";

  return {
    mimeType: mime ?? "image/jpeg",
    buffer: Buffer.from(arrayBuffer),
  };
}

async function resolveImage(photo: Record<string, unknown>) {
  if (photo.source === "url" && typeof photo.url === "string") {
    return { imageUrl: photo.url, imagePath: "" };
  }

  if (typeof photo.fileId !== "string") {
    throw new Error("Foto konten belum valid.");
  }

  const image = await telegramPhotoToDataUrl(photo.fileId);
  const file = new File([image.buffer], "telegram-upload.jpg", { type: image.mimeType });
  const uploaded = await uploadImage(file, "cerita-kita/telegram");
  return { imageUrl: uploaded.secure_url, imagePath: uploaded.public_id };
}

async function publishContent(data: Record<string, unknown>) {
  const admin = await resolveAdminUser();
  if (!admin) throw new Error("Akun admin website belum ditemukan.");

  const title = String(data.title ?? "").trim();
  const category = String(data.category ?? "").trim();
  const body = String(data.body ?? "").trim();
  const photo = data.photo as Record<string, unknown>;
  const date = data.date ? new Date(String(data.date)) : new Date();
  const image = await resolveImage(photo);
  const slug = await createUniqueSlug(title);
  const excerpt = body.length > 160 ? `${body.slice(0, 157)}...` : body;

  return prisma.activity.create({
    data: {
      title,
      slug,
      excerpt,
      description: body,
      ...image,
      date,
      category,
      tags: parseTags("telegram"),
      status: ActivityStatus.ACTIVE,
      createdById: admin.id,
    },
  });
}

async function updateContent(id: string, updates: Record<string, unknown>) {
  const existing = await prisma.activity.findUnique({ where: { id } });
  if (!existing) throw new Error("Konten tidak ditemukan.");

  const data: Record<string, unknown> = {};
  if (typeof updates.title === "string") {
    data.title = updates.title.trim();
    data.slug = await createUniqueSlug(updates.title.trim(), id);
  }
  if (typeof updates.category === "string") data.category = updates.category.trim();
  if (typeof updates.date === "string") data.date = new Date(updates.date);
  if (typeof updates.body === "string") {
    const body = updates.body.trim();
    data.description = body;
    data.excerpt = body.length > 160 ? `${body.slice(0, 157)}...` : body;
  }
  if (updates.photo) {
    const image = await resolveImage(updates.photo as Record<string, unknown>);
    Object.assign(data, image);
    await deleteImage(existing.imagePath);
  }

  return prisma.activity.update({ where: { id }, data });
}

function contentCaption(content: {
  title: string;
  category: string;
  description?: string;
  excerpt?: string;
  status?: string;
  views?: number;
  commentsCount?: number;
  slug?: string;
  date?: Date;
}) {
  return [
    "<b>Preview Konten Website</b>",
    "",
    `# ${escapeHtml(content.category)}`,
    `<b>${escapeHtml(content.title)}</b>`,
    escapeHtml(truncate(content.excerpt || content.description || "", 420)),
    "",
    `<b>Status:</b> ${content.status === "ACTIVE" ? "Aktif" : "Hidden/Arsip"}`,
    content.date ? `<b>Tanggal:</b> ${escapeHtml(content.date.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }))}` : "",
    `<b>Statistik:</b> ${content.views ?? 0} views | ${content.commentsCount ?? 0} komentar`,
    content.slug ? `<b>URL:</b> /memories/${escapeHtml(content.slug)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function showStatus(chatId: string, session: BotSession, origin: string) {
  const { result: response, ms } = await timed(() => fetch(origin, { cache: "no-store" }));
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const load = os.loadavg()[0] ?? 0;
  const cpuCount = os.cpus().length || 1;
  const databaseStorage = await getDatabaseStorageInfo();

  await sendMenu(chatId, session, origin, [
    "<b>Status Website</b>",
    `URL: ${escapeHtml(origin)}`,
    `Status: ${response.ok ? "ONLINE" : "BERMASALAH"}`,
    `HTTP: ${response.status}`,
    `Response time: ${ms} ms`,
    "",
    "<b>Server Bot</b>",
    `Uptime OS: ${formatDuration(os.uptime())}`,
    `Uptime proses: ${formatDuration(process.uptime())}`,
    `RAM: ${formatBytes(usedMemory)} / ${formatBytes(totalMemory)} terpakai`,
    `CPU: ${cpuCount} core, load ${load.toFixed(2)}`,
    `Storage database: ${formatBytes(databaseStorage.sizeBytes)} / ${databaseStorage.limitMb} MB terpakai`,
    `Pemakaian storage: ${databaseStorage.usagePercent.toFixed(2)}%`,
    "Storage server: dikelola Vercel",
  ].join("\n"));
}

async function showSpeedTest(chatId: string, session: BotSession, origin: string) {
  const website = await timed(() => fetch(origin, { cache: "no-store" }));
  const database = await timed(() => prisma.$queryRawUnsafe("select 1"));
  const telegramApi = await timed(() => telegram("getMe", {}));
  const download = await timed(async () => {
    const response = await fetch(`${origin}/depoizon-menu.jpg?speed=${Date.now()}`, { cache: "no-store" });
    return response.arrayBuffer();
  });
  const bytes = download.result.byteLength;
  const mbps = download.ms > 0 ? (bytes * 8) / (download.ms / 1000) / 1_000_000 : 0;

  await sendMenu(chatId, session, origin, [
    "<b>Speed Test Bot</b>",
    "",
    `Website latency: ${website.ms} ms`,
    `Telegram API latency: ${telegramApi.ms} ms`,
    `Database latency: ${database.ms} ms`,
    `Download test: ${formatBytes(bytes)} dalam ${download.ms} ms`,
    `Estimasi speed: ${mbps.toFixed(2)} Mbps`,
    "",
    `Status: ${website.result.ok ? "ONLINE" : "BERMASALAH"}`,
  ].join("\n"));
}

async function showDatabase(chatId: string, session: BotSession, origin: string) {
  const databaseStorage = await getDatabaseStorageInfo();
  const [totalContents, activeContents, hiddenContents, comments, users, admins, views] = await Promise.all([
    prisma.activity.count(),
    prisma.activity.count({ where: { status: ActivityStatus.ACTIVE } }),
    prisma.activity.count({ where: { status: ActivityStatus.HIDDEN } }),
    prisma.comment.count(),
    prisma.user.count({ where: { role: Role.USER } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.view.count(),
  ]);

  await sendMenu(chatId, session, origin, [
    "<b>Status Database</b>",
    "",
    "Provider: postgresql",
    `Storage terpakai: ${formatBytes(databaseStorage.sizeBytes)}`,
    `Limit maksimal: ${databaseStorage.limitMb} MB`,
    `Pemakaian: ${databaseStorage.usagePercent.toFixed(2)}%`,
    `Total konten: ${totalContents}`,
    `Konten aktif: ${activeContents}`,
    `Konten hidden/arsip: ${hiddenContents}`,
    `Komentar: ${comments}`,
    `User: ${users}`,
    `Admin: ${admins}`,
    `Views tercatat: ${views}`,
  ].join("\n"));
}

async function showComments(chatId: string, session: BotSession, origin: string) {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { content: { select: { title: true } } },
  });

  if (!comments.length) {
    await sendMenu(chatId, session, origin, "<b>Komentar</b>\nBelum ada komentar terbaru.");
    return;
  }

  await sendMenu(chatId, session, origin, [
    "<b>Komentar Terbaru</b>",
    "",
    ...comments.map((comment, index) =>
      [
        `${index + 1}. ${escapeHtml(comment.content.title)}`,
        `Nama: ${escapeHtml(comment.userName)}`,
        `Komentar: ${escapeHtml(truncate(comment.commentText, 120))}`,
      ].join("\n"),
    ),
  ].join("\n\n"));
}

async function showManage(chatId: string, session: BotSession) {
  const contents = await prisma.activity.findMany({ orderBy: { createdAt: "desc" }, take: 8 });
  if (!contents.length) {
    await sendMessage(chatId, session, "<b>Kelola Konten</b>\nBelum ada konten.", keyboard(menuRows));
    return;
  }

  const rows = contents.map((content, index) => [
    {
      text: `${index + 1}. ${content.status === "ACTIVE" ? "Aktif" : "Hidden"} - ${content.title.slice(0, 22)}`,
      callback_data: `content:view:${content.id}`,
    },
  ]);
  rows.push([{ text: "Kembali ke Menu", callback_data: "menu:home" }]);
  await sendPhoto(chatId, session, contents[0].imageUrl, contentCaption({
    ...contents[0],
    title: "Daftar Konten Website",
    category: "Admin",
    excerpt: "Pilih konten dari tombol di bawah untuk melihat preview, edit, hide/unhide, atau hapus.",
  }), keyboard(rows));
}

async function showContent(chatId: string, session: BotSession, id: string) {
  const content = await prisma.activity.findUnique({ where: { id } });
  if (!content) {
    await sendMessage(chatId, session, "Konten tidak ditemukan.", keyboard(menuRows));
    return;
  }

  await sendPhoto(chatId, session, content.imageUrl, contentCaption(content), keyboard([
    [{ text: content.status === "ACTIVE" ? "Hide / Arsipkan" : "Unhide / Tampilkan", callback_data: `content:toggle:${content.id}` }],
    [{ text: "Edit Konten", callback_data: `content:edit:${content.id}` }],
    [{ text: "Hapus Konten", callback_data: `content:delete_confirm:${content.id}` }],
    [
      { text: "Daftar Konten", callback_data: "menu:manage" },
      { text: "Menu Utama", callback_data: "menu:home" },
    ],
  ]));
}

async function handleAddText(chatId: string, session: BotSession, text: string) {
  const flow = session.flow;
  if (!flow || flow.type !== "add") return false;

  if (flow.step === "title") {
    flow.data.title = text;
    flow.step = "category";
    await sendMessage(chatId, session, "Masukkan katalog/kategori konten:");
    return true;
  }
  if (flow.step === "category") {
    flow.data.category = text;
    flow.data.dateParts = {};
    await askDatePart(chatId, session, "dateYear");
    return true;
  }
  if (["dateYear", "dateMonth", "dateDay", "dateHour"].includes(flow.step)) {
    await sendMessage(chatId, session, "Pilih tanggal dan jam menggunakan tombol yang tersedia.");
    return true;
  }
  if (flow.step === "photo") {
    if (!/^https?:\/\//i.test(text)) {
      await sendMessage(chatId, session, "Kirim foto atau link gambar valid yang diawali http/https.");
      return true;
    }
    flow.data.photo = { source: "url", url: text };
    flow.step = "body";
    await sendPhoto(chatId, session, text, "<b>Foto dari link diterima.</b>\nSekarang masukkan isi konten:");
    return true;
  }
  if (flow.step === "body") {
    flow.data.body = text;
    flow.step = "preview";
    const photo = flow.data.photo as Record<string, string>;
    await sendPhoto(chatId, session, photo.url || String(photo.fileId), [
      "<b>Preview Konten Website</b>",
      "",
      `# ${escapeHtml(flow.data.category)}`,
      `<b>${escapeHtml(flow.data.title)}</b>`,
      `Tanggal: ${escapeHtml(new Date(String(flow.data.date)).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }))}`,
      escapeHtml(truncate(text, 650)),
      "",
      "Pilih aksi di bawah:",
    ].join("\n"), keyboard([
      [
        { text: "Simpan Draft", callback_data: "add:save_draft" },
        { text: "Publish Sekarang", callback_data: "add:publish" },
      ],
      [{ text: "Batal", callback_data: "menu:cancel" }],
    ]));
    return true;
  }

  return false;
}

async function handleEditInput(chatId: string, session: BotSession, text?: string, photo?: TelegramMessage["photo"]) {
  const flow = session.flow;
  if (!flow || flow.type !== "edit") return false;
  const contentId = String(flow.data.contentId);
  const field = String(flow.data.field);

  if (field === "photo") {
    const best = photo?.at(-1);
    const newPhoto = best
      ? { source: "telegram", fileId: best.file_id }
      : text && /^https?:\/\//i.test(text)
        ? { source: "url", url: text }
        : null;

    if (!newPhoto) {
      await sendMessage(chatId, session, "Kirim foto upload Telegram atau link gambar valid http/https.");
      return true;
    }
    const content = await updateContent(contentId, { photo: newPhoto });
    session.flow = null;
    await showContent(chatId, session, content.id);
    return true;
  }

  if (field === "date") {
    await sendMessage(chatId, session, "Pilih tanggal dan jam menggunakan tombol yang tersedia.");
    return true;
  }

  if (!text) return false;
  const content = await updateContent(contentId, { [field === "body" ? "body" : field]: text });
  session.flow = null;
  await showContent(chatId, session, content.id);
  return true;
}

async function handleCallback(chatId: string, session: BotSession, callback: TelegramCallbackQuery, origin: string) {
  const data = normalizeMenuAction(callback.data ?? "");
  await safeTelegram("answerCallbackQuery", { callback_query_id: callback.id });
  await animateAndDelete(chatId, callback.message?.message_id);
  await deleteTracked(chatId, session, callback.message?.message_id);

  if (data.startsWith("date:")) {
    return handleDateCallback(chatId, session, data);
  }

  if (data === "menu:home") {
    session.flow = null;
    await sendMenu(chatId, session, origin);
    return;
  }
  if (data === "menu:status") return showStatus(chatId, session, origin);
  if (data === "menu:comments") return showComments(chatId, session, origin);
  if (data === "menu:database") return showDatabase(chatId, session, origin);
  if (data === "menu:ping") return showSpeedTest(chatId, session, origin);
  if (data === "menu:help") return sendMenu(chatId, session, origin, helpText());
  if (data === "menu:cancel") {
    session.flow = null;
    return sendMenu(chatId, session, origin, "Proses dibatalkan.");
  }
  if (data === "menu:add") {
    session.flow = { type: "add", step: "title", data: {} };
    await sendMenu(chatId, session, origin, "<b>Tambah Konten</b>\nMasukkan judul konten:");
    return;
  }
  if (data === "menu:drafts" || data === "menu:publish_drafts") {
    const rows = session.drafts.map((draft) => [{ text: `Publish #${draft.id} - ${draft.title.slice(0, 24)}`, callback_data: `draft:publish:${draft.id}` }]);
    rows.push([{ text: "Menu Utama", callback_data: "menu:home" }]);
    await sendMenu(chatId, session, origin, session.drafts.length ? "<b>Draft Lokal Bot</b>\nPilih draft untuk publish." : "<b>Draft Lokal Bot</b>\nBelum ada draft.");
    if (session.drafts.length) await sendMessage(chatId, session, "Pilih draft:", keyboard(rows));
    return;
  }
  if (data === "menu:manage") return showManage(chatId, session);
  if (data === "add:save_draft") {
    const flow = session.flow;
    if (!flow?.data.title || !flow.data.category || !flow.data.date || !flow.data.body || !flow.data.photo) return sendMenu(chatId, session, origin, "Konten belum lengkap.");
    session.lastDraftId += 1;
    session.drafts.unshift({ id: session.lastDraftId, title: String(flow.data.title), category: String(flow.data.category), body: String(flow.data.body), photo: flow.data.photo as Record<string, unknown>, date: String(flow.data.date), createdAt: new Date().toISOString() });
    session.flow = null;
    return sendMenu(chatId, session, origin, `Draft tersimpan. ID draft: ${session.lastDraftId}`);
  }
  if (data === "add:publish") {
    if (!session.flow?.data) return sendMenu(chatId, session, origin, "Konten belum lengkap.");
    const content = await publishContent(session.flow.data);
    session.flow = null;
    return sendMenu(chatId, session, origin, `Konten berhasil dipublish ke website.\nID website: ${content.id}\nSlug: ${content.slug}`);
  }
  if (data.startsWith("draft:publish:")) {
    const id = Number(data.split(":")[2]);
    const draft = session.drafts.find((item) => item.id === id);
    if (!draft) return sendMenu(chatId, session, origin, "Draft tidak ditemukan.");
    const content = await publishContent(draft);
    session.drafts = session.drafts.filter((item) => item.id !== id);
    return sendMenu(chatId, session, origin, `Draft berhasil dipublish.\nID website: ${content.id}\nSlug: ${content.slug}`);
  }
  if (data.startsWith("content:view:")) return showContent(chatId, session, data.split(":")[2]);
  if (data.startsWith("content:toggle:")) {
    const id = data.split(":")[2];
    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) return sendMenu(chatId, session, origin, "Konten tidak ditemukan.");
    await prisma.activity.update({ where: { id }, data: { status: existing.status === "ACTIVE" ? ActivityStatus.HIDDEN : ActivityStatus.ACTIVE } });
    return showContent(chatId, session, id);
  }
  if (data.startsWith("content:delete_confirm:")) {
    const id = data.split(":")[2];
    return sendMessage(chatId, session, "Yakin ingin menghapus konten ini?", keyboard([
      [
        { text: "Ya, Hapus", callback_data: `content:delete:${id}` },
        { text: "Batal", callback_data: `content:view:${id}` },
      ],
    ]));
  }
  if (data.startsWith("content:delete:")) {
    const id = data.split(":")[2];
    const existing = await prisma.activity.findUnique({ where: { id } });
    if (existing) {
      await prisma.activity.delete({ where: { id } });
      await deleteImage(existing.imagePath);
    }
    return sendMenu(chatId, session, origin, existing ? `Konten berhasil dihapus.\nJudul: ${escapeHtml(existing.title)}` : "Konten tidak ditemukan.");
  }
  if (data.startsWith("content:edit:")) {
    const id = data.split(":")[2];
    return sendMessage(chatId, session, "Pilih bagian yang ingin diedit:", keyboard([
      [
        { text: "Edit Judul", callback_data: `edit:${id}:title` },
        { text: "Edit Katalog", callback_data: `edit:${id}:category` },
      ],
      [
        { text: "Edit Isi", callback_data: `edit:${id}:body` },
        { text: "Edit Foto", callback_data: `edit:${id}:photo` },
      ],
      [{ text: "Edit Tanggal", callback_data: `edit:${id}:date` }],
      [{ text: "Batal", callback_data: `content:view:${id}` }],
    ]));
  }
  if (data.startsWith("edit:")) {
    const [, id, field] = data.split(":");
    if (field === "date") {
      session.flow = { type: "edit", step: "dateYear", data: { contentId: id, field, dateParts: {} } };
      return askDatePart(chatId, session, "dateYear");
    }

    session.flow = { type: "edit", step: "editField", data: { contentId: id, field } };
    return sendMessage(chatId, session, field === "photo" ? "Kirim foto baru atau link gambar http/https:" : "Kirim nilai baru:");
  }
}

async function handleDateCallback(chatId: string, session: BotSession, data: string) {
  const flow = session.flow;
  if (!flow || !["dateYear", "dateMonth", "dateDay", "dateHour"].includes(flow.step)) {
    await sendMessage(chatId, session, "Sesi pilih tanggal sudah tidak aktif.", keyboard(backToMenuRows));
    return;
  }

  const [, part, rawValue] = data.split(":");
  const value = Number(rawValue);
  const parts = dateParts(flow);

  if (!Number.isInteger(value)) {
    await sendMessage(chatId, session, "Pilihan tanggal tidak valid.");
    return;
  }

  if (part === "year") {
    parts.year = value;
    flow.data.dateParts = parts;
    await askDatePart(chatId, session, "dateMonth");
    return;
  }

  if (part === "month") {
    parts.month = value;
    flow.data.dateParts = parts;
    await askDatePart(chatId, session, "dateDay");
    return;
  }

  if (part === "day") {
    parts.day = value;
    flow.data.dateParts = parts;
    await askDatePart(chatId, session, "dateHour");
    return;
  }

  if (part === "hour") {
    parts.hour = value;
    flow.data.dateParts = parts;
    const selected = buildSelectedDate(parts);
    if (!selected) {
      await askDatePart(chatId, session, "dateYear");
      return;
    }

    flow.data.date = selected.toISOString();

    if (flow.type === "edit") {
      const contentId = String(flow.data.contentId);
      const content = await updateContent(contentId, { date: flow.data.date });
      session.flow = null;
      await showContent(chatId, session, content.id);
      return;
    }

    flow.step = "photo";
    await sendMessage(chatId, session, [
      "<b>Tanggal konten dipilih.</b>",
      `Tanggal: ${escapeHtml(selected.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }))}`,
      "",
      "Kirim foto konten sebagai upload Telegram, atau kirim link gambar http/https.",
    ].join("\n"));
  }
}

async function handleMenuAction(chatId: string, session: BotSession, origin: string, action: string) {
  if (action === "menu:home") {
    session.flow = null;
    await sendMenu(chatId, session, origin);
    return true;
  }
  if (action === "menu:status") {
    await showStatus(chatId, session, origin);
    return true;
  }
  if (action === "menu:comments") {
    await showComments(chatId, session, origin);
    return true;
  }
  if (action === "menu:database") {
    await showDatabase(chatId, session, origin);
    return true;
  }
  if (action === "menu:ping") {
    await showSpeedTest(chatId, session, origin);
    return true;
  }
  if (action === "menu:help") {
    await sendMenu(chatId, session, origin, helpText());
    return true;
  }
  if (action === "menu:cancel") {
    session.flow = null;
    await sendMenu(chatId, session, origin, "Proses dibatalkan.");
    return true;
  }
  if (action === "menu:add") {
    session.flow = { type: "add", step: "title", data: {} };
    await sendMenu(chatId, session, origin, "<b>Tambah Konten</b>\nMasukkan judul konten:");
    return true;
  }
  if (action === "menu:drafts" || action === "menu:publish_drafts") {
    const rows = session.drafts.map((draft) => [{ text: `Publish #${draft.id} - ${draft.title.slice(0, 24)}`, callback_data: `draft:publish:${draft.id}` }]);
    rows.push([{ text: "Menu Utama", callback_data: "menu:home" }]);
    await sendMenu(chatId, session, origin, session.drafts.length ? "<b>Draft Lokal Bot</b>\nPilih draft untuk publish." : "<b>Draft Lokal Bot</b>\nBelum ada draft.");
    if (session.drafts.length) await sendMessage(chatId, session, "Pilih draft:", keyboard(rows));
    return true;
  }
  if (action === "menu:manage") {
    await showManage(chatId, session);
    return true;
  }

  return false;
}

function helpText() {
  return [
    "<b>Bantuan Fitur Depoizon Admin</b>",
    "",
    "<b>1. Status Website</b>",
    "Mengecek kondisi website, response time, RAM, CPU, uptime, dan storage database.",
    "",
    "<b>2. Ping / Speed Test</b>",
    "Menguji latency website, Telegram API, database, dan estimasi kecepatan download.",
    "",
    "<b>3. Komentar</b>",
    "Menampilkan komentar terbaru dari website.",
    "",
    "<b>4. Tambah Konten</b>",
    "Membuat konten baru dari Telegram dengan judul, katalog, foto/link gambar, dan isi cerita.",
    "",
    "<b>5. Draft</b>",
    "Melihat konten yang disimpan sementara sebagai draft lokal bot.",
    "",
    "<b>6. Publish Draft</b>",
    "Mempublikasikan draft yang sudah tersimpan ke website.",
    "",
    "<b>7. Kelola Konten</b>",
    "Melihat semua konten website, edit konten, hide/unhide, dan hapus konten.",
    "",
    "<b>8. Database</b>",
    "Menampilkan storage database, jumlah konten, komentar, user, admin, dan views.",
    "",
    "<b>9. Help</b>",
    "Menampilkan penjelasan fungsi setiap fitur bot.",
  ].join("\n");
}

export async function GET() {
  return NextResponse.json({ ok: true, mode: "telegram-webhook" });
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  const update = (await request.json().catch(() => ({}))) as TelegramUpdate;
  const chatId = chatIdFrom(update);
  if (!chatId) return NextResponse.json({ ok: true });

  if (!isAdmin(update)) {
    await sendMessage(chatId, defaultSession(), "Akses ditolak. Bot ini hanya untuk admin.");
    return NextResponse.json({ ok: true });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const session = await loadSession(chatId);

  try {
    if (update.callback_query) {
      await handleCallback(chatId, session, update.callback_query, origin);
      await saveSession(chatId, session);
      return NextResponse.json({ ok: true });
    }

    const text = update.message?.text?.trim();
    const photo = update.message?.photo;

    if (await handleEditInput(chatId, session, text, photo)) {
      await saveSession(chatId, session);
      return NextResponse.json({ ok: true });
    }

    if (photo && session.flow?.type === "add" && session.flow.step === "photo") {
      const best = photo.at(-1);
      if (best) {
        session.flow.data.photo = { source: "telegram", fileId: best.file_id };
        session.flow.step = "body";
        await sendPhoto(chatId, session, best.file_id, "<b>Foto diterima.</b>\nSekarang masukkan isi konten:");
      }
      await saveSession(chatId, session);
      return NextResponse.json({ ok: true });
    }

    if (text && !text.startsWith("/") && await handleAddText(chatId, session, text)) {
      await saveSession(chatId, session);
      return NextResponse.json({ ok: true });
    }

    const numberedMenuAction = text && !text.startsWith("/") ? menuActionFromNumber(text) : null;
    if (numberedMenuAction) {
      await deleteTracked(chatId, session);
      await safeTelegram("deleteMessage", { chat_id: chatId, message_id: incomingMessageId(update) });
      await handleMenuAction(chatId, session, origin, numberedMenuAction);
      await saveSession(chatId, session);
      return NextResponse.json({ ok: true });
    }

    if (text?.startsWith("/")) {
      await deleteTracked(chatId, session);
      await safeTelegram("deleteMessage", { chat_id: chatId, message_id: incomingMessageId(update) });
      const command = text.split(/\s+/)[0];
      if (command === "/start") await sendMenu(chatId, session, origin);
      else if (command === "/help") await sendMenu(chatId, session, origin, helpText());
      else if (command === "/ping") await showSpeedTest(chatId, session, origin);
      else if (command === "/status") await showStatus(chatId, session, origin);
      else if (command === "/komentar") await showComments(chatId, session, origin);
      else if (command === "/tambah") {
        session.flow = { type: "add", step: "title", data: {} };
        await sendMenu(chatId, session, origin, "<b>Tambah Konten</b>\nMasukkan judul konten:");
      } else if (command === "/draft" || command === "/publish") {
        await sendMenu(chatId, session, origin, session.drafts.length ? `Draft tersedia: ${session.drafts.length}. Gunakan tombol Publish Draft di menu.` : "Belum ada draft.");
      } else if (command === "/batal") {
        session.flow = null;
        await sendMenu(chatId, session, origin, "Proses dibatalkan.");
      } else {
        await sendMenu(chatId, session, origin, helpText());
      }
    }

    await saveSession(chatId, session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await sendMessage(chatId, session, `Error: ${escapeHtml(error instanceof Error ? error.message : "Bot gagal memproses request.")}`);
    await saveSession(chatId, session);
    return NextResponse.json({ ok: true });
  }
}
