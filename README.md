# Political Baby Generator — Totally Scientific™

A **fictional parody** entertainment app. Pick two public figures, optionally tweak some
cartoon traits, and generate a clearly stylized cartoon baby avatar with a humorous
fictional report.

> **Fictional parody — not a biological prediction.**
> This is a cartoon generator for fun. It does **not** predict, model or represent what any
> real child would look like, and it never infers ethnicity, race, health, intelligence,
> personality, sexuality, or any medical or genetic characteristic. It is not a genetic,
> medical or facial-prediction tool.

---

## What it does

1. **Select Person A** and **Person B** from a searchable roster of **94 real public figures**
   across 40+ countries, filterable by country.
2. **View both profile cards** side by side, joined by an animated 🧬 divider.
3. **Customize fictional visual traits** — hair style, hair colour, eye colour, face shape,
   eyebrows, expression — or hit **🎲 Randomize Traits**.
4. **Generate** a stylized cartoon baby — either an **AI-generated cartoon** (OpenRouter) or
   the built-in local SVG renderer, with a short animation and reveal.
5. **Read the fictional report** — animated entertainment stat bars.
6. **Regenerate** for different results, **Download** a PNG result card, or **Share**.

## The roster

`data/people.ts` holds **94 real, well-known political figures** — heads of state, prime
ministers and presidents from the US, UK, India, Pakistan, France, Germany, Russia, China,
Brazil, Canada, Japan, and many more regions (Europe, the Middle East, Africa, Asia-Pacific
and Latin America).

- Each entry has a **name, country, role and a real portrait**.
- Portraits are downloaded **once at build time** from **Wikimedia Commons** into
  `public/portraits/` and served locally — the app **never hot-links or scrapes at runtime**.
- Per-image attribution lives in **`public/portraits/CREDITS.md`**.
- If a portrait file is missing, the card falls back to a **deterministic monogram avatar**.
- The picker supports **search** (name / role / country) and **country filtering**.

Regenerate the roster with:

```bash
python3 scripts/harvest_roster.py
```

> The `traits` on each roster entry are **fictional parody tags** assigned deterministically
> from the person's id so the roster is stable. They are **not** measurements, observations
> or inferences about any real person.

## Safety rules enforced in the UI and the code

- The result is always a **flat, obviously cartoon** avatar — either an AI image generated
  from a **strict cartoon prompt** or the local SVG renderer. **Never photorealistic.**
- The AI prompt explicitly requests a cartoon/illustration style and forbids photorealism,
  realistic children and real-person likeness.
- The disclaimer **"Fictional parody — not a biological prediction."** appears in the hero,
  under the Generate button, in the result panel, in the footer, and on the downloaded card.
- The trait model contains **only broad visual attributes** (hair, eyes, face shape,
  eyebrows, expression). There is no field for ethnicity, race, health, intelligence,
  personality, sexuality or any medical/genetic characteristic — so none can be inferred.
- The cartoon skin palette is a **fixed fictional palette**, never derived from the selected
  people.

## Tech stack

- **Next.js 15** (App Router) + **TypeScript** + **React 19**
- **Pure CSS** (no Tailwind, no UI library) — dark theme, glassmorphism, gradients
- **SVG** cartoon renderer (local fallback) + optional **OpenRouter** image generation
- **Zero runtime dependencies** beyond Next/React. No database, no auth, no analytics.

## Project structure

```
app/
  layout.tsx              Root layout + metadata + viewport
  page.tsx                The whole flow (client component)
  globals.css             Full design system
  api/generate/route.ts   Server-side generation + OpenRouter image call
components/
  BabyAvatar.tsx          SVG cartoon baby renderer (reusable facial parts)
  PersonCard.tsx          Selected-person card (real portrait + monogram fallback)
  PersonPicker.tsx        Searchable bottom-sheet picker + country filter
  TraitMixer.tsx          Fictional trait customization panel
  StatBars.tsx            Animated fictional report bars
  DnaDivider.tsx          🧬 divider with DNA particles
  GeneratingOverlay.tsx   Generation loading animation
data/
  people.ts               REAL public-figure roster (94 figures, generated)
  traits.ts               Fictional trait catalogue + cartoon palette
  models.ts               Shared image-model allowlist (secret-free)
lib/
  generator.ts            Deterministic seeded generation engine
  people.ts               People data-access layer + avatar helpers
  openrouter.ts           SERVER-ONLY OpenRouter image generation
  exportCard.ts           Result-card SVG builder + PNG export
types/
  index.ts                Shared domain types
public/
  portraits/              Real portraits (downloaded at build time)
  portraits/CREDITS.md    Per-image Wikimedia attribution
scripts/
  harvest_roster.py       Build-time roster + portrait harvester
  mock_openrouter.py      Local mock of the OpenRouter image endpoint (testing)
```

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Type check:

