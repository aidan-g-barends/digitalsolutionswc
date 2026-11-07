import { stack, steps } from "@/lib/site";
import { Label, Reveal } from "./ui";

/** How a project runs, in four plain steps, plus the tools we use. */
export default function Process() {
  const tools = stack.flatMap((g) => g.items);

  return (
    <section id="process" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Label>How it works</Label>
          <h2 className="headline mt-5 text-[clamp(2.4rem,5.5vw,4.5rem)]">From first chat to launch day.</h2>
        </Reveal>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="bg-paper p-6 sm:p-8">
              <Reveal delay={i * 0.08}>
                <span className="font-display text-5xl font-semibold tracking-tight text-signal sm:text-6xl">{i + 1}</span>
                <h3 className="mt-4 font-display text-2xl sm:mt-10 font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-soft">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-14 grid grid-cols-1 gap-4 border-t border-line pt-8 md:grid-cols-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute md:col-span-3">Built with</p>
          <p className="min-w-0 font-display text-xl font-medium leading-relaxed tracking-tight md:col-span-9">
            {tools.map((t, i) => (
              <span key={t} className="inline-block">
                {t}
                {i < tools.length - 1 && <span className="mx-2 text-mute">·</span>}
              </span>
            ))}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
