"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { ApiError, deleteClient, fetchClient, updateClient, type Client } from "../../../lib/api";
import { useSession } from "../../../lib/session";
import Modal from "../../../modal";
import { Button, FormMessage, Panel } from "../../../ui";
import ClientForm from "../client-form";

export default function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useSession();
  const { t: dictionary, href, fmt } = useI18n();
  const t = dictionary.invoicer.clients;
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();

    fetchClient(id, controller.signal)
      .then(setClient)
      .catch((caught) => {
        if (controller.signal.aborted) return;
        setError(
          caught instanceof ApiError
            ? { status: caught.status, message: caught.message }
            : { status: 0, message: dictionary.common.serverUnreachable },
        );
      });

    return () => controller.abort();
  }, [user, id, dictionary]);

  const canManage = user?.can.manage_invoices ?? false;

  async function handleDelete() {
    if (!client) return;
    setDeleting(true);
    try {
      await deleteClient(client.id);
      router.push(href("/invoicer/clients"));
    } catch (caught) {
      setDeleting(false);
      setConfirmingDelete(false);
      setError({
        status: 0,
        message: caught instanceof ApiError ? caught.message : dictionary.common.serverUnreachable,
      });
    }
  }

  const back = (
    <Link href={href("/invoicer/clients")} className="text-sm text-foreground/60 transition-colors hover:text-accent">
      {t.all}
    </Link>
  );

  if (error?.status === 404) {
    return (
      <>
        {back}
        <Panel className="mt-4 text-center">
          <p className="font-medium">{t.notFound}</p>
        </Panel>
      </>
    );
  }

  if (!client) {
    return (
      <>
        {back}
        {error ? (
          <div className="mt-4">
            <FormMessage tone="error">{error.message}</FormMessage>
          </div>
        ) : (
          <div className="mt-16 flex justify-center">
            <span className="size-5 animate-spin rounded-full border-2 border-accent border-r-transparent" />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {back}
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{client.name}</h1>
          <p className="mt-1 text-sm text-foreground/60">
            {format(t.since, {
              date: fmt.monthYear(new Date(client.created_at)),
            })}
          </p>
        </div>
        {canManage && (
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            {t.delete}
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-4">
          <FormMessage tone="error">{error.message}</FormMessage>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel>
          <h2 className="text-lg font-semibold">{t.details}</h2>
          <div className="mt-6">
            <ClientForm
              key={client.id}
              client={client}
              disabled={!canManage}
              submitLabel={dictionary.invoicer.settings.save}
              onSubmit={async (input) => {
                setSaved(false);
                setClient(await updateClient(client.id, input));
                setSaved(true);
              }}
              actions={saved && <FormMessage tone="success">{dictionary.invoicer.settings.saved}</FormMessage>}
            />
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold">{t.invoices}</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs uppercase tracking-wider text-foreground/50">{t.outstanding}</dt>
              <dd className="mt-1 text-xl font-semibold">—</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-foreground/50">{t.invoices}</dt>
              <dd className="mt-1 text-xl font-semibold">0</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-foreground/60">{t.noInvoices}</p>
        </Panel>
      </div>

      <Modal open={confirmingDelete} title={t.deleteTitle} onClose={() => setConfirmingDelete(false)}>
        <p className="text-sm text-foreground/70">{format(t.deleteText, { name: client.name })}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="danger" busy={deleting} onClick={handleDelete}>
            {t.delete}
          </Button>
          <Button variant="secondary" onClick={() => setConfirmingDelete(false)}>
            {dictionary.common.cancel}
          </Button>
        </div>
      </Modal>
    </>
  );
}
