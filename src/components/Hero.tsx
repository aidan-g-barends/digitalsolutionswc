"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { projects } from "@/lib/site";
import { LocalTime, Phone } from "./ui";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  // The two phones drift apart slightly as you scroll, giving a bit of depth.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const backY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const frontY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const [ivy, jjs] = projects;

  return (
    <section id="top" ref={ref} className="relative overflow-hidden pt-24 sm:pt-32">
      {/* One soft electric-blue glow behind the phones. */}
      <div aria-hidden className="pointer-events-none absolute -right-24 top-[22rem] h-[22rem] w-[22rem] rounded-full bg-signal/25 blur-[100px] lg:-right-32 lg:top-24 lg:h-[36rem] lg:w-[36rem] lg:blur-[130px]" />
      {/* Mobile order: headline, then the phones, then text + buttons, so real work shows on the first screen.
          Desktop: text on the left, phones on the right (grid rows/columns below). */}
      <div className="relative z-10 mx-auto grid max-w-7xl gap-y-10 px-5 pb-16 sm:px-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0 lg:pb-28">
        <div className="lg:col-span-7 lg:row-start-1 lg:pt-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-mute"
          >
            <span className="inline-flex items-center gap-2 text-ink">
              <span className="h-2 w-2 rounded-full bg-[#2f9e5b]" aria-hidden />
              Taking on new projects
            </span>
            <span aria-hidden>/</span>
            <span>
              Western Cape, <LocalTime />
            </span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease }}
            className="headline mt-6 max-w-[13ch] text-[clamp(2.6rem,6.4vw,5.6rem)] lg:mt-7"
          >
            Websites that make your business look as good as it{" "}
            <span className="relative whitespace-nowrap">
              really is
              {/* Hand-drawn style underline, drawn in after the headline appears. */}
              <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-[0.22em] w-full text-signal">
                <motion.path
                  d="M3 14 C 70 4, 150 4, 297 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: 0.9, ease }}
                />
              </svg>
            </span>
            .
          </motion.h1>
        </div>

        <div className="order-3 lg:order-none lg:col-span-7 lg:row-start-2">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease }}
            className="max-w-xl text-lg leading-relaxed text-soft sm:text-xl lg:mt-8"
          >
            We design and develop high-performance websites, online stores and web applications for South African businesses
            that want to stand out, connect with customers and grow online.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease }}
            className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4 lg:mt-10"
          >
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full bg-signal px-7 py-4 font-medium text-white shadow-[0_10px_40px_-12px_rgba(79,109,255,0.8)] transition-colors hover:bg-[#6280ff]"
            >
              Let&apos;s Build Something
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a href="#work" className="group inline-flex items-center gap-2 font-medium">
              <span className="link-line">Explore Our Work</span>
              <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
          </motion.div>
        </div>

        {/* Real work, straight away: the two live sites on phones. */}
        <div className="relative order-2 mx-auto h-[23rem] w-full max-w-[20rem] sm:h-[34rem] sm:max-w-[26rem] lg:order-none lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:ml-auto lg:h-[40rem] lg:self-center">
          <motion.a
            href={jjs.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${jjs.title} (${jjs.domain})`}
            style={{ y: backY }}
            initial={{ opacity: 0, x: 40, rotate: 10 }}
            animate={{ opacity: 1, x: 0, rotate: 6 }}
            transition={{ duration: 1.1, delay: 0.4, ease }}
            className="absolute right-0 top-0 w-[56%]"
          >
            <Phone src={jjs.screens[0].src} alt={jjs.screens[0].alt} priority />
            <Tag className="-top-3 right-4">{jjs.domain}</Tag>
          </motion.a>
          <motion.a
            href={ivy.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${ivy.title} (${ivy.domain})`}
            style={{ y: frontY }}
            initial={{ opacity: 0, y: 60, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ duration: 1.1, delay: 0.55, ease }}
            className="absolute bottom-0 left-0 w-[58%] sm:bottom-4"
          >
            <Phone src={ivy.screens[0].src} alt={ivy.screens[0].alt} priority />
            <Tag className="-right-8 top-20">{ivy.domain}</Tag>
          </motion.a>
        </div>
      </div>

      {/* Plain-language summary strip. */}
      <div className="border-y border-line">
        <dl className="mx-auto grid max-w-7xl gap-px px-5 sm:grid-cols-3 sm:px-8">
          {[
            ["What we build", "Websites, online stores & web apps"],
            ["Where", "Western Cape, working with clients across South Africa"],
            ["Who you deal with", "The developer building your project. Directly."],
          ].map(([k, v]) => (
            <div key={k} className="py-6 sm:pr-8">
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">{k}</dt>
              <dd className="mt-2 font-display text-lg font-medium tracking-tight">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Little label stuck onto a phone, showing the site's real domain. */
function Tag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`absolute z-10 whitespace-nowrap rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-[11px] text-ink shadow-sm ${className}`}
    >
      {children} ↗
    </span>
  );
}
