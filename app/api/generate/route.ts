import { NextResponse } from "next/server";
import { generate } from "@/lib/generator";
import { getPersonById } from "@/lib/people";
import { generateImage } from "@/lib/openrouter";
import { DEFAULT_MODEL, isAllowedModel } from "@/data/models";
import { TRAIT_KEYS, TRAIT_OPTIONS } from "@/data/traits";
import type { VisualTraits } from "@/types";

/**
 * Server-side generation endpoint.
 *
 * 1. Validates the request (both people must exist; overrides are whitelisted).
 * 2. Resolves the fictional trait set + report using the same deterministic
 *    engine as the client.
 * 3. If OPENROUTER_API_KEY is configured, calls OpenRouter to produce a STRICTLY
 *    cartoon baby image. On any failure (no key, rate limit, timeout, provider
 *    error) it returns the result WITHOUT an image so the client falls back to
 *    the local SVG renderer.
 *
 * The API key is read from process.env on the server only — never sent to the
 * browser. The response never includes the key or any provider credential.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  aId?: unknown;
  bId?: unknown;
  seed?: unknown;
  model?: unknown;
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

  const model =
    typeof body.model === "string" && isAllowedModel(body.model)
      ? body.model
      : undefined;

  const result = generate({
    personA,
    personB,
    overrides: sanitizeOverrides(body.overrides),
    seed,
  });

  // Optional AI image. Fall back to the client-side SVG renderer on any failure.
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (apiKey) {
    const imageResult = await generateImage(
      apiKey,
      model ?? process.env.OPENROUTER_IMAGE_MODEL ?? DEFAULT_MODEL,
      result,
      personA,
      personB,
    );
    if (imageResult.ok) {
      return NextResponse.json({ result: { ...result, image: imageResult.image } });
    }
    // Non-fatal: signal the reason so the client can show a helpful note.
    return NextResponse.json({ result, fallback: imageResult.reason });
  }

  return NextResponse.json({ result, fallback: "no-key" });
}
