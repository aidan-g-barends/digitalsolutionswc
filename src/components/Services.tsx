"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";
import { services } from "@/lib/site";
import { Label, Reveal, SplitHeading, ease } from "./ui";

/** Services as an expanding typographic index: scannable at a glance, detail on demand. */
export default function Services() {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <section id="services" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Label index="02">Services</Label>
            <SplitHeading text="What we can build for you." className="display mt-6 text-[clamp(2.8rem,5.4vw,5rem)]" />
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-sm text-lg leading-relaxed text-soft">
                From your first professional website to custom software that runs part of your business. If it lives in a
                browser, we can build it.
              </p>
              <a href="#contact" className="group mt-8 inline-flex items-center gap-2 font-medium">
                <span className="link-line">Not sure what you need? Ask us</span>
                <span aria-hidden className="text-signal transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </Reveal>
          </div>
        </div>

        <ol className="border-t border-line-strong lg:col-span-8">
          {services.map((s, i) => {
            const isOpen = open === i;
            const panel = `${uid}-panel-${i}`;
            return (
              <li key={s.title} className="border-b border-line">
                <Reveal delay={i * 0.04}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panel}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-2 py-6 text-left sm:grid-cols-[4rem_1fr_auto] sm:py-7"
                    >
                      <span className={`font-mono text-xs transition-colors duration-300 ${isOpen ? "text-signal" : "text-mute group-hover:text-signal"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`display text-[clamp(1.75rem,3.6vw,3rem)] transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2 ${
                          isOpen ? "text-ink" : "text-ink/75 group-hover:text-ink"
                        }`}
                      >
                        {s.title}
                      </span>
                      {/* Plus that turns into a minus. */}
                      <span aria-hidden className="relative h-3 w-3 self-center">
                        <span className="absolute left-0 top-1/2 h-px w-3 bg-current" />
                        <span
                          className={`absolute left-1/2 top-0 h-3 w-px bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] ${isOpen ? "scale-y-0" : ""}`}
                        />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panel}
                        role="region"
                        aria-label={s.title}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-5 pb-8 sm:grid-cols-[4rem_1fr_1fr] sm:gap-x-2">
                          <p className="leading-relaxed text-soft sm:col-start-2">{s.description}</p>
                          <div className="border-l-2 border-signal pl-4 sm:ml-8">
                            <p className="annot text-mute">Good for</p>
                            <p className="mt-2 font-display text-lg font-medium leading-snug tracking-tight">{s.goodFor}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
