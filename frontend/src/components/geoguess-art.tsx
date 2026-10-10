import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land from "world-atlas/land-110m.json";

// A flat world map (x = longitude + 180, y = 90 − latitude) cropped to the
// Atlantic–Asia side, with a guess, the real location and the line between
// them. Faded out towards the card's text.
const topology = land as unknown as Topology<{ land: GeometryCollection }>;

/** The land outline as one SVG path, snapped to half a degree to keep it small. */
function landPath() {
  const snap = (value: number) => Math.round(value * 2) / 2;
  const parts: string[] = [];

  for (const { geometry } of feature(topology, topology.objects.land).features) {
    const polygons =
      geometry.type === "Polygon"
        ? [geometry.coordinates]
        : geometry.type === "MultiPolygon"
          ? geometry.coordinates
          : [];

    for (const ring of polygons.flat()) {
      // Antarctica's outline runs along the bottom edge of the map.
      if (ring.every(([, lat]) => lat < -60)) continue;

      // A ring crossing the 180° meridian (Eurasia, at its far eastern tip)
      // jumps between the map's edges, drawing a line across it. Moving that
      // tip past 180° keeps the ring in one piece; the overhang is outside
      // the crop. Western Europe and Africa, also below 0°, must stay put.
      const crosses = ring.some(
        ([lng], i) => i > 0 && Math.abs(lng - ring[i - 1][0]) > 180,
      );

      const points: string[] = [];
      for (const [rawLng, lat] of ring) {
        const lng = crosses && rawLng < -90 ? rawLng + 360 : rawLng;
        const point = `${snap(lng + 180)} ${snap(90 - lat)}`;
        if (point !== points.at(-1)) points.push(point);
      }
      if (points.length > 3) parts.push(`M${points.join("L")}Z`);
    }
  }

  return parts.join("");
}

const LAND = landPath();

const GUESS = { x: 258, y: 68 };
const ANSWER = { x: 223.5, y: 48 };

export default function GeoGuessArt() {
  return (
    <svg
      viewBox="110 5 200 150"
      preserveAspectRatio="xMidYMid slice"
      className="size-full mask-[radial-gradient(ellipse_75%_80%_at_68%_42%,black_25%,transparent_95%)]"
    >
      <path
        d={LAND}
        strokeWidth="0.5"
        strokeLinejoin="round"
        className="fill-current/10 stroke-current/30"
      />
      <path
        d={`M${GUESS.x} ${GUESS.y}L${ANSWER.x} ${ANSWER.y}`}
        strokeWidth="0.8"
        strokeDasharray="2 2.5"
        strokeLinecap="round"
        className="stroke-current/70"
      />
      <circle
        cx={GUESS.x}
        cy={GUESS.y}
        r="3.2"
        strokeWidth="1"
        className="fill-accent stroke-white"
      />
      <circle
        cx={ANSWER.x}
        cy={ANSWER.y}
        r="3.2"
        strokeWidth="1"
        className="fill-emerald-500 stroke-white"
      />
    </svg>
  );
}
