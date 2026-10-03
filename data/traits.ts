import type {
  EyebrowStyle,
  Expression,
  EyeColor,
  FaceShape,
  HairColor,
  HairStyle,
  VisualTraits,
} from "@/types";

/**
 * The fictional trait catalogue.
 *
 * Every option is a broad, stylized cartoon attribute. None of these model
 * biology, genetics, ethnicity, health or any real characteristic.
 */

export interface TraitOption<T extends string> {
  value: T;
  label: string;
  /** Swatch colour for colour-type traits. */
  swatch?: string;
}

export const HAIR_STYLES: TraitOption<HairStyle>[] = [
  { value: "bald", label: "Smooth Dome" },
  { value: "tuft", label: "Single Tuft" },
  { value: "curly", label: "Curly Cloud" },
  { value: "sidepart", label: "Side Part" },
  { value: "spiky", label: "Spiky" },
  { value: "bob", label: "Bob" },
  { value: "pigtails", label: "Pigtails" },
  { value: "buzz", label: "Buzz" },
  { value: "mop", label: "Mop Top" },
];

export const HAIR_COLORS: TraitOption<HairColor>[] = [
  { value: "jet", label: "Jet", swatch: "#1b1b22" },
  { value: "chestnut", label: "Chestnut", swatch: "#5a3620" },
  { value: "auburn", label: "Auburn", swatch: "#8a3b1e" },
  { value: "blonde", label: "Blonde", swatch: "#d9a94a" },
  { value: "platinum", label: "Platinum", swatch: "#e8e2d0" },
  { value: "ginger", label: "Ginger", swatch: "#c25a1e" },
  { value: "silver", label: "Silver", swatch: "#b9bec7" },
  { value: "candy", label: "Candy", swatch: "#e0559b" },
];

export const EYE_COLORS: TraitOption<EyeColor>[] = [
  { value: "brown", label: "Brown", swatch: "#5b3a1e" },
  { value: "hazel", label: "Hazel", swatch: "#8a6a2f" },
  { value: "green", label: "Green", swatch: "#3f7d4e" },
  { value: "blue", label: "Blue", swatch: "#3f6fa8" },
  { value: "grey", label: "Grey", swatch: "#7b8794" },
  { value: "violet", label: "Violet", swatch: "#7a4fa8" },
];

export const FACE_SHAPES: TraitOption<FaceShape>[] = [
  { value: "round", label: "Round" },
  { value: "oval", label: "Oval" },
  { value: "square", label: "Square" },
  { value: "heart", label: "Heart" },
  { value: "long", label: "Long" },
];

export const EYEBROW_STYLES: TraitOption<EyebrowStyle>[] = [
  { value: "soft", label: "Soft" },
  { value: "arched", label: "Arched" },
  { value: "straight", label: "Straight" },
  { value: "bushy", label: "Bushy" },
  { value: "worried", label: "Worried" },
  { value: "bold", label: "Bold" },
];

export const EXPRESSIONS: TraitOption<Expression>[] = [
  { value: "giggly", label: "Giggly" },
  { value: "sleepy", label: "Sleepy" },
  { value: "surprised", label: "Surprised" },
  { value: "cheeky", label: "Cheeky" },
  { value: "serious", label: "Serious" },
  { value: "delighted", label: "Delighted" },
];

export const HAIR_COLOR_HEX: Record<HairColor, string> = {
  jet: "#1b1b22",
  chestnut: "#5a3620",
  auburn: "#8a3b1e",
  blonde: "#d9a94a",
  platinum: "#e8e2d0",
  ginger: "#c25a1e",
  silver: "#b9bec7",
  candy: "#e0559b",
};

export const EYE_COLOR_HEX: Record<EyeColor, string> = {
  brown: "#5b3a1e",
  hazel: "#8a6a2f",
  green: "#3f7d4e",
  blue: "#3f6fa8",
  grey: "#7b8794",
  violet: "#7a4fa8",
};

/**
 * The cartoon skin palette.
 *
 * This is a FIXED, FICTIONAL cartoon palette. It is deliberately NOT derived
 * from the selected people and is never presented as a prediction of anything.
 */
export const CARTOON_TONES = [
  { value: "peach", label: "Peach", hex: "#f6c9a8", shade: "#e0a97f" },
  { value: "sand", label: "Sand", hex: "#eab98d", shade: "#d09a6a" },
  { value: "honey", label: "Honey", hex: "#d99f6c", shade: "#bd8250" },
  { value: "cocoa", label: "Cocoa", hex: "#a9714a", shade: "#8c5836" },
  { value: "mint", label: "Mint", hex: "#bfe3c8", shade: "#9cc7a8" },
  { value: "lilac", label: "Lilac", hex: "#d3c2ea", shade: "#b3a0d1" },
] as const;

export type CartoonTone = (typeof CARTOON_TONES)[number]["value"];

export const DEFAULT_TRAITS: VisualTraits = {
  hairStyle: "tuft",
  hairColor: "chestnut",
  eyeColor: "brown",
  faceShape: "round",
  eyebrowStyle: "soft",
  expression: "giggly",
};

export const TRAIT_KEYS: (keyof VisualTraits)[] = [
  "hairStyle",
  "hairColor",
  "eyeColor",
  "faceShape",
  "eyebrowStyle",
  "expression",
];

export const TRAIT_LABELS: Record<keyof VisualTraits, string> = {
  hairStyle: "Hair Style",
  hairColor: "Hair Colour",
  eyeColor: "Eye Colour",
  faceShape: "Face Shape",
  eyebrowStyle: "Eyebrows",
  expression: "Expression",
};

export const TRAIT_OPTIONS: Record<keyof VisualTraits, TraitOption<string>[]> = {
  hairStyle: HAIR_STYLES,
  hairColor: HAIR_COLORS,
  eyeColor: EYE_COLORS,
  faceShape: FACE_SHAPES,
  eyebrowStyle: EYEBROW_STYLES,
  expression: EXPRESSIONS,
};
