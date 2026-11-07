"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useRef, useState } from "react";
import { steps } from "@/lib/site";
import { Eyebrow, Reveal } from "./ui";

/**
 * A timeline that fills up as you scroll. Each step lights up when the line reaches it.
 * Horizontal on desktop, vertical on mobile.
 */
export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [reached, setReached] = useState(-1);

  // Turn the 0 to 1 scroll progress into "how many steps have we reached".
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setReached(v <= 0.02 ? -1 : Math.min(steps.length - 1, Math.floor(v * steps.length)));
  });

  return (
    <section id="process" className="relative overflow-hidden border-t border-line py-28 sm:py-36">
      <div className="blueprint pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-20 max-w-3xl">
          <Eyebrow index="04">How it works</Eyebrow>
          <h2 className="display mt-6 text-[clamp(2.5rem,6vw,5.5rem)]">
            From idea to <span className="font-serif font-normal normal-case italic text-volt" style={{ fontStretch: "100%" }}>live</span> in four steps
          </h2>
        </Reveal>

        <div ref={ref} className="relative">
          {/* Track + animated fill (desktop: horizontal) */}
          <div className="absolute left-0 right-0 top-[7px] hidden h-px bg-line lg:block" aria-hidden>
            <motion.div style={{ scaleX: progress }} className="h-full origin-left bg-volt" />
          </div>
          {/* Track + animated fill (mobile: vertical) */}
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-line lg:hidden" aria-hidden>
            <motion.div style={{ scaleY: progress }} className="h-full w-full origin-top bg-volt" />
          </div>

          <ol className="grid gap-14 lg:grid-cols-4 lg:gap-8">
            {steps.map((s, i) => {
              const on = i <= reached;
              return (
                <li key={s.title} className="relative pl-10 lg:pl-0 lg:pt-14">
                  <span
                    aria-hidden
                    className={`absolute left-0 top-0 h-[15px] w-[15px] rounded-full border-2 transition-all duration-500 ${
                      on ? "border-volt bg-volt shadow-[0_0_24px_rgba(79,109,255,0.9)]" : "border-dim bg-ink"
                    }`}
                  />
                  <p className={`font-mono text-xs transition-colors duration-500 ${on ? "text-volt" : "text-dim"}`}>
                    Step {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3
                    className={`display mt-3 text-5xl transition-colors duration-500 sm:text-6xl ${on ? "text-bone" : "text-dim"}`}
                  >
                    {s.title}
                  </h3>
                  <p className={`mt-4 max-w-xs leading-relaxed transition-colors duration-500 ${on ? "text-mute" : "text-dim"}`}>
                    {s.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
