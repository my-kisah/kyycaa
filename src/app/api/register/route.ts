import { hash } from "bcryptjs";
import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminEmail, maskEmail } from "@/lib/auth-helpers";
import { sendOtpEmail } from "@/lib/mailer";
import { registerSchema } from "@/lib/validators";

const REGISTER_OTP_EXPIRES_MINUTES = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const username = parsed.data.username.toLowerCase();

    if (isAdminEmail(email)) {
      return NextResponse.json(
        { error: "Email ini dicadangkan untuk akun admin dan tidak bisa didaftarkan publik." },
        { status: 403 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      select: { id: true, email: true, username: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.email === email
              ? "Email sudah terdaftar. Silakan login."
              : "Username sudah dipakai. Silakan pilih username lain.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        username,
        passwordHash,
        role: Role.USER,
      },
    });

    const code = String(randomInt(100000, 1000000));
    const codeHash = await hash(code, 10);

    await prisma.otpChallenge.deleteMany({
      where: {
        userId: user.id,
        portal: "register",
      },
    });

    const challenge = await prisma.otpChallenge.create({
      data: {
        userId: user.id,
        portal: "register",
        codeHash,
        expiresAt: new Date(Date.now() + REGISTER_OTP_EXPIRES_MINUTES * 60 * 1000),
      },
    });

    let delivery: Awaited<ReturnType<typeof sendOtpEmail>>;

    try {
      delivery = await sendOtpEmail({
        to: email,
        code,
        portal: "user",
        expiresInMinutes: REGISTER_OTP_EXPIRES_MINUTES,
      });
    } catch (error) {
      await prisma.$transaction([
        prisma.otpChallenge.deleteMany({
          where: { userId: user.id, portal: "register" },
        }),
        prisma.user.delete({
          where: { id: user.id },
        }),
      ]);

      throw error;
    }

    return NextResponse.json({
      success: true,
      challengeId: challenge.id,
      maskedEmail: maskEmail(email),
      debugCode: "developmentCode" in delivery ? delivery.developmentCode : undefined,
    });
  } catch (error) {
    console.error("Register route failed", error);
    const message =
      error instanceof Error &&
      /readonly database|Unable to open the database file/i.test(error.message)
        ? "Production di Vercel belum memakai database online yang bisa ditulis. Login admin sudah aktif, tetapi register user baru masih menunggu database production."
        : process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat akun.";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
