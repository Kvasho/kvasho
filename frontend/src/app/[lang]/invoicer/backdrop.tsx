// Invoices and receipts scattered around the screen's edges, slowly bobbing,
// a few stamped PAID in the accent colour. The middle is masked clear so
// forms and tables stay readable. Replaces the line grid on Invoicer pages.

type Sheet = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  kind: "invoice" | "receipt";
  paid?: boolean;
};

const SHEETS: Sheet[] = [
  { x: 70, y: 60, rotate: -12, scale: 1.1, kind: "invoice", paid: true },
  { x: 330, y: 150, rotate: 8, scale: 0.8, kind: "receipt" },
  { x: 120, y: 470, rotate: 6, scale: 0.9, kind: "receipt" },
  { x: 40, y: 760, rotate: -6, scale: 1, kind: "invoice" },
  { x: 330, y: 820, rotate: 14, scale: 0.75, kind: "invoice", paid: true },
  { x: 1180, y: 40, rotate: 10, scale: 1, kind: "invoice" },
  { x: 1420, y: 230, rotate: -9, scale: 0.85, kind: "receipt", paid: true },
  { x: 1240, y: 480, rotate: -4, scale: 1.05, kind: "invoice", paid: true },
  { x: 1450, y: 700, rotate: 12, scale: 0.8, kind: "invoice" },
  { x: 1150, y: 800, rotate: -14, scale: 0.9, kind: "receipt" },
  { x: 760, y: -30, rotate: 4, scale: 0.7, kind: "receipt" },
  { x: 720, y: 900, rotate: -8, scale: 0.75, kind: "invoice" },
];

const SYMBOLS = [
  { x: 520, y: 120, char: "₾", size: 64 },
  { x: 1050, y: 210, char: "$", size: 52 },
  { x: 230, y: 360, char: "€", size: 48 },
  { x: 1520, y: 520, char: "₾", size: 56 },
  { x: 560, y: 760, char: "$", size: 44 },
  { x: 1000, y: 880, char: "€", size: 60 },
];

function Invoice({ paid }: { paid?: boolean }) {
  return (
    <>
      <rect width="120" height="160" rx="6" className="fill-background stroke-current/25" strokeWidth="1.2" />
      <rect x="12" y="14" width="18" height="18" rx="3" className="fill-accent/50" />
      <rect x="38" y="16" width="40" height="5" rx="2.5" className="fill-current/25" />
      <rect x="38" y="25" width="26" height="4" rx="2" className="fill-current/15" />
      {[54, 70, 86].map((y, i) => (
        <g key={y}>
          <rect x="12" y={y} width={[58, 44, 66][i]} height="4" rx="2" className="fill-current/15" />
          <rect x={108 - [20, 16, 24][i]} y={y} width={[20, 16, 24][i]} height="4" rx="2" className="fill-current/20" />
        </g>
      ))}
      <line x1="12" y1="104" x2="108" y2="104" strokeWidth="1" className="stroke-current/20" />
      <rect x="12" y="114" width="26" height="5" rx="2.5" className="fill-current/25" />
      <rect x="74" y="112" width="34" height="8" rx="4" className="fill-accent/60" />
      {paid && <Stamp x={60} y={140} />}
    </>
  );
}

function Receipt({ paid }: { paid?: boolean }) {
  // Torn zigzag bottom edge, drawn from the right corner back to the left.
  const teeth = Array.from({ length: 8 }, (_, i) => `L${75 - i * 10} 136L${70 - i * 10} 130`).join("");

  return (
    <>
      <path
        d={`M0 4Q0 0 4 0H76Q80 0 80 4V130${teeth}Z`}
        className="fill-background stroke-current/25"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <rect x="22" y="12" width="36" height="5" rx="2.5" className="fill-current/25" />
      {[30, 42, 54, 66].map((y, i) => (
        <g key={y}>
          <rect x="10" y={y} width={[30, 22, 34, 26][i]} height="3.5" rx="1.75" className="fill-current/15" />
          <rect x="56" y={y} width="14" height="3.5" rx="1.75" className="fill-current/20" />
        </g>
      ))}
      <line x1="10" y1="80" x2="70" y2="80" strokeWidth="1" strokeDasharray="3 3" className="stroke-current/25" />
      <rect x="10" y="88" width="22" height="5" rx="2.5" className="fill-current/25" />
      <rect x="46" y="87" width="24" height="7" rx="3.5" className="fill-accent/60" />
      {paid && <Stamp x={40} y={112} small />}
    </>
  );
}

function Stamp({ x, y, small = false }: { x: number; y: number; small?: boolean }) {
  const width = small ? 46 : 58;
  const height = small ? 18 : 22;

  return (
    <g transform={`translate(${x} ${y}) rotate(-14)`} className="text-accent" opacity="0.8">
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx="3"
        fill="none"
        strokeWidth="2"
        className="stroke-current"
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={small ? 12 : 15}
        letterSpacing="2"
        className="fill-current font-display"
      >
        PAID
      </text>
    </g>
  );
}

export default function InvoicerBackdrop() {
  return (
    <div aria-hidden className="invoicer-backdrop">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="size-full">
        {SYMBOLS.map((symbol, i) => (
          <text
            key={i}
            x={symbol.x}
            y={symbol.y}
            fontSize={symbol.size}
            className="invoicer-float fill-current/10 font-display"
            style={{ animationDelay: `${-i * 1.7}s` }}
          >
            {symbol.char}
          </text>
        ))}
        {SHEETS.map((sheet, i) => (
          <g key={i} transform={`translate(${sheet.x} ${sheet.y}) rotate(${sheet.rotate}) scale(${sheet.scale})`}>
            <g className="invoicer-float" style={{ animationDelay: `${-i * 1.3}s` }}>
              {sheet.kind === "invoice" ? <Invoice paid={sheet.paid} /> : <Receipt paid={sheet.paid} />}
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
