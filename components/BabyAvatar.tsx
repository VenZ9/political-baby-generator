"use client";

import { CARTOON_TONES, EYE_COLOR_HEX, HAIR_COLOR_HEX } from "@/data/traits";
import type { VisualTraits } from "@/types";

/**
 * Local, dependency-free cartoon baby renderer.
 *
 * Pure SVG built from reusable facial components. Deterministic: the same
 * traits + seed always produce the same baby. No external image API, no
 * network, no assets to load.
 *
 * The output is intentionally, obviously STYLIZED and CARTOON-LIKE. It is a
 * fictional parody avatar — never a photorealistic depiction of a child.
 */

interface Props {
  traits: VisualTraits;
  seed: number;
  tone: (typeof CARTOON_TONES)[number];
  size?: number;
  className?: string;
  /** Rendered inside the downloadable card — disables the outer frame. */
  bare?: boolean;
}

/** Face geometry per shape. */
function faceGeometry(shape: VisualTraits["faceShape"]) {
  switch (shape) {
    case "round":
      return { rx: 62, ry: 58, cy: 108 };
    case "oval":
      return { rx: 54, ry: 66, cy: 108 };
    case "square":
      return { rx: 60, ry: 56, cy: 110 };
    case "heart":
      return { rx: 58, ry: 60, cy: 106 };
    case "long":
      return { rx: 50, ry: 70, cy: 110 };
  }
}

function Hair({ style, color }: { style: VisualTraits["hairStyle"]; color: string }) {
  const dark = "rgba(0,0,0,0.18)";
  switch (style) {
    case "bald":
      return (
        <g>
          <ellipse cx="100" cy="62" rx="46" ry="20" fill={color} opacity="0.25" />
        </g>
      );
    case "tuft":
      return (
        <g>
          <path d="M100 40c-6-16 4-26 14-30-2 12 2 20 8 24-8 2-16 4-22 6z" fill={color} />
          <path d="M100 40c-6-16 4-26 14-30-2 12 2 20 8 24-8 2-16 4-22 6z" fill={dark} opacity="0.35" />
        </g>
      );
    case "curly":
      return (
        <g fill={color}>
          {[
            [62, 62],
            [78, 48],
            [100, 42],
            [122, 48],
            [138, 62],
            [70, 78],
            [130, 78],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={i === 2 ? 20 : 16} />
          ))}
        </g>
      );
    case "sidepart":
      return (
        <g>
          <path d="M40 96c0-34 26-56 60-56s60 22 60 56c0-8-6-14-14-16-10-3-22-2-34 2-14 5-30 6-44 2-14-4-24 2-28 12z" fill={color} />
          <path d="M96 44c14-6 30-6 44 0-12 4-30 6-44 0z" fill={dark} opacity="0.4" />
        </g>
      );
    case "spiky":
      return (
        <g fill={color}>
          <path d="M46 92c0-30 24-50 54-50s54 20 54 50c-6-10-14-16-22-18l-6-18-10 16-12-20-10 20-12-16-8 18c-10 2-20 8-28 18z" />
        </g>
      );
    case "bob":
      return (
        <g>
          <path d="M38 104c0-38 28-62 62-62s62 24 62 62v22c0 6-6 10-12 8-4-14-6-30-6-44-14 8-30 12-44 12s-30-4-44-12c0 14-2 30-6 44-6 2-12-2-12-8z" fill={color} />
        </g>
      );
    case "pigtails":
      return (
        <g fill={color}>
          <circle cx="40" cy="96" r="20" />
          <circle cx="160" cy="96" r="20" />
          <path d="M44 92c0-32 26-52 56-52s56 20 56 52c-8-12-20-18-34-20-8 6-16 8-22 8s-14-2-22-8c-14 2-26 8-34 20z" />
        </g>
      );
    case "buzz":
      return (
        <g>
          <path d="M44 96c0-32 26-54 56-54s56 22 56 54c-10-14-30-22-56-22s-46 8-56 22z" fill={color} opacity="0.85" />
        </g>
      );
    case "mop":
      return (
        <g>
          <path d="M36 100c0-38 30-62 64-62s64 24 64 62c-4 10-12 14-20 10 2-16-2-30-10-40-12 10-30 16-46 16s-30-4-40-12c-6 10-8 24-6 36-8 4-16 0-6-10z" fill={color} />
        </g>
      );
  }
}

function Eyebrows({ style, color }: { style: VisualTraits["eyebrowStyle"]; color: string }) {
  const stroke = { stroke: color, strokeWidth: 5, strokeLinecap: "round" as const, fill: "none" };
  switch (style) {
    case "soft":
      return (
        <g {...stroke} opacity="0.85">
          <path d="M70 88q10-6 20-2" />
          <path d="M110 86q10-4 20 2" />
        </g>
      );
    case "arched":
      return (
        <g {...stroke}>
          <path d="M68 90q12-12 24-4" />
          <path d="M108 86q12-8 24 4" />
        </g>
      );
    case "straight":
      return (
        <g {...stroke}>
          <path d="M68 88h22" />
          <path d="M110 88h22" />
        </g>
      );
    case "bushy":
      return (
        <g {...stroke} strokeWidth={9} opacity="0.9">
          <path d="M66 88q12-6 24-2" />
          <path d="M110 86q12-4 24 2" />
        </g>
      );
    case "worried":
      return (
        <g {...stroke}>
          <path d="M68 84q12 6 24 6" />
          <path d="M108 90q12 0 24-6" />
        </g>
      );
    case "bold":
      return (
        <g {...stroke} strokeWidth={8}>
          <path d="M66 90q13-10 26-4" />
          <path d="M108 86q13-6 26 4" />
        </g>
      );
  }
}

