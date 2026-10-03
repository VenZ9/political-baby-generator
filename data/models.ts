/**
 * Image models offered by the OpenRouter image route.
 *
 * Kept in a shared, secret-free module so both the server route and the client
 * model selector import the same allowlist. A client-supplied model can never
 * cause arbitrary provider routing because the route validates against this.
 */
export const IMAGE_MODELS = [
  { id: "google/gemini-2.5-flash-image", label: "Nano Banana (fast)" },
  { id: "google/gemini-3-flash-image-preview", label: "Nano Banana 2 (preview)" },
  { id: "black-forest-labs/flux.2-flex", label: "Flux 2 Flex" },
  { id: "black-forest-labs/flux.2-pro", label: "Flux 2 Pro" },
] as const;

export type ImageModel = (typeof IMAGE_MODELS)[number]["id"];

export const DEFAULT_MODEL: ImageModel = "google/gemini-2.5-flash-image";

export function isAllowedModel(model: string): model is ImageModel {
  return IMAGE_MODELS.some((m) => m.id === model);
}
