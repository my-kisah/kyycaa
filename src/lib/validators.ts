import { z } from "zod";

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];

export const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter.").max(60, "Nama terlalu panjang."),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(24, "Username maksimal 24 karakter.")
    .regex(/^[a-zA-Z0-9_.]+$/, "Username hanya boleh huruf, angka, titik, dan underscore."),
  email: z.email("Masukkan email yang valid."),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter.")
    .max(64, "Password terlalu panjang.")
    .regex(/[A-Z]/, "Password harus memiliki huruf besar.")
    .regex(/[a-z]/, "Password harus memiliki huruf kecil.")
    .regex(/[0-9]/, "Password harus memiliki angka."),
});

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Masukkan email atau username yang valid."),
  password: z.string().min(1, "Password wajib diisi."),
  portal: z.enum(["user", "admin"]),
});

export const commentSchema = z.object({
  contentId: z.string().min(1),
  commentText: z
    .string()
    .trim()
    .min(1, "Komentar tidak boleh kosong.")
    .max(300, "Komentar maksimal 300 karakter."),
});

export const activitySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(4, "Judul minimal 4 karakter.").max(120, "Judul terlalu panjang."),
  description: z
    .string()
    .min(30, "Deskripsi minimal 30 karakter.")
    .max(6000, "Deskripsi terlalu panjang."),
  date: z.string().min(1, "Tanggal wajib diisi."),
  category: z.string().min(2, "Kategori wajib diisi.").max(40, "Kategori terlalu panjang."),
  tags: z.string().max(120, "Tag terlalu panjang.").optional().default(""),
  status: z.enum(["ACTIVE", "HIDDEN"]),
});

export const profileSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter.").max(60, "Nama terlalu panjang."),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(24, "Username maksimal 24 karakter.")
    .regex(/^[a-zA-Z0-9_.]+$/, "Username hanya boleh huruf, angka, titik, dan underscore."),
  email: z.email("Masukkan email yang valid."),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi."),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter.")
      .max(64, "Password terlalu panjang.")
      .regex(/[A-Z]/, "Password baru harus memiliki huruf besar.")
      .regex(/[a-z]/, "Password baru harus memiliki huruf kecil.")
      .regex(/[0-9]/, "Password baru harus memiliki angka."),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

export const adminResetPasswordSchema = z.object({
  userId: z.string().min(1),
  newPassword: z
    .string()
    .min(8, "Password baru minimal 8 karakter.")
    .max(64, "Password terlalu panjang.")
    .regex(/[A-Z]/, "Password baru harus memiliki huruf besar.")
    .regex(/[a-z]/, "Password baru harus memiliki huruf kecil.")
    .regex(/[0-9]/, "Password baru harus memiliki angka."),
});

export const adminCreateSchema = registerSchema;

export const adminBanSchema = z.object({
  userId: z.string().min(1, "User tidak valid."),
  reason: z
    .union([
      z
        .string()
        .trim()
        .min(8, "Alasan pembekuan minimal 8 karakter.")
        .max(200, "Alasan pembekuan maksimal 200 karakter."),
      z.literal(""),
    ])
    .optional()
    .default(""),
});

export function validateImageFile(file: File | null | undefined) {
  if (!file || file.size === 0) return null;
  if (!acceptedImageTypes.includes(file.type)) {
    return "Format gambar harus JPG, PNG, atau WEBP.";
  }
  if (file.size > 4 * 1024 * 1024) {
    return "Ukuran gambar maksimal 4MB.";
  }
  return null;
}
