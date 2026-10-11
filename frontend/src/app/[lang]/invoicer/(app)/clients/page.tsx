"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, plural } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { ApiError, createClient, listClients, type Client, type Paginated } from "../../lib/api";
import { useSession } from "../../lib/session";
import Modal from "../../modal";
import { Button, FormMessage, Panel } from "../../ui";
import ClientForm from "./client-form";

export default function ClientsPage() {
  const { user } = useSession();
  const { t: dictionary, href } = useI18n();
  const t = dictionary.invoicer.clients;
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<Client> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Wait for a pause in typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();

    listClients({ search: query, page }, controller.signal)
      .then((next) => {
        setResult(next);
        setError(null);
      })
      .catch((caught) => {
        if (controller.signal.aborted) return;
        setError(caught instanceof ApiError ? caught.message : dictionary.common.serverUnreachable);
      });

    return () => controller.abort();
  }, [user, query, page, dictionary]);

  const canManage = user?.can.manage_invoices ?? false;
  const clients = result?.data ?? [];
  const meta = result?.meta;
  const clientHref = (client: Client) => href(`/invoicer/clients/${client.id}`);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="mt-1 text-sm text-foreground/60">
            {meta ? plural(meta.total, t.count) : " "}
          </p>
        </div>
        {canManage && <Button onClick={() => setCreating(true)}>{t.new}</Button>}
      </div>

      <div className="mt-6">
        <label className="sr-only" htmlFor="client-search">
          {t.search}
        </label>
        <input
          id="client-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-lg border border-foreground/15 bg-background/80 px-3 py-2.5 text-sm outline-none backdrop-blur-md transition-colors placeholder:text-foreground/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:max-w-sm"
        />
      </div>

      {error && (
        <div className="mt-4">
          <FormMessage tone="error">{error}</FormMessage>
        </div>
      )}

      <Panel className="mt-4 overflow-hidden p-0 sm:p-0">
        {result === null ? (
          <div className="flex justify-center py-16">
            <span className="size-5 animate-spin rounded-full border-2 border-accent border-r-transparent" />
          </div>
        ) : clients.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium">{query ? t.noMatch : t.empty}</p>
            {!query && canManage && <p className="mt-1 text-sm text-foreground/60">{t.emptyHint}</p>}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-foreground/10 text-xs uppercase tracking-wider text-foreground/50">
              <tr>
                <th className="px-6 py-3 font-medium">{t.name}</th>
                <th className="hidden px-6 py-3 font-medium sm:table-cell">{t.email}</th>
                <th className="hidden px-6 py-3 font-medium md:table-cell">{t.taxId}</th>
                <th className="hidden px-6 py-3 font-medium lg:table-cell">{t.phone}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => router.push(clientHref(client))}
                  className="cursor-pointer transition-colors hover:bg-accent/5"
                >
                  <td className="px-6 py-3.5">
                    <Link href={clientHref(client)} className="font-medium hover:text-accent">
                      {client.name}
                    </Link>
                    <p className="truncate text-xs text-foreground/50 sm:hidden">{client.email}</p>
                  </td>
                  <td className="hidden px-6 py-3.5 text-foreground/70 sm:table-cell">{client.email}</td>
                  <td className="hidden px-6 py-3.5 text-foreground/70 md:table-cell">{client.tax_id ?? "—"}</td>
                  <td className="hidden px-6 py-3.5 text-foreground/70 lg:table-cell">{client.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {meta && meta.last_page > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-foreground/60">
            {format(t.page, { page: meta.current_page, last: meta.last_page })}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {t.previous}
            </Button>
            <Button variant="secondary" disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>
              {t.next}
            </Button>
          </div>
        </div>
      )}

      <Modal open={creating} title={t.new} onClose={() => setCreating(false)}>
        <ClientForm
          submitLabel={t.add}
          onSubmit={async (input) => {
            const client = await createClient(input);
            setCreating(false);
            router.push(clientHref(client));
          }}
          actions={
            <Button type="button" variant="secondary" onClick={() => setCreating(false)}>
              {dictionary.common.cancel}
            </Button>
          }
        />
      </Modal>
    </>
  );
}
