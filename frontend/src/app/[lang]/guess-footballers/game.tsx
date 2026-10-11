"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import Board from "./board";
import { AWAY_COLOR, HOME_COLOR } from "./lineups";
import MatchList from "./match-list";
import {
  fetchLineups,
  matchDay,
  type Match,
  type MatchLineups,
} from "./matches";
import Pitch from "./pitch";

type LoadedLineups = {
  matchId: number;
  /** `null` when loading them failed. */
  lineups: MatchLineups | null;
};

function TeamName({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span
        aria-hidden
        className="size-3 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}

export default function Game() {
  const { t: dictionary, fmt } = useI18n();
  const t = dictionary.footballers;
  const [match, setMatch] = useState<Match | null>(null);
  const [loaded, setLoaded] = useState<LoadedLineups | null>(null);
  const matchId = match?.id;

  useEffect(() => {
    if (matchId === undefined) return;

    const controller = new AbortController();
    fetchLineups(matchId, controller.signal)
      .then((lineups) => setLoaded({ matchId, lineups }))
      .catch(() => {
        if (!controller.signal.aborted) setLoaded({ matchId, lineups: null });
      });

    return () => controller.abort();
  }, [matchId]);

  // Ignore lineups that belong to a previously selected match.
  const current = loaded?.matchId === matchId ? loaded : null;

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[24rem_1fr]">
      <aside className="lg:sticky lg:top-12 lg:self-start">
        <MatchList selectedId={match?.id ?? null} onSelect={setMatch} />
      </aside>

      <section className="rounded-3xl border border-foreground/10 bg-foreground/3 p-4 backdrop-blur-md sm:p-6">
        <header className="mb-5 min-h-20 px-2">
          {match ? (
            <>
              <p className="text-xs uppercase tracking-[0.3em] text-accent">
                {match.competition.name} · {match.season}
              </p>
              <h2 className="mt-2 flex flex-wrap items-center gap-x-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
                <TeamName name={match.home_team.name} color={HOME_COLOR} />
                <span className="text-foreground/40">{t.vs}</span>
                <TeamName name={match.away_team.name} color={AWAY_COLOR} />
              </h2>
              <p className="mt-1 text-sm text-foreground/60">
                {[fmt.day(matchDay(match.date)), match.stage, match.stadium]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </>
          ) : (
            <p className="flex min-h-20 items-center text-foreground/50">
              {t.pickMatch}
            </p>
          )}
        </header>

        {match && current?.lineups ? (
          <Board key={match.id} match={match} lineups={current.lineups} />
        ) : (
          <Pitch label={t.pitch} />
        )}

        {current && !current.lineups && (
          <p className="mt-4 px-2 text-sm text-foreground/60">{t.lineupsError}</p>
        )}
      </section>
    </div>
  );
}
