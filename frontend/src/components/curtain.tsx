"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export type CurtainOptions = {
  /** Text written on the curtain. */
  label: string;
  /** Curtain colour; the site accent when left out. */
  color?: string;
  /** Colour of the label; white when left out. */
  textColor?: string;
  /**
   * A short muted clip played behind the label. `tint` is how strongly the
   * curtain colour is laid over it, from 0 (none) to 1 (solid); 0.6 by default.
   */
  video?: { src: string; poster?: string; tint?: number };
};

type Transition = CurtainOptions & { href: string };

type Navigate = (href: string, options: CurtainOptions) => void;

const CurtainContext = createContext<Navigate>(() => {});

/** Navigate to `href` behind a curtain that drops from the top. */
export function useCurtain() {
  return useContext(CurtainContext);
}

/**
 * Reports the current path. On dynamic routes the path is runtime data, so
 * it is read here under Suspense rather than in the provider wrapping every page.
 */
function PathnameReporter({ onChange }: { onChange: (pathname: string) => void }) {
  const pathname = usePathname();
  useEffect(() => onChange(pathname), [pathname, onChange]);
  return null;
}

export default function CurtainProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pathname, setPathname] = useState<string | null>(null);
  const [transition, setTransition] = useState<Transition | null>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  const navigate = useCallback<Navigate>(
    (href, options) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      setTransition((current) => current ?? { href, ...options });
    },
    [router],
  );

  // Drop the curtain, write the label, then switch the page underneath.
  useGSAP(
    () => {
      if (!transition) return;

      router.prefetch(transition.href);
      // Muted clips may autoplay; if the browser still refuses, the poster stays.
      video.current?.play().catch(() => {});

      gsap
        .timeline({ onComplete: () => router.push(transition.href) })
        .fromTo(
          curtain.current,
          { yPercent: -100 },
          { yPercent: 0, duration: 0.9, ease: "power4.inOut" },
        )
        .fromTo(
          ".curtain-letter",
          { yPercent: 110 },
          { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.035 },
          "-=0.25",
        );
    },
    { scope: curtain, dependencies: [transition] },
  );

  // Once the new page is in place, let the curtain fall away.
  useGSAP(
    () => {
      if (!transition || pathname !== transition.href) return;

      gsap
        .timeline({ delay: 0.5, onComplete: () => setTransition(null) })
        .to(".curtain-letter", {
          yPercent: -110,
          duration: 0.5,
          ease: "power3.in",
          stagger: 0.02,
        })
        .to(
          curtain.current,
          { yPercent: 100, duration: 0.9, ease: "power4.inOut" },
          "-=0.2",
        );
    },
    { scope: curtain, dependencies: [pathname, transition] },
  );

  const color = transition?.color ?? "var(--accent)";

  return (
    <CurtainContext value={navigate}>
      <Suspense fallback={null}>
        <PathnameReporter onChange={setPathname} />
      </Suspense>
      {children}
      {transition && (
        <div
          ref={curtain}
          aria-hidden
          style={{ backgroundColor: color, color: transition.textColor }}
          className="fixed inset-0 z-60 flex items-center justify-center overflow-hidden text-white"
        >
          {transition.video && (
            <>
              <video
                ref={video}
                src={transition.video.src}
                poster={transition.video.poster}
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 size-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: color,
                  opacity: transition.video.tint ?? 0.6,
                }}
              />
            </>
          )}
          <p className="relative flex flex-wrap justify-center gap-x-[0.25em] px-6 font-display text-[11vw] uppercase leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
            {transition.label.split(" ").map((word, i) => (
              <span key={i} className="flex overflow-hidden py-[0.08em]">
                {word.split("").map((letter, j) => (
                  <span key={j} className="curtain-letter inline-block">
                    {letter}
                  </span>
                ))}
              </span>
            ))}
          </p>
        </div>
      )}
    </CurtainContext>
  );
}
