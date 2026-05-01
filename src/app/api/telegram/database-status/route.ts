import { stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { ActivityStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeTelegramApi } from "@/lib/telegram-api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatBytes(bytes: number | bigint | null | undefined) {
  if (bytes === null || bytes === undefined) return null;
  let size = Number(bytes);
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function getStorageLimit() {
  const limitMb = Number(process.env.DATABASE_STORAGE_LIMIT_MB);

  if (!Number.isFinite(limitMb) || limitMb <= 0) {
    return null;
  }

  const bytes = Math.round(limitMb * 1024 * 1024);

  return {
    megabytes: limitMb,
    bytes,
    formatted: formatBytes(bytes),
  };
}

function withLimit(provider: string, sizeBytes: number | null) {
  const limit = getStorageLimit();
  const usagePercent = limit && sizeBytes ? (sizeBytes / limit.bytes) * 100 : null;

  return {
    provider,
    size: formatBytes(sizeBytes),
    sizeBytes,
    limit,
    usagePercent,
  };
}

async function getDatabaseSize() {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    try {
      const result = await prisma.$queryRawUnsafe<Array<{ size: bigint }>>(
        "select pg_database_size(current_database()) as size",
      );
      const sizeBytes = Number(result[0]?.size ?? 0);

      return withLimit("postgresql", sizeBytes);
    } catch {
      return withLimit("postgresql", null);
    }
  }

  if (databaseUrl.startsWith("file:")) {
    try {
      const relativePath = databaseUrl.replace(/^file:/, "");
      const absolutePath = path.resolve(process.cwd(), "prisma", relativePath);
      const file = await stat(absolutePath);

      return withLimit("sqlite", file.size);
    } catch {
      return withLimit("sqlite", null);
    }
  }

  return withLimit("unknown", null);
}

export async function GET(request: Request) {
  const authError = authorizeTelegramApi(request);
  if (authError) return authError;

  const [database, totalContents, activeContents, hiddenContents, comments, users, admins, views] =
    await Promise.all([
      getDatabaseSize(),
      prisma.activity.count(),
      prisma.activity.count({ where: { status: ActivityStatus.ACTIVE } }),
      prisma.activity.count({ where: { status: ActivityStatus.HIDDEN } }),
      prisma.comment.count(),
      prisma.user.count({ where: { role: Role.USER } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.view.count(),
    ]);

  return NextResponse.json({
    database,
    counts: {
      totalContents,
      activeContents,
      hiddenContents,
      comments,
      users,
      admins,
      views,
    },
    checkedAt: new Date().toISOString(),
  });
}
