"use client";

/**
 * The 🧬 divider between the two person cards, with animated DNA particles
 * that visually "connect" the two people. Pure CSS/SVG — no canvas, no
 * per-frame JS, so it stays cheap on low-end phones.
 */
export default function DnaDivider({ active }: { active: boolean }) {
  return (
    <div className={`dna ${active ? "is-active" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 60 200" className="dna__svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="dnaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0483a" />
            <stop offset="50%" stopColor="#ff8a3d" />
            <stop offset="100%" stopColor="#e0483a" />
          </linearGradient>
        </defs>
        <path
          d="M18 0 C42 40, 42 60, 18 100 C-6 140, -6 160, 18 200"
          fill="none"
          stroke="url(#dnaGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M42 0 C18 40, 18 60, 42 100 C66 140, 66 160, 42 200"
          fill="none"
          stroke="url(#dnaGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />
        {[20, 50, 80, 110, 140, 170].map((y, i) => (
          <line
            key={y}
            x1={i % 2 === 0 ? 22 : 38}
            y1={y}
            x2={i % 2 === 0 ? 38 : 22}
            y2={y + 10}
            stroke="#ff8a3d"
            strokeWidth="2"
            opacity="0.5"
          />
        ))}
      </svg>
      <span className="dna__badge">🧬</span>
    </div>
  );
}
