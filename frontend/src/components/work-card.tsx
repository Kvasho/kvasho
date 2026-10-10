"use client";

import { useRef, type PointerEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const MAX_TILT = 6;

type WorkCardProps = {
  index: number;
  title: string;
  category: string;
};

export default function WorkCard({ index, title, category }: WorkCardProps) {
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

  return (
    <article
      ref={card}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6 backdrop-blur-md transition-[border-color,box-shadow] duration-500 hover:border-accent/50 hover:shadow-[0_24px_60px_-24px] hover:shadow-accent/40"
    >
      <div
        aria-hidden
        className="work-card-spot pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between">
        <span className="font-display text-5xl leading-none text-foreground/15 transition-colors duration-500 group-hover:text-accent">
          {String(index).padStart(2, "0")}
        </span>
        <span className="flex size-10 items-center justify-center rounded-full border border-foreground/15 transition-all duration-500 group-hover:-rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
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
    </article>
  );
}
