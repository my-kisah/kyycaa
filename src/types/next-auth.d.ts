import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      username?: string;
      bannedAt?: string | null;
      banReason?: string | null;
      deleted?: boolean;
    };
  }

  interface User {
    role?: Role;
    username?: string;
    bannedAt?: string | null;
    banReason?: string | null;
    deleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    username?: string;
    bannedAt?: string | null;
    banReason?: string | null;
    deleted?: boolean;
  }
}
