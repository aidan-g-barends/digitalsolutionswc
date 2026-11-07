"use client";

import { reasons } from "@/lib/site";
import { Eyebrow, Reveal } from "./ui";

export default function WhyUs() {
  // Spotlight: store the cursor position on the hovered cell as CSS variables,
  // and a radial gradient in that cell's background follows it.
  function onMove(e: React.PointerEvent<HTMLLIElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  }

  return (
    <section id="why" className="relative border-t border-line py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-16 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Eyebrow index="03">Why choose us</Eyebrow>
            <h2 className="display mt-6 text-[clamp(2.5rem,6vw,5.5rem)]">
              Built around <span className="font-serif font-normal normal-case italic text-volt" style={{ fontStretch: "100%" }}>your</span> business
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="self-end lg:col-span-4 lg:col-start-9">
            <p className="text-lg leading-relaxed text-mute">
              A website is an investment. Here&apos;s what you get when you build it with us.
            </p>
          </Reveal>
        </div>

        {/* Hairline grid: the 1px gaps show the background colour, drawing the lines. */}
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <li
              key={r.title}
              onPointerMove={onMove}
              className="group relative bg-ink p-8 transition-colors duration-500 [background-image:radial-gradient(420px_circle_at_var(--x,-999px)_var(--y,-999px),rgba(79,109,255,0.13),transparent_45%)] sm:p-10"
            >
              <Reveal delay={(i % 3) * 0.08}>
                <span className="font-mono text-xs text-volt">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-10 font-display text-2xl font-semibold tracking-tight">{r.title}</h3>
                <p className="mt-3 leading-relaxed text-mute">{r.body}</p>
              </Reveal>
              <span
                aria-hidden
                className="absolute left-0 top-0 h-px w-0 bg-volt transition-all duration-700 group-hover:w-full"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
