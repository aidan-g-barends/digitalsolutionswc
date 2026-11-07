"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { services, site } from "@/lib/site";
import SignalField from "./SignalField";
import { MagneticLink } from "./ui";

const ease = [0.16, 1, 0.3, 1] as const;

// Each item is one word of the headline. "serif" words get the italic accent treatment.
const headline: { text: string; serif?: boolean }[] = [
  { text: "We" },
  { text: "build" },
  { text: "digital" },
  { text: "experiences" },
  { text: "that" },
  { text: "move", serif: true },
  { text: "businesses" },
  { text: "forward." },
];

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden pt-28">
      {/* Background layers: dot field, faded at the edges, plus a soft blue glow. */}
      <SignalField className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_80%_70%_at_60%_40%,black,transparent)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/3 h-[38rem] w-[38rem] rounded-full bg-volt/20 blur-[140px]"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-mute"
        >
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-[#5fd08c]" aria-hidden />
          Web studio · {site.location}
        </motion.p>

        {/* Each word slides up from behind a mask, one after another. */}
        <h1 className="display max-w-[17ch] text-[clamp(3rem,8.6vw,8.75rem)]">
          {headline.map((w, i) => (
            <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-[0.06em] align-bottom last:mr-0">
              <motion.span
                className={`inline-block ${
                  w.serif ? "font-serif text-[1.08em] font-normal normal-case italic tracking-[-0.02em] text-volt" : ""
                }`}
                style={w.serif ? { fontStretch: "100%" } : undefined}
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, delay: 0.3 + i * 0.07, ease }}
              >
                {w.text}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease }}
            className="max-w-xl text-lg leading-relaxed text-mute sm:text-xl lg:col-span-6"
          >
            We design and develop high-performance websites, web applications and digital solutions that help
            businesses <span className="text-bone">stand out</span>, <span className="text-bone">connect with customers</span>{" "}
            and <span className="text-bone">grow online</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.15, ease }}
            className="flex flex-wrap gap-3 lg:col-span-6 lg:justify-end"
          >
            <MagneticLink href="#contact">
              Let&apos;s Build Something
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </MagneticLink>
            <MagneticLink href="#work" variant="ghost">
              Explore Our Work
              <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </MagneticLink>
          </motion.div>
        </div>
      </div>

      {/* Endless strip of services along the bottom of the hero. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="relative mt-12 border-y border-line bg-ink/60 py-5 backdrop-blur-sm"
      >
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap hover:[animation-play-state:paused]">
          {[...services, ...services, ...services, ...services].map((s, i) => (
            <span key={i} className="flex items-center gap-12 font-display text-lg text-mute" aria-hidden={i >= services.length}>
              {s.title}
              <span className="text-volt" aria-hidden>
                ✦
              </span>
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
