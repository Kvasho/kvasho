"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { format } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import {
  ApiError,
  removeCompanyLogo,
  updateCompany,
  uploadCompanyLogo,
  type Company,
  type ValidationErrors,
} from "../../lib/api";
import { useSession } from "../../lib/session";
import { Button, Field, FormMessage, Panel } from "../../ui";

export default function SettingsPage() {
  const { user, setUser } = useSession();
  const { t } = useI18n();
  const company = user?.company;

  if (!user || !company) return null;

  const canEdit = user.can.manage_company;

  /** Keep the menu and every page in sync with the saved company. */
  function applyCompany(next: Company) {
    setUser({ ...user!, company: next });
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">{t.invoicer.settings.title}</h1>
      {!canEdit && <p className="mt-1 text-sm text-foreground/60">{t.invoicer.settings.ownerOnly}</p>}
      <div className="mt-6 space-y-6">
        <LogoPanel company={company} canEdit={canEdit} onSaved={applyCompany} />
        <CompanyForm key={company.id} company={company} canEdit={canEdit} onSaved={applyCompany} />
      </div>
    </>
  );
}

type SectionProps = {
  company: Company;
  canEdit: boolean;
  onSaved: (company: Company) => void;
};

function CompanyForm({ company, canEdit, onSaved }: SectionProps) {
  const { t: dictionary } = useI18n();
  const t = dictionary.invoicer.settings;
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => {
      const text = String(form.get(name) ?? "").trim();
      return text === "" ? null : text;
    };

    setBusy(true);
    setErrors({});
    setMessage(null);

    try {
      onSaved(
        await updateCompany({
          name: value("name") ?? "",
          tax_id: value("tax_id"),
          address: value("address"),
          email: value("email"),
          phone: value("phone"),
          bank_account: value("bank_account"),
          currency: (value("currency") ?? "").toUpperCase(),
          invoice_prefix: (value("invoice_prefix") ?? "").toUpperCase(),
        }),
      );
      setMessage({ tone: "success", text: t.saved });
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setErrors(error.errors);
      } else {
        setMessage({
          tone: "error",
          text: error instanceof ApiError ? error.message : dictionary.common.serverUnreachable,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel>
      <h2 className="text-lg font-semibold">{t.company}</h2>
      <p className="mt-1 text-sm text-foreground/60">{t.companyHint}</p>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={!canEdit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t.name} name="name" defaultValue={company.name} required error={errors.name} className="sm:col-span-2" />
          <Field label={t.taxId} name="tax_id" defaultValue={company.tax_id ?? ""} error={errors.tax_id} />
          <Field label={t.email} name="email" type="email" defaultValue={company.email ?? ""} error={errors.email} />
          <Field label={t.address} name="address" defaultValue={company.address ?? ""} error={errors.address} className="sm:col-span-2" />
          <Field label={t.phone} name="phone" defaultValue={company.phone ?? ""} error={errors.phone} />
          <Field
            label={t.bankAccount}
            name="bank_account"
            defaultValue={company.bank_account ?? ""}
            error={errors.bank_account}
          />
          <Field
            label={t.currency}
            name="currency"
            defaultValue={company.currency}
            maxLength={3}
            error={errors.currency}
            hint={t.currencyHint}
          />
          <Field
            label={t.prefix}
            name="invoice_prefix"
            defaultValue={company.invoice_prefix}
            maxLength={10}
            error={errors.invoice_prefix}
            hint={format(t.prefixHint, {
              example: `${company.invoice_prefix}-${new Date().getFullYear()}-0001`,
            })}
          />
        </fieldset>
        {canEdit && (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button type="submit" busy={busy}>
              {t.save}
            </Button>
            {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}
          </div>
        )}
      </form>
    </Panel>
  );
}

function LogoPanel({ company, canEdit, onSaved }: SectionProps) {
  const { t: dictionary } = useI18n();
  const t = dictionary.invoicer.settings;
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<Company>) {
    setBusy(true);
    setError(null);
    try {
      onSaved(await action());
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.errors.logo?.[0] ?? caught.message);
      } else {
        setError(dictionary.common.serverUnreachable);
      }
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) run(() => uploadCompanyLogo(file));
  }

  return (
    <Panel>
      <h2 className="text-lg font-semibold">{t.logo}</h2>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-foreground/5">
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo_url}
              alt={format(t.logoAlt, { name: company.name })}
              className="size-full object-contain"
            />
          ) : (
            <span className="text-center text-xs text-foreground/40">{t.noLogo}</span>
          )}
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-3">
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFile}
              className="hidden"
              id="logo-input"
            />
            <Button variant="secondary" busy={busy} onClick={() => input.current?.click()}>
              {company.logo_url ? t.replace : t.upload}
            </Button>
            {company.logo_url && (
              <Button variant="danger" disabled={busy} onClick={() => run(removeCompanyLogo)}>
                {t.remove}
              </Button>
            )}
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-foreground/50">{t.logoHint}</p>
      {error && (
        <div className="mt-3">
          <FormMessage tone="error">{error}</FormMessage>
        </div>
      )}
    </Panel>
  );
}
