import { Role } from "@prisma/client";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  isAllowedEmailDomain,
  normalizeIdentifier,
  requiresRegisterOtpVerification,
} from "@/lib/auth-helpers";
import { loginSchema } from "@/lib/validators";

export async function validateLoginCredentials(rawCredentials: unknown) {
  const parsed = loginSchema.safeParse(rawCredentials);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data login tidak valid." } as const;
  }

  const { identifier, password, portal } = parsed.data;
  const normalizedIdentifier = normalizeIdentifier(identifier);

  if (normalizedIdentifier.includes("@") && !isAllowedEmailDomain(normalizedIdentifier)) {
    return { error: "Saat ini hanya email @gmail.com yang diterima." } as const;
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
    },
  });

  if (!user?.passwordHash) {
    return {
      error:
        portal === "admin"
          ? "Login admin gagal. Pastikan email admin dan password benar."
          : "Login gagal. Periksa email atau username dan password Anda.",
    } as const;
  }

  if (!isAllowedEmailDomain(user.email)) {
    return { error: "Saat ini hanya email @gmail.com yang diterima." } as const;
  }

  const validPassword = await compare(password, user.passwordHash);

  if (!validPassword) {
    return {
      error:
        portal === "admin"
          ? "Login admin gagal. Pastikan email admin dan password benar."
          : "Login gagal. Periksa email atau username dan password Anda.",
    } as const;
  }

  if (user.role === Role.USER && user.bannedAt) {
    return {
      error: `Akun telah dibekukan. Alasan: ${user.banReason ?? "Tidak ada alasan yang ditulis admin."}`,
    } as const;
  }

  if (
    user.role === Role.USER &&
    !user.emailVerified &&
    requiresRegisterOtpVerification(user.createdAt)
  ) {
    return {
      error: "Akun ini belum diverifikasi. Selesaikan OTP register dari email Anda terlebih dahulu.",
    } as const;
  }

  if (portal === "admin") {
    if (user.role !== Role.ADMIN) {
      return { error: "Login admin gagal. Pastikan email admin dan password benar." } as const;
    }
  } else if (user.role !== Role.USER) {
    return { error: "Login gagal. Periksa email atau username dan password Anda." } as const;
  }

  return {
    user,
    portal,
  } as const;
}
