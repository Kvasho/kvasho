import type { ReactNode } from "react";

// Drawn in metres on a standard 105 × 68 pitch, home side on the left.
export const LENGTH = 105;
export const WIDTH = 68;
/** Grass around the touchlines. */
export const PITCH_MARGIN = 3;
const STRIPES = 10;

type PitchProps = {
  /** SVG elements drawn on top of the pitch, in metres. */
  children?: ReactNode;
  className?: string;
  /** Fill the whole box, cropping the pitch, instead of fitting inside it. */
  cover?: boolean;
  /** Accessible name, in the page's language. */
  label?: string;
};

export default function Pitch({
  children,
  className = "block w-full rounded-2xl",
  cover = false,
  label,
}: PitchProps) {
  return (
    <svg
      viewBox={`${-PITCH_MARGIN} ${-PITCH_MARGIN} ${LENGTH + PITCH_MARGIN * 2} ${WIDTH + PITCH_MARGIN * 2}`}
      preserveAspectRatio={cover ? "xMidYMid slice" : undefined}
      role="group"
      aria-label={label}
      className={className}
    >
      <rect
        x={-PITCH_MARGIN}
        y={-PITCH_MARGIN}
        width={LENGTH + PITCH_MARGIN * 2}
        height={WIDTH + PITCH_MARGIN * 2}
        fill="#17602f"
      />
      {Array.from({ length: STRIPES }, (_, i) => (
        <rect
          key={i}
          x={(i * LENGTH) / STRIPES}
          y="0"
          width={LENGTH / STRIPES}
          height={WIDTH}
          fill={i % 2 === 0 ? "#1f7a3d" : "#1b6e37"}
        />
      ))}

      <g
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.85"
        strokeWidth="0.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Touchlines, halfway line and centre circle */}
        <rect x="0" y="0" width={LENGTH} height={WIDTH} />
        <path d={`M${LENGTH / 2} 0V${WIDTH}`} />
        <circle cx={LENGTH / 2} cy={WIDTH / 2} r="9.15" />

        {/* Penalty areas, goal areas and penalty arcs */}
        <rect x="0" y="13.84" width="16.5" height="40.32" />
        <rect x="0" y="24.84" width="5.5" height="18.32" />
        <path d="M16.5 26.69A9.15 9.15 0 0 1 16.5 41.31" />
        <rect x={LENGTH - 16.5} y="13.84" width="16.5" height="40.32" />
        <rect x={LENGTH - 5.5} y="24.84" width="5.5" height="18.32" />
        <path d="M88.5 26.69A9.15 9.15 0 0 0 88.5 41.31" />

        {/* Goals */}
        <rect x="-2" y="30.34" width="2" height="7.32" />
        <rect x={LENGTH} y="30.34" width="2" height="7.32" />

        {/* Corner arcs */}
        <path d="M1 0A1 1 0 0 1 0 1" />
        <path d="M0 67A1 1 0 0 1 1 68" />
        <path d="M104 0A1 1 0 0 0 105 1" />
        <path d="M105 67A1 1 0 0 0 104 68" />
      </g>

      {/* Centre and penalty spots */}
      <g fill="#ffffff" fillOpacity="0.85">
        <circle cx={LENGTH / 2} cy={WIDTH / 2} r="0.45" />
        <circle cx="11" cy={WIDTH / 2} r="0.45" />
        <circle cx={LENGTH - 11} cy={WIDTH / 2} r="0.45" />
      </g>

      {children}
    </svg>
  );
}
