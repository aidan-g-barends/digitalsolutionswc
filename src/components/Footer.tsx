import { ArrowUp, ArrowUpRight } from "lucide-react";
import { navLinks, projects, services, site } from "@/lib/site";
import { LocalTime, Logo } from "./ui";
import Year from "./Year";

export default function Footer() {
  const socials = site.socials.filter((s) => s.href);
  const cols = [
    { title: "Navigate", links: [...navLinks, { label: "Contact", href: "#contact" }] },
    { title: "Services", links: services.map((s) => ({ label: s.short, href: "#services" })) },
    { title: "Work", links: projects.map((p) => ({ label: p.title, href: p.url, external: true })) },
    ...(socials.length ? [{ title: "Follow", links: socials.map((s) => ({ label: s.label, href: s.href, external: true })) }] : []),
  ];

  return (
    <footer className="border-t border-line bg-paper text-ink">
      {/* Last call: one big, direct way to get in touch. */}
      {site.email && (
        <div className="border-b border-line">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <p className="annot text-mute">Prefer email? Write to us directly</p>
            <a
              href={`mailto:${site.email}`}
              className="group mt-6 flex items-end justify-between gap-6 border-b border-line-strong pb-6 transition-colors hover:border-signal"
            >
              <span className="display min-w-0 break-words text-[clamp(1.7rem,5.4vw,5.2rem)] transition-colors duration-500 group-hover:text-signal">
                {site.email}
              </span>
              <ArrowUpRight className="mb-2 h-7 w-7 shrink-0 text-signal transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1 group-hover:translate-x-1 sm:h-10 sm:w-10" />
            </a>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <Logo />
            <p className="mt-5 max-w-xs leading-relaxed text-soft">
              Websites, online stores and web applications for South African businesses. Based in the Western Cape.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <h2 className="annot text-mute">{c.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...("external" in l && l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="link-line text-ink/70 transition-colors hover:text-ink"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="annot mt-16 flex flex-col justify-between gap-4 border-t border-line py-7 text-mute sm:flex-row sm:items-center">
          <p>
            © <Year /> {site.name}
          </p>
          <p>
            Western Cape · <LocalTime /> SAST
          </p>
          <a href="#top" className="group inline-flex items-center gap-2 transition-colors hover:text-ink">
            Back to top
            <ArrowUp className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
