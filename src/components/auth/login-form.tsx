"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { getLoginGuardMessageAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validators";

type LoginValues = {
  identifier: string;
  password: string;
  portal: "user" | "admin";
};

export function LoginForm({
  portal,
  callbackUrl,
}: {
  portal: "user" | "admin";
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      portal,
    },
  });

  function getSafeRedirectTarget(target?: string) {
    const adminFallback = "/admin";
    const userFallback = "/dashboard";

    if (!target || !target.startsWith("/")) {
      return portal === "admin" ? adminFallback : userFallback;
    }

    if (portal === "admin") {
      return target.startsWith("/admin") ? target : adminFallback;
    }

    if (target.startsWith("/admin")) {
      return userFallback;
    }

    if (target === "/login" || target === "/register" || target === "/admin/login") {
      return userFallback;
    }

    return target;
  }

  async function onSubmit(values: LoginValues) {
    setServerError("");
    startTransition(async () => {
      const redirectTarget = getSafeRedirectTarget(callbackUrl);
      const result = await signIn("credentials", {
        identifier: values.identifier,
        password: values.password,
        portal,
        callbackUrl: redirectTarget,
        redirect: false,
      });

      if (result?.error) {
        const guardMessage = await getLoginGuardMessageAction({
          identifier: values.identifier,
          portal,
        });

        setServerError(
          guardMessage.error ??
            (portal === "admin"
              ? "Login admin gagal. Pastikan email admin dan password benar."
              : "Login gagal. Periksa email atau username dan password Anda."),
        );
        return;
      }

      toast.success("Login berhasil.");
      router.replace(redirectTarget);
      router.refresh();
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-rose-900">
          {portal === "admin" ? "Email admin" : "Email atau username"}
        </label>
        <Input
          type="text"
          placeholder={portal === "admin" ? "admin@email.com" : "nama@email.com atau username"}
          autoComplete="username"
          error={errors.identifier?.message}
          {...register("identifier")}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-rose-900">Password</label>
        <Input
          type="password"
          placeholder="Masukkan password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>
      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Memproses..." : portal === "admin" ? "Masuk sebagai Admin" : "Login"}
      </Button>

      {portal === "user" ? (
        <>
          <p className="text-center text-sm text-rose-700/80">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-rose-600">
              Register di sini
            </Link>
          </p>
        </>
      ) : (
        <p className="text-center text-sm text-rose-700/80">
          Halaman ini khusus akun admin yang dibuat pemilik website.
        </p>
      )}
    </form>
  );
}
