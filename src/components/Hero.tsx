"use client";

import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { projects } from "@/lib/site";
import { Button, LocalTime, ease, useStill } from "./ui";

const HEADLINE = ["Websites", "that", "make", "your", "business", "look", "as", "good", "as", "it"];
const SELECTED = "really is";

// Every real screen, alternating between clients: ivy, jjs, ivy, jjs...
const reel = projects[0].screens.flatMap((_, i) =>
  projects.map((p) => ({ ...p.screens[i], project: p })),
);
const REEL_MS = 3600;

// The phone, drawn as a wireframe: frame, notch, header, hero image, text, button, two cards.
const WIRE: ({ shape: "rect"; x: number; y: number; width: number; height: number; rx: number } | { shape: "line"; x1: number; y1: number; x2: number; y2: number })[] = [
  { shape: "rect", x: 0.5, y: 0.5, width: 199, height: 439, rx: 24 },
  { shape: "rect", x: 74, y: 10, width: 52, height: 9, rx: 4.5 },
  { shape: "line", x1: 14, y1: 40, x2: 186, y2: 40 },
  { shape: "rect", x: 14, y: 56, width: 172, height: 150, rx: 6 },
  { shape: "line", x1: 14, y1: 226, x2: 150, y2: 226 },
  { shape: "line", x1: 14, y1: 240, x2: 120, y2: 240 },
  { shape: "rect", x: 14, y: 260, width: 78, height: 22, rx: 3 },
  { shape: "rect", x: 14, y: 304, width: 82, height: 96, rx: 6 },
  { shape: "rect", x: 104, y: 304, width: 82, height: 96, rx: 6 },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const still = useStill();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // On scroll the real phone lifts away from its wireframe: design, then build.
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : -90]);
  const wireY = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : 40]);
  const headY = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : 60]);

  return (
    <section id="top" ref={ref} className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32">
      {/* The 12-column grid, drawn in on load: the page is built on it. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 mx-auto hidden max-w-7xl grid-cols-12 px-8 lg:grid">
        {Array.from({ length: 12 }, (_, i) => (
          <motion.span
            key={i}
            className="border-l border-line last:border-r"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            style={{ originY: 0 }}
            transition={{ duration: 1.4, delay: i * 0.03, ease }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-y-10 px-5 pb-14 sm:px-8 lg:grid-cols-12 lg:gap-y-0 lg:pb-20">
        {/* Status line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="annot order-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-mute lg:col-span-12 lg:pl-[1px]"
        >
          <span className="inline-flex items-center gap-2 text-ink">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-[#2f9e5b] opacity-60 [animation-duration:2.4s]" />
              <span className="relative h-2 w-2 rounded-full bg-[#2f9e5b]" />
            </span>
            Taking on new projects
          </span>
          <span aria-hidden className="hidden text-line-strong sm:inline">/</span>
          <span>
            Western Cape · <LocalTime /> SAST
          </span>
        </motion.p>

        {/* Headline */}
        {/* Left column. "contents" on mobile lets the phone slot in between headline and intro. */}
        <div className="contents lg:col-span-8 lg:row-start-2 lg:block lg:pt-10">
        <motion.div style={{ y: headY }} className="order-1 lg:order-none">
          <h1 className="display text-[clamp(3.3rem,8.4vw,8.6rem)] lg:-ml-[0.04em]">
            <span className="sr-only">Websites that make your business look as good as it really is.</span>
            <span aria-hidden>
              {HEADLINE.map((w, i) => (
                <span key={i} className="mask">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "105%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1, delay: 0.25 + i * 0.05, ease }}
                  >
                    {w}
                  </motion.span>
                  {" "}
                </span>
              ))}
              {/* "really is" gets selected, like text in an editor. */}
              <span className="mask">
                <motion.span
                  className="relative inline-block whitespace-nowrap"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, delay: 0.25 + HEADLINE.length * 0.05, ease }}
                >
                  <motion.span
                    className="absolute -inset-x-[0.04em] bottom-[0.02em] top-[0.1em] origin-left bg-signal"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.75, delay: 1.45, ease: [0.65, 0, 0.35, 1] }}
                  />
                  <span className="relative">{SELECTED}</span>
                </motion.span>
              </span>
              <span className="mask">
                <motion.span
                  className="inline-block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, delay: 0.3 + HEADLINE.length * 0.05, ease }}
                >
                  .
                  <span className="ml-[0.06em] inline-block h-[0.78em] w-[0.07em] translate-y-[0.06em] animate-caret bg-ink" />
                </motion.span>
              </span>
            </span>
          </h1>
        </motion.div>

        {/* Intro + actions */}
        <div className="order-3 lg:order-none lg:mt-14 lg:max-w-[34rem]">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.0, ease }}
            className="max-w-[34rem] text-lg leading-relaxed text-soft sm:text-xl"
          >
            We design and develop high-performance websites, online stores and web applications for South African
            businesses that want to stand out, connect with customers and grow online.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.12, ease }}
            className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5"
          >
            <Button href="#contact">Let&apos;s build something</Button>
            <a href="#work" className="group inline-flex items-center gap-2 font-medium">
              <span className="link-line">See the work</span>
              <ArrowDown className="h-4 w-4 transition-transform duration-500 group-hover:translate-y-0.5" />
            </a>
          </motion.div>
        </div>
        </div>

        {/* Live reel of real client screens, on its own wireframe. */}
        <div className="order-2 lg:order-none lg:col-span-3 lg:col-start-10 lg:row-start-2 lg:pt-14">
          <HeroReel phoneY={phoneY} wireY={wireY} still={still} />
        </div>
      </div>

      {/* Plain-language summary strip. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="relative border-y border-line bg-paper"
      >
        <dl className="mx-auto grid max-w-7xl px-5 sm:grid-cols-3 sm:px-8">
          {[
            ["What we build", "Websites, online stores & web apps"],
            ["Where", "Western Cape, for clients across South Africa"],
            ["Who you deal with", "The developer building your project. Directly."],
          ].map(([k, v], i) => (
            <div key={k} className={`py-6 sm:pr-8 ${i > 0 ? "border-t border-line sm:border-l sm:border-t-0 sm:pl-8" : ""}`}>
              <dt className="annot text-mute">
                <span className="text-signal">0{i + 1}</span> {k}
              </dt>
              <dd className="mt-2 font-display text-lg font-medium tracking-tight">{v}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </section>
  );
}

/**
 * One phone that steps through every real client screen. Sitting behind it is the
 * same phone drawn as a blue wireframe: the sketch, and the finished thing.
 */
function HeroReel({
  phoneY,
  wireY,
  still,
}: {
  phoneY: MotionValue<number>;
  wireY: MotionValue<number>;
  still: boolean;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const running = !paused && !hovered && !still;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setI((n) => (n + 1) % reel.length), REEL_MS);
    return () => clearTimeout(id);
  }, [i, running]);

  const shot = reel[i];

  return (
    <div className="mx-auto flex w-full max-w-[22rem] items-end gap-5 sm:max-w-[26rem] lg:mx-0 lg:block lg:max-w-none">
      <div className="relative ml-[5%] w-[50%] shrink-0 sm:w-[54%] lg:ml-auto lg:w-[92%]">
        {/* Wireframe */}
        <motion.div aria-hidden style={{ y: wireY }} className="absolute inset-0 -translate-x-[10%] translate-y-[5%]">
          <motion.svg
            viewBox="0 0 200 440"
            className="h-full w-full text-signal"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            initial="hidden"
            animate="show"
          >
            {WIRE.map(({ shape: Shape, ...attrs }, k) => {
              const M = Shape === "rect" ? motion.rect : motion.line;
              return (
                <M
                  key={k}
                  {...attrs}
                  vectorEffect="non-scaling-stroke"
                  variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 0.75 } }}
                  transition={{ duration: 1.2, delay: 0.5 + k * 0.07, ease }}
                />
              );
            })}
          </motion.svg>
        </motion.div>

        {/* Real phone */}
        <motion.a
          href={shot.project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${shot.project.title} (${shot.project.domain}) in a new tab`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          style={{ y: phoneY }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease }}
          className="relative block"
        >
          <div className="relative rounded-[2.4rem] bg-black p-[7px] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.14)_inset] transition-transform duration-700 ease-[var(--ease-out-expo)] hover:-translate-y-1">
            <div className="relative aspect-[392/864] overflow-hidden rounded-[1.95rem] bg-paper-2">
              {reel.map((s, k) => (
                <Image
                  key={s.src}
                  src={s.src}
                  alt={k === i ? s.alt : ""}
                  aria-hidden={k !== i}
                  fill
                  sizes="(max-width: 1024px) 50vw, 300px"
                  preload={k === 0}
                  className={`object-cover object-top transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out-expo)] ${
                    k === i ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                  }`}
                />
              ))}
              <span aria-hidden className="absolute left-1/2 top-2 h-[18px] w-[30%] -translate-x-1/2 rounded-full bg-black" />
            </div>
          </div>
        </motion.a>
      </div>

      {/* Caption */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="min-w-0 flex-1 pb-2 lg:mt-10 lg:pb-0 lg:pl-[8%]"
      >
        <div className="annot flex items-center justify-between text-mute">
          <span>Now showing</span>
          <span className="tabular-nums">
            {String(i + 1).padStart(2, "0")}/{String(reel.length).padStart(2, "0")}
          </span>
        </div>
        <div className="relative mt-3 h-7 overflow-hidden" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.a
              key={shot.project.domain + i}
              href={shot.project.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.6, ease }}
              className="group absolute inset-0 flex items-center gap-1 font-display text-lg font-medium tracking-tight"
            >
              <span className="truncate">{shot.project.domain}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-signal transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </motion.a>
          </AnimatePresence>
        </div>
        {/* Progress ticks + pause */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex flex-1 gap-1">
            {reel.map((s, k) => (
              <button
                key={s.src}
                type="button"
                onClick={() => setI(k)}
                aria-label={`Show screen ${k + 1}: ${s.alt}`}
                aria-current={k === i ? "true" : undefined}
                className="group relative h-4 flex-1"
              >
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line-strong transition-colors group-hover:bg-soft" />
                {k < i && <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink" />}
                {k === i && (
                  <span
                    key={`${i}-${running}`}
                    className="absolute inset-x-0 top-1/2 h-px origin-left -translate-y-1/2 bg-signal"
                    style={running ? { animation: `reel-fill ${REEL_MS}ms linear forwards` } : undefined}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play the screen reel" : "Pause the screen reel"}
            className="grid h-7 w-7 place-items-center rounded-[4px] border border-line-strong text-soft transition-colors hover:text-ink"
          >
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
