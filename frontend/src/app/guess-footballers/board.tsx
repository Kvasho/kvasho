"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Lineups, { placeSlot, type GuessResult, type Side } from "./lineups";
import {
  submitGuess,
  type LineupSlot,
  type Match,
  type MatchLineups,
  type Player,
} from "./matches";
import Pitch, { LENGTH, PITCH_MARGIN, WIDTH } from "./pitch";
import PlayerSearch from "./player-search";

/** Wrong guesses allowed before the game ends. */
const MAX_MISTAKES = 3;

type ActiveSlot = {
  slot: LineupSlot;
  side: Side;
};

type Notice = {
  kind: "success" | "error" | "warning";
  text: string;
  /** Changes with every notice so the same message animates in again. */
  attempt: number;
};

const NOTICE_STYLES: Record<Notice["kind"], string> = {
  success: "bg-green-600 text-white",
  error: "bg-accent text-white",
  warning: "bg-foreground text-background",
};

/** Anchor the popover next to a spot on the pitch, opening towards the middle. */
function popoverStyle({ slot, side }: ActiveSlot): CSSProperties {
  const { x, y } = placeSlot(slot, side);
  const horizontal =
    x < LENGTH / 3 ? "-1.5rem" : x > (LENGTH * 2) / 3 ? "calc(-100% + 1.5rem)" : "-50%";
  const vertical = y > WIDTH / 2 ? "calc(-100% - 1.75rem)" : "1.75rem";

  return {
    left: `${((x + PITCH_MARGIN) / (LENGTH + PITCH_MARGIN * 2)) * 100}%`,
    top: `${((y + PITCH_MARGIN) / (WIDTH + PITCH_MARGIN * 2)) * 100}%`,
    transform: `translate(${horizontal}, ${vertical})`,
  };
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-5 transition-colors duration-500 ${
        filled ? "fill-accent text-accent" : "fill-transparent text-foreground/25"
      }`}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M12 20.5S4.5 16 2.8 11.2A5.2 5.2 0 0 1 12 6.6a5.2 5.2 0 0 1 9.2 4.6C19.5 16 12 20.5 12 20.5Z" />
    </svg>
  );
}

type BoardProps = {
  match: Match;
  lineups: MatchLineups;
};

/** The pitch with both lineups, the name search and the state of the game. */
export default function Board({ match, lineups }: BoardProps) {
  const [guessed, setGuessed] = useState<Record<number, Player>>({});
  const [mistakes, setMistakes] = useState(0);
  const [active, setActive] = useState<ActiveSlot | null>(null);
  const [checkingSlotId, setCheckingSlotId] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<GuessResult | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const popover = useRef<HTMLDivElement>(null);
  const attempts = useRef(0);

  const total = lineups.home_team.length + lineups.away_team.length;
  const guessedCount = Object.keys(guessed).length;
  const lost = mistakes >= MAX_MISTAKES;
  const won = total > 0 && guessedCount === total;

  // Close the search when clicking anywhere else; shirts handle themselves.
  useEffect(() => {
    if (!active) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Element;
      if (popover.current?.contains(target)) return;
      if (target.closest(".lineup-shirt")) return;
      setActive(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [active]);

  useEffect(() => {
    if (!notice) return;

    const timeout = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

  function handleSelect(slot: LineupSlot, side: Side) {
    if (checkingSlotId !== null) return;
    setActive((current) =>
      current?.slot.id === slot.id ? null : { slot, side },
    );
  }

  async function handlePick(player: Player) {
    if (!active) return;

    const { slot } = active;
    const attempt = ++attempts.current;
    setActive(null);
    setCheckingSlotId(slot.id);

    try {
      const correct = await submitGuess(match.id, slot.id, player.id);

      if (correct) {
        setGuessed((current) => ({ ...current, [slot.id]: player }));
        setNotice({
          kind: "success",
          text: `Correct! ${player.name} started as ${slot.position}.`,
          attempt,
        });
      } else {
        const left = MAX_MISTAKES - mistakes - 1;
        setMistakes((current) => current + 1);
        setNotice({
          kind: "error",
          text: `Wrong — it wasn't ${player.name}. ${
            left === 1 ? "1 try left." : `${left} tries left.`
          }`,
          attempt,
        });
      }
      setLastResult({ slotId: slot.id, correct, attempt });
    } catch {
      setNotice({
        kind: "warning",
        text: "Couldn't check that guess. Please try again.",
        attempt,
      });
    } finally {
      setCheckingSlotId(null);
    }
  }

  function handleRestart() {
    setGuessed({});
    setMistakes(0);
    setLastResult(null);
    setNotice(null);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-2">
        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">
          Guessed{" "}
          <span className="text-foreground">
            {guessedCount} / {total}
          </span>
        </p>
        <div
          role="img"
          aria-label={`${MAX_MISTAKES - mistakes} of ${MAX_MISTAKES} tries left`}
          className="flex gap-1"
        >
          {Array.from({ length: MAX_MISTAKES }, (_, i) => (
            <Heart key={i} filled={i < MAX_MISTAKES - mistakes} />
          ))}
        </div>
      </div>

      <div className="relative">
        <Pitch>
          <Lineups
            lineups={lineups}
            guessed={guessed}
            activeSlotId={active?.slot.id ?? null}
            checkingSlotId={checkingSlotId}
            lastResult={lastResult}
            locked={lost || won}
            onSelect={handleSelect}
          />
        </Pitch>

        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center px-3"
        >
          {notice && !lost && !won && (
            <p
              key={notice.attempt}
              className={`guess-notice rounded-full px-5 py-2.5 text-center text-sm font-medium shadow-xl ${NOTICE_STYLES[notice.kind]}`}
            >
              {notice.text}
            </p>
          )}
        </div>

        {active && (
          <div
            ref={popover}
            role="dialog"
            aria-label={`Guess the ${active.slot.position}`}
            style={popoverStyle(active)}
            className="absolute z-20 w-64 rounded-2xl border border-foreground/15 bg-background/95 p-3 shadow-2xl backdrop-blur-md max-sm:left-2! max-sm:right-2! max-sm:w-auto max-sm:transform-none!"
          >
            <div className="mb-3 px-1">
              <p className="text-xs uppercase tracking-[0.2em] text-accent">
                {active.slot.position}
              </p>
              <p className="text-xs text-foreground/50">
                {active.side === "home"
                  ? match.home_team.name
                  : match.away_team.name}
              </p>
            </div>
            <PlayerSearch
              key={active.slot.id}
              onPick={handlePick}
              onClose={() => setActive(null)}
            />
          </div>
        )}

        {(lost || won) && (
          <div
            role="alertdialog"
            aria-label={won ? "You won" : "Game over"}
            className="game-result absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 rounded-2xl bg-background/85 p-6 text-center backdrop-blur-sm"
          >
            <p
              className={`font-display text-5xl uppercase leading-none sm:text-7xl ${
                won ? "text-green-500" : "text-accent"
              }`}
            >
              {won ? "You got them all!" : "Game over"}
            </p>
            <p className="text-foreground/70">
              {won
                ? `All ${total} players guessed with ${mistakes} wrong ${mistakes === 1 ? "try" : "tries"}.`
                : `Three wrong guesses. You named ${guessedCount} of ${total} players.`}
            </p>
            <button
              type="button"
              autoFocus
              onClick={handleRestart}
              className="mt-2 cursor-pointer rounded-full border border-foreground/15 px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-white"
            >
              {won ? "Play again" : "Try again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
