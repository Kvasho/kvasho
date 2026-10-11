// Two tilted invoice sheets: the front one itemised, totalled in the card's
// accent colour and stamped PAID. Faded out towards the card's text.
const ITEMS = [
  { label: 30, amount: 10 },
  { label: 24, amount: 8 },
  { label: 34, amount: 12 },
];

export default function InvoicerArt() {
  return (
    <svg
      viewBox="0 0 129 97"
      preserveAspectRatio="xMidYMid slice"
      className="size-full mask-[radial-gradient(ellipse_75%_80%_at_68%_42%,black_25%,transparent_95%)]"
    >
      {/* Sheet behind, peeking out to the right. */}
      <rect
        x="68"
        y="8"
        width="50"
        height="66"
        rx="3"
        strokeWidth="0.45"
        transform="rotate(9 93 41)"
        className="fill-current/5 stroke-current/20"
      />

      <g transform="translate(46 9) rotate(-7 27 36)">
        <rect
          width="54"
          height="72"
          rx="3"
          strokeWidth="0.45"
          className="fill-current/5 stroke-current/30"
        />

        {/* Header: logo, company lines and the invoice number. */}
        <rect x="6" y="6" width="8" height="8" rx="1.5" className="fill-accent/70" />
        <rect x="17" y="7" width="16" height="2" rx="1" className="fill-current/35" />
        <rect x="17" y="11" width="11" height="1.5" rx="0.75" className="fill-current/20" />
        <rect x="38" y="7" width="10" height="2" rx="1" className="fill-current/25" />

        {/* Line items: description on the left, amount on the right. */}
        {ITEMS.map((item, i) => {
          const y = 24 + i * 7;
          return (
            <g key={i}>
              <rect x="6" y={y} width={item.label} height="1.8" rx="0.9" className="fill-current/25" />
              <rect
                x={48 - item.amount}
                y={y}
                width={item.amount}
                height="1.8"
                rx="0.9"
                className="fill-current/30"
              />
            </g>
          );
        })}

        <line x1="6" y1="47" x2="48" y2="47" strokeWidth="0.4" className="stroke-current/25" />

        {/* Total. */}
        <rect x="6" y="51" width="12" height="2.2" rx="1.1" className="fill-current/35" />
        <rect x="32" y="50.5" width="16" height="3.2" rx="1.6" className="fill-accent" />

        {/* PAID stamp. */}
        <g transform="translate(27 62) rotate(-14)" className="text-accent">
          <rect
            x="-13"
            y="-5.5"
            width="26"
            height="11"
            rx="2"
            fill="none"
            strokeWidth="1"
            className="stroke-current"
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="7.5"
            letterSpacing="1"
            className="fill-current font-display"
          >
            PAID
          </text>
        </g>
      </g>
    </svg>
  );
}
