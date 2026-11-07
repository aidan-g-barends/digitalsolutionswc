import { navLinks, projects, services, site } from "@/lib/site";
import { Logo } from "./ui";
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
    <footer className="border-t border-line-dark bg-paper-2 text-ink">
      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <Logo />
            <p className="mt-5 max-w-xs leading-relaxed text-ink/55">
              Websites, online stores and web applications for South African businesses. Based in Langebaan, Western Cape.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/40">{c.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...("external" in l && l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-ink/70 transition-colors hover:text-ink"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-line-dark py-7 text-sm text-ink/45 sm:flex-row">
          <p>
            © <Year /> {site.name}
          </p>
          {site.email && (
            <a href={`mailto:${site.email}`} className="transition-colors hover:text-ink">
              {site.email}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
