import { services } from "@/lib/site";
import { Label, Reveal } from "./ui";

/** Services as a clean, numbered index. Readable first, decorative never. */
export default function Services() {
  return (
    <section id="services" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Label>Services</Label>
            <h2 className="headline mt-5 text-[clamp(2.4rem,5.5vw,4.5rem)]">What we can build for you.</h2>
          </Reveal>
          <Reveal delay={0.1} className="self-end lg:col-span-5 lg:col-start-8">
            <p className="text-lg leading-relaxed text-soft">
              From your first professional website to custom software that runs part of your business. If it lives in a
              browser, we can build it.
            </p>
          </Reveal>
        </div>

        <ol className="mt-16 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <li key={s.title} className="group border-t border-line py-8">
              <Reveal delay={(i % 3) * 0.06}>
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-signal">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{s.title}</h3>
                </div>
                <p className="mt-4 leading-relaxed text-soft">{s.description}</p>
                <p className="mt-5 text-sm">
                  <span className="text-mute">Good for: </span>
                  {s.goodFor}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
