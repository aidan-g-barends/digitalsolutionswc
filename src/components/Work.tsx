"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { projects, type Project } from "@/lib/site";
import { Label, Phone, Reveal } from "./ui";

export default function Work() {
  return (
    <section id="work" className="bg-ink py-24 text-paper sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Label dark>Selected work</Label>
            <h2 className="headline mt-5 text-[clamp(2.4rem,5.5vw,4.5rem)]">Live, and working for real businesses.</h2>
          </div>
          <p className="max-w-xs text-paper/60">These aren&apos;t mockups. Open them on your phone and have a look around.</p>
        </Reveal>

        <div className="mt-16 space-y-8 sm:mt-20 sm:space-y-10">
          {projects.map((p, i) => (
            <CaseStudy key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** One case study card, dressed in the client's own brand colours. */
function CaseStudy({ project: p, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Phones move at slightly different speeds while scrolling (parallax).
  const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [110, -70]);
  const y3 = useTransform(scrollYProgress, [0, 1], [80, -30]);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="grid overflow-hidden rounded-[1.75rem] lg:grid-cols-12"
      style={{ background: p.colors.bg, color: p.colors.ink }}
    >
      <div className="flex flex-col p-7 sm:p-10 lg:col-span-5 lg:p-12">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] opacity-70">
          <span>
            {String(index + 1).padStart(2, "0")} · {p.category}
          </span>
          <span>{p.domain}</span>
        </div>

        <h3 className="headline mt-10 text-[clamp(2.2rem,4vw,3.4rem)]">{p.title}</h3>
        <p className="mt-5 text-lg leading-relaxed">{p.about}</p>
        <p className="mt-3 leading-relaxed opacity-75">{p.built}</p>

        <ul className="mt-8 flex flex-wrap gap-2">
          {p.scope.map((s) => (
            <li key={s} className="rounded-full border px-3 py-1.5 text-[13px]" style={{ borderColor: `${p.colors.ink}26` }}>
              {s}
            </li>
          ))}
        </ul>
        {p.stack && <p className="mt-5 font-mono text-[12px] opacity-60">{p.stack}</p>}

        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-10 inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-6 py-3.5 font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
          style={{ background: p.colors.accent }}
        >
          View Live Website
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          <span className="sr-only">(opens {p.domain} in a new tab)</span>
        </a>
      </div>

      {/* Three real screens of the live site, fanned out. */}
      <div className="relative h-[26rem] overflow-hidden sm:h-[34rem] lg:col-span-7 lg:h-auto lg:min-h-[38rem]">
        <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={{ background: `radial-gradient(circle at 60% 40%, ${p.colors.accent}, transparent 60%)` }} />
        <motion.div style={{ y: y1 }} className="absolute left-[4%] top-[14%] w-[36%] -rotate-[5deg] sm:w-[30%]">
          <Phone src={p.screens[1].src} alt={p.screens[1].alt} />
        </motion.div>
        <motion.div style={{ y: y2 }} className="absolute left-1/2 top-[6%] z-10 w-[42%] -translate-x-1/2 sm:w-[33%]">
          <Phone src={p.screens[0].src} alt={p.screens[0].alt} />
        </motion.div>
        <motion.div style={{ y: y3 }} className="absolute right-[4%] top-[18%] w-[36%] rotate-[5deg] sm:w-[30%]">
          <Phone src={p.screens[2].src} alt={p.screens[2].alt} />
        </motion.div>
      </div>
    </motion.article>
  );
}
