"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { auth } from "@/auth";
import { saveLocalProfileImage } from "@/lib/local-upload";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import {
  adminBanSchema,
  adminCreateSchema,
  adminResetPasswordSchema,
  passwordChangeSchema,
  profileSchema,
  validateImageFile,
} from "@/lib/validators";
import { isAdminEmail, normalizeIdentifier } from "@/lib/auth-helpers";

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateProfileAction(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return { error: "Sesi login tidak ditemukan." };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Profil tidak valid." };
  }

  const email = parsed.data.email.toLowerCase();
  const username = normalizeIdentifier(parsed.data.username);
  const file = formData.get("image");
  const currentImage = String(formData.get("currentImage") ?? "").trim();

  if (session.user.role !== "ADMIN" && isAdminEmail(email)) {
    return { error: "Email ini dicadangkan untuk admin." };
  }

  const imageError = validateImageFile(file instanceof File ? file : null);
  if (imageError) {
    return { error: imageError };
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
      NOT: { id: session.user.id },
    },
    select: { id: true, email: true, username: true },
  });

  if (existing) {
    return {
      error:
        existing.email === email
          ? "Email sudah digunakan pengguna lain."
          : "Username sudah digunakan pengguna lain.",
    };
  }

  let image = currentImage || null;

  if (file instanceof File && file.size > 0) {
    try {
      const hasCloudinaryConfig =
        Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
        Boolean(process.env.CLOUDINARY_API_KEY) &&
        Boolean(process.env.CLOUDINARY_API_SECRET);

      if (hasCloudinaryConfig) {
        const uploaded = await uploadImage(file, "cerita-kita/profiles");
        image = uploaded.secure_url;
      } else {
        const uploaded = await saveLocalProfileImage(file);
        image = uploaded.imageUrl;
      }
    } catch (error) {
      console.error("Profile image upload failed", error);
      return { error: "Upload foto profil gagal. Coba lagi setelah beberapa saat." };
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      username,
      email,
      image,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/admin/settings");
  revalidatePath("/");

  return { success: "Profil berhasil diperbarui." };
}

export async function changePasswordAction(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await auth();

  if (!session?.user) {
    return { error: "Sesi login tidak ditemukan." };
  }

  const parsed = passwordChangeSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Password baru tidak valid." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { error: "Password akun tidak ditemukan." };
  }

  const validPassword = await compare(parsed.data.currentPassword, user.passwordHash);
  if (!validPassword) {
    return { error: "Password saat ini salah." };
  }

  const newPasswordHash = await hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newPasswordHash },
  });

  return { success: "Password berhasil diubah." };
}

export async function adminResetUserPasswordAction(payload: {
  userId: string;
  newPassword: string;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Akses admin ditolak." };
  }

  const parsed = adminResetPasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Password baru tidak valid." };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, role: true, email: true, name: true },
  });

  if (!targetUser) {
    return { error: "User tidak ditemukan." };
  }

  const passwordHash = await hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: targetUser.id },
    data: { passwordHash },
  });

  revalidatePath("/admin/settings");

  return {
    success: `Password untuk ${targetUser.name} berhasil diganti.`,
  };
}

