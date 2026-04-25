import Link from "next/link";
import { Heart } from "lucide-react";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/layout/logout-button";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;
  const dashboardHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-[80] border-b border-rose-100/80 bg-[rgba(255,250,252,0.94)] shadow-[0_12px_40px_rgba(214,148,170,0.08)] backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-4 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:min-w-0 lg:flex-1">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="float-subtle flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f7adc7,#d694aa)] text-lg font-bold text-white shadow-[0_16px_36px_rgba(214,148,170,0.28)]">
              <Heart className="h-6 w-6 fill-white text-white" />
            </div>
            <div className="min-w-0">
              <p className="shimmer-text truncate font-display text-[1.85rem] leading-none sm:text-[2rem]">
                Cerita Kita
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-rose-500 sm:text-[11px]">
                Romantic Memory Hub
              </p>
            </div>
          </Link>

          {!user ? (
            <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:hidden">
              <Link href="/login">
                <Button variant="secondary" className="px-4 py-2.5 text-xs sm:text-sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="px-4 py-2.5 text-xs sm:text-sm">Register</Button>
              </Link>
            </div>
          ) : null}
        </div>

        <nav className="hidden flex-1 items-center justify-center lg:flex">
          <div className="soft-shine hover-glow flex items-center gap-1 rounded-full border border-rose-200/90 bg-white/88 p-1.5 shadow-[0_12px_30px_rgba(206,140,170,0.08)] backdrop-blur-xl">
            <Link
              href="/#tentang"
              className="rounded-full px-4 py-2.5 text-sm font-medium text-rose-800 transition hover:bg-rose-50 hover:text-rose-950"
            >
              Tentang Website
            </Link>
            <Link
              href={dashboardHref}
              className="rounded-full px-4 py-2.5 text-sm font-medium text-rose-800 transition hover:bg-rose-50 hover:text-rose-950"
            >
              Dashboard
            </Link>
          </div>
        </nav>

        {user ? (
          <div className="w-full lg:ml-auto lg:w-auto">
            <div
              className={`rounded-[24px] border border-rose-100/90 bg-white/78 p-2 shadow-[0_10px_28px_rgba(206,140,170,0.08)] backdrop-blur-xl ${
                user.role !== "ADMIN" ? "grid grid-cols-3" : "grid grid-cols-2"
              } gap-2 sm:gap-3 lg:flex lg:w-auto lg:items-center`}
            >
              <Link href={dashboardHref} className="w-full lg:w-auto">
                <Button
                  variant="secondary"
                  className={`w-full px-3 py-2.5 text-xs sm:px-5 sm:text-sm ${
                    user.role !== "ADMIN" ? "" : "lg:min-w-[140px]"
                  }`}
                >
                  Dashboard
                </Button>
              </Link>
              {user.role !== "ADMIN" ? (
                <Link href="/dashboard/profile" className="w-full lg:w-auto">
                  <Button variant="ghost" className="w-full px-3 py-2.5 text-xs sm:px-4 sm:text-sm">
                    Profil
                  </Button>
                </Link>
              ) : null}
              <LogoutButton
                className={`w-full px-3 py-2.5 text-xs sm:px-4 sm:text-sm ${
                  user.role !== "ADMIN" ? "" : "lg:min-w-[120px]"
                }`}
              />
            </div>
          </div>
        ) : (
          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <Link href="/login">
              <Button variant="secondary">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
