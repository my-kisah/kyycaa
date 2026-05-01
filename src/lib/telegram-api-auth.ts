import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function authorizeTelegramApi(request: Request) {
  const expectedToken = process.env.TELEGRAM_ADMIN_API_TOKEN;

  if (!expectedToken) {
    return NextResponse.json(
      { error: "TELEGRAM_ADMIN_API_TOKEN belum dikonfigurasi di website." },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!token || !safeEqual(token, expectedToken)) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  return null;
}
