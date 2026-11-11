"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useRef, useState } from "react";
import { stack, steps } from "@/lib/site";
import { Label, Reveal, SplitHeading, useStill } from "./ui";

/** How a project runs: a line that draws through four steps as you scroll, plus the tools we use. */
export default function Process() {
  const ref = useRef<HTMLOListElement>(null);
  const still = useStill();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  // How many steps the line has reached, so each one can light up in turn.
  const [reached, setReached] = useState(still ? steps.length : 0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!still) setReached(Math.min(steps.length, Math.floor(v * steps.length + 0.35)));
  });
  const lit = still ? steps.length : reached;

  return (
    <section id="process" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Label index="06">How it works</Label>
            <SplitHeading text="From first chat to launch day." className="display mt-6 text-[clamp(2.8rem,6vw,5.6rem)]" />
          </div>
          <Reveal delay={0.15} className="lg:col-span-4 lg:col-start-9">
            <p className="leading-relaxed text-soft">
              Four clear stages, and you know what&apos;s happening at every one of them. No surprises, no disappearing
              acts.
            </p>
          </Reveal>
        </div>

        <ol ref={ref} className="relative mt-14 grid gap-8 pl-8 sm:mt-20 lg:grid-cols-4 lg:gap-8 lg:pl-0 lg:pt-10">
          {/* The track and the line drawing along it (vertical on mobile, horizontal on desktop). */}
          <span aria-hidden className="absolute bottom-0 left-[5px] top-0 w-px bg-line-strong lg:inset-x-0 lg:bottom-auto lg:top-[5px] lg:h-px lg:w-auto" />
          <motion.span
            aria-hidden
            style={{ scaleY: still ? 1 : line }}
            className="absolute bottom-0 left-[5px] top-0 w-px origin-top bg-signal lg:hidden"
          />
          <motion.span
            aria-hidden
            style={{ scaleX: still ? 1 : line }}
            className="absolute inset-x-0 top-[5px] hidden h-px origin-left bg-signal lg:block"
          />

          {steps.map((s, i) => {
            const on = i < lit;
            return (
              <li key={s.title} className="relative">
                {/* Node on the line */}
                <span
                  aria-hidden
                  className={`absolute -left-8 top-1 h-[11px] w-[11px] border transition-colors duration-500 lg:-top-10 lg:left-0 ${
                    on ? "border-signal bg-signal" : "border-line-strong bg-paper"
                  }`}
                />
                <div className="flex items-baseline gap-4 lg:block">
                  <span
                    className={`display block text-[2.6rem] transition-colors duration-700 lg:text-[clamp(3.5rem,6vw,5.5rem)] ${on ? "text-ink" : "text-ink/15"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-2xl font-semibold tracking-tight lg:mt-6">{s.title}</h3>
                </div>
                <p className="mt-3 max-w-xs leading-relaxed text-soft">{s.body}</p>
              </li>
            );
          })}
        </ol>

        {/* The toolset, as a spec sheet. */}
        <div className="mt-24 grid gap-8 sm:mt-32 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <Label>Built with</Label>
            <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-mute">Only tools used on real, shipped projects.</p>
          </Reveal>
          <dl className="border-t border-line-strong lg:col-span-9">
            {stack.map((g) => (
              <Reveal key={g.group} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[10rem_1fr] sm:gap-8">
                <dt className="annot pt-1.5 text-mute">{g.group}</dt>
                <dd className="font-display text-xl font-medium tracking-tight">
                  {g.items.map((t, i) => (
                    <span key={t} className="inline-block">
                      {t}
                      {i < g.items.length - 1 && <span className="mx-2.5 text-mute">/</span>}
                    </span>
                  ))}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
