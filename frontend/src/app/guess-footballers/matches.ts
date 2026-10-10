const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Match = {
  id: number;
  date: string;
  kick_off: string | null;
  season: string;
  stage: string | null;
  stadium: string | null;
  competition: {
    id: number;
    name: string;
    country: string | null;
    gender: string | null;
  };
  home_team: { id: number; name: string };
  away_team: { id: number; name: string };
  home_score: number | null;
  away_score: number | null;
};

export type MatchPage = {
  data: Match[];
  meta: { current_page: number; last_page: number; total: number };
};

export async function fetchMatches(
  search: string,
  page: number,
  signal?: AbortSignal,
): Promise<MatchPage> {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);

  const response = await fetch(`${API_URL}/api/v1/matches?${params}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Matches request failed with ${response.status}`);
  }

  return response.json();
}

/** A starting position on the pitch; who played there is not included. */
export type LineupSlot = {
  id: number;
  position_id: number;
  position: string;
};

export type MatchLineups = {
  home_team: LineupSlot[];
  away_team: LineupSlot[];
};

export async function fetchLineups(
  matchId: number,
  signal?: AbortSignal,
): Promise<MatchLineups> {
  const response = await fetch(`${API_URL}/api/v1/matches/${matchId}/lineups`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Lineups request failed with ${response.status}`);
  }

  return (await response.json()).data;
}

export type Player = {
  id: number;
  /** The name the player is commonly known by. */
  name: string;
  full_name: string;
  country: string | null;
};

export const MIN_PLAYER_SEARCH_LENGTH = 3;

/** Suggest up to ten players matching `search` (at least three characters). */
export async function fetchPlayers(
  search: string,
  signal?: AbortSignal,
): Promise<Player[]> {
  const params = new URLSearchParams({ search });
  const response = await fetch(`${API_URL}/api/v1/players?${params}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Players request failed with ${response.status}`);
  }

  return (await response.json()).data;
}

/** Ask whether `playerId` started the match in the given lineup slot. */
export async function submitGuess(
  matchId: number,
  slotId: number,
  playerId: number,
): Promise<boolean> {
  const response = await fetch(
    `${API_URL}/api/v1/matches/${matchId}/lineups/${slotId}/guesses`,
    {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: playerId }),
    },
  );
  if (!response.ok) {
    throw new Error(`Guess request failed with ${response.status}`);
  }

  return (await response.json()).data.correct;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMatchDate(date: string) {
  return dateFormat.format(new Date(`${date}T00:00:00Z`));
}
