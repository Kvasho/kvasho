"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import {
  fetchPlayers,
  MIN_PLAYER_SEARCH_LENGTH,
  type Player,
} from "./matches";

type Suggestions = {
  /** The search text these players were suggested for. */
  query: string;
  /** `null` when loading them failed. */
  players: Player[] | null;
};

type PlayerSearchProps = {
  onPick: (player: Player) => void;
  onClose: () => void;
};

export default function PlayerSearch({ onPick, onClose }: PlayerSearchProps) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [highlighted, setHighlighted] = useState(0);

  const longEnough = query.length >= MIN_PLAYER_SEARCH_LENGTH;

  // Wait for a pause in typing before asking the API.
  useEffect(() => {
    const timeout = setTimeout(() => setQuery(search.trim()), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!longEnough) return;

    const controller = new AbortController();
    fetchPlayers(query, controller.signal)
      .then((players) => {
        setSuggestions({ query, players });
        setHighlighted(0);
      })
      .catch(() => {
        if (!controller.signal.aborted) setSuggestions({ query, players: null });
      });

    return () => controller.abort();
  }, [query, longEnough]);

  const current = longEnough && suggestions?.query === query ? suggestions : null;
  const players = current?.players ?? [];

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      onClose();
    } else if (event.key === "ArrowDown" && players.length > 0) {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % players.length);
    } else if (event.key === "ArrowUp" && players.length > 0) {
      event.preventDefault();
      setHighlighted((index) => (index - 1 + players.length) % players.length);
    } else if (event.key === "Enter" && players[highlighted]) {
      event.preventDefault();
      onPick(players[highlighted]);
    }
  }

  return (
    <div>
      <input
        type="text"
        autoFocus
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={players.length > 0}
        aria-controls="player-suggestions"
        aria-autocomplete="list"
        aria-label="Player name"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a player's name…"
        className="w-full rounded-full border border-foreground/15 bg-transparent px-4 py-2.5 text-sm outline-none transition-colors duration-300 placeholder:text-foreground/40 focus:border-accent"
      />

      {!longEnough ? (
        <p className="px-1 pt-3 text-xs text-foreground/50">
          Type at least {MIN_PLAYER_SEARCH_LENGTH} letters to see suggestions.
        </p>
      ) : !current ? (
        <p className="px-1 pt-3 text-xs text-foreground/50">Searching…</p>
      ) : current.players === null ? (
        <p className="px-1 pt-3 text-xs text-foreground/50">
          Couldn&apos;t load suggestions. Keep typing to try again.
        </p>
      ) : players.length === 0 ? (
        <p className="px-1 pt-3 text-xs text-foreground/50">
          No players found for “{current.query}”.
        </p>
      ) : (
        <ul
          id="player-suggestions"
          role="listbox"
          className="match-list mt-2 max-h-56 space-y-0.5 overflow-y-auto overscroll-contain"
        >
          {players.map((player, index) => (
            <li
              key={player.id}
              role="option"
              aria-selected={index === highlighted}
              onPointerEnter={() => setHighlighted(index)}
              // Keep the input focused so the choice registers before blur.
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => onPick(player)}
              className={`cursor-pointer rounded-xl px-3 py-2 transition-colors duration-150 ${
                index === highlighted ? "bg-accent text-white" : ""
              }`}
            >
              <span className="block text-sm font-medium">{player.name}</span>
              <span
                className={`block truncate text-xs ${
                  index === highlighted ? "text-white/75" : "text-foreground/50"
                }`}
              >
                {[
                  player.full_name !== player.name && player.full_name,
                  player.country,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
