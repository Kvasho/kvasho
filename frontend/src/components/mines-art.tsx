// A tilted 5 × 5 board with a few tiles already opened: gems, and one mine
// in the card's accent colour. Faded out towards the card's text.
const TILE = 14;
const GAP = 3;
const GEMS = [1, 3, 7, 11, 18, 22];
const MINE = 13;

export default function MinesArt() {
  return (
    <svg
      viewBox="0 0 129 97"
      preserveAspectRatio="xMidYMid slice"
      className="size-full mask-[radial-gradient(ellipse_75%_80%_at_68%_42%,black_25%,transparent_95%)]"
    >
      <g transform="translate(40 4) rotate(-9 41 41)">
        {Array.from({ length: 25 }, (_, tile) => {
          const x = (tile % 5) * (TILE + GAP);
          const y = Math.floor(tile / 5) * (TILE + GAP);
          const isGem = GEMS.includes(tile);
          const isMine = tile === MINE;

          return (
            <g key={tile} transform={`translate(${x} ${y})`}>
              <rect
                width={TILE}
                height={TILE}
                rx="3"
                strokeWidth="0.45"
                className={
                  isMine
                    ? "fill-accent/25 stroke-accent"
                    : isGem
                      ? "fill-emerald-500/15 stroke-emerald-500/60"
                      : "fill-current/5 stroke-current/20"
                }
              />
              {/* Icons are drawn in a 24-unit box, scaled to sit inside the tile. */}
              {isGem && (
                <g transform="translate(2.8 2.8) scale(0.35)" fillOpacity="0.85">
                  <path d="M6 3h12l4 6-10 12L2 9z" className="fill-emerald-400" />
                  <path
                    d="M6 3 2 9h20l-4-6-3 6-3-6-3 6z"
                    className="fill-emerald-300"
                  />
                  <path d="M9 9l3 12 3-12z" className="fill-emerald-500" />
                </g>
              )}
              {isMine && (
                <g
                  transform="translate(2.8 2.8) scale(0.35)"
                  className="fill-accent stroke-accent"
                >
                  <path
                    d="M14.5 7.5 17 5m1.5-2.5.5.5m1.5.5-1 .5m-2-3 .5 1"
                    fill="none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="10.5" cy="13.5" r="7.5" stroke="none" />
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
