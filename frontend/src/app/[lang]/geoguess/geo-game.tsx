"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { format } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import {
  ApiError,
  fetchGame,
  startGame,
  submitGuess,
  type Game,
  type GuessResult,
  type LatLng,
} from "./api";

// Leaflet needs the browser's `window`, so the map is never rendered on the server.
const GeoMap = dynamic(() => import("./geo-map"), {
  ssr: false,
  loading: () => <LoadingMap />,
});

const TOKEN_KEY = "geoguess-token";

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Without storage the game still works; it just can't resume after a refresh.
  }
}

/** Numbers, points and kilometres written the way the page's language does. */
function useFormat() {
  const { fmt, t } = useI18n();

  return {
    number: fmt.number,
    points: fmt.number,
    km: (value: number) => format(t.geo.km, { n: fmt.number(value) }),
  };
}

function MapPlaceholder({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-full items-center justify-center bg-foreground/5 text-sm text-foreground/50">
      {children}
    </div>
  );
}

function LoadingMap() {
  const { t } = useI18n();
  return <MapPlaceholder>{t.geo.loadingMap}</MapPlaceholder>;
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-foreground/3 px-4 py-3 backdrop-blur-md">
      <dt className="text-xs uppercase tracking-[0.2em] text-foreground/50">
        {label}
      </dt>
      <dd className="mt-1 font-display text-2xl leading-none sm:text-3xl">
        {children}
      </dd>
    </div>
  );
}

function Flag({ url, name, className }: { url: string | null; name: string; className: string }) {
  const { t } = useI18n();
  if (!url) return null;

  return (
    // Flags come from an external CDN in a size that needs no optimising.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={format(t.geo.flagOf, { name })}
      className={`rounded-md border border-foreground/10 object-cover ${className}`}
    />
  );
}

const buttonClass =
  "cursor-pointer rounded-full bg-accent px-8 py-4 text-sm font-medium uppercase tracking-[0.2em] text-accent-contrast transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40";

export default function GeoGame() {
  const { t: dictionary } = useI18n();
  const t = dictionary.geo;
  const fmt = useFormat();
  const [game, setGame] = useState<Game | null>(null);
  const [loadError, setLoadError] = useState(false);
  /** Bumped to load again: after an error, or to start a fresh game. */
  const [attempt, setAttempt] = useState(0);

  const [guess, setGuess] = useState<LatLng | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  /** The scored guess of the round on screen, until the player moves on. */
  const [reveal, setReveal] = useState<GuessResult | null>(null);

  // Next.js hides this page instead of unmounting it when navigating away,
  // and Leaflet tears its map down at that moment. Giving the map a new key
  // makes it start from scratch when the page is shown again; without this
  // the old, destroyed map is reused and crashes.
  const [mapKey, setMapKey] = useState(0);
  useLayoutEffect(() => () => setMapKey((current) => current + 1), []);

  // Resume the stored game if there is one, otherwise start a new one.
  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      const token = readToken();
      if (token) {
        try {
          return await fetchGame(token, controller.signal);
        } catch (error) {
          // A game that no longer exists is simply replaced by a new one.
          if (!(error instanceof ApiError && error.status === 404)) throw error;
        }
      }

      return startGame(controller.signal);
    }

    load()
      .then((loaded) => {
        saveToken(loaded.token);
        setGame(loaded);
        setLoadError(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setLoadError(true);
      });

    return () => controller.abort();
  }, [attempt]);

  function handlePlayAgain() {
    saveToken(null);
    setGame(null);
    setGuess(null);
    setReveal(null);
    setSubmitError(false);
    setAttempt((current) => current + 1);
  }

  async function handleConfirm() {
    if (!game?.question || !guess || submitting) return;

    setSubmitting(true);
    setSubmitError(false);
    try {
      setReveal(await submitGuess(game.token, game.question.round, guess));
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Answered already (e.g. in another tab): pick up where the game really is.
        setGuess(null);
        setGame(null);
        setAttempt((current) => current + 1);
      } else {
        setSubmitError(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (!game || !reveal) return;

    setGame(
      reveal.result ?? {
        ...game,
        current_round: reveal.next_question?.round ?? game.current_round,
        question: reveal.next_question,
        total_score: reveal.total_score,
        total_distance_km: reveal.total_distance_km,
      },
    );
    setGuess(null);
    setReveal(null);
  }

  if (loadError) {
    return (
      <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-foreground/10 bg-foreground/3 p-10 text-center backdrop-blur-md">
        <p className="text-foreground/70">{t.loadError}</p>
        <button
          type="button"
          onClick={() => {
            setLoadError(false);
            setAttempt((current) => current + 1);
          }}
          className={buttonClass}
        >
          {dictionary.common.tryAgain}
        </button>
      </div>
    );
  }

  if (!game) {
    return (
      <p className="mt-10 rounded-3xl border border-foreground/10 bg-foreground/3 p-10 text-center text-foreground/50 backdrop-blur-md">
        {t.loading}
      </p>
    );
  }

  if (!game.question) {
    return <Result game={game} onPlayAgain={handlePlayAgain} />;
  }

  const { question } = game;
  const totalScore = reveal?.total_score ?? game.total_score;
  const totalDistance = reveal?.total_distance_km ?? game.total_distance_km;

  return (
    <div className="mt-10 flex flex-col gap-4">
      <dl className="grid grid-cols-3 gap-3">
        <Stat label={t.round}>
          {question.round}
          <span className="text-foreground/40"> / {game.total_rounds}</span>
        </Stat>
        <Stat label={t.score}>{fmt.points(totalScore)}</Stat>
        <Stat label={t.distance}>
          {fmt.number(totalDistance)}
          <span className="text-base text-foreground/40">
            {" "}
            / {fmt.km(game.win_distance_km)}
          </span>
        </Stat>
      </dl>

      <div className="flex items-center gap-4 rounded-3xl border border-foreground/10 bg-foreground/3 p-4 backdrop-blur-md sm:p-5">
        <Flag url={question.flag_url} name={question.country_name} className="h-12 w-auto sm:h-16" />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">
            {t.whereIs}
          </p>
          <h2 className="font-display text-3xl uppercase leading-tight sm:text-5xl">
            {question.country_name}
          </h2>
        </div>
      </div>

      {/* `isolate` keeps Leaflet's high z-indexes below the site's overlays. */}
      <div className="isolate h-[55vh] min-h-80 overflow-hidden rounded-3xl border border-foreground/10">
        <GeoMap
          key={mapKey}
          round={question.round}
          guess={guess}
          answer={reveal?.correct ?? null}
          locked={submitting || reveal !== null}
          onGuess={setGuess}
        />
      </div>

      <div className="flex flex-col items-stretch gap-4 rounded-3xl border border-foreground/10 bg-foreground/3 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p role="status" aria-live="polite" className="text-foreground/70">
          {reveal ? (
            <>
              <span className="font-display text-3xl text-foreground">
                {fmt.km(reveal.distance_km)}
              </span>{" "}
              {t.away} ·{" "}
              <span className="font-medium text-accent">
                {format(t.points, { points: fmt.points(reveal.score) })}
              </span>
            </>
          ) : submitError ? (
            <span className="text-red-500">{t.submitError}</span>
          ) : guess ? (
            t.hintMove
          ) : (
            t.hintStart
          )}
        </p>

        {reveal ? (
          <button type="button" onClick={handleNext} className={buttonClass}>
            {reveal.next_question ? t.next : t.seeResult}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!guess || submitting}
            className={buttonClass}
          >
            {submitting ? t.checking : t.confirm}
          </button>
        )}
      </div>
    </div>
  );
}

