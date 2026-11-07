"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import { site } from "@/lib/site";

/** Logo mark: a bracket "D" with a signal dot, drawn in SVG so it's razor sharp. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="#top" className={`group inline-flex items-center gap-3 ${className}`} aria-label={`${site.name}, back to top`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect x="0.5" y="0.5" width="31" height="31" rx="8" className="fill-ink-3 stroke-line" />
        <path d="M10 9h6.5a7 7 0 0 1 0 14H10z" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-bone" />
        <circle cx="16.5" cy="16" r="2.4" className="fill-volt transition-transform duration-500 group-hover:scale-125" style={{ transformOrigin: "16.5px 16px" }} />
      </svg>
      <span className="font-display text-[15px] font-semibold tracking-tight text-bone">
        Digital Solutions <span className="text-volt">WC</span>
      </span>
    </a>
  );
}

/** Small mono label like "(01) Services" that sits above section titles. */
export function Eyebrow({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
      <span className="text-volt">({index})</span>
      <span className="h-px w-8 bg-line" aria-hidden />
      {children}
    </p>
  );
}

/** Fades and lifts content in the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A link that gently follows the cursor ("magnetic" button).
 * Springs smooth the movement so it feels physical, not jumpy.
 */
export function MagneticLink({
  href,
  children,
  variant = "primary",
  className = "",
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

  function onMove(e: React.PointerEvent<HTMLAnchorElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    // Move 25% of the distance between the cursor and the button's centre.
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  const styles =
    variant === "primary"
      ? "bg-volt text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_10px_40px_-10px_rgba(79,109,255,0.8)] hover:bg-[#6280ff]"
      : "border border-line text-bone hover:border-white/25 hover:bg-white/[0.04]";

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium transition-colors duration-300 ${styles} ${className}`}
      {...(rest as object)}
    >
      {children}
    </motion.a>
  );
}
