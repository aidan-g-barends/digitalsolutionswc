"use client";

import { Tilt } from "./Depth";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { projects, type Project } from "@/lib/site";
import { Label, Phone, Reveal, SplitHeading, ease, useStill } from "./ui";

export default function Work() {
  const stackRef = useRef<HTMLDivElement>(null);
  // Progress through the whole stack, used to push earlier cards back as later ones arrive.
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] });

  return (
    <section id="work" className="relative border-b border-line bg-paper-2 py-24 text-ink sm:py-32 lg:pb-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Label index="01">Selected work</Label>
            <SplitHeading text="Live, and working for real businesses." className="display mt-6 text-[clamp(2.8rem,6.6vw,6rem)]" />
          </div>
          <Reveal delay={0.2} className="lg:col-span-3 lg:col-start-10">
            <p className="leading-relaxed text-soft">
              These aren&apos;t mockups. Every screen is a real page from a live site. Open them on your phone and have a
              look around.
            </p>
          </Reveal>
        </div>

        <div ref={stackRef} className="mt-16 space-y-6 sm:mt-20 lg:space-y-0">
          {projects.map((p, i) => (
            <CaseStudy key={p.title} project={p} index={i} total={projects.length} stack={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** One case study, dressed in the client's own brand colours. Stacks on large screens. */
function CaseStudy({ project: p, index, total, stack }: { project: Project; index: number; total: number; stack: MotionValue<number> }) {
  const ref = useRef<HTMLElement>(null);
  const still = useStill();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Phones move at slightly different speeds while scrolling (parallax).
  const y1 = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [120, -80]);
  const y3 = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [90, -40]);

  // While the next card slides over this one, this one sinks back slightly.
  const isLast = index === total - 1;
  // N cards means N-1 hand-overs across the stack's scroll distance.
  // Ranges must stay within 0-1: scroll animations can run on the browser's native
  // animation engine, which rejects keyframe offsets outside that range.
  const steps = Math.max(total - 1, 1);
  const start = isLast ? 0 : index / steps;
  const end = isLast ? 1 : Math.min((index + 1) / steps, 1);
  const scale = useTransform(stack, [start, end], isLast || still ? [1, 1] : [1, 0.94]);
  const dim = useTransform(stack, [start, end], isLast || still ? [0, 0] : [0, 0.45]);

  return (
    <div className="lg:sticky lg:h-[calc(100svh-6rem)] lg:max-h-[46rem] lg:min-h-[36rem] lg:pb-8" style={{ top: `calc(5.5rem + ${index * 1.25}rem)` }}>
      <motion.article
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1, ease }}
        style={{ background: p.colors.bg, color: p.colors.ink, scale }}
        className="relative grid h-full origin-top overflow-hidden rounded-[14px] lg:grid-cols-12"
      >
        <div className="relative z-10 flex flex-col p-6 sm:p-10 lg:col-span-5 lg:p-12">
          <div className="annot flex flex-wrap items-center justify-between gap-x-6 gap-y-1 opacity-70">
            <span className="flex items-center gap-3">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {p.category}
              {p.status && <span className="rounded-[3px] border border-current px-1.5 py-0.5 text-[10px]">{p.status}</span>}
            </span>
            <span className="normal-case tracking-normal">{p.domain}</span>
          </div>

          <h3 className="display mt-10 text-[clamp(2.6rem,4.6vw,4.4rem)] lg:mt-auto">{p.title}</h3>
          <p className="mt-5 text-lg leading-relaxed">{p.about}</p>
          <p className="mt-3 leading-relaxed opacity-75">{p.built}</p>

          {/* Scope as a tidy spec list rather than a cloud of pills. */}
          <ul className="mt-7 grid grid-cols-2 border-t text-[13px] sm:text-[14px]" style={{ borderColor: `${p.colors.ink}22` }}>
            {p.scope.map((s) => (
              <li key={s} className="flex gap-2 border-b py-2 odd:pr-3" style={{ borderColor: `${p.colors.ink}22` }}>
                <span aria-hidden style={{ color: p.colors.accent }}>
                  —
                </span>
                {s}
              </li>
            ))}
          </ul>
          {p.stack && <p className="mt-4 font-mono text-[12px] opacity-60">{p.stack}</p>}

          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex w-fit items-center gap-3 font-medium lg:mb-auto"
          >
            <span className="grid h-11 w-11 place-items-center rounded-[5px] text-white transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-rotate-45" style={{ background: p.colors.accent }}>
              <ArrowUpRight className="h-4 w-4 rotate-45" />
            </span>
            <span className="link-line">View the live website</span>
            <span className="sr-only">(opens {p.domain} in a new tab)</span>
          </a>
        </div>

        {/* Three real screens of the live site, fanned out. */}
        <Tilt max={5} className="relative h-[24rem] overflow-hidden sm:h-[34rem] lg:col-span-7 lg:h-auto">
          <div aria-hidden className="absolute inset-0 opacity-[0.08]" style={{ background: `radial-gradient(circle at 60% 40%, ${p.colors.accent}, transparent 60%)` }} />
          <ScreensLink project={p}>
          <motion.div style={{ y: y1 }} className="absolute left-[2%] top-[16%] w-[38%] -rotate-[5deg] sm:w-[30%]">
            <Phone src={p.screens[1].src} alt={p.screens[1].alt} />
          </motion.div>
          <motion.div style={{ y: y2 }} className="absolute left-1/2 top-[6%] z-10 w-[46%] -translate-x-1/2 sm:w-[33%]">
            <Phone src={p.screens[0].src} alt={p.screens[0].alt} />
          </motion.div>
          <motion.div style={{ y: y3 }} className="absolute right-[2%] top-[20%] w-[38%] rotate-[5deg] sm:w-[30%]">
            <Phone src={p.screens[2].src} alt={p.screens[2].alt} />
          </motion.div>
          </ScreensLink>
        </Tilt>

        {/* Shade that darkens this card as the next one covers it. */}
        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 z-20 bg-paper" />
      </motion.article>
    </div>
  );
}

/**
 * Makes the phone screens a link to the live site. With a mouse, a round "Visit site"
 * badge in the client's colour follows the pointer, so it's obvious the screens are
 * clickable. Touch screens get a small static label instead (there's no hover there),
 * and keyboard users see the badge centred when the link has focus.
 */
function ScreensLink({ project: p, children }: { project: Project; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [active, setActive] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 450, damping: 38, mass: 0.5 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  function follow(e: React.PointerEvent<HTMLAnchorElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }
  function centre() {
    if (!ref.current) return;
    x.jump(ref.current.offsetWidth / 2);
    y.jump(ref.current.offsetHeight / 2);
  }

  return (
    <a
      ref={ref}
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open the live ${p.title} website (${p.domain}) in a new tab`}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        follow(e);
        x.jump(x.get());
        y.jump(y.get());
        setActive(true);
      }}
      onPointerMove={follow}
      onPointerLeave={() => setActive(false)}
      onFocus={() => {
        centre();
        setActive(true);
      }}
      onBlur={() => setActive(false)}
      className="screens-link absolute inset-0 block focus-visible:outline-offset-[-6px]"
    >
      {children}
      {/* Pointer badge (mouse and keyboard) */}
      <motion.span
        aria-hidden
        style={{ x: sx, y: sy, background: p.colors.accent }}
        initial={false}
        animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ duration: 0.45, ease }}
        className="screens-badge pointer-events-none absolute left-0 top-0 z-30 -ml-12 -mt-12 grid h-24 w-24 place-items-center rounded-full text-center text-[13px] font-medium leading-tight text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)]"
      >
        <span>
          Visit site
          <ArrowUpRight className="mx-auto mt-0.5 h-4 w-4" />
        </span>
      </motion.span>
      {/* Touch screens: a quiet, static hint */}
      <span
        aria-hidden
        className="tap-hint annot absolute bottom-4 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-[4px] px-2.5 py-1.5 text-[10px] text-white"
        style={{ background: p.colors.accent }}
      >
        Tap to visit ↗
      </span>
    </a>
  );
}
