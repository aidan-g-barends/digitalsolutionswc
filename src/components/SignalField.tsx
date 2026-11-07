"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's animated background: a grid of tiny dots that ripple like a signal
 * and bend away from the cursor. Drawn on a <canvas> because thousands of DOM
 * elements would be far too slow.
 */
export default function SignalField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const GAP = 26; // distance between dots in CSS pixels
    const RADIUS = 170; // how far the cursor's influence reaches
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = true;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    // Match the canvas to its box and the screen's pixel density so dots stay crisp.
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(t: number) {
      // Ease the pointer towards its target so the bend trails the cursor smoothly.
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;

      ctx!.clearRect(0, 0, width, height);
      const time = t * 0.0006;

      for (let x = GAP / 2; x < width; x += GAP) {
        for (let y = GAP / 2; y < height; y += GAP) {
          // A slow diagonal wave gives the "signal" pulse.
          const wave = Math.sin(x * 0.012 + y * 0.008 - time * 2.2);
          let px = x;
          let py = y;
          let glow = 0;

          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS) {
            const force = (1 - dist / RADIUS) ** 2;
            px += (dx / (dist || 1)) * force * 22;
            py += (dy / (dist || 1)) * force * 22;
            glow = force;
          }

          const alpha = 0.08 + (wave + 1) * 0.06 + glow * 0.7;
          const size = 1.1 + glow * 1.6 + Math.max(wave, 0) * 0.5;
          // Dots near the cursor shift from white to the brand's electric blue.
          ctx!.fillStyle =
            glow > 0.05 ? `rgba(${120 - glow * 41}, ${150 - glow * 41}, 255, ${alpha})` : `rgba(238, 236, 230, ${alpha})`;
          ctx!.fillRect(px - size / 2, py - size / 2, size, size);
        }
      }
      if (running && !reduceMotion) frame = requestAnimationFrame(draw);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
    }
    function onLeave() {
      pointer.tx = -9999;
      pointer.ty = -9999;
    }

    resize();
    draw(0);

    // Stop drawing when the hero is off-screen, so it costs nothing while scrolling.
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (running && !reduceMotion) frame = requestAnimationFrame(draw);
    });
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(0);
    });
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
