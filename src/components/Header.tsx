"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/site";
import { Logo } from "./ui";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  // Scroll spy: works out which section is in the middle of the screen,
  // so the matching nav link can be underlined.
  useEffect(() => {
    const ids = [...navLinks.map((l) => l.href.slice(1)), "contact"];
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
    // Back at the very top (hero), nothing is underlined.
    const onTop = () => window.scrollY < 200 && setActive("");
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, []);

  // Add a border and background once the page scrolls, so the bar stays readable.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        scrolled || open ? "border-b border-line bg-paper/90 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-8 text-[15px] text-soft">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  aria-current={active === l.href.slice(1) ? "location" : undefined}
                  className={`link-line py-1 transition-colors hover:text-ink ${active === l.href.slice(1) ? "link-line-on text-ink" : ""}`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal hover:text-white sm:px-5"
          >
            <span className="sm:hidden">Let&apos;s talk</span>
            <span className="hidden sm:inline">Start a project</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-full border border-line md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden md:hidden"
          >
            <ul className="space-y-1 px-5 pb-6 pt-2">
              {[...navLinks, { label: "Contact", href: "#contact" }].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={active === l.href.slice(1) ? "location" : undefined}
                    className={`headline block py-2 text-4xl ${active === l.href.slice(1) ? "text-signal" : ""}`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
