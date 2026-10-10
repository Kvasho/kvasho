// A tilted tactics board: pitch markings in metres (105 × 68) with both
// starting elevens as shirts, faded out towards the card's text.
const SHIRT =
  "M-1-2.4Q0-1.5 1-2.4L2.9-1.5 2.3 0 1.5-.4V2.4H-1.5V-.4L-2.3 0-2.9-1.5Z";

// A 4-3-3 for the team on the left; the other side mirrors it.
const FORMATION: [x: number, y: number][] = [
  [4, 34],
  [16, 60],
  [13, 45],
  [13, 23],
  [16, 8],
  [27, 34],
  [32, 49],
  [32, 19],
  [43, 58],
  [47, 34],
  [43, 10],
];

export default function GuessFootballersArt() {
  return (
    <svg
      viewBox="-12 -16 129 97"
      preserveAspectRatio="xMidYMid slice"
      className="size-full mask-[radial-gradient(ellipse_75%_80%_at_68%_42%,black_25%,transparent_95%)]"
    >
      <g transform="rotate(-9 52.5 34)">
        <g
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.22"
          strokeWidth="0.45"
          strokeLinejoin="round"
        >
          <rect x="0" y="0" width="105" height="68" />
          <path d="M52.5 0V68" />
          <circle cx="52.5" cy="34" r="9.15" />
          <rect x="0" y="13.84" width="16.5" height="40.32" />
          <rect x="0" y="24.84" width="5.5" height="18.32" />
          <path d="M16.5 26.69A9.15 9.15 0 0 1 16.5 41.31" />
          <rect x="88.5" y="13.84" width="16.5" height="40.32" />
          <rect x="99.5" y="24.84" width="5.5" height="18.32" />
          <path d="M88.5 26.69A9.15 9.15 0 0 0 88.5 41.31" />
        </g>

        {FORMATION.map(([x, y]) => (
          <path
            key={`home-${x}-${y}`}
            d={SHIRT}
            transform={`translate(${x} ${y})`}
            className="fill-accent"
            fillOpacity="0.75"
          />
        ))}
        {FORMATION.map(([x, y]) => (
          <path
            key={`away-${x}-${y}`}
            d={SHIRT}
            transform={`translate(${105 - x} ${68 - y})`}
            fill="currentColor"
            fillOpacity="0.3"
          />
        ))}
      </g>
    </svg>
  );
}
