"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { reasons, site } from "@/lib/site";
import { Label, Reveal, SplitHeading, useStill } from "./ui";

const STATEMENT =
  "No account managers and no hand-offs. The person you brief is the person who designs, builds and launches your project, and the one who answers when you need a change.";

/** Who's behind the studio, and what working together is like. */
export default function About() {
  return (
    <section id="about" className="border-y border-line bg-paper-2 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Label index="05">Why work with us</Label>
            <SplitHeading text="You talk to the person building your site." className="display mt-6 text-[clamp(2.2rem,3.6vw,3.2rem)]" />
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-sm leading-relaxed text-soft">
                {site.name} is an independent web studio in the Western Cape, working with businesses across South Africa.
              </p>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <ScrollStatement text={STATEMENT} />
            <Reveal>
              <a href="#contact" className="group mt-10 inline-flex items-center gap-2 font-medium">
                <span className="link-line">Have an idea? Let&apos;s talk</span>
                <span aria-hidden className="text-signal transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </Reveal>
          </div>
        </div>

        {/* Reasons as a ruled list: title on the left, the detail on the right. */}
        <ul className="mt-20 border-t border-line-strong sm:mt-28">
          {reasons.map((r, i) => (
            <li key={r.title} className="group border-b border-line">
              <Reveal className="grid gap-2 py-6 sm:grid-cols-12 sm:gap-8 sm:py-7">
                <span className="font-mono text-xs text-mute transition-colors group-hover:text-signal sm:col-span-1 sm:pt-1.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl font-semibold tracking-tight sm:col-span-5 lg:col-span-4">{r.title}</h3>
                <p className="leading-relaxed text-soft sm:col-span-6 lg:col-span-5 lg:col-start-7">{r.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** A large statement whose words brighten as it scrolls through the screen, at reading pace. */
function ScrollStatement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const still = useStill();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className="display text-[clamp(1.9rem,4.2vw,3.9rem)] !leading-[1.04]">
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} still={still}>
            {w}
          </Word>
        ))}
      </span>
    </p>
  );
}

function Word({ children, progress, range, still }: { children: string; progress: MotionValue<number>; range: [number, number]; still: boolean }) {
  const opacity = useTransform(progress, range, still ? [1, 1] : [0.16, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}
