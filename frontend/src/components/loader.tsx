"use client";

import { useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Stays true for the lifetime of the tab, so the loader plays once per full
// page load and not again when navigating back to the home page.
let hasPlayed = false;

const LETTERS = "KVASHO".split("");

/** How many squares fit along the longer side of the screen. */
const DISSOLVE_DENSITY = 28;
/** Seconds the whole dissolve takes. */
const DISSOLVE_DURATION = 1.6;
/** Share of that time a single square spends shrinking away. */
const SQUARE_SHARE = 0.45;

/**
 * Break `element` up into a grid of squares that shrink away to nothing,
 * each starting at its own random moment, showing whatever is behind it.
 *
 * Done by clipping the element to what is left of the squares; every frame
 * rebuilds that outline with each square at its current size.
 */
function dissolve(element: HTMLElement) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const size = Math.ceil(Math.max(width, height) / DISSOLVE_DENSITY);
  const columns = Math.ceil(width / size);
  const rows = Math.ceil(height / size);

  // When each square starts to shrink, as a share of the whole dissolve.
  const starts = Array.from(
    { length: columns * rows },
    () => Math.random() * (1 - SQUARE_SHARE),
  );
  const shrink = gsap.parseEase("power2.inOut");
  const progress = { value: 0 };

  return gsap.to(progress, {
    value: 1,
    duration: DISSOLVE_DURATION,
    ease: "none",
    onUpdate: () => {
      let outline = "";

      for (let i = 0; i < starts.length; i++) {
        const elapsed = (progress.value - starts[i]) / SQUARE_SHARE;
        const scale = 1 - shrink(Math.min(1, Math.max(0, elapsed)));
        if (scale <= 0) continue;

        // Untouched squares overlap a little so no hairline shows between them.
        const side = scale === 1 ? size + 0.5 : size * scale;
        const x = (i % columns) * size + (size - side) / 2;
        const y = Math.floor(i / columns) * size + (size - side) / 2;
        outline += `M${x.toFixed(1)} ${y.toFixed(1)}h${side.toFixed(1)}v${side.toFixed(1)}h${(-side).toFixed(1)}z`;
      }

      element.style.clipPath = outline ? `path("${outline}")` : "inset(50%)";
    },
  });
}

export default function Loader() {
  const [visible, setVisible] = useState(!hasPlayed);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useGSAP(
    () => {
      if (!visible) return;

      // Server-rendered HTML can't mark the clip as muted, so the browser may
      // have refused to autoplay it; by now it is muted and allowed to start.
      video.current?.play().catch(() => {});

      gsap
        .timeline({
          onComplete: () => {
            hasPlayed = true;
            setVisible(false);
          },
        })
        .to(".loader-fill", {
          clipPath: "inset(0% 0 0 0)",
          duration: 1.1,
          ease: "power2.inOut",
          stagger: 0.18,
        })
        .add(
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? gsap.to(root.current, { autoAlpha: 0, duration: 0.7 })
            : dissolve(root.current!),
          "+=0.25",
        );
    },
    { scope: root, dependencies: [visible] },
  );

  if (!visible) return null;

  return (
    <div
      ref={root}
      aria-hidden
      // Always dark, whatever the site theme: the clip behind it is dark too.
      style={{ "--foreground": "#ededed" } as CSSProperties}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050805]"
    >
      <video
        ref={video}
        src="/hacker.mp4"
        poster="/hacker-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 size-full object-cover"
      />
      {/* A light veil, so the name stays the loudest thing on screen. */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative flex font-display text-[24vw] leading-none tracking-wide select-none">
        {LETTERS.map((letter, i) => (
          <span key={i} className="relative">
            <span className="loader-outline">{letter}</span>
            <span
              className="loader-fill absolute inset-0"
              style={{ clipPath: "inset(100% 0 0 0)" }}
            >
              {letter}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
