"use client";

import type { FormEvent } from "react";
import { useActionState, useState } from "react";
import { verifyRegistrationOtpAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterOtpForm({
  challengeId,
  maskedEmail,
  developmentCode,
}: {
  challengeId: string;
  maskedEmail?: string;
  developmentCode?: string;
}) {
  const [code, setCode] = useState("");
  const [state, action, isPending] = useActionState(verifyRegistrationOtpAction, {
    error: "",
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (!/^\d{6}$/.test(code.trim())) {
      event.preventDefault();
    }
  }

  return (
    <form className="space-y-5" action={action} onSubmit={onSubmit}>
      <input type="hidden" name="challengeId" value={challengeId} />

      <div className="rounded-[28px] border border-rose-100/80 bg-white/72 px-5 py-4 text-sm leading-7 text-rose-800/80">
        <p className="font-semibold text-rose-900">Verifikasi register Anda.</p>
        <p className="mt-1">
          Kami mengirim OTP 6 digit ke{" "}
          <span className="font-semibold text-rose-700">
            {maskedEmail ?? "email Gmail Anda"}
          </span>
          . Masukkan kodenya untuk mengaktifkan akun baru Anda.
        </p>
        {developmentCode ? (
          <p className="mt-3 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">
            Dev OTP: {developmentCode}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-rose-900">Kode OTP 6 digit</label>
        <Input
          name="code"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          error={state.error || (!/^\d{0,6}$/.test(code) ? "Kode OTP harus angka." : undefined)}
        />
      </div>

      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Memverifikasi..." : "Verifikasi akun"}
      </Button>
    </form>
  );
}
