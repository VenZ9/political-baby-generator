/**
 * Shared domain types for Political Baby Generator — Totally Scientific™.
 *
 * IMPORTANT: every trait in this file is a BROAD, STYLIZED, FICTIONAL visual
 * attribute used purely for cartoon parody. Nothing here models biology,
 * genetics, ethnicity, health, intelligence, personality or any real
 * characteristic of any person.
 */

export type HairStyle =
  | "bald"
  | "tuft"
  | "curly"
  | "sidepart"
  | "spiky"
  | "bob"
  | "pigtails"
  | "buzz"
  | "mop";

export type HairColor =
  | "jet"
  | "chestnut"
  | "auburn"
  | "blonde"
  | "platinum"
  | "ginger"
  | "silver"
  | "candy";

export type EyeColor = "brown" | "hazel" | "green" | "blue" | "grey" | "violet";

export type FaceShape = "round" | "oval" | "square" | "heart" | "long";

export type EyebrowStyle = "soft" | "arched" | "straight" | "bushy" | "worried" | "bold";

export type Expression =
  | "giggly"
  | "sleepy"
  | "surprised"
  | "cheeky"
  | "serious"
  | "delighted";

/** A broad, stylized visual trait set. Purely fictional / cartoon. */
export interface VisualTraits {
  hairStyle: HairStyle;
  hairColor: HairColor;
  eyeColor: EyeColor;
  faceShape: FaceShape;
  eyebrowStyle: EyebrowStyle;
  expression: Expression;
}

/** A selectable public figure (mock dataset — swappable for a real DB later). */
export interface Person {
  id: string;
  name: string;
  /** Short display role, e.g. "Head of State", "Senator". */
  role: string;
  /** Region / affiliation label for display only. */
  region: string;
  /** Two-letter monogram used by the generated avatar. */
  monogram: string;
  /** Accent colour for the generated avatar + card. */
  accent: string;
  /**
   * Broad, stylized visual trait tags used ONLY to seed the fictional mixer.
   * These are parody tags, not measurements of any real person.
   */
  traits: VisualTraits;
  /** A couple of light, non-sensitive display facts. */
  facts: string[];
}

/** The full input to a generation run. */
export interface GenerationInput {
  personA: Person;
  personB: Person;
  /** User overrides from the trait mixer. */
  overrides: Partial<VisualTraits>;
  /** Deterministic seed — same seed + same input ⇒ same baby. */
  seed: number;
}

/** The resolved, renderable result of a generation run. */
export interface GenerationResult {
  seed: number;
  traits: VisualTraits;
  /** Which parent each resolved trait was "inherited" from (fictional). */
  provenance: Record<keyof VisualTraits, "A" | "B" | "mix" | "user" | "chaos">;
  /** Fictional entertainment stats. NOT real characteristics. */
  stats: FictionalStat[];
  /** A short humorous fictional headline. */
  headline: string;
  /** Fictional "name suggestion". */
  babyName: string;
  createdAt: number;
}

export interface FictionalStat {
  key: string;
  label: string;
  emoji: string;
  /** 0–100, purely for the animated bar. */
  value: number;
  /** One-line joke describing the (fictional) reading. */
  blurb: string;
}