export async function adminDeleteUserAction(userId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Akses admin ditolak." };
  }

  if (!userId) {
    return { error: "User tidak valid." };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      comments: {
        select: {
          contentId: true,
        },
      },
    },
  });

  if (!targetUser) {
    return { error: "User tidak ditemukan." };
  }

  if (targetUser.role === "ADMIN") {
    return { error: "Akun admin tidak bisa dihapus dari menu ini." };
  }

  if (targetUser.id === session.user.id) {
    return { error: "Anda tidak bisa menghapus akun sendiri dari sesi admin ini." };
  }

  const affectedContentIds = [...new Set(targetUser.comments.map((comment) => comment.contentId))];
  const remainingCounts = affectedContentIds.length
    ? await prisma.comment.groupBy({
      by: ["contentId"],
      where: {
        contentId: { in: affectedContentIds },
        NOT: { userId: targetUser.id },
      },
      _count: { _all: true },
    })
    : [];

  const countMap = new Map(
    remainingCounts.map((item) => [item.contentId, item._count._all]),
  );

  await prisma.$transaction(async (tx) => {
    await Promise.all(
      [
        tx.comment.deleteMany({ where: { userId: targetUser.id } }),
        tx.view.deleteMany({ where: { userId: targetUser.id } }),
        tx.account.deleteMany({ where: { userId: targetUser.id } }),
        tx.session.deleteMany({ where: { userId: targetUser.id } }),
      ],
    );

    if (affectedContentIds.length) {
      await Promise.all(
        affectedContentIds.map((contentId) =>
          tx.activity.update({
            where: { id: contentId },
            data: { commentsCount: countMap.get(contentId) ?? 0 },
          }),
        ),
      );
    }

    await tx.user.delete({
      where: { id: targetUser.id },
    });
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/comments");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return {
    success: `Akun ${targetUser.name} berhasil dihapus.`,
  };
}

export async function adminCreateAdminAction(payload: {
  name: string;
  username: string;
  email: string;
  password: string;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Akses admin ditolak." };
  }

  const parsed = adminCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data admin baru tidak valid." };
  }

  const email = parsed.data.email.toLowerCase();
  const username = normalizeIdentifier(parsed.data.username);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: { email: true, username: true },
  });

  if (existing) {
    return {
      error:
        existing.email === email
          ? "Email sudah digunakan akun lain."
          : "Username sudah digunakan akun lain.",
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      username,
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  revalidatePath("/admin/settings");

  return {
    success: `Akun admin ${parsed.data.name} berhasil dibuat.`,
  };
}

export async function adminBanUserAction(payload: {
  userId: string;
  reason?: string;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Akses admin ditolak." };
  }

  const parsed = adminBanSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data pembekuan tidak valid." };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: {
      id: true,
      name: true,
      role: true,
      bannedAt: true,
    },
  });

  if (!targetUser) {
    return { error: "User tidak ditemukan." };
  }

  if (targetUser.role === "ADMIN") {
    return { error: "Akun admin tidak bisa dibekukan dari menu ini." };
  }

  if (targetUser.bannedAt) {
    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        bannedAt: null,
        banReason: null,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/dashboard");

    return {
      success: `Pembekuan akun ${targetUser.name} berhasil dibuka.`,
    };
  }

  await prisma.user.update({
    where: { id: targetUser.id },
    data: {
      bannedAt: new Date(),
      banReason: parsed.data.reason,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard");

  return {
    success: `Akun ${targetUser.name} berhasil dibekukan.`,
  };
}

export async function getLoginGuardMessageAction(payload: {
  identifier: string;
  portal: "user" | "admin";
}) {
  const normalizedIdentifier = normalizeIdentifier(payload.identifier);

  if (!normalizedIdentifier) {
    return { error: "Masukkan email atau username yang valid." };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
    },
    select: {
      role: true,
      bannedAt: true,
      banReason: true,
    },
  });

  if (!user) {
    return {
      error:
        payload.portal === "admin"
          ? "Login admin gagal. Pastikan email admin dan password benar."
          : "Login gagal. Periksa email atau username dan password Anda.",
    };
  }

  if (payload.portal === "admin" && user.role !== "ADMIN") {
    return {
      error: "Login admin gagal. Pastikan email admin dan password benar.",
    };
  }

  if (payload.portal === "user") {
    if (user.role !== "USER") {
      return { error: "Login gagal. Periksa email atau username dan password Anda." };
    }

    if (user.bannedAt) {
      return {
        error: `Akun telah dibekukan. Alasan: ${user.banReason ?? "Tidak ada alasan yang ditulis admin."}`,
      };
    }
  }

  return {
    error:
      payload.portal === "admin"
        ? "Login admin gagal. Pastikan email admin dan password benar."
        : "Login gagal. Periksa email atau username dan password Anda.",
  };
}
