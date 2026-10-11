"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useI18n } from "@/i18n/provider";
import { ApiError, type Client, type ClientInput, type ValidationErrors } from "../../lib/api";
import { Button, Field, FormMessage } from "../../ui";

type ClientFormProps = {
  client?: Client;
  submitLabel: string;
  onSubmit: (input: ClientInput) => Promise<void>;
  /** Extra buttons next to the submit button, e.g. Cancel. */
  actions?: ReactNode;
  disabled?: boolean;
};

/** The client's details; used to create a client and to edit one. */
export default function ClientForm({ client, submitLabel, onSubmit, actions, disabled }: ClientFormProps) {
  const { t: dictionary } = useI18n();
  const t = dictionary.invoicer.clients;
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const optional = (name: string) => String(form.get(name) ?? "").trim() || null;

    setBusy(true);
    setErrors({});
    setMessage(null);

    try {
      await onSubmit({
        name: String(form.get("name") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        phone: optional("phone"),
        address: optional("address"),
        tax_id: optional("tax_id"),
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setErrors(error.errors);
      } else {
        setMessage(error instanceof ApiError ? error.message : dictionary.common.serverUnreachable);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2">
        <Field label={t.name} name="name" defaultValue={client?.name} required error={errors.name} className="sm:col-span-2" />
        <Field
          label={t.email}
          name="email"
          type="email"
          defaultValue={client?.email}
          required
          error={errors.email}
          hint={t.emailHint}
        />
        <Field label={t.phone} name="phone" type="tel" defaultValue={client?.phone ?? ""} error={errors.phone} />
        <Field label={t.address} name="address" defaultValue={client?.address ?? ""} error={errors.address} className="sm:col-span-2" />
        <Field label={t.taxId} name="tax_id" defaultValue={client?.tax_id ?? ""} error={errors.tax_id} />
      </fieldset>
      {message && (
        <div className="mt-4">
          <FormMessage tone="error">{message}</FormMessage>
        </div>
      )}
      {!disabled && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="submit" busy={busy}>
            {submitLabel}
          </Button>
          {actions}
        </div>
      )}
    </form>
  );
}
