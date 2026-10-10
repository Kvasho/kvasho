"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function AboutPanel({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline>(null);

  useGSAP(
    () => {
      gsap.set(panel.current, { xPercent: -100 });

      timeline.current = gsap
        .timeline({
          paused: true,
          onReverseComplete: () => {
            gsap.set(panel.current, { visibility: "hidden" });
          },
        })
        .to(panel.current, {
          xPercent: 0,
          duration: 0.9,
          ease: "power4.inOut",
        })
        .from(
          "[data-reveal]",
          {
            y: 32,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.06,
          },
          "-=0.35",
        );
    },
    { scope: panel },
  );

  function openPanel() {
    setOpen(true);
    gsap.set(panel.current, { visibility: "visible" });
    panel.current?.scrollTo(0, 0);
    timeline.current?.timeScale(1).play();
    closeButton.current?.focus({ preventScroll: true });
  }

  function closePanel() {
    setOpen(false);
    timeline.current?.timeScale(1.6).reverse();
    trigger.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePanel();
    }

    // Keep the page behind the panel from scrolling.
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={openPanel}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="group inline-flex cursor-pointer items-center gap-3 rounded-full border border-foreground/15 px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-white"
      >
        About me
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 transition-transform duration-500 group-hover:translate-x-1"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="About me"
        inert={!open}
        className="invisible fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-background"
      >
        {/* Sticky rather than fixed: the panel is transformed by GSAP. */}
        <div className="sticky top-6 z-10 flex h-0 justify-end px-6 sm:px-10">
          <button
            ref={closeButton}
            type="button"
            onClick={closePanel}
            aria-label="Close"
            className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-foreground/15 bg-background/60 backdrop-blur-md transition-all duration-500 hover:rotate-90 hover:border-accent hover:bg-accent hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="size-5"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
