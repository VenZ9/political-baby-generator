import { NextResponse } from "next/server";
import { generate } from "@/lib/generator";
import { getPersonById } from "@/lib/people";
import { TRAIT_KEYS, TRAIT_OPTIONS } from "@/data/traits";
import type { VisualTraits } from "@/types";

/**
 * Optional server-side generation endpoint.
 *
 * The app works fully client-side without this route. It exists so an
 * optional AI image-generation provider can be added later behind the same
 * contract, and so generation can be validated server-side.
 *
 * No API keys are used here. If you add a provider later, read its key from
 * process.env on the server only — never expose it to the browser.
 */

export const runtime = "nodejs";

interface Body {
  aId?: unknown;
  bId?: unknown;
  seed?: unknown;
  overrides?: unknown;
}

/** Whitelist-validate overrides so client data is never trusted blindly. */
function sanitizeOverrides(raw: unknown): Partial<VisualTraits> {
  if (!raw || typeof raw !== "object") return {};
  const out: Partial<VisualTraits> = {};
  for (const key of TRAIT_KEYS) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value !== "string") continue;
    const allowed = TRAIT_OPTIONS[key].map((o) => o.value);
    if (allowed.includes(value)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (out as any)[key] = value;
    }
  }
  return out;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const aId = typeof body.aId === "string" ? body.aId : "";
  const bId = typeof body.bId === "string" ? body.bId : "";
  const personA = getPersonById(aId);
  const personB = getPersonById(bId);

  if (!personA || !personB) {
    return NextResponse.json(
      { error: "Both aId and bId must reference known people." },
      { status: 400 },
    );
  }

  const seed =
    typeof body.seed === "number" && Number.isFinite(body.seed)
      ? Math.abs(Math.floor(body.seed)) >>> 0
      : Math.floor(Math.random() * 0xffffffff) >>> 0;

  const result = generate({
    personA,
    personB,
    overrides: sanitizeOverrides(body.overrides),
    seed,
  });

  return NextResponse.json({ result });
}
