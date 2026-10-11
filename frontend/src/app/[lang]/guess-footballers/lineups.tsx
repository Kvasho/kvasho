"use client";

import { useRef, type KeyboardEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { useI18n } from "@/i18n/provider";
import type { LineupSlot, MatchLineups, Player } from "./matches";
import { LENGTH, WIDTH } from "./pitch";

gsap.registerPlugin(useGSAP);

export const HOME_COLOR = "#e1061b";
export const AWAY_COLOR = "#1557ff";
const CORRECT_COLOR = "#16a34a";

export type Side = "home" | "away";

/** The outcome of the latest guess, used to animate that shirt. */
export type GuessResult = {
  slotId: number;
  correct: boolean;
  /** Changes with every guess so repeated results animate again. */
  attempt: number;
};

/**
 * Where each StatsBomb position stands, keyed by position id:
 * [metres from the team's own goal line, 0 (left touchline) to 1 (right)].
 */
const POSITIONS: Record<number, [depth: number, side: number]> = {
  1: [4, 0.5], // Goalkeeper
  2: [16, 0.88], // Right Back
  3: [13, 0.68], // Right Center Back
  4: [12, 0.5], // Center Back
  5: [13, 0.32], // Left Center Back
  6: [16, 0.12], // Left Back
  7: [22, 0.9], // Right Wing Back
  8: [22, 0.1], // Left Wing Back
  9: [23, 0.66], // Right Defensive Midfield
  10: [22, 0.5], // Center Defensive Midfield
  11: [23, 0.34], // Left Defensive Midfield
  12: [31, 0.9], // Right Midfield
  13: [30, 0.68], // Right Center Midfield
  14: [30, 0.5], // Center Midfield
  15: [30, 0.32], // Left Center Midfield
  16: [31, 0.1], // Left Midfield
  17: [41, 0.88], // Right Wing
  18: [38, 0.68], // Right Attacking Midfield
  19: [37, 0.5], // Center Attacking Midfield
  20: [38, 0.32], // Left Attacking Midfield
  21: [41, 0.12], // Left Wing
  22: [46, 0.64], // Right Center Forward
  23: [47, 0.5], // Center Forward
  24: [46, 0.36], // Left Center Forward
  25: [42, 0.5], // Secondary Striker
};

// A shirt roughly 6 m wide, centred on the player's spot.
const SHIRT =
  "M-1-2.4Q0-1.5 1-2.4L2.9-1.5 2.3 0 1.5-.4V2.4H-1.5V-.4L-2.3 0-2.9-1.5Z";

/**
 * A slot's spot on the pitch in metres. The home team attacks to the right,
 * the away team to the left.
 */
export function placeSlot(slot: LineupSlot, side: Side) {
  const [depth, lateral] = POSITIONS[slot.position_id] ?? [26, 0.5];

  return side === "home"
    ? { x: depth, y: lateral * WIDTH }
    : { x: LENGTH - depth, y: (1 - lateral) * WIDTH };
}

/** A slot's position in the page's language, falling back to the data's English name. */
export function positionName(slot: LineupSlot, t: Dictionary["footballers"]) {
  return t.positions[slot.position_id] ?? slot.position;
}

/** The part of a name that fits under a shirt, e.g. "Messi". */
function shortName(player: Player) {
  return player.name.split(" ").at(-1) ?? player.name;
}

type LineupsProps = {
  lineups: MatchLineups;
  /** The correctly guessed player of each slot, keyed by slot id. */
  guessed: Record<number, Player>;
  activeSlotId: number | null;
  /** The slot whose guess is being checked right now. */
  checkingSlotId: number | null;
  lastResult: GuessResult | null;
  /** Stop accepting clicks, e.g. once the game is over. */
  locked: boolean;
  onSelect: (slot: LineupSlot, side: Side) => void;
};

type TeamProps = Omit<LineupsProps, "lineups" | "lastResult"> & {
  slots: LineupSlot[];
  side: Side;
};

function Team({
  slots,
  side,
  guessed,
  activeSlotId,
  checkingSlotId,
  locked,
  onSelect,
}: TeamProps) {
  const { t: dictionary } = useI18n();
  const t = dictionary.footballers;

  return slots.map((slot) => {
    const { x, y } = placeSlot(slot, side);
    const position = positionName(slot, t);
    const player = guessed[slot.id];
    const active = slot.id === activeSlotId;
    const clickable = !player && !locked;

    function handleKeyDown(event: KeyboardEvent<SVGGElement>) {
      if (clickable && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        onSelect(slot, side);
      }
    }

    return (
      <g key={slot.id} transform={`translate(${x} ${y})`}>
        <g
          data-slot={slot.id}
          role="button"
          tabIndex={clickable ? 0 : -1}
          aria-disabled={!clickable}
          aria-label={
            player
              ? format(t.slotCorrect, { position, player: player.name })
              : format(t.slotGuess, { position })
          }
          onClick={clickable ? () => onSelect(slot, side) : undefined}
          onKeyDown={handleKeyDown}
          className={`lineup-shirt group outline-none ${clickable ? "cursor-pointer" : ""}`}
        >
          <title>{position}</title>
          <path
            d={SHIRT}
            fill={side === "home" ? HOME_COLOR : AWAY_COLOR}
            stroke={active ? "#ffd60a" : "#ffffff"}
            strokeWidth={active ? 0.5 : 0.25}
            strokeLinejoin="round"
            className={
              clickable
                ? "transition-[stroke-width] duration-200 group-hover:stroke-[0.5] group-focus-visible:stroke-[0.5]"
                : undefined
            }
          />
          {player ? (
            <>
              <circle
                cx="2.3"
                cy="-2"
                r="1.2"
                fill={CORRECT_COLOR}
                stroke="#ffffff"
                strokeWidth="0.2"
              />
              <path
                d="M1.75-2 2.15-1.6 2.9-2.4"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                y="4.6"
                textAnchor="middle"
                fontSize="1.9"
                fontWeight="700"
                fill="#ffffff"
                stroke="#0a0a0a"
                strokeOpacity="0.7"
                strokeWidth="0.45"
                paintOrder="stroke"
              >
                {shortName(player)}
              </text>
            </>
          ) : (
            <text
              y="1.2"
              textAnchor="middle"
              fontSize="2.2"
              fontWeight="700"
              fill="#ffffff"
            >
              {slot.id === checkingSlotId ? "…" : "?"}
            </text>
          )}
        </g>
      </g>
    );
  });
}

/** Both starting elevens as shirts on the pitch. Renders inside `<Pitch>`. */
export default function Lineups({ lineups, lastResult, ...team }: LineupsProps) {
  const root = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      gsap.from(".lineup-shirt", {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
        stagger: 0.03,
        transformOrigin: "50% 50%",
      });
    },
    { scope: root, dependencies: [lineups] },
  );

  // Bounce the shirt on a correct guess, shake it on a wrong one.
  useGSAP(
    () => {
      if (!lastResult) return;
      const shirt = `[data-slot="${lastResult.slotId}"]`;

      if (lastResult.correct) {
        gsap.fromTo(
          shirt,
          { scale: 1.7 },
          { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.4)" },
        );
      } else {
        gsap.fromTo(
          shirt,
          { x: -0.8 },
          { x: 0, duration: 0.6, ease: "elastic.out(1.2, 0.2)" },
        );
      }
    },
    { scope: root, dependencies: [lastResult] },
  );

  return (
    <g ref={root}>
      <Team slots={lineups.home_team} side="home" {...team} />
      <Team slots={lineups.away_team} side="away" {...team} />
    </g>
  );
}
