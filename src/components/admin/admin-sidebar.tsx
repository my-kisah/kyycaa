"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardPenLine,
  LayoutDashboard,
  MessageSquareHeart,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/content", label: "Kelola Konten", icon: ClipboardPenLine },
  { href: "/admin/content/new", label: "Tambah Konten", icon: PlusCircle },
  { href: "/admin/comments", label: "Komentar", icon: MessageSquareHeart },
  { href: "/admin/analytics", label: "Analisis", icon: BarChart3 },
  { href: "/admin/settings#users", label: "Pengguna", icon: Users },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="luxe-panel rise-card rounded-[34px] p-5">
      <div className="soft-shine rounded-[28px] border border-white/55 bg-[linear-gradient(135deg,rgba(244,177,203,0.3),rgba(255,255,255,0.4))] px-4 py-4">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-500">
          Admin Panel
        </p>
        <p className="mt-3 text-sm leading-7 text-rose-800/78">
          Navigasi cepat untuk mengelola seluruh konten, komentar, pengguna, dan insight website.
        </p>
      </div>
      <nav className="grid gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            pathname === link.href ||
            (link.href.includes("#users") && pathname === "/admin/settings");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group mt-2 flex items-center gap-3 rounded-[26px] px-4 py-3.5 text-sm font-medium transition duration-300",
                active
                  ? "bg-[linear-gradient(135deg,#f49dbe,#c5729c)] text-white shadow-[0_18px_36px_rgba(197,114,156,0.28)]"
                  : "text-rose-800 hover:-translate-y-0.5 hover:bg-white/78 hover:shadow-[0_18px_34px_rgba(208,148,170,0.12)]",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition",
                  active
                    ? "bg-white/20"
                    : "bg-rose-100 text-rose-500 group-hover:bg-white",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
