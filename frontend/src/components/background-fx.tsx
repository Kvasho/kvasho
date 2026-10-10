"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const PARTICLE_COUNT = 48;

export default function BackgroundFx() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  // Soft glow that trails the cursor.
  useGSAP(() => {
    const options = { duration: 1.2, ease: "power3.out" };
    const moveX = gsap.quickTo(glow.current, "x", options);
    const moveY = gsap.quickTo(glow.current, "y", options);

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      moveX(event.clientX);
      moveY(event.clientY);
      gsap.to(glow.current, { opacity: 1, duration: 0.8, overwrite: "auto" });
    }

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  });

  // Small dots slowly floating upwards.
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.6 + Math.random() * 1.6,
      // Fractions of the viewport per second.
      rise: 0.004 + Math.random() * 0.01,
      drift: (Math.random() - 0.5) * 0.006,
      phase: Math.random() * Math.PI * 2,
      accent: Math.random() < 0.25,
    }));

    let width = 0;
    let height = 0;
    let foreground = "";
    let accent = "";
    let frame = 0;
    let last = performance.now();

    function readColors() {
      const style = getComputedStyle(document.documentElement);
      foreground = style.getPropertyValue("--foreground").trim();
      accent = style.getPropertyValue("--accent").trim();
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      el!.width = width * dpr;
      el!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(now: number) {
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;

      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.rise * delta;
        p.x += p.drift * delta;
        if (p.y < -0.02) p.y = 1.02;
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;

        const twinkle = 0.5 + 0.5 * Math.sin(now * 0.0008 + p.phase);
        ctx!.globalAlpha = 0.12 + 0.28 * twinkle;
        ctx!.fillStyle = p.accent ? accent : foreground;
        ctx!.beginPath();
        ctx!.arc(p.x * width, p.y * height, p.radius, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (!reduceMotion.matches) frame = requestAnimationFrame(draw);
    }

    function restart() {
      cancelAnimationFrame(frame);
      readColors();
      resize();
      last = performance.now();
      draw(last);
    }

    restart();
    window.addEventListener("resize", restart);
    reduceMotion.addEventListener("change", restart);
    colorScheme.addEventListener("change", restart);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", restart);
      reduceMotion.removeEventListener("change", restart);
      colorScheme.removeEventListener("change", restart);
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} className="absolute inset-0 size-full" />
      <div ref={glow} className="bg-cursor-glow" />
    </>
  );
}
