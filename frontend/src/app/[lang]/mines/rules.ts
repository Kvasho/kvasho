export const TILE_COUNT = 25;
export const MIN_MINES = 1;
export const MAX_MINES = TILE_COUNT - 1;
export const DEFAULT_MINES = 3;

/** Share of every fair payout the house keeps. */
const HOUSE_EDGE = 0.01;

/**
 * What a bet is multiplied by after `picks` safe tiles on a board hiding
 * `mineCount` mines.
 *
 * Each pick pays the inverse of its chance of being safe, so the more mines
 * there are, the faster the multiplier grows.
 */
export function multiplier(mineCount: number, picks: number) {
  if (picks === 0) return 1;

  let fair = 1;
  for (let i = 0; i < picks; i++) {
    fair *= (TILE_COUNT - i) / (TILE_COUNT - mineCount - i);
  }

  return fair * (1 - HOUSE_EDGE);
}

/** Pick `mineCount` distinct tiles at random to hide the mines under. */
export function placeMines(mineCount: number) {
  const tiles = Array.from({ length: TILE_COUNT }, (_, i) => i);
  const random = new Uint32Array(TILE_COUNT);
  crypto.getRandomValues(random);

  // Fisher–Yates shuffle, then keep the first few.
  for (let i = TILE_COUNT - 1; i > 0; i--) {
    const j = random[i] % (i + 1);
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  return tiles.slice(0, mineCount);
}

// Play money is always shown as US dollars, matching the "$" in the bet field.
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatMoney(cents: number) {
  return money.format(cents / 100);
}

// A plain "x": the display font's multiplication sign is too small to read.
export function formatMultiplier(value: number) {
  return `x${value.toFixed(2)}`;
}
