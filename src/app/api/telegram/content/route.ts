import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ActivityStatus, Role } from "@prisma/client";
import slugify from "slugify";
import { z } from "zod";
import { uploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { authorizeTelegramApi } from "@/lib/telegram-api-auth";
import { parseTags } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.string().trim().min(2).max(40),
  body: z.string().trim().min(1).max(12000),
  date: z.string().optional(),
  tags: z.string().optional().default("telegram"),
  imageUrl: z.string().url().optional(),
  status: z.enum(["ACTIVE", "HIDDEN"]).optional().default("ACTIVE"),
  photo: z
    .object({
      fileId: z.string().optional(),
      fileUniqueId: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      dataUrl: z.string().optional(),
      mimeType: z.string().optional(),
    })
    .optional(),
});

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

async function resolveAdminUser() {
  const configuredEmail = process.env.TELEGRAM_ADMIN_EMAIL?.toLowerCase();

  if (configuredEmail) {
    const user = await prisma.user.findUnique({
      where: { email: configuredEmail },
      select: { id: true },
    });

    if (user) return user;
  }

  return prisma.user.findFirst({
    where: { role: Role.ADMIN },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
}

async function createUniqueSlug(title: string) {
  const slugBase = slugify(title, { lower: true, strict: true }) || `telegram-${Date.now()}`;
  let slug = slugBase;
  let counter = 1;

  while (
    await prisma.activity.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    counter += 1;
    slug = `${slugBase}-${counter}`;
  }

  return slug;
}

export async function GET(request: Request) {
  const authError = authorizeTelegramApi(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 10), 1), 20);
  const status = url.searchParams.get("status");

  const activities = await prisma.activity.findMany({
    where:
      status === "ACTIVE" || status === "HIDDEN"
        ? { status: status as ActivityStatus }
        : undefined,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
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

  return NextResponse.json({
    contents: activities,
  });
}

export async function POST(request: Request) {
  const authError = authorizeTelegramApi(request);
  if (authError) return authError;

  try {
    const parsed = payloadSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Payload konten tidak valid." },
        { status: 400 },
      );
    }

    const admin = await resolveAdminUser();
    if (!admin) {
      return NextResponse.json(
        { error: "Akun admin website belum ditemukan." },
        { status: 500 },
      );
    }

    if (!parsed.data.photo?.dataUrl && !parsed.data.imageUrl) {
      return NextResponse.json(
        { error: "Foto wajib dikirim dari bot." },
        { status: 400 },
      );
    }

    let imageUrl = parsed.data.imageUrl ?? "";
    let imagePath = "";

    if (parsed.data.photo?.dataUrl) {
      const image = parseDataUrl(parsed.data.photo.dataUrl);
      const file = new File([image.buffer], "telegram-upload.jpg", {
        type: image.mimeType,
      });
      const uploaded = await uploadImage(file, "cerita-kita/telegram");
      imageUrl = uploaded.secure_url;
      imagePath = uploaded.public_id;
    }

    const slug = await createUniqueSlug(parsed.data.title);
    const description = parsed.data.body;
    const excerpt =
      description.length > 160 ? `${description.slice(0, 157)}...` : description;

    const activity = await prisma.activity.create({
      data: {
        title: parsed.data.title,
        slug,
        excerpt,
        description,
        imageUrl,
        imagePath,
        date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
        category: parsed.data.category,
        tags: parseTags(parsed.data.tags),
        status: parsed.data.status as ActivityStatus,
        createdById: admin.id,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/content");
    revalidatePath("/admin/analytics");

    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Telegram content API failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat konten dari Telegram.",
      },
      { status: 500 },
    );
  }
}
