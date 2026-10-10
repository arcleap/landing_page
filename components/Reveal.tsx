"use client";

import { useEffect } from "react";

// Marks `[data-reveal]` elements once they scroll into view. Content stays
// visible without JavaScript; the hidden start state only applies under `.js`.
// SVG (SMIL) motion ignores CSS, so it is paused here for reduced motion.
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll("svg").forEach((svg) => svg.pauseAnimations());
    }

    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return null;
}
