import { reasons, site } from "@/lib/site";
import { Label, Reveal } from "./ui";

/** Who's behind the studio, and what working together is like. */
export default function About() {
  return (
    <section id="about" className="bg-paper-2 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <Label>Why work with us</Label>
          <h2 className="headline mt-5 text-[clamp(2.4rem,5vw,4rem)]">You talk to the person building your site.</h2>
          <div className="mt-8 space-y-4 text-lg leading-relaxed text-soft">
            <p>
              {site.name} is run by {site.founder}, a software developer based in Langebaan on the West Coast.
            </p>
            <p>
              No account managers and no hand-offs. The person you brief is the person who designs, builds and launches
              your project, and the one who answers when you need a change.
            </p>
          </div>
          <a href="#contact" className="link-line mt-8 inline-block font-medium">
            Have an idea? Let&apos;s talk.
          </a>
        </Reveal>

        <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
          {reasons.map((r, i) => (
            <li key={r.title} className="border-t border-line py-7">
              <Reveal delay={(i % 2) * 0.06}>
                <h3 className="font-display text-xl font-semibold tracking-tight">{r.title}</h3>
                <p className="mt-2 leading-relaxed text-soft">{r.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
