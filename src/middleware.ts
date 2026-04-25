import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = Boolean(session?.user);
  const isAdmin = session?.user?.role === "ADMIN";
  const pathname = nextUrl.pathname;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminLoginPage = pathname === "/admin/login";
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLoginPage;

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/dashboard", nextUrl),
    );
  }

  if (isDashboard && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminLoginPage && isLoggedIn && isAdmin) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/admin/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard?denied=admin", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
