"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/** Wordmark: a small square mark plus the name. Simple, like a printed letterhead. */
export function Logo() {
  return (
    <a href="#top" className="inline-flex items-center gap-2.5" aria-label={`${site.name}, back to top`}>
      <span aria-hidden className={`grid h-7 w-7 place-items-center rounded-[7px] bg-signal text-white`}>
        <span className="font-display text-[13px] font-bold leading-none">D</span>
      </span>
      <span className="font-display text-[15px] font-semibold tracking-tight">
        Digital Solutions <span className="text-signal">WC</span>
      </span>
    </a>
  );
}

/** Small label above a section title, e.g. "Selected work". */
export function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className={`font-mono text-[11px] uppercase tracking-[0.16em] text-mute`}>
      {children}
    </p>
  );
}

/** Fades content up the first time it scrolls into view. */
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A phone with a real screenshot inside. Pure CSS frame (no image of a phone),
 * so it stays sharp at any size and loads instantly.
 */
export function Phone({ src, alt, className = "", priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={`relative rounded-[2.4rem] bg-black p-[7px] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.14)_inset] ${className}`}>
      <div className="relative aspect-[392/864] overflow-hidden rounded-[1.95rem] bg-paper-2">
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 60vw, 300px" className="object-cover object-top" priority={priority} />
        {/* Camera pill, like a real phone. */}
        <span aria-hidden className="absolute left-1/2 top-2 h-[18px] w-[30%] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

/** Live local South African time. A small, real detail that shows there's a person behind the site. */
export function LocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time || "--:--"}</span>;
}
