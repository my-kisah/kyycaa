import { Role } from "@prisma/client";

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export function getExpectedRole(email?: string | null) {
  return isAdminEmail(email) ? Role.ADMIN : Role.USER;
}

export function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase();
}
