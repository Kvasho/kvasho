"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { ApiError, register, type ValidationErrors } from "../../lib/api";
import { useSession } from "../../lib/session";
import { Button, Field, FormMessage, Panel } from "../../ui";

export default function RegisterPage() {
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
        await register({
          name: String(form.get("name")),
          email: String(form.get("email")),
          company_name: String(form.get("company_name")),
          password: String(form.get("password")),
          password_confirmation: String(form.get("password_confirmation")),
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
      <h1 className="text-xl font-semibold">{t.createTitle}</h1>
      <p className="mt-1 text-sm text-foreground/60">{t.createSubtitle}</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {message && <FormMessage tone="error">{message}</FormMessage>}
        <Field label={t.yourName} name="name" autoComplete="name" required error={errors.name} />
        <Field label={t.email} name="email" type="email" autoComplete="email" required error={errors.email} />
        <Field
          label={t.companyName}
          name="company_name"
          autoComplete="organization"
          required
          error={errors.company_name}
          hint={t.companyHint}
        />
        <Field
          label={t.password}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          error={errors.password}
        />
        <Field
          label={t.confirmPassword}
          name="password_confirmation"
          type="password"
          autoComplete="new-password"
          required
        />
        <Button type="submit" busy={busy} className="w-full">
          {t.createButton}
        </Button>
      </form>
      <p className="mt-6 text-sm text-foreground/60">
        {t.haveAccount}{" "}
        <Link href={href("/invoicer/login")} className="font-medium text-accent hover:underline">
          {t.signIn}
        </Link>
      </p>
    </Panel>
  );
}