function Eyes({ color, expression }: { color: string; expression: VisualTraits["expression"] }) {
  const closed = expression === "sleepy" || expression === "giggly";
  const wide = expression === "surprised";
  const r = wide ? 11 : 9;
  return (
    <g>
      {closed ? (
        <g stroke="#2a2a33" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M74 104q8 8 16 0" />
          <path d="M110 104q8 8 16 0" />
        </g>
      ) : (
        <g>
          <ellipse cx="82" cy="104" rx={r} ry={r + 1} fill="#fff" />
          <ellipse cx="118" cy="104" rx={r} ry={r + 1} fill="#fff" />
          <circle cx="82" cy="105" r={r * 0.62} fill={color} />
          <circle cx="118" cy="105" r={r * 0.62} fill={color} />
          <circle cx="82" cy="105" r={r * 0.3} fill="#14141a" />
          <circle cx="118" cy="105" r={r * 0.3} fill="#14141a" />
          <circle cx="79" cy="101" r="2.4" fill="#fff" />
          <circle cx="115" cy="101" r="2.4" fill="#fff" />
        </g>
      )}
    </g>
  );
}

function Mouth({ expression }: { expression: VisualTraits["expression"] }) {
  switch (expression) {
    case "giggly":
      return <path d="M86 128q14 16 28 0q-14 6-28 0z" fill="#8c3a3a" />;
    case "sleepy":
      return <path d="M90 130q10 6 20 0" stroke="#8c3a3a" strokeWidth="4" fill="none" strokeLinecap="round" />;
    case "surprised":
      return <ellipse cx="100" cy="130" rx="8" ry="10" fill="#8c3a3a" />;
    case "cheeky":
      return <path d="M84 126q16 14 32-2" stroke="#8c3a3a" strokeWidth="4.5" fill="none" strokeLinecap="round" />;
    case "serious":
      return <path d="M88 130h24" stroke="#8c3a3a" strokeWidth="4.5" fill="none" strokeLinecap="round" />;
    case "delighted":
      return (
        <g>
          <path d="M84 126q16 18 32 0z" fill="#8c3a3a" />
          <path d="M92 132q8 6 16 0" fill="#e07a7a" />
        </g>
      );
  }
}

export default function BabyAvatar({ traits, seed, tone, size = 320, className, bare }: Props) {
  const hairHex = HAIR_COLOR_HEX[traits.hairColor];
  const eyeHex = EYE_COLOR_HEX[traits.eyeColor];
  const geo = faceGeometry(traits.faceShape);
  const blush = traits.expression === "cheeky" || traits.expression === "delighted";

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Fictional cartoon baby avatar"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={`bg-${seed}`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#2a2a3a" />
          <stop offset="100%" stopColor="#14141c" />
        </radialGradient>
        <linearGradient id={`skin-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone.hex} />
          <stop offset="100%" stopColor={tone.shade} />
        </linearGradient>
      </defs>

      {!bare && <rect width="200" height="200" rx="28" fill={`url(#bg-${seed})`} />}

      {/* body / onesie */}
      <path d="M56 200c2-30 20-46 44-46s42 16 44 46z" fill="#e0483a" />
      <path d="M56 200c2-30 20-46 44-46s42 16 44 46z" fill="rgba(0,0,0,0.12)" />
      <circle cx="100" cy="176" r="4" fill="#fff" opacity="0.7" />

      {/* ears */}
      <circle cx="40" cy={geo.cy + 6} r="12" fill={tone.shade} />
      <circle cx="160" cy={geo.cy + 6} r="12" fill={tone.shade} />

      {/* face */}
      <ellipse cx="100" cy={geo.cy} rx={geo.rx} ry={geo.ry} fill={`url(#skin-${seed})`} />

      {/* hair behind/over */}
      <Hair style={traits.hairStyle} color={hairHex} />

      {/* brows + eyes + mouth */}
      <Eyebrows style={traits.eyebrowStyle} color={hairHex} />
      <Eyes color={eyeHex} expression={traits.expression} />
      <Mouth expression={traits.expression} />

      {/* nose */}
      <path d="M100 114q4 4 0 7" stroke={tone.shade} strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* blush */}
      {blush && (
        <g opacity="0.5">
          <ellipse cx="66" cy="120" rx="9" ry="6" fill="#e07a7a" />
          <ellipse cx="134" cy="120" rx="9" ry="6" fill="#e07a7a" />
        </g>
      )}
    </svg>
  );
}
