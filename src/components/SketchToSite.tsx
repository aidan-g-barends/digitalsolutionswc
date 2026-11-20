"use client";

import { useEffect, useRef } from "react";
import { projects } from "@/lib/site";
import { Label, Phone, Reveal, SplitHeading, useStill } from "./ui";

/**
 * "Sketch to site": a cursor-reveal band.
 *
 * Two identical rows of phones are stacked on top of each other:
 * - the bottom row is styled as a blueprint (CSS filters turn the real
 *   screenshots into blue line art),
 * - the top row is the real, finished screens, clipped to a circle "lens".
 *
 * Moving the mouse (or dragging a finger) moves the lens, so you look through
 * the plan and see the finished site underneath. The lens position lives in two
 * CSS variables that we set directly on the element, so moving it never
 * re-renders React. Before anyone touches it, the lens drifts slowly on its own,
 * so phone users still see what it does. Reduced motion: the lens sits still.
 */

const screens = projects.map((p) => p.screens[0]);

function Row({ blueprint }: { blueprint?: boolean }) {
  return (
    <div className="grid grid-cols-3 items-start gap-4 sm:gap-8">
      {screens.map((s, i) => (
        <Phone
          key={s.src}
          src={s.src}
          alt={blueprint ? "" : s.alt}
          sizes="(max-width: 768px) 30vw, 280px"
          className={i === 1 ? "sm:-translate-y-8" : "sm:translate-y-6"}
        />
      ))}
    </div>
  );
}

export default function SketchToSite() {
  const stage = useRef<HTMLDivElement>(null);
  const still = useStill();

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let touched = false;
    let raf = 0;

    const place = (x: number, y: number) => {
      el.style.setProperty("--lx", `${x}px`);
      el.style.setProperty("--ly", `${y}px`);
    };
    // Lens size follows the stage: smaller on phones, where the screens are smaller.
    const size = () => el.style.setProperty("--lr", `${el.clientWidth < 640 ? 78 : 150}px`);
    const centre = () => place(el.clientWidth / 2, el.clientHeight * 0.45);
    size();
    centre();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    if (still) return () => ro.disconnect();

    // Idle drift: a slow figure-of-eight until the visitor takes over.
    const t0 = performance.now();
    const drift = (now: number) => {
      if (touched) return;
      const t = (now - t0) / 1000;
      const w = el.clientWidth;
      const h = el.clientHeight;
      place(w / 2 + Math.sin(t * 0.5) * w * 0.34, h * 0.45 + Math.sin(t) * h * 0.18);
      raf = requestAnimationFrame(drift);
    };
    raf = requestAnimationFrame(drift);

    const move = (e: PointerEvent) => {
      touched = true;
      cancelAnimationFrame(raf);
      const r = el.getBoundingClientRect();
      place(e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", move);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", move);
    };
  }, [still]);

  // The lens: a hard-edged circle at (--lx, --ly).
  const lens = `radial-gradient(circle var(--lr) at var(--lx) var(--ly), #000 98%, transparent 100%)`;

  return (
    <section aria-label="From sketch to site" className="relative overflow-hidden border-b border-line bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Label>From sketch to site</Label>
            <SplitHeading text="Every site starts as a plan." className="display mt-6 text-[clamp(2.6rem,6vw,5.4rem)]" />
          </div>
          <Reveal delay={0.2} className="lg:col-span-3 lg:col-start-10">
            <p className="leading-relaxed text-soft">
              Each project is mapped out before a line of code is written. Move your cursor (or drag your finger) over the
              plans to see the finished sites underneath.
            </p>
          </Reveal>
        </div>

        <div
          ref={stage}
          className="relative mx-auto mt-14 max-w-4xl overflow-hidden rounded-[14px] touch-pan-y select-none px-2 pb-6 pt-10 sm:mt-20 sm:cursor-none sm:px-10"
        >
          {/* Blueprint grid behind the plans */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-[14px] border border-line opacity-60 [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:28px_28px]"
          />

          {/* Bottom layer: the plan. Filters turn screenshots into blue line art. */}
          <div aria-hidden className="relative [filter:grayscale(1)_invert(1)_sepia(1)_saturate(4)_hue-rotate(185deg)_contrast(1.2)_brightness(0.75)] opacity-80">
            <Row blueprint />
          </div>

          {/* Top layer: the finished sites, only visible inside the lens. */}
          <div
            className="absolute inset-0 px-2 pb-6 pt-10 sm:px-10"
            style={{ maskImage: lens, WebkitMaskImage: lens }}
          >
            <Row />
          </div>

          {/* Lens ring, so the circle reads as a tool rather than a glitch. */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 rounded-full border-2 border-signal shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-signal)_18%,transparent)]"
            style={{
              width: "calc(var(--lr) * 2)",
              height: "calc(var(--lr) * 2)",
              transform: "translate(calc(var(--lx) - var(--lr)), calc(var(--ly) - var(--lr)))",
            }}
          />
        </div>
      </div>
    </section>
  );
}
