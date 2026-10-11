"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { ApiError, login, type ValidationErrors } from "../../lib/api";
import { useSession } from "../../lib/session";
import { Button, Field, FormMessage, Panel } from "../../ui";

export default function LoginPage() {
  const { setUser } = useSession();
  const { t: dictionary, href } = useI18n();
  const t = dictionary.invoicer.auth;
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setBusy(true);
    setErrors({});
    setMessage(null);

    try {
      setUser(
        await login({
          email: String(form.get("email")),
          password: String(form.get("password")),
          remember: form.get("remember") === "on",
        }),
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setErrors(error.errors);
      } else {
        setMessage(error instanceof ApiError ? error.message : dictionary.common.serverUnreachable);
      }
      setBusy(false);
    }
  }

  return (
    <Panel>
      <h1 className="text-xl font-semibold">{t.signIn}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {message && <FormMessage tone="error">{message}</FormMessage>}
        <Field label={t.email} name="email" type="email" autoComplete="email" required error={errors.email} />
        <Field
          label={t.password}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={errors.password}
        />
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <input type="checkbox" name="remember" className="accent-accent" />
          {t.remember}
        </label>
        <Button type="submit" busy={busy} className="w-full">
          {t.signIn}
        </Button>
      </form>
      <p className="mt-6 text-sm text-foreground/60">
        {t.newHere}{" "}
        <Link href={href("/invoicer/register")} className="font-medium text-accent hover:underline">
          {t.createLink}
        </Link>
      </p>
    </Panel>
  );
}
