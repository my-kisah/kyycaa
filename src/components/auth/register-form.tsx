"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/lib/validators";

type RegisterValues = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterValues) {
    setServerError("");
    startTransition(async () => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setServerError(data.error ?? "Register gagal.");
        return;
      }

      const signInResult = await signIn("credentials", {
        identifier: values.email,
        password: values.password,
        portal: "user",
        redirect: false,
      });

      if (signInResult?.error) {
        toast.success("Akun berhasil dibuat. Silakan login.");
        window.location.href = "/login";
        return;
      }

      toast.success("Registrasi berhasil.");
      window.location.href = "/dashboard";
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-rose-900">Nama</label>
        <Input
          placeholder="Nama lengkap"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-rose-900">Username</label>
        <Input
          placeholder="username"
          autoComplete="username"
          error={errors.username?.message}
          {...register("username")}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-rose-900">Email</label>
        <Input
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-rose-900">Password</label>
        <Input
          type="password"
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>
      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Membuat akun..." : "Daftar sekarang"}
      </Button>
      <p className="text-center text-sm text-rose-700/80">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-rose-600">
          Login di sini
        </Link>
      </p>
    </form>
  );
}
