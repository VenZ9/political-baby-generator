import type { FictionalStat, GenerationResult, Person } from "@/types";

/**
 * Client-side result-card export.
 *
 * Builds a fully self-contained SVG (no external fonts, images or network),
 * then rasterizes it to PNG via a canvas. No third-party library, no server.
 */

const W = 1080;
const H = 1500;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(text: string, max: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

/**
 * @param babySvgMarkup serialized <svg> markup of the cartoon baby
 */
export function buildCardSvg(
  result: GenerationResult,
  personA: Person,
  personB: Person,
  babySvgMarkup: string,
): string {
  // Strip the outer width/height so it scales into our layout box.
  const baby = babySvgMarkup
    .replace(/width="[^"]*"/, 'width="520"')
    .replace(/height="[^"]*"/, 'height="520"');

  const statRows = result.stats
    .map((s: FictionalStat, i: number) => {
      const y = 1010 + i * 74;
      const barW = Math.round((s.value / 100) * 620);
      return `
      <g>
        <text x="120" y="${y}" fill="#e8e8f0" font-size="30" font-family="Inter,Segoe UI,Arial,sans-serif">${esc(
          s.emoji + " " + s.label,
        )}</text>
        <text x="960" y="${y}" fill="#ff8a3d" font-size="30" font-weight="700" text-anchor="end" font-family="Inter,Segoe UI,Arial,sans-serif">${s.value}</text>
        <rect x="120" y="${y + 14}" width="840" height="14" rx="7" fill="#2a2a38"/>
        <rect x="120" y="${y + 14}" width="${barW}" height="14" rx="7" fill="url(#barGrad)"/>
      </g>`;
    })
    .join("");

  const headlineLines = wrap(result.headline, 46)
    .map(
      (l, i) =>
        `<text x="540" y="${880 + i * 40}" fill="#b9b9c9" font-size="30" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif">${esc(
          l,
        )}</text>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#12121a"/>
      <stop offset="55%" stop-color="#0d0d14"/>
      <stop offset="100%" stop-color="#1a0f12"/>
    </linearGradient>
    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e0483a"/>
      <stop offset="100%" stop-color="#ff8a3d"/>
    </linearGradient>
    <linearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ff8a3d"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="40" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="2"/>

  <text x="540" y="96" fill="url(#titleGrad)" font-size="46" font-weight="800" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif">POLITICAL BABY GENERATOR</text>
  <text x="540" y="140" fill="#8f8fa3" font-size="26" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif">Totally Scientific™ (Definitely Not Scientific)</text>

  <g transform="translate(280, 190)">${baby}</g>

  <text x="540" y="790" fill="#8f8fa3" font-size="26" letter-spacing="4" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif">YOUR FICTIONAL BABY</text>
  <text x="540" y="840" fill="#ffffff" font-size="44" font-weight="700" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif">${esc(
    result.babyName,
  )}</text>
  ${headlineLines}

  <text x="120" y="960" fill="#8f8fa3" font-size="24" letter-spacing="3" font-family="Inter,Segoe UI,Arial,sans-serif">FICTIONAL ENTERTAINMENT STATS</text>
  ${statRows}

  <text x="540" y="1420" fill="#8f8fa3" font-size="24" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif">${esc(
    personA.name,
  )} + ${esc(personB.name)}</text>
  <text x="540" y="1458" fill="#ff8a3d" font-size="26" font-weight="700" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif">Fictional parody — not a biological prediction.</text>
</svg>`;
}

/** Rasterize an SVG string to a PNG blob at the given scale. */
export async function svgToPngBlob(svg: string, scale = 1): Promise<Blob> {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const img = new Image();
  img.decoding = "sync";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not rasterize the result card."));
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.fillStyle = "#0d0d14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not export the image."))),
      "image/png",
      0.95,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
