import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import authConfig from "@/auth.config";
import { requiresRegisterOtpVerification } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { validateLoginCredentials } from "@/lib/login-helpers";

function getSessionSafeImage(image?: string | null) {
  if (!image) {
    return null;
  }

  if (image.startsWith("data:") || image.startsWith("blob:") || image.startsWith("inline:")) {
    return null;
  }

  return image;
}

const providers: Provider[] = [
  Credentials({
    id: "credentials",
    credentials: {
      identifier: {},
      password: {},
      portal: {},
    },
    authorize: async (rawCredentials) => {
      const validated = await validateLoginCredentials(rawCredentials);

      if ("error" in validated) {
        return null;
      }

      try {
        await prisma.user.update({
          where: { id: validated.user.id },
          data: {
            lastLoginAt: new Date(),
          },
        });
      } catch (error) {
        console.warn("Skipping lastLoginAt update during credentials sign in", error);
      }

      return {
        id: validated.user.id,
        email: validated.user.email,
        name: validated.user.name,
        username: validated.user.username,
        image: getSessionSafeImage(validated.user.image),
        role: validated.user.role,
        bannedAt: validated.user.bannedAt?.toISOString() ?? null,
        banReason: validated.user.banReason ?? null,
      };
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as Adapter,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;

      if (account?.provider === "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, role: true, bannedAt: true, emailVerified: true, createdAt: true },
        });

        if (!existingUser) return false;
        if (existingUser.role === Role.USER && existingUser.bannedAt) return false;
        if (
          existingUser.role === Role.USER &&
          !existingUser.emailVerified &&
          requiresRegisterOtpVerification(existingUser.createdAt)
        ) {
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? Role.USER;
        token.sub = user.id;
        token.username = user.username;
        token.bannedAt = user.bannedAt ?? null;
        token.banReason = user.banReason ?? null;
        token.deleted = user.deleted ?? false;
      }

      const dbUser = token.sub
        ? await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            role: true,
            name: true,
            image: true,
            username: true,
            bannedAt: true,
            banReason: true,
          },
        })
        : token.email
          ? await prisma.user.findUnique({
            where: { email: token.email.toLowerCase() },
            select: {
              id: true,
              role: true,
              name: true,
              image: true,
              username: true,
              bannedAt: true,
              banReason: true,
            },
          })
          : null;

      if (dbUser) {
        token.sub = dbUser.id;
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.picture = getSessionSafeImage(dbUser.image);
        token.username = dbUser.username;
        token.bannedAt = dbUser.bannedAt?.toISOString() ?? null;
        token.banReason = dbUser.banReason ?? null;
        token.deleted = false;
      } else if (token.sub) {
        token.sub = undefined;
        token.role = undefined;
        token.name = undefined;
        token.picture = undefined;
        token.username = undefined;
        token.bannedAt = null;
        token.banReason = null;
        token.deleted = true;
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.sub || token.deleted) {
        return null as never;
      }

      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as Role) ?? Role.USER;
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
        session.user.image = typeof token.picture === "string" ? token.picture : null;
        session.user.username =
          typeof token.username === "string" ? token.username : undefined;
        session.user.bannedAt =
          typeof token.bannedAt === "string" ? token.bannedAt : null;
        session.user.banReason =
          typeof token.banReason === "string" ? token.banReason : null;
        session.user.deleted = Boolean(token.deleted);
      }

      return session;
    },
  },
});
