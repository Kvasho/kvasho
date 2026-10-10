const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type LatLng = { lat: number; lng: number };

/** What the player is shown for a round they have not answered yet. */
export type Question = {
  round: number;
  country_name: string;
  flag_url: string | null;
};

export type AnsweredRound = {
  round: number;
  country_name: string;
  flag_url: string | null;
  guess: LatLng;
  correct: LatLng;
  distance_km: number;
  score: number;
};

export type GameStatus = "in_progress" | "won" | "lost";

export type Game = {
  token: string;
  status: GameStatus;
  total_rounds: number;
  current_round: number;
  total_score: number;
  total_distance_km: number;
  /** A finished game is won when its total distance is at most this. */
  win_distance_km: number;
  max_score: number;
  /** `null` once the game is finished. */
  question: Question | null;
  /** The rounds answered so far. */
  rounds: AnsweredRound[];
};

export type GuessResult = {
  round: number;
  distance_km: number;
  score: number;
  correct: LatLng & { name: string };
  total_score: number;
  total_distance_km: number;
  status: GameStatus;
  /** `null` after the last round. */
  next_question: Question | null;
  /** The finished game, after the last round only. */
  result: Game | null;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/api/v1/geo${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.message ?? `Request failed with ${response.status}`,
    );
  }

  return (await response.json()).data;
}

export function startGame(signal?: AbortSignal) {
  return request<Game>("/games", { method: "POST", signal });
}

/** The current state of a game, used to resume it after a page refresh. */
export function fetchGame(token: string, signal?: AbortSignal) {
  return request<Game>(`/games/${token}`, { signal });
}

/**
 * Send the guess for `round`. Naming the round makes the server reject a
 * repeated request instead of scoring it against the next country.
 */
export function submitGuess(token: string, round: number, guess: LatLng) {
  return request<GuessResult>(`/games/${token}/guess`, {
    method: "POST",
    body: JSON.stringify({ ...guess, round }),
  });
}

export function formatKm(km: number) {
  return `${km.toLocaleString("en-US")} km`;
}

export function formatPoints(points: number) {
  return points.toLocaleString("en-US");
}
