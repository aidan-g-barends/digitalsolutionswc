"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { faqs, site } from "@/lib/site";
import { Label, Reveal, SplitHeading, ease } from "./ui";

/** The questions small business owners always ask, answered plainly. The first one starts open. */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Label index="06">Questions</Label>
          <SplitHeading text="Straight answers." className="display mt-6 text-[clamp(2.8rem,6vw,5.6rem)]" />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-sm leading-relaxed text-soft">
              Still wondering about something?{" "}
              <a href="#contact" data-assistant className="link-line font-medium text-ink">
                Ask our AI assistant
              </a>{" "}
              or email{" "}
              <a href={`mailto:${site.email}`} className="link-line font-medium text-ink">
                {site.email}
              </a>
              .
            </p>
          </Reveal>
        </div>

        <ul className="border-t border-line lg:col-span-7 lg:col-start-6">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center gap-5 py-6 text-left"
                  >
                    <span className={`flex-1 font-display text-xl font-semibold tracking-tight transition-colors sm:text-2xl ${isOpen ? "text-ink" : "text-soft group-hover:text-ink"}`}>
                      {f.q}
                    </span>
                    <span
                      aria-hidden
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-[5px] border transition-colors duration-300 ${
                        isOpen ? "border-signal bg-signal text-white" : "border-line-strong text-mute group-hover:text-ink"
                      }`}
                    >
                      {/* Only the icon turns: plus becomes a cross. */}
                      <Plus className={`h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)] ${isOpen ? "rotate-45" : ""}`} />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 pr-14 leading-relaxed text-soft">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
