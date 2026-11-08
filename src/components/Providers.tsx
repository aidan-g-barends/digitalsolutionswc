"use client";

import { MotionConfig } from "framer-motion";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Clean URLs: links like href="#contact" still scroll to the section,
  // but the "#contact" part is not added to the address bar.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      // Let ctrl/cmd-click etc. behave normally (open in new tab).
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href")!.slice(1);
      const target = id === "top" ? document.body : document.getElementById(id);
      if (!target) return;
      e.preventDefault(); // stop the browser adding #id to the URL
      if (id === "top") window.scrollTo({ top: 0, behavior: "smooth" });
      else target.scrollIntoView({ behavior: "smooth" });
      // Keyboard and screen-reader users land on the section they jumped to.
      if (id !== "top") {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Makes every Framer Motion animation respect the visitor's "reduce motion" setting.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
