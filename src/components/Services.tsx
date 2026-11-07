"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { services, type Glyph } from "@/lib/site";
import { Eyebrow, Reveal } from "./ui";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Services as an interactive index instead of six cards.
 * Desktop: hover a row and the panel on the right shows an animated drawing of it.
 * Mobile: tap a row to open its description in place.
 */
export default function Services() {
  const [active, setActive] = useState(0);
  const current = services[active];

  return (
    <section id="services" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-16 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Eyebrow index="01">Services</Eyebrow>
            <h2 className="display mt-6 text-[clamp(2.5rem,6vw,5.5rem)]">
              What we <span className="font-serif font-normal normal-case italic text-volt" style={{ fontStretch: "100%" }}>build</span> for you
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="self-end lg:col-span-4 lg:col-start-9">
            <p className="text-lg leading-relaxed text-mute">
              From your first professional website to custom software that runs part of your business. One partner, built to fit.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          <ul className="border-t border-line lg:col-span-7" role="list">
            {services.map((s, i) => {
              const isActive = i === active;
              return (
                <li key={s.title} className="border-b border-line">
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-expanded={isActive}
                    className="group flex w-full items-center gap-5 py-6 text-left sm:gap-8 sm:py-7"
                  >
                    <span className={`font-mono text-xs transition-colors ${isActive ? "text-volt" : "text-dim"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`flex-1 font-display text-[clamp(1.5rem,3.2vw,2.6rem)] font-semibold leading-tight tracking-tight transition-all duration-500 ${
                        isActive ? "translate-x-2 text-bone" : "text-dim group-hover:text-mute"
                      }`}
                    >
                      {s.title}
                    </span>
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                        isActive ? "rotate-45 border-volt bg-volt text-white" : "border-line text-mute"
                      }`}
                      aria-hidden
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>

                  {/* Inline description, only used on smaller screens. */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease }}
                        className="overflow-hidden lg:hidden"
                      >
                        <p className="pb-6 pl-10 pr-4 leading-relaxed text-mute sm:pl-14">{s.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          {/* Sticky preview panel (desktop only). */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28 overflow-hidden rounded-2xl border border-line bg-ink-2">
              <div className="blueprint relative aspect-[4/3] border-b border-line">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.45, ease }}
                    className="absolute inset-0 grid place-items-center"
                  >
                    <ServiceGlyph glyph={current.glyph} />
                  </motion.div>
                </AnimatePresence>
                <span className="outline-text absolute bottom-2 right-5 font-display text-8xl font-bold">
                  {String(active + 1).padStart(2, "0")}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease }}
                  className="p-7"
                >
                  <p className="leading-relaxed text-mute">{current.description}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {current.tags.map((t) => (
                      <li key={t} className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-mute">
                        {t}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Line drawings that "draw themselves" (pathLength animates from 0 to 1). */
function ServiceGlyph({ glyph }: { glyph: Glyph }) {
  const draw = (delay = 0) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.1, delay, ease },
  });
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <svg viewBox="0 0 240 180" className="h-3/5 w-3/5 text-bone" aria-hidden>
      {glyph === "web" && (
        <>
          <motion.rect x="20" y="25" width="200" height="130" rx="10" {...stroke} {...draw()} />
          <motion.path d="M20 50h200" {...stroke} {...draw(0.2)} />
          <motion.path d="M40 75h90M40 92h60" {...stroke} {...draw(0.4)} className="text-volt" stroke="currentColor" />
          <motion.rect x="40" y="110" width="50" height="16" rx="8" {...stroke} {...draw(0.6)} />
          <motion.rect x="145" y="70" width="55" height="60" rx="6" {...stroke} {...draw(0.5)} />
          <circle cx="33" cy="37.5" r="3" className="fill-volt" />
        </>
      )}
      {glyph === "shop" && (
        <>
          <motion.path d="M70 60h100l-10 95H80z" {...stroke} {...draw()} />
          <motion.path d="M95 60V48a25 25 0 0 1 50 0v12" {...stroke} {...draw(0.3)} className="text-volt" stroke="currentColor" />
          <motion.path d="M100 110l14 14 28-30" {...stroke} {...draw(0.7)} />
        </>
      )}
      {glyph === "app" && (
        <>
          {[[50, 50], [190, 45], [120, 95], [60, 140], [185, 140]].map(([cx, cy], i) => (
            <motion.circle key={i} cx={cx} cy={cy} r={i === 2 ? 14 : 8} {...stroke} {...draw(i * 0.1)} className={i === 2 ? "text-volt" : ""} stroke="currentColor" />
          ))}
          <motion.path d="M57 55l50 33M182 50l-50 38M110 105l-43 29M131 104l46 29" {...stroke} {...draw(0.5)} />
        </>
      )}
      {glyph === "mobile" && (
        <>
          <motion.rect x="85" y="15" width="70" height="150" rx="14" {...stroke} {...draw()} />
          <motion.path d="M110 27h20" {...stroke} {...draw(0.3)} />
          <motion.rect x="97" y="45" width="46" height="34" rx="5" {...stroke} {...draw(0.4)} className="text-volt" stroke="currentColor" />
          <motion.path d="M97 95h46M97 108h30M97 121h38" {...stroke} {...draw(0.6)} />
        </>
      )}
      {glyph === "uiux" && (
        <>
          <motion.rect x="25" y="30" width="80" height="55" rx="6" {...stroke} {...draw()} />
          <motion.rect x="135" y="30" width="80" height="55" rx="6" {...stroke} {...draw(0.15)} />
          <motion.rect x="80" y="110" width="80" height="45" rx="6" {...stroke} {...draw(0.3)} />
          <motion.path d="M105 57h30M175 85v12a6 6 0 0 1-6 6h-29" {...stroke} {...draw(0.5)} className="text-volt" stroke="currentColor" />
          <motion.path d="M150 128l20 8-9 3-3 9z" {...stroke} {...draw(0.8)} />
        </>
      )}
      {glyph === "redesign" && (
        <>
          <motion.rect x="20" y="40" width="85" height="100" rx="4" {...stroke} {...draw()} strokeDasharray="4 5" className="text-dim" stroke="currentColor" />
          <motion.rect x="135" y="40" width="85" height="100" rx="10" {...stroke} {...draw(0.3)} />
          <motion.path d="M150 62h55M150 78h35" {...stroke} {...draw(0.5)} className="text-volt" stroke="currentColor" />
          <motion.rect x="150" y="96" width="55" height="30" rx="5" {...stroke} {...draw(0.6)} />
          <motion.path d="M110 90h18m-6-6 6 6-6 6" {...stroke} {...draw(0.4)} />
        </>
      )}
    </svg>
  );
}
