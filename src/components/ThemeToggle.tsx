"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

/** Reads the theme the inline script in layout.tsx already applied. */
function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

// Lets React "subscribe" to the data-theme attribute, so the icon always matches the page.
function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

/**
 * Dark/light switch. Remembers the visitor's choice, follows the device's theme
 * until they pick one, and animates the change as a circle growing out of the button.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  // null on the server (unknown until the browser runs), the real theme in the browser.
  const theme = useSyncExternalStore<Theme | null>(subscribe, currentTheme, () => null);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // No saved choice yet? Keep following the device if it switches (e.g. sunset auto-dark).
    const mq = matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (localStorage.getItem("theme")) return;
      const t: Theme = mq.matches ? "light" : "dark";
      apply(t);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode: the switch still works for this visit */
    }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

    if (!doc.startViewTransition || reduce) {
      // Fallback: let colours cross-fade for a moment.
      document.documentElement.classList.add("theme-fade");
      apply(next);
      setTimeout(() => document.documentElement.classList.remove("theme-fade"), 500);
      return;
    }

    // Circle reveal from the centre of the button to the farthest corner of the screen.
    const r = ref.current!.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = doc.startViewTransition(() => apply(next));
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  }

  const label = theme === "light" ? "Switch to dark mode" : "Switch to light mode";
  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[5px] border border-line-strong text-soft transition-colors hover:text-ink ${className}`}
    >
      {/* Both icons are rendered; the inactive one is rotated away. Avoids a flash before hydration. */}
      <Sun
        aria-hidden
        className={`absolute h-4 w-4 transition-all duration-500 ease-[var(--ease-out-expo)] ${
          theme === "light" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
        }`}
      />
      <Moon
        aria-hidden
        className={`absolute h-4 w-4 transition-all duration-500 ease-[var(--ease-out-expo)] ${
          theme === "light" ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
    </button>
  );
}
