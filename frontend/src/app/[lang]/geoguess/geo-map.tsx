"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { FeatureCollection, MultiPolygon, Position } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldAtlas from "world-atlas/countries-50m.json";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "./api";

const WORLD_CENTER: [number, number] = [20, 0];
const MIN_ZOOM = 2;
const WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-85, -180],
  [85, 180],
];

// Country outlines only. The map is drawn from shapes rather than image
// tiles, so no place names can appear on it and give the answer away.
const topology = worldAtlas as unknown as Topology<{
  countries: GeometryCollection;
}>;
const ANTARCTICA_ID = "010";

type Ring = Position[];

/**
 * Shapes that cross the 180° meridian (Russia, Fiji) jump from one edge of
 * the map to the other, which draws as a band across the whole world. Such a
 * shape is made continuous by moving its western part past 180°, and drawn
 * twice, a full turn apart, so both edges of the map show their piece of it.
 */
function unwrapPolygon(rings: Ring[]): Ring[][] {
  const crosses = rings.some((ring) =>
    ring.some((point, i) => i > 0 && Math.abs(point[0] - ring[i - 1][0]) > 180),
  );
  if (!crosses) return [rings];

  const east = rings.map((ring) =>
    ring.map(([lng, lat]) => [lng < 0 ? lng + 360 : lng, lat]),
  );
  const west = east.map((ring) => ring.map(([lng, lat]) => [lng - 360, lat]));

  return [east, west];
}

const countries: FeatureCollection<MultiPolygon> = {
  type: "FeatureCollection",
  features: feature(topology, topology.objects.countries)
    .features // Nothing to guess there, and its outline runs along the map's edge.
    .filter((country) => country.id !== ANTARCTICA_ID)
    .map((country) => {
      const polygons =
        country.geometry.type === "Polygon"
          ? [country.geometry.coordinates]
          : country.geometry.type === "MultiPolygon"
            ? country.geometry.coordinates
            : [];

      return {
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiPolygon",
          coordinates: polygons.flatMap(unwrapPolygon),
        },
      };
    }),
};

const COUNTRY_STYLE: L.PathOptions = {
  color: "#9aa5a8",
  weight: 0.8,
  fillColor: "#f4f1ea",
  fillOpacity: 1,
};

// Slim inline-SVG map pin (colors in globals.css); the tip marks the exact spot.
const PIN_SVG = `<svg viewBox="0 0 16 24" width="16" height="24" aria-hidden="true"><path d="M8 23.5C8 23.5 1 14.6 1 8a7 7 0 0 1 14 0c0 6.6-7 15.5-7 15.5Z" fill="currentColor" stroke="#ffffff" stroke-width="1.5"/><circle cx="8" cy="8" r="2.5" fill="#ffffff"/></svg>`;

function pin(kind: "guess" | "answer") {
  return L.divIcon({
    className: "",
    html: `<span class="geo-pin geo-pin-${kind}">${PIN_SVG}</span>`,
    iconSize: [16, 24],
    iconAnchor: [8, 24],
  });
}

const guessIcon = pin("guess");
const answerIcon = pin("answer");

type GeoMapProps = {
  /** Changes with every round, which sends the view back to the whole world. */
  round: number;
  guess: LatLng | null;
  /** Where the country really is; shown once the round is answered. */
  answer: LatLng | null;
  /** Ignore clicks, e.g. while a guess is being checked or after the answer. */
  locked: boolean;
  onGuess: (point: LatLng) => void;
};

function Clicks({ locked, onGuess }: Pick<GeoMapProps, "locked" | "onGuess">) {
  useMapEvents({
    click(event) {
      if (locked) return;

      const point = event.latlng.wrap();
      onGuess({
        lat: Math.max(-90, Math.min(90, point.lat)),
        lng: Math.max(-180, Math.min(180, point.lng)),
      });
    },
  });

  return null;
}

function View({ round, guess, answer }: Pick<GeoMapProps, "round" | "guess" | "answer">) {
  const map = useMap();

  useEffect(() => {
    map.setView(WORLD_CENTER, MIN_ZOOM);
  }, [map, round]);

  // Frame the guess and the answer together once the answer is revealed.
  useEffect(() => {
    if (!guess || !answer) return;

    map.flyToBounds(
      [
        [guess.lat, guess.lng],
        [answer.lat, answer.lng],
      ],
      { padding: [60, 60], maxZoom: 5, duration: 0.8 },
    );
    // Only when the answer arrives: the guess cannot change after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, answer]);

  return null;
}

export default function GeoMap({ round, guess, answer, locked, onGuess }: GeoMapProps) {
  return (
    <MapContainer
      center={WORLD_CENTER}
      zoom={MIN_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={7}
      maxBounds={WORLD_BOUNDS}
      maxBoundsViscosity={1}
      worldCopyJump={false}
      preferCanvas
      className={`geo-map size-full ${locked ? "" : "cursor-crosshair"}`}
    >
      <GeoJSON
        data={countries}
        style={COUNTRY_STYLE}
        interactive={false}
        attribution='Map data: <a href="https://www.naturalearthdata.com/">Natural Earth</a>'
      />
      <Clicks locked={locked} onGuess={onGuess} />
      <View round={round} guess={guess} answer={answer} />

      {guess && <Marker position={[guess.lat, guess.lng]} icon={guessIcon} interactive={false} />}
      {guess && answer && (
        <>
          <Polyline
            positions={[
              [guess.lat, guess.lng],
              [answer.lat, answer.lng],
            ]}
            pathOptions={{ color: "#171717", weight: 2, dashArray: "6 8" }}
            interactive={false}
          />
          <Marker position={[answer.lat, answer.lng]} icon={answerIcon} interactive={false} />
        </>
      )}
    </MapContainer>
  );
}
