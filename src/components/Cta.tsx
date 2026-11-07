"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { MagneticLink } from "./ui";

export default function Cta() {
  const ref = useRef<HTMLElement>(null);
  // The glow grows as the section scrolls into view, so the moment builds up.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.5, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 0.55]);

  return (
    <section ref={ref} className="relative overflow-hidden border-t border-line py-32 sm:py-44">
      <motion.div
        aria-hidden
        style={{ scale, opacity }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#4f6dff_0%,rgba(79,109,255,0.25)_40%,transparent_70%)] blur-3xl"
      />
      <div className="blueprint pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">Have an idea? Let&apos;s talk.</p>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="display mx-auto mt-8 max-w-6xl text-[clamp(2.75rem,8vw,8.5rem)]"
        >
          Let&apos;s build something that sets your business{" "}
          <span className="font-serif font-normal normal-case italic text-volt" style={{ fontStretch: "100%" }}>
            apart.
          </span>
        </motion.h2>
        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-mute">
          Whether you need a professional website, an online store or a custom digital solution, let&apos;s turn your idea into
          something exceptional.
        </p>
        <div className="mt-12 flex justify-center">
          <MagneticLink href="#contact" className="px-9 py-5 text-base">
            Start Your Project
            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </MagneticLink>
        </div>
      </div>
    </section>
  );
}
