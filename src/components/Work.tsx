"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Lock, RotateCw } from "lucide-react";
import { useRef, useState } from "react";
import { projects, type Project } from "@/lib/site";
import { Eyebrow, Reveal } from "./ui";

export default function Work() {
  return (
    <section id="work" className="relative border-t border-line py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-20 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <Eyebrow index="02">Selected work</Eyebrow>
            <h2 className="display mt-6 text-[clamp(2.5rem,6vw,5.5rem)]">
              Real projects.
              <br />
              <span className="text-mute">Live right now.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-lg leading-relaxed text-mute">
              Don&apos;t take our word for it. Open them, click around, try them on your phone.
            </p>
          </Reveal>
        </div>

        <div className="space-y-32 sm:space-y-44">
          {projects.map((p, i) => (
            <CaseStudy key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudy({ project: p, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLElement>(null);
  // Parallax: the mockup drifts slightly slower than the page as you scroll past.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const flip = index % 2 === 1;

  return (
    <article ref={ref} className="relative grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Giant hollow project number behind everything. */}
      <span
        aria-hidden
        className={`outline-text pointer-events-none absolute -top-20 select-none sm:-top-32 font-display text-[12rem] font-bold leading-none sm:text-[16rem] ${
          flip ? "right-0" : "left-0"
        }`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <motion.div style={{ y }} className={`relative lg:col-span-8 ${flip ? "lg:order-2" : ""}`}>
        {/* Colour glow in the project's own accent, so the two projects feel distinct. */}
        <div
          aria-hidden
          className="absolute inset-x-10 -bottom-10 top-10 rounded-full opacity-40 blur-[90px]"
          style={{ background: p.accent }}
        />
        <BrowserMockup project={p} />
      </motion.div>

      <div className={`relative lg:col-span-4 ${flip ? "lg:order-1" : ""}`}>
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: p.accent }}>
            {p.category}
          </p>
          <h3 className="display mt-4 text-[clamp(2.75rem,5vw,4.5rem)]">{p.title}</h3>
          <p className="mt-6 leading-relaxed text-mute">{p.description}</p>
          <ul className="mt-6 space-y-2 border-t border-line pt-6">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-bone">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} aria-hidden />
                {h}
              </li>
            ))}
          </ul>
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-3 rounded-full border border-line py-2 pl-5 pr-2 text-sm font-medium transition-colors hover:border-white/30"
          >
            View Live Website
            <span
              className="grid h-9 w-9 place-items-center rounded-full text-ink transition-transform duration-500 group-hover:rotate-45"
              style={{ background: p.accent }}
            >
              <ArrowUpRight className="h-4 w-4" />
            </span>
            <span className="sr-only">(opens {p.domain} in a new tab)</span>
          </a>
        </Reveal>
      </div>
    </article>
  );
}

/**
 * A realistic browser window around a screenshot of the live site.
 * Hovering slowly scrolls the screenshot, like someone browsing the page.
 */
function BrowserMockup({ project: p }: { project: Project }) {
  // Image sources in order of preference: your own screenshot, then a live
  // capture of the real site (WordPress mShots service), then a fallback card.
  const sources = [
    p.screenshot,
    `https://s0.wp.com/mshots/v1/${encodeURIComponent(p.url)}?w=1440&h=2600`,
  ].filter(Boolean);
  const [srcIndex, setSrcIndex] = useState(0);
  const [attempt, setAttempt] = useState(0); // retries while mShots is still generating
  const [loaded, setLoaded] = useState(false);
  const failed = srcIndex >= sources.length;

  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open the live ${p.title} website`}
      className="group relative block overflow-hidden rounded-xl border border-white/10 bg-ink-2 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1"
    >
      {/* Browser top bar */}
      <div className="flex items-center gap-3 border-b border-line bg-ink-3 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <div className="mx-auto flex min-w-0 max-w-sm flex-1 items-center justify-center gap-2 rounded-md bg-white/[0.05] px-3 py-1.5 font-mono text-[11px] text-mute">
          <Lock className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{p.domain}</span>
        </div>
        <RotateCw className="h-3.5 w-3.5 text-dim" aria-hidden />
      </div>

      {/* Screen */}
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-3">
        {!failed && (
          // eslint-disable-next-line @next/next/no-img-element -- external screenshot with fallbacks, so next/image adds nothing here
          <img
            key={`${srcIndex}-${attempt}`}
            src={attempt ? `${sources[srcIndex]}&retry=${attempt}` : sources[srcIndex]}
            alt={`Screenshot of the ${p.title} website`}
            loading="lazy"
            decoding="async"
            onLoad={(e) => {
              // mShots returns a tiny "generating" placeholder the first time. Treat that as not ready.
              // Wait 3 seconds and ask again, up to 5 times, then fall back to the title card.
              if (e.currentTarget.naturalWidth < 600) {
                if (attempt < 5) setTimeout(() => setAttempt((a) => a + 1), 3000);
                else setSrcIndex((i) => i + 1);
                return;
              }
              setLoaded(true);
            }}
            onError={() => setSrcIndex((i) => i + 1)}
            className={`absolute inset-0 h-full w-full object-cover object-top transition-[object-position,opacity] duration-[6000ms,700ms] ease-[linear,ease] group-hover:object-bottom ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Shown while loading or if no screenshot is available. */}
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="display text-4xl sm:text-6xl" style={{ color: p.accent }}>
                {p.title}
              </p>
              <p className="mt-3 font-mono text-xs text-mute">{p.domain}</p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-ink/80 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bone px-3 py-1.5 text-xs font-medium text-ink">
            Visit site <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}
