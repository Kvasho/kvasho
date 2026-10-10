"use client";

import { useState } from "react";
import {
  DEFAULT_MINES,
  formatMoney,
  formatMultiplier,
  MAX_MINES,
  MIN_MINES,
  multiplier,
  placeMines,
  TILE_COUNT,
} from "./rules";

const START_BALANCE = 100_00;
const MINE_PRESETS = [1, 3, 5, 10, 24];

type Round = {
  status: "playing" | "lost" | "won";
  /** Stake in cents, already taken from the balance. */
  bet: number;
  mineCount: number;
  mines: number[];
  /** Tiles the player has opened, in order. */
  picked: number[];
  /** Winnings in cents, once the round is over. */
  payout: number;
};

function Gem() {
  return (
    <svg viewBox="0 0 24 24" className="mines-pop size-1/2">
      <path d="M6 3h12l4 6-10 12L2 9z" className="fill-emerald-400" />
      <path d="M6 3 2 9h20l-4-6-3 6-3-6-3 6z" className="fill-emerald-300" />
      <path d="M9 9l3 12 3-12z" className="fill-emerald-500" />
    </svg>
  );
}

function Mine() {
  return (
    <svg viewBox="0 0 24 24" className="mines-pop size-1/2">
      <path
        d="M14.5 7.5 17 5m1.5-2.5.5.5m1.5.5-1 .5m-2-3 .5 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10.5" cy="13.5" r="7.5" fill="currentColor" />
      <circle cx="8" cy="11" r="1.8" className="fill-white/50" />
    </svg>
  );
}

