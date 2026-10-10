"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Backdrop = {
  /** Tells one card's backdrop from another's. */
  id: number;
  art: ReactNode;
  /** The card's own accent colour, if it has one. */
  glow?: string;
};

type BackdropControls = {
  show: (backdrop: Backdrop) => void;
  hide: () => void;
};

const BackdropContext = createContext<BackdropControls>({
  show: () => {},
  hide: () => {},
});

/** Lets a work card put its illustration behind the whole page while hovered. */
export function useWorkBackdrop() {
  return useContext(BackdropContext);
}

export default function WorkBackdropProvider({ children }: { children: ReactNode }) {
  // The last backdrop stays mounted after `hide`, so it can fade out.
  const [backdrop, setBackdrop] = useState<Backdrop | null>(null);
  const [visible, setVisible] = useState(false);
  const layer = useRef<HTMLDivElement>(null);

  const show = useCallback((next: Backdrop) => {
    setBackdrop(next);
    setVisible(true);
  }, []);
  const hide = useCallback(() => setVisible(false), []);
  const controls = useMemo(() => ({ show, hide }), [show, hide]);

  useGSAP(
    () => {
      if (!layer.current) return;

      if (!visible) {
        gsap.to(layer.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          overwrite: true,
        });
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Wiped in from the left edge while drifting to the right.
      gsap.fromTo(
        layer.current,
        reduceMotion
          ? { opacity: 0, clipPath: "inset(0 0% 0 0)", xPercent: 0 }
          : { opacity: 0, clipPath: "inset(0 100% 0 0)", xPercent: -8 },
        {
          opacity: 1,
          clipPath: "inset(0 0% 0 0)",
          xPercent: 0,
          duration: reduceMotion ? 0.4 : 1.1,
          ease: "power3.out",
          overwrite: true,
        },
      );
    },
    { dependencies: [backdrop?.id, visible] },
  );

  return (
    <BackdropContext value={controls}>
      {/* Behind the page content, in front of the animated site background. */}
      <div
        ref={layer}
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-5 opacity-0"
      >
        {backdrop && (
          <div
            className="size-full opacity-45"
            style={
              backdrop.glow
                ? ({ "--accent": backdrop.glow } as CSSProperties)
                : undefined
            }
          >
            {backdrop.art}
          </div>
        )}
      </div>
      {children}
    </BackdropContext>
  );
}
