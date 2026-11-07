import { navLinks, projects, services, site } from "@/lib/site";
import { Logo } from "./ui";
import Year from "./Year";

export default function Footer() {
  const socials = site.socials.filter((s) => s.href);

  return (
    <footer className="relative overflow-hidden border-t border-line pt-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-12 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-4">
            <Logo />
            <p className="mt-6 max-w-xs leading-relaxed text-mute">
              Websites, online stores and web applications for South African businesses that want to look the part and grow
              online.
            </p>
            {site.email && (
              <a href={`mailto:${site.email}`} className="mt-6 inline-block text-bone underline decoration-line underline-offset-4 transition-colors hover:decoration-volt">
                {site.email}
              </a>
            )}
            {site.phone && <p className="mt-2 text-mute">{site.phone}</p>}
          </div>

          <FooterCol title="Navigate" links={navLinks} />
          <FooterCol title="Services" links={services.map((s) => ({ label: s.short, href: "#services" }))} />
          <FooterCol
            title="Work"
            links={projects.map((p) => ({ label: p.title, href: p.url, external: true }))}
          />
          {socials.length > 0 && (
            <FooterCol title="Follow" links={socials.map((s) => ({ label: s.label, href: s.href, external: true }))} />
          )}
        </div>

        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-line py-8 text-sm text-dim sm:flex-row">
          <p>
            © <Year /> {site.name}. All rights reserved.
          </p>
          <p>Designed &amp; built in-house · {site.location}</p>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge. */}
      <p aria-hidden className="outline-text display -mb-[0.18em] select-none whitespace-nowrap text-center text-[15vw] leading-none">
        Digital Solutions
      </p>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div className="lg:col-span-2">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">{title}</h2>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-mute transition-colors hover:text-bone"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