export default function MinesGame() {
  const [balance, setBalance] = useState(START_BALANCE);
  const [betInput, setBetInput] = useState("10");
  const [mineCount, setMineCount] = useState(DEFAULT_MINES);
  const [round, setRound] = useState<Round | null>(null);

  const playing = round?.status === "playing";
  const over = round?.status === "lost" || round?.status === "won";

  const bet = Math.round(Number.parseFloat(betInput) * 100);
  const betValid = Number.isFinite(bet) && bet >= 1 && bet <= balance;

  // A running round keeps the settings it started with; the form is for the next one.
  const activeMines = playing ? round.mineCount : mineCount;
  const picks = playing ? round.picked.length : 0;
  const current = multiplier(activeMines, picks);
  const safeLeft = TILE_COUNT - activeMines - picks;
  const next = safeLeft > 0 ? multiplier(activeMines, picks + 1) : null;
  const cashOutValue = playing ? Math.floor(round.bet * current) : 0;

  function startRound(firstTile?: number) {
    if (!betValid) return;

    const fresh: Round = {
      status: "playing",
      bet,
      mineCount,
      mines: placeMines(mineCount),
      picked: [],
      payout: 0,
    };
    setBalance((value) => value - bet);

    if (firstTile === undefined) {
      setRound(fresh);
    } else {
      openTile(fresh, firstTile);
    }
  }

  function finish(ended: Round, payout: number) {
    setBalance((value) => value + payout);
    setRound({ ...ended, status: "won", payout });
  }

  function openTile(active: Round, tile: number) {
    const picked = [...active.picked, tile];

    if (active.mines.includes(tile)) {
      setRound({ ...active, status: "lost", picked });
      return;
    }

    const opened = { ...active, picked };
    const payout = Math.floor(
      active.bet * multiplier(active.mineCount, picked.length),
    );

    // Nothing but mines left: pay out without making the player click again.
    if (picked.length === TILE_COUNT - active.mineCount) {
      finish(opened, payout);
    } else {
      setRound(opened);
    }
  }

  function handleTile(tile: number) {
    if (!round) {
      startRound(tile);
    } else if (playing && !round.picked.includes(tile)) {
      openTile(round, tile);
    }
  }

  function handleMainButton() {
    if (playing) {
      finish(round, cashOutValue);
    } else {
      startRound();
    }
  }

  function setBet(cents: number) {
    const clamped = Math.max(1, Math.min(cents, balance));
    setBetInput((clamped / 100).toFixed(2));
  }

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[22rem_1fr]">
      <aside className="flex flex-col gap-6 rounded-3xl border border-foreground/10 bg-foreground/3 p-6 backdrop-blur-md lg:self-start">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">
            Balance
          </p>
          <p className="mt-1 font-display text-5xl leading-none">
            {formatMoney(balance)}
          </p>
        </div>

        <div>
          <label
            htmlFor="mines-bet"
            className="text-xs uppercase tracking-[0.2em] text-foreground/50"
          >
            Bet amount
          </label>
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-foreground/50">
                $
              </span>
              <input
                id="mines-bet"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={betInput}
                onChange={(event) => setBetInput(event.target.value)}
                className="w-full rounded-full border border-foreground/15 bg-transparent py-3 pr-4 pl-8 outline-none transition-colors duration-300 focus:border-accent"
              />
            </div>
            {[
              { label: "½", cents: bet / 2 },
              { label: "2×", cents: bet * 2 },
              { label: "Max", cents: balance },
            ].map(({ label, cents }) => (
              <button
                key={label}
                type="button"
                disabled={!Number.isFinite(cents) || balance < 1}
                onClick={() => setBet(Math.floor(cents))}
                className="cursor-pointer rounded-full border border-foreground/15 px-3 text-sm transition-colors duration-300 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="mines-count"
              className="text-xs uppercase tracking-[0.2em] text-foreground/50"
            >
              Mines
            </label>
            <span className="text-sm text-foreground/60">
              <span className="font-display text-2xl text-foreground">
                {mineCount}
              </span>{" "}
              mines · {TILE_COUNT - mineCount} gems
            </span>
          </div>
          <input
            id="mines-count"
            type="range"
            min={MIN_MINES}
            max={MAX_MINES}
            value={mineCount}
            onChange={(event) => setMineCount(Number(event.target.value))}
            className="mt-3 w-full cursor-pointer accent-accent"
          />
          <div className="mt-3 flex gap-2">
            {MINE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-pressed={mineCount === preset}
                onClick={() => setMineCount(preset)}
                className={`flex-1 cursor-pointer rounded-full border py-1.5 text-sm transition-colors duration-300 ${
                  mineCount === preset
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-foreground/15 hover:border-accent hover:text-accent"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          {playing && (
            <p className="mt-3 text-xs text-foreground/50">
              This round: {formatMoney(round.bet)} on {round.mineCount}{" "}
              {round.mineCount === 1 ? "mine" : "mines"}. Changes apply to the
              next round.
            </p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-foreground/10 p-3">
            <dt className="text-xs uppercase tracking-[0.2em] text-foreground/50">
              Multiplier
            </dt>
            <dd className="mt-1 font-display text-2xl">
              {formatMultiplier(current)}
            </dd>
          </div>
          <div className="rounded-2xl border border-foreground/10 p-3">
            <dt className="text-xs uppercase tracking-[0.2em] text-foreground/50">
              Next tile
            </dt>
            <dd className="mt-1 font-display text-2xl">
              {next === null ? "—" : formatMultiplier(next)}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={handleMainButton}
          disabled={playing ? picks === 0 : !betValid}
          className={`cursor-pointer rounded-full px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${
            playing
              ? "bg-emerald-600 text-white"
              : "bg-accent text-accent-contrast"
          }`}
        >
          {playing
            ? picks === 0
              ? "Pick a tile"
              : `Cash out ${formatMoney(cashOutValue)}`
            : over
              ? "Bet again"
              : "Bet"}
        </button>

        <p
          role="status"
          aria-live="polite"
          className="min-h-10 text-sm text-foreground/70"
        >
          {round?.status === "lost" && (
            <>
              <span className="font-medium text-red-500">Boom!</span> You hit a
              mine and lost {formatMoney(round.bet)}.
            </>
          )}
          {round?.status === "won" && (
            <>
              <span className="font-medium text-emerald-500">Cashed out!</span>{" "}
              {formatMoney(round.payout)} at{" "}
              {formatMultiplier(multiplier(round.mineCount, round.picked.length))}
              .
            </>
          )}
          {!round && "Place a bet, or just pick a tile to start."}
          {!playing && !betValid && balance >= 1 && (
            <span className="block text-red-500">
              Enter a bet between $0.01 and {formatMoney(balance)}.
            </span>
          )}
        </p>

        {!playing && balance < 1 && (
          <button
            type="button"
            onClick={() => {
              setBalance(START_BALANCE);
              setRound(null);
            }}
            className="cursor-pointer rounded-full border border-foreground/15 px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            Out of money — reset to {formatMoney(START_BALANCE)}
          </button>
        )}
      </aside>

      <section
        // Remounting restarts the shake when a new round is lost.
        key={round?.status === "lost" ? round.mines.join() : "board"}
        className={`mx-auto grid w-full max-w-2xl grid-cols-5 gap-2 self-start rounded-3xl border border-foreground/10 bg-foreground/3 p-3 backdrop-blur-md sm:gap-3 sm:p-5 ${
          round?.status === "lost" ? "mines-shake" : ""
        }`}
      >
        {Array.from({ length: TILE_COUNT }, (_, tile) => {
          const picked = round?.picked.includes(tile) ?? false;
          const isMine = round?.mines.includes(tile) ?? false;
          const shown = picked || over;
          const clickable = !round ? betValid : playing && !picked;

          return (
            <button
              key={tile}
              type="button"
              disabled={!clickable}
              onClick={() => handleTile(tile)}
              aria-label={
                !shown
                  ? `Tile ${tile + 1}`
                  : isMine
                    ? `Tile ${tile + 1}: mine`
                    : `Tile ${tile + 1}: gem`
              }
              className={`flex aspect-square items-center justify-center rounded-2xl border transition duration-300 ${
                !shown
                  ? "border-foreground/10 bg-foreground/5 enabled:cursor-pointer enabled:hover:-translate-y-1 enabled:hover:border-accent/60 enabled:hover:bg-foreground/10"
                  : isMine
                    ? picked
                      ? "border-red-500 bg-red-500/30 text-red-500"
                      : "border-red-500/30 bg-red-500/10 text-red-500/60"
                    : picked
                      ? "border-emerald-500/60 bg-emerald-500/15"
                      : "border-foreground/10 bg-foreground/5 opacity-40"
              }`}
            >
              {shown && (isMine ? <Mine /> : <Gem />)}
            </button>
          );
        })}
      </section>
    </div>
  );
}
