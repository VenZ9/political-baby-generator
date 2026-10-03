import type { GenerationResult, Person } from "@/types";
import { DEFAULT_MODEL, isAllowedModel } from "@/data/models";

export { IMAGE_MODELS, DEFAULT_MODEL, isAllowedModel } from "@/data/models";
export type { ImageModel } from "@/data/models";

/**
 * Server-only OpenRouter image generation.
 *
 * This module is imported ONLY by the API route (never by a client component),
 * so the API key is never exposed to the browser. It generates a STRICTLY
 * cartoon / stylized baby avatar — never a photorealistic depiction.
 */

const OPENROUTER_URL =
  (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1") + "/images";

export interface GeneratedImage {
  dataUrl: string;
  mediaType: string;
  model: string;
}

export type GenerateImageResult =
  | { ok: true; image: GeneratedImage }
  | { ok: false; reason: "no-key" | "invalid" | "provider-error" | "timeout" | "rate-limit" };

/**
 * Build a strict, clearly-fictional cartoon prompt from the resolved traits.
 *
 * The prompt explicitly requests a cartoon / illustration style and forbids
 * photorealism. It mentions NO ethnicity, race, health, intelligence,
 * personality, sexuality, medical or genetic attribute — it only names broad
 * cartoon features (hair, eyes, face shape, expression).
 */
function buildPrompt(result: GenerationResult): string {
  const t = result.traits;
  const hair = String(t.hairStyle).replace(/([a-z])([A-Z])/g, "$1 $2");
  return [
    "A cute, flat 2D cartoon baby avatar illustration, chibi style, soft rounded shapes,",
    "clean vector look, pastel color palette, centered portrait on a dark navy background.",
    `The baby has ${hair} hair in a ${String(t.hairColor)} tone, ${String(t.eyeColor)} eyes,`,
    `a ${String(t.faceShape)} face shape, ${String(t.eyebrowStyle)} eyebrows, and a`,
    `${String(t.expression)} expression.`,
    "It wears a simple red onesie. Whimsical, friendly, obviously stylized and fictional.",
    "STRICTLY a cartoon / illustration — absolutely no photorealism, no realistic child,",
    "no real person likeness, no text, no watermark.",
  ].join(" ");
}

export async function generateImage(
  apiKey: string,
  model: string,
  result: GenerationResult,
  _personA: Person,
  _personB: Person,
): Promise<GenerateImageResult> {
  if (!isAllowedModel(model)) {
    return { ok: false, reason: "invalid" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt: buildPrompt(result),
        n: 1,
        output_format: "png",
        background: "opaque",
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return { ok: false, reason: "invalid" };
      if (res.status === 429) return { ok: false, reason: "rate-limit" };
      return { ok: false, reason: "provider-error" };
    }

    const data = (await res.json()) as {
      data?: { b64_json?: string; media_type?: string }[];
    };
    const item = data.data?.[0];
    if (!item?.b64_json) return { ok: false, reason: "provider-error" };

    const mediaType = item.media_type || "image/png";
    return {
      ok: true,
      image: {
        dataUrl: `data:${mediaType};base64,${item.b64_json}`,
        mediaType,
        model,
      },
    };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return { ok: false, reason: "timeout" };
    }
    return { ok: false, reason: "provider-error" };
  } finally {
    clearTimeout(timeout);
  }
}