function Result({ game, onPlayAgain }: { game: Game; onPlayAgain: () => void }) {
  const { t: dictionary } = useI18n();
  const t = dictionary.geo;
  const fmt = useFormat();
  const won = game.status === "won";

  return (
    <div className="mt-10 flex flex-col gap-6 rounded-3xl border border-foreground/10 bg-foreground/3 p-6 backdrop-blur-md sm:p-10">
      <div>
        <p
          className={`font-display text-6xl uppercase leading-none sm:text-8xl ${
            won ? "text-emerald-500" : "text-accent"
          }`}
        >
          {won ? t.won : t.lost}
        </p>
        <p className="mt-3 text-foreground/70">{won ? t.wonText : t.lostText}</p>
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Stat label={t.totalScore}>
          {fmt.points(game.total_score)}
          <span className="text-base text-foreground/40">
            {" "}
            / {fmt.points(game.max_score)}
          </span>
        </Stat>
        <Stat label={t.totalDistance}>
          {fmt.number(game.total_distance_km)}
          <span className="text-base text-foreground/40">
            {" "}
            / {format(t.limit, { distance: fmt.km(game.win_distance_km) })}
          </span>
        </Stat>
      </dl>

      <div className="overflow-x-auto">
        <table className="w-full min-w-96 text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-foreground/50">
            <tr>
              <th scope="col" className="py-2 pr-4 font-normal">
                #
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                {t.country}
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-normal">
                {t.distance}
              </th>
              <th scope="col" className="py-2 text-right font-normal">
                {t.score}
              </th>
            </tr>
          </thead>
          <tbody>
            {game.rounds.map((round) => (
              <tr key={round.round} className="border-t border-foreground/10">
                <td className="py-3 pr-4 text-foreground/50">{round.round}</td>
                <td className="py-3 pr-4">
                  <span className="flex items-center gap-3">
                    <Flag url={round.flag_url} name={round.country_name} className="h-5 w-8" />
                    {round.country_name}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {fmt.km(round.distance_km)}
                </td>
                <td className="py-3 text-right font-medium tabular-nums">
                  {fmt.points(round.score)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={onPlayAgain} className={`${buttonClass} self-start`}>
        {dictionary.common.playAgain}
      </button>
    </div>
  );
}
