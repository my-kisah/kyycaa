import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

function createBucket(date = new Date()) {
  const utcYear = date.getUTCFullYear();
  const utcMonth = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const utcDate = `${date.getUTCDate()}`.padStart(2, "0");
  const half = date.getUTCHours() < 12 ? "am" : "pm";
  return `${utcYear}${utcMonth}${utcDate}-${half}`;
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const cookieStore = await cookies();
  const existingVisitor = cookieStore.get("visitor_id")?.value;
  const visitorKey = existingVisitor ?? randomUUID();
  const bucket = createBucket();

  if (!existingVisitor) {
    cookieStore.set("visitor_id", visitorKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  try {
    await prisma.view.create({
      data: {
        contentId: id,
        visitorKey,
        bucket,
      },
    });

    await prisma.activity.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  } catch {
    return NextResponse.json({ counted: false });
  }

  return NextResponse.json({ counted: true });
}
