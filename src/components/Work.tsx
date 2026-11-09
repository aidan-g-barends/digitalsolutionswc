"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
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
            <span>
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {p.category}
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
        <div className="relative h-[24rem] overflow-hidden sm:h-[34rem] lg:col-span-7 lg:h-auto">
          <div aria-hidden className="absolute inset-0 opacity-[0.08]" style={{ background: `radial-gradient(circle at 60% 40%, ${p.colors.accent}, transparent 60%)` }} />
          <motion.div style={{ y: y1 }} className="absolute left-[2%] top-[16%] w-[38%] -rotate-[5deg] sm:w-[30%]">
            <Phone src={p.screens[1].src} alt={p.screens[1].alt} />
          </motion.div>
          <motion.div style={{ y: y2 }} className="absolute left-1/2 top-[6%] z-10 w-[46%] -translate-x-1/2 sm:w-[33%]">
            <Phone src={p.screens[0].src} alt={p.screens[0].alt} />
          </motion.div>
          <motion.div style={{ y: y3 }} className="absolute right-[2%] top-[20%] w-[38%] rotate-[5deg] sm:w-[30%]">
            <Phone src={p.screens[2].src} alt={p.screens[2].alt} />
          </motion.div>
        </div>

        {/* Shade that darkens this card as the next one covers it. */}
        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 z-20 bg-paper" />
      </motion.article>
    </div>
  );
}