```bash
npm run typecheck
```

## Deploy to Vercel

1. Open [Vercel](https://vercel.com/new).
2. Import this GitHub repository.
3. Let Vercel detect **Next.js** automatically (no configuration needed).
4. Deploy.

**Environment variables required: None.** The app works fully without any configuration —
if `OPENROUTER_API_KEY` is unset, generation falls back to the built-in local SVG renderer.

To enable AI image generation on Vercel, add one environment variable in
**Project → Settings → Environment Variables**:

| Name | Value |
| --- | --- |
| `OPENROUTER_API_KEY` | your key from <https://openrouter.ai/keys> |

Optional: `OPENROUTER_IMAGE_MODEL` to override the default model.

There is no `vercel.json` — none is needed. No database, no paid service required.

## AI image generation (OpenRouter)

Generation is **server-side only**. The browser calls `POST /api/generate`; the route
validates the input, resolves the fictional traits, and — if a key is configured — calls
OpenRouter's Image API. **The API key is read from `process.env` on the server and is never
sent to the browser.**

- **Default model:** `google/gemini-2.5-flash-image` ("Nano Banana").
- **Selectable in the UI:** Nano Banana, Nano Banana 2 (preview), Flux 2 Flex, Flux 2 Pro.
  The route validates the model against a server-side allowlist, so a client-supplied model
  can never cause arbitrary provider routing.
- **Prompt:** strictly cartoon — *"flat 2D cartoon baby avatar illustration, chibi style …
  STRICTLY a cartoon / illustration — absolutely no photorealism, no realistic child, no real
  person likeness."* It names only broad cartoon features (hair, eyes, face shape, expression).
- **Fallback:** on no key, invalid key, rate limit, timeout (55s) or provider error, the route
  returns the result **without** an image and the client renders the local SVG cartoon instead,
  with a short explanatory note. The flow never dead-ends.

### Getting a key

1. Create an account at <https://openrouter.ai>.
2. Go to <https://openrouter.ai/keys> and click **Create API Key**.
3. Copy the key (starts with `sk-or-v1-…`) into `OPENROUTER_API_KEY`.

### Testing the route locally without a real key

```bash
python3 scripts/mock_openrouter.py &                       # mock provider on :4599
OPENROUTER_API_KEY=sk-or-v1-test \
OPENROUTER_BASE_URL=http://127.0.0.1:4599/api/v1 \
  npm start
```

## How generation works

```
Person A traits + Person B traits + user overrides + seed
        ↓
  fictional trait combination   (lib/generator.ts)
        ↓
  cartoon baby renderer         (OpenRouter AI image, or components/BabyAvatar.tsx)
```

- **Deterministic:** the same seed + same inputs always produce the same baby
  (`mulberry32` PRNG). Different seeds produce different babies.
- For each trait the engine rolls: inherit from A, inherit from B, blend, or a
  **chaos roll** (a fresh fictional option). User overrides always win.
- The result panel shows the **provenance** of each trait (from A / from B / blended /
  your pick / chaos roll).

### Swapping in a different public-figure database

Replace the array in `data/people.ts` (or point `lib/people.ts` at a remote source and make
its functions async). Nothing else needs to change — every consumer goes through
`lib/people.ts` and the `Person` type.

## Privacy

Everything runs in your browser, except the optional AI image call which goes to OpenRouter
via our own server route. The selected people, traits and result are stored only in
`localStorage` on your own device. No accounts, no tracking, no personal data collected.

## Licence

MIT
