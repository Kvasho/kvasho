"use client";

import { useEffect, useRef, useState, type UIEvent } from "react";
import { format, plural } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { fetchMatches, matchDay, type Match } from "./matches";

type Result = {
  /** The search text these matches were loaded for. */
  query: string;
  matches: Match[];
  page: number;
  lastPage: number;
  total: number;
  failed: boolean;
};

type MatchListProps = {
  selectedId: number | null;
  onSelect: (match: Match) => void;
};

export default function MatchList({ selectedId, onSelect }: MatchListProps) {
  const { t: dictionary, fmt } = useI18n();
  const t = dictionary.footballers;
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const list = useRef<HTMLUListElement>(null);

  // Wait for a pause in typing before asking the API.
  useEffect(() => {
    const timeout = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    fetchMatches(query, 1, controller.signal)
      .then((page) => {
        setResult({
          query,
          matches: page.data,
          page: 1,
          lastPage: page.meta.last_page,
          total: page.meta.total,
          failed: false,
        });
        list.current?.scrollTo(0, 0);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setResult({
          query,
          matches: [],
          page: 1,
          lastPage: 1,
          total: 0,
          failed: true,
        });
      });

    return () => controller.abort();
  }, [query, attempt]);

  const loading = result?.query !== query;

  function loadMore() {
    if (!result || loading || loadingMore || result.page >= result.lastPage) {
      return;
    }

    const nextPage = result.page + 1;
    setLoadingMore(true);
    fetchMatches(query, nextPage)
      .then((page) => {
        setResult((current) =>
          current && current.query === query && current.page === nextPage - 1
            ? {
                ...current,
                matches: [...current.matches, ...page.data],
                page: nextPage,
                lastPage: page.meta.last_page,
              }
            : current,
        );
      })
      .catch(() => {
        // Scrolling again retries.
      })
      .finally(() => setLoadingMore(false));
  }

  function handleScroll(event: UIEvent<HTMLUListElement>) {
    const el = event.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) loadMore();
  }

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/3 backdrop-blur-md lg:h-[calc(100vh-6rem)]">
      <div className="border-b border-foreground/10 p-4">
        <label className="relative block">
          <span className="sr-only">{t.searchMatches}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-foreground/40"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-full border border-foreground/15 bg-transparent py-3 pr-4 pl-11 text-sm outline-none transition-colors duration-300 placeholder:text-foreground/40 focus:border-accent"
          />
        </label>
        <p className="mt-3 px-1 text-xs uppercase tracking-[0.2em] text-foreground/40">
          {result && !result.failed
            ? plural(result.total, t.matchCount, { count: fmt.number(result.total) })
            : " "}
        </p>
      </div>

      {result?.failed ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-sm text-foreground/60">{t.matchesError}</p>
          <button
            type="button"
            onClick={() => setAttempt((current) => current + 1)}
            className="cursor-pointer rounded-full border border-foreground/15 px-5 py-2 text-xs uppercase tracking-[0.2em] transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-white"
          >
            {dictionary.common.tryAgain}
          </button>
        </div>
      ) : !result ? (
        <p className="flex flex-1 items-center justify-center text-sm text-foreground/50">
          {t.loadingMatches}
        </p>
      ) : result.matches.length === 0 ? (
        <p className="flex flex-1 items-center justify-center p-6 text-center text-sm text-foreground/50">
          {format(t.noMatches, { query: result.query })}
        </p>
      ) : (
        <ul
          ref={list}
          onScroll={handleScroll}
          className={`match-list flex-1 space-y-1 overflow-y-auto overscroll-contain p-2 transition-opacity duration-300 ${loading ? "opacity-50" : ""}`}
        >
          {result.matches.map((match) => {
            const selected = match.id === selectedId;

            return (
              <li key={match.id}>
                <button
                  type="button"
                  onClick={() => onSelect(match)}
                  aria-pressed={selected}
                  className={`group w-full cursor-pointer rounded-2xl border px-4 py-3 text-left transition-colors duration-300 ${
                    selected
                      ? "border-accent bg-accent/10"
                      : "border-transparent hover:bg-foreground/5"
                  }`}
                >
                  <span className="block font-medium">
                    {match.home_team.name}{" "}
                    <span className="text-foreground/40">{t.vs}</span>{" "}
                    {match.away_team.name}
                  </span>
                  <span className="mt-1 block text-xs text-foreground/50">
                    {match.competition.name} · {match.season} ·{" "}
                    {fmt.day(matchDay(match.date))}
                  </span>
                </button>
              </li>
            );
          })}
          {result.page < result.lastPage && (
            <li className="py-3 text-center text-xs text-foreground/40">
              {loadingMore ? t.loadingMore : t.scrollMore}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
