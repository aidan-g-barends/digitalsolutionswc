import { stack } from "@/lib/site";
import { Eyebrow, Reveal } from "./ui";

/** Technology shown as a typographic index grouped by layer, not a wall of logos. */
export default function Stack() {
  const all = stack.flatMap((g) => g.items);

  return (
    <section id="stack" className="relative overflow-hidden border-t border-line py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow index="05">Technology</Eyebrow>
            <h2 className="display mt-6 text-[clamp(2.5rem,6vw,5.5rem)]">
              Modern tools.
              <br />
              <span className="text-mute">Solid builds.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-mute">
              The same technologies used by leading product teams, chosen to keep your site fast, secure and easy to grow.
            </p>
          </Reveal>

          <dl className="border-t border-line lg:col-span-7">
            {stack.map((g, i) => (
              <Reveal key={g.group} delay={i * 0.06}>
                <div className="grid gap-3 border-b border-line py-6 sm:grid-cols-[9rem_1fr] sm:gap-8">
                  <dt className="pt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-volt">{g.group}</dt>
                  <dd className="flex flex-wrap gap-x-1 gap-y-2">
                    {g.items.map((t, j) => (
                      <span key={t} className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
                        <span className="cursor-default transition-colors duration-300 hover:text-volt">{t}</span>
                        {j < g.items.length - 1 && <span className="mx-2 text-dim">/</span>}
                      </span>
                    ))}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>

      {/* Huge hollow marquee of the stack, purely decorative. */}
      <div className="mt-24 select-none" aria-hidden>
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap [animation-duration:60s]">
          {[...all, ...all].map((t, i) => (
            <span key={i} className="outline-text display text-[clamp(4rem,10vw,9rem)]">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
