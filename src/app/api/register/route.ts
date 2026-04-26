import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/auth-helpers";
import { registerSchema } from "@/lib/validators";

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

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        username,
        passwordHash,
        role: Role.USER,
      },
    });

    return NextResponse.json({ success: true });
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
