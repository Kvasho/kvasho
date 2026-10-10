"use client";

import {
  useRef,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useCurtain, type CurtainOptions } from "@/components/curtain";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const MAX_TILT = 6;

type WorkCardProps = {
  index: number;
  title: string;
  category: string;
  href?: string;
  /** Navigate to `href` behind a curtain set up like this. */
  curtain?: CurtainOptions;
  /** Decorative illustration filling the card behind its text. */
  art?: ReactNode;
  /** A colour this card glows in, replacing the site accent inside it. */
  glow?: string;
  /** Text colour readable on top of `glow`; white when left out. */
  glowContrast?: string;
};

export default function WorkCard({
  index,
  title,
  category,
  href,
  curtain,
  art,
  glow,
  glowContrast,
}: WorkCardProps) {
  const navigate = useCurtain();
  const card = useRef<HTMLElement>(null);
  const rotateX = useRef<gsap.QuickToFunc>(null);
  const rotateY = useRef<gsap.QuickToFunc>(null);

  useGSAP(
    () => {
      gsap.set(card.current, { transformPerspective: 900 });
      const options = { duration: 0.6, ease: "power3.out" };
      rotateX.current = gsap.quickTo(card.current, "rotationX", options);
      rotateY.current = gsap.quickTo(card.current, "rotationY", options);
    },
    { scope: card },
  );

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;

    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    rotateX.current?.((0.5 - y) * MAX_TILT * 2);
    rotateY.current?.((x - 0.5) * MAX_TILT * 2);
  }

  function handlePointerLeave() {
    rotateX.current?.(0);
    rotateY.current?.(0);
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!href || !curtain) return;
    // Leave new-tab / new-window clicks to the browser.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    navigate(href, curtain);
  }

  return (
    <article
      ref={card}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      // Overriding --accent recolours every accent utility inside the card.
      style={
        glow
          ? ({
              "--accent": glow,
              "--accent-contrast": glowContrast,
            } as CSSProperties)
          : undefined
      }
      className={`group relative flex aspect-4/3 flex-col justify-between overflow-hidden rounded-3xl border bg-foreground/3 p-6 backdrop-blur-md transition-[border-color,box-shadow] duration-500 hover:border-accent/50 hover:shadow-[0_24px_60px_-24px] hover:shadow-accent/40 ${
        glow
          ? "border-accent/30 shadow-[0_0_48px_-18px] shadow-accent/60"
          : "border-foreground/10"
      }`}
    >
      {art && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
        >
          {art}
        </div>
      )}
      <div
        aria-hidden
        className="work-card-spot pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between">
        <span className="font-display text-5xl leading-none text-foreground/15 transition-colors duration-500 group-hover:text-accent">
          {String(index).padStart(2, "0")}
        </span>
        <span className="flex size-10 items-center justify-center rounded-full border border-foreground/15 transition-all duration-500 group-hover:-rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-contrast">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>

      <div className="relative">
        <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">
          {category}
        </p>
        <h2 className="mt-2 text-xl font-medium transition-transform duration-500 group-hover:translate-x-1">
          {title}
        </h2>
        <span className="mt-4 block h-px origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
      </div>

      {href && (
        <Link
          href={href}
          aria-label={title}
          onClick={handleClick}
          className="absolute inset-0"
        />
      )}
    </article>
  );
}
