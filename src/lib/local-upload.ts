import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { isProductionDeployment } from "@/lib/cloudinary";

const mimeExtensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function saveLocalProfileImage(file: File) {
  if (isProductionDeployment()) {
    throw new Error(
      "Upload file lokal dimatikan di production. Aktifkan Cloudinary lebih dulu untuk upload foto profil.",
    );
  }

  const extension =
    mimeExtensions[file.type] ||
    path.extname(file.name || "").toLowerCase() ||
    ".jpg";

  const fileName = `${randomUUID()}${extension}`;
  const relativeDir = path.join("uploads", "profiles");
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  const absolutePath = path.join(absoluteDir, fileName);

  await mkdir(absoluteDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await writeFile(absolutePath, buffer);

  return {
    imageUrl: `/${relativeDir.replace(/\\/g, "/")}/${fileName}`,
  };
}
