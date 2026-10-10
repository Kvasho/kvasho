"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Stays true for the lifetime of the tab, so the loader plays once per full
// page load and not again when navigating back to the home page.
let hasPlayed = false;

const LETTERS = "KVASHO".split("");

export default function Loader() {
  const [visible, setVisible] = useState(!hasPlayed);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!visible) return;

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
        .to(root.current, {
          autoAlpha: 0,
          duration: 0.7,
          ease: "power2.out",
          delay: 0.25,
        });
    },
    { scope: root, dependencies: [visible] },
  );

  if (!visible) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <div className="flex font-display text-[24vw] leading-none tracking-wide select-none">
        {LETTERS.map((letter, i) => (
          <span key={i} className="relative">
            <span className="loader-outline">{letter}</span>
            <span
              className="loader-fill absolute inset-0 text-accent"
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
