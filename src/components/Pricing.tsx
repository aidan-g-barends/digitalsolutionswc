"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { pricing, rand } from "@/lib/site";
import { Button, Label, Reveal, SplitHeading, ease, useStill } from "./ui";

/**
 * Pricing: the honest range (R2,500 to R30,000), a visual scale showing roughly
 * where common projects land, what moves the price, and what's always included.
 * Exact prices come as a fixed quote after the free consultation.
 */
export default function Pricing() {
  const still = useStill();

  return (
    <section id="pricing" className="border-y border-line bg-paper-2 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Label index="03">Pricing</Label>
            <SplitHeading text="Clear prices. No surprises." accent={["Clear"]} className="display mt-6 text-[clamp(2.8rem,6vw,5.6rem)]" />
          </div>
          <Reveal delay={0.15} className="lg:col-span-4 lg:col-start-9">
            <p className="leading-relaxed text-soft">
              You only pay for what your business needs. After a free consultation you get a fixed quote, so the number
              you agree to is the number you pay.
            </p>
          </Reveal>
        </div>

        {/* The range, big and plain */}
        <Reveal className="mt-16 flex flex-wrap items-end gap-x-6 gap-y-2">
          <p className="display text-[clamp(3.4rem,10vw,8.5rem)] leading-[0.85]">
            {rand(pricing.from)}
            <span className="mx-[0.15em] text-mute">to</span>
            <span className="text-signal">{rand(pricing.to)}</span>
          </p>
          <p className="annot pb-2 text-mute">Per project, depending on scope</p>
        </Reveal>

        {/* The scale: a line from the lowest to the highest price, with where common projects usually land */}
        <div className="mt-14" aria-label="Rough guide to where common projects land on the price range">
          <div className="relative h-px bg-line-strong">
            <motion.span
              aria-hidden
              className="absolute inset-y-0 left-0 w-full origin-left bg-signal"
              initial={{ scaleX: still ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.4, ease }}
            />
          </div>
          {/* Stacked list on phones, positioned markers on bigger screens */}
          <ul className="mt-6 grid gap-3 sm:relative sm:mt-0 sm:block sm:h-14">
            {pricing.guide.map((g, i) => (
              <motion.li
                key={g.label}
                initial={{ opacity: still ? 1 : 0, y: still ? 0 : 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.25, ease }}
                className="flex items-center gap-3 sm:absolute sm:top-0 sm:flex-col sm:items-start sm:gap-0"
                style={{ left: `${g.at * 100}%` }}
              >
                <span aria-hidden className="h-2.5 w-2.5 shrink-0 border border-signal bg-paper-2 sm:-mt-[5px] sm:-ml-[5px]" />
                <span
                  className={`text-sm text-soft sm:mt-4 sm:whitespace-nowrap ${
                    g.at > 0.8 ? "sm:-translate-x-[85%]" : g.at > 0.2 ? "sm:-translate-x-1/2" : ""
                  }`}
                >
                  {g.label}
                </span>
              </motion.li>
            ))}
          </ul>
          <p className="annot mt-6 text-mute sm:mt-2">Lower to higher price · A rough guide, not a quote</p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-[14px] border border-line bg-line lg:grid-cols-2">
          <Reveal className="h-full bg-paper-2 p-7 sm:p-9">
            <h3 className="font-display text-xl font-semibold tracking-tight">What moves the price</h3>
            <ul className="mt-5 space-y-3">
              {pricing.drivers.map((d, i) => (
                <li key={d} className="flex gap-4 text-soft">
                  <span className="annot pt-1 text-signal">{String(i + 1).padStart(2, "0")}</span>
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="h-full bg-paper-2 p-7 sm:p-9">
            <h3 className="font-display text-xl font-semibold tracking-tight">Always included</h3>
            <ul className="mt-5 space-y-3">
              {pricing.included.map((d) => (
                <li key={d} className="flex items-center gap-3 text-soft">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-signal text-white">
                    <Check className="h-3 w-3" />
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Button href="#contact">Get your fixed quote</Button>
          <a href="#contact" data-assistant className="group inline-flex items-center gap-2 font-medium">
            <span className="link-line">Ask the AI where your project might land</span>
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
