import { Role } from "@prisma/client";

const gmailPattern = /^[^@\s]+@gmail\.com$/i;
const REGISTER_OTP_ROLLOUT_AT = new Date("2026-04-27T00:00:00+07:00");

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

export function isAllowedEmailDomain(email?: string | null) {
  if (!email) return false;
  return gmailPattern.test(email.trim().toLowerCase());
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;

  if (name.length <= 2) {
    return `${name[0] ?? "*"}***@${domain}`;
  }

  return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
}

export function requiresRegisterOtpVerification(createdAt?: Date | null) {
  if (!createdAt) {
    return false;
  }

  return createdAt >= REGISTER_OTP_ROLLOUT_AT;
}
