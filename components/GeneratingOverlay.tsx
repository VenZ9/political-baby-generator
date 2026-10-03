"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Consulting the fictional trait ledger…",
  "Rolling a fair die for hair…",
  "Blending cartoon colours…",
  "Assigning a completely made-up name…",
  "Filing the parody paperwork…",
];

/**
 * Short generation animation. Uses a single interval and CSS transitions —
 * no requestAnimationFrame loop, so it costs almost nothing.
 */
export default function GeneratingOverlay({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 420);
    return () => window.clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <div className="gen-overlay" role="status" aria-live="polite">
      <div className="gen-overlay__inner">
        <div className="gen-spinner" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="gen-overlay__title">Generating Fictional Baby…</p>
        <p className="gen-overlay__step">{STEPS[step]}</p>
        <p className="gen-overlay__note">Fictional parody — not a biological prediction.</p>
      </div>
    </div>
  );
}
