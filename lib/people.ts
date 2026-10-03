import { PEOPLE } from "@/data/people";
import type { Person } from "@/types";

/**
 * People data access layer.
 *
 * Today this reads the local curated dataset (real public figures). To move to
 * a remote public-figure database later, make these functions async and fetch
 * from your source — every consumer already goes through this module.
 */

export function getAllPeople(): Person[] {
  return PEOPLE;
}

export function getPersonById(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}

/** Distinct country labels, in insertion order. */
export function getCountries(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of PEOPLE) {
    if (!seen.has(p.country)) {
      seen.add(p.country);
      out.push(p.country);
    }
  }
  return out;
}

/** Case-insensitive search across name, role and country. */
export function searchPeople(
  query: string,
  opts: { country?: string } = {},
): Person[] {
  const q = query.trim().toLowerCase();
  let list = PEOPLE;
  if (opts.country) {
    list = list.filter((p) => p.country === opts.country);
  }
  if (!q) return list;
  return list.filter((p) =>
    [p.name, p.role, p.country].some((field) => field.toLowerCase().includes(q)),
  );
}

/**
 * A local portrait URL if the person has one, otherwise a deterministic
 * monogram data URI. Never touches the network at runtime.
 */
export function personAvatar(person: Person, size = 96): string {
  return person.image ?? monogramAvatar(person, size);
}

/** Deterministic monogram avatar as an inline SVG data URI (no network). */
export function monogramAvatar(person: Person, size = 96): string {
  const initials = person.monogram.slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 96 96">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${person.accent}"/>
<stop offset="100%" stop-color="#1a1a24"/>
</linearGradient>
</defs>
<rect width="96" height="96" rx="24" fill="url(#g)"/>
<circle cx="48" cy="38" r="15" fill="rgba(255,255,255,0.22)"/>
<path d="M18 88c4-18 16-26 30-26s26 8 30 26z" fill="rgba(255,255,255,0.22)"/>
<text x="48" y="58" font-family="Inter,Segoe UI,sans-serif" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">${initials}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
