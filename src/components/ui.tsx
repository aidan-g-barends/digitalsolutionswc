"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

export const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Wordmark. The blue bar is a text caret: the studio's mark is the cursor you
 * see when you're about to build something. It blinks only when you hover the logo.
 */
export function Logo() {
  return (
    <a href="#top" className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap" aria-label={`${site.name}, back to top`}>
      <span className="display text-[1.2rem] leading-none tracking-[-0.01em] sm:text-[1.35rem]">Digital Solutions</span>
      <span className="annot mt-[3px] text-[10px] tracking-[0.18em] text-soft">WC</span>
      <span aria-hidden className="mt-[1px] h-[1.15rem] w-[7px] bg-signal group-hover:animate-caret" />
    </a>
  );
}

/** Section label: "01 — Selected work", with the index in the accent colour. */
export function Label({ index, children }: { index?: string; children: React.ReactNode }) {
  return (
    <p className="annot flex items-center gap-3 text-mute">
      {index && <span className="text-signal">{index}</span>}
      {index && <span aria-hidden className="h-px w-6 bg-line-strong" />}
      <span>{children}</span>
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
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Heading whose words rise out of a mask, one after another, when it scrolls into view.
 * Screen readers get the plain sentence; the animated words are hidden from them.
 */
export function SplitHeading({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  accent,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
  /** Words (exact match) to colour with the accent. */
  accent?: string[];
}) {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ staggerChildren: 0.045, delayChildren: delay }}
        className="block"
      >
        {words.map((w, i) => (
          <span key={i} className="mask">
            <motion.span
              className={`inline-block ${accent?.includes(w) ? "text-signal" : ""}`}
              variants={{ hidden: { y: "105%" }, show: { y: "0%" } }}
              transition={{ duration: 0.9, ease }}
            >
              {w}
            </motion.span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

/**
 * Primary call-to-action. A label that rolls on hover, plus an arrow in its own
 * square cell, so the action reads as a precise, engineered control rather than a pill.
 */
export function Button({
  href,
  children,
  className = "",
  size = "md",
  onClick,
}: {
  href: string;
  children: string;
  className?: string;
  size?: "sm" | "md";
  onClick?: () => void;
}) {
  const pad = size === "sm" ? "h-10 pl-4 pr-3 text-sm" : "h-14 pl-6 pr-5 text-[15px]";
  const cell = size === "sm" ? "w-10" : "w-14";
  return (
    <a href={href} onClick={onClick} className={`group inline-flex items-stretch rounded-[5px] font-medium text-white ${className}`}>
      <span className={`flex items-center rounded-l-[5px] bg-signal transition-colors duration-300 group-hover:bg-signal-hi ${pad}`}>
        <span className="roll">
          <span>{children}</span>
          <span aria-hidden>{children}</span>
        </span>
      </span>
      <span
        aria-hidden
        className={`grid place-items-center rounded-r-[5px] border-l border-white/20 bg-signal transition-colors duration-300 group-hover:bg-signal-hi ${cell}`}
      >
        <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-rotate-45" />
      </span>
    </a>
  );
}

/**
 * A phone with a real screenshot inside. Pure CSS frame (no image of a phone),
 * so it stays sharp at any size and loads instantly.
 */
export function Phone({
  src,
  alt,
  className = "",
  preload = false,
  sizes = "(max-width: 768px) 60vw, 300px",
}: {
  src: string;
  alt: string;
  className?: string;
  preload?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`relative rounded-[2.4rem] bg-black p-[7px] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.14)_inset] ${className}`}>
      <div className="relative aspect-[392/864] overflow-hidden rounded-[1.95rem] bg-paper-2">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" preload={preload} />
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

/** True when scroll-linked effects (parallax etc.) should be switched off. */
export function useStill() {
  return useReducedMotion() ?? false;
}
