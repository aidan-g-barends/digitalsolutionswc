"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/lib/site";
import { Button, LocalTime, Logo, ease } from "./ui";
import ThemeToggle from "./ThemeToggle";

const allLinks = [...navLinks, { label: "Contact", href: "#contact" }];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  // Reading progress: a hairline under the bar that fills as you move down the page.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  // Scroll spy: works out which section is in the middle of the screen,
  // so the matching nav link can be marked.
  useEffect(() => {
    const ids = allLinks.map((l) => l.href.slice(1));
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      // Only the band in the middle of the viewport counts as "current".
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((el) => io.observe(el));
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      // Back at the very top (hero), nothing is marked.
      if (window.scrollY < 200) setActive("");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Lock scrolling and close on Escape while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ${
        scrolled && !open ? "border-b border-line bg-paper/85 backdrop-blur-md" : "border-b border-transparent"
      } ${open ? "bg-paper" : ""}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 text-[14px] text-soft">
            {navLinks.map((l, i) => {
              const on = active === l.href.slice(1);
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    aria-current={on ? "location" : undefined}
                    className={`group flex items-baseline gap-1.5 px-3 py-2 transition-colors hover:text-ink ${on ? "text-ink" : ""}`}
                  >
                    <span className={`font-mono text-[10px] transition-colors ${on ? "text-signal" : "text-mute group-hover:text-signal"}`}>
                      0{i + 1}
                    </span>
                    <span className={`link-line ${on ? "link-line-on" : ""}`}>{l.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className={`grid h-10 place-items-center whitespace-nowrap rounded-[5px] bg-signal px-3.5 text-sm font-medium text-white transition-opacity sm:hidden ${open ? "pointer-events-none opacity-0" : ""}`}
          >
            Let&apos;s talk
          </a>
          <span className="hidden sm:block">
            <Button href="#contact" size="sm" onClick={() => setOpen(false)}>
              Start a project
            </Button>
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative grid h-10 w-10 place-items-center rounded-[5px] border border-line-strong md:hidden"
          >
            {/* Two lines that rotate into a cross. */}
            <span aria-hidden className={`absolute h-px w-4 bg-ink transition-transform duration-500 ease-[var(--ease-out-expo)] ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
            <span aria-hidden className={`absolute h-px w-4 bg-ink transition-transform duration-500 ease-[var(--ease-out-expo)] ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
          </button>
        </div>
      </div>

      <motion.div aria-hidden style={{ scaleX: progress }} className="absolute inset-x-0 bottom-[-1px] h-px origin-left bg-signal" />

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease }}
            className="fixed inset-x-0 bottom-0 top-16 flex flex-col justify-between bg-paper px-5 pb-8 pt-6 md:hidden"
          >
            <ul className="border-t border-line">
              {allLinks.map((l, i) => {
                const on = active === l.href.slice(1);
                return (
                  <li key={l.href} className="border-b border-line">
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={on ? "location" : undefined}
                      className="flex items-baseline justify-between py-4"
                    >
                      <span className="mask">
                        <motion.span
                          className={`display inline-block text-[2.75rem] ${on ? "text-signal" : ""}`}
                          initial={{ y: "105%" }}
                          animate={{ y: "0%" }}
                          transition={{ duration: 0.8, delay: 0.15 + i * 0.05, ease }}
                        >
                          {l.label}
                        </motion.span>
                      </span>
                      <span className="font-mono text-xs text-mute">0{i + 1}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="space-y-5"
            >
              <Button href="#contact" onClick={() => setOpen(false)} className="w-full [&>span:first-child]:flex-1">
                Start a project
              </Button>
              <div className="annot flex justify-between text-mute">
                <span>Western Cape · <LocalTime /></span>
                {site.email && (
                  <a href={`mailto:${site.email}`} className="normal-case tracking-normal text-soft">
                    Email us
                  </a>
                )}
              </div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
