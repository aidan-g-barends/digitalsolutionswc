"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { useStill } from "./ui";

/**
 * Tilts its content in 3D towards the mouse, like holding a card under a light.
 * Only on devices with a real mouse (no effect on touch screens) and never when
 * the visitor has asked for reduced motion. Pure CSS transforms, so it's cheap.
 */
export function Tilt({
  children,
  max = 8,
  className = "",
}: {
  children: React.ReactNode;
  /** Maximum tilt in degrees. */
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useStill();
  const px = useMotionValue(0); // -0.5 (left) to 0.5 (right)
  const py = useMotionValue(0);
  const spring = { stiffness: 150, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (still || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function reset() {
    px.set(0);
    py.set(0);
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={className} style={{ perspective: 1200 }}>
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/**
 * A wireframe cube drawn with CSS 3D (six bordered faces), slowly turning.
 * It's the studio's grid lines, lifted into the third dimension.
 */
function Cube({ size, className = "", duration = 28, reverse = false }: { size: number; className?: string; duration?: number; reverse?: boolean }) {
  const half = size / 2;
  const faces = [
    `rotateY(0deg) translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className}`} style={{ width: size, height: size, perspective: 800 }}>
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          animation: `cube-spin ${duration}s linear infinite ${reverse ? "reverse" : ""}`,
        }}
      >
        {faces.map((t, i) => (
          <span key={i} className="absolute inset-0 border border-signal/40 bg-signal/[0.03]" style={{ transform: t }} />
        ))}
      </div>
    </div>
  );
}

/** A few floating cubes for the hero background. Small, slow, and out of the way of the text. */
export function FloatingShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-[6%] top-[18%] hidden lg:block" style={{ animation: "float-y 9s ease-in-out infinite" }}>
        <Cube size={56} className="relative" duration={26} />
      </div>
      <div className="absolute bottom-[22%] left-[44%] hidden lg:block" style={{ animation: "float-y 11s ease-in-out infinite reverse" }}>
        <Cube size={34} className="relative" duration={20} reverse />
      </div>
      <div className="absolute right-[8%] top-[52%] lg:hidden" style={{ animation: "float-y 10s ease-in-out infinite" }}>
        <Cube size={30} className="relative" duration={24} />
      </div>
    </div>
  );
}
