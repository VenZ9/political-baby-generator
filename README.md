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

1. **Select Person A** and **Person B** from a searchable roster.
2. **View both profile cards** side by side, joined by an animated 🧬 divider.
3. **Customize fictional visual traits** — hair style, hair colour, eye colour, face shape,
   eyebrows, expression — or hit **🎲 Randomize Traits**.
4. **Generate** a stylized cartoon baby (short animation, then reveal).
5. **Read the fictional report** — animated entertainment stat bars.
6. **Regenerate** for different results, **Download** a PNG result card, or **Share**.

## Safety rules enforced in the UI and the code

- The result is always a **flat, obviously cartoon** SVG avatar — never photorealistic.
- The disclaimer **"Fictional parody — not a biological prediction."** appears in the hero,
  under the Generate button, in the result panel, in the footer, and on the downloaded card.
- The trait model contains **only broad visual attributes** (hair, eyes, face shape,
  eyebrows, expression). There is no field for ethnicity, race, health, intelligence,
  personality, sexuality or any medical/genetic characteristic — so none can be inferred.
- The cartoon skin palette is a **fixed fictional palette**, never derived from the selected
  people.
- The roster is **fictional archetype characters**, not real people.

## Tech stack

- **Next.js 15** (App Router) + **TypeScript** + **React 19**
- **Pure CSS** (no Tailwind, no UI library) — dark theme, glassmorphism, gradients
- **SVG** cartoon renderer — no canvas, no image API, no external assets
- **Zero runtime dependencies** beyond Next/React. No database, no auth, no analytics.

## Project structure

```
app/
  layout.tsx              Root layout + metadata + viewport
  page.tsx                The whole flow (client component)
  globals.css             Full design system
  api/generate/route.ts   OPTIONAL server-side generation (validated)
components/
  BabyAvatar.tsx          SVG cartoon baby renderer (reusable facial parts)
  PersonCard.tsx          Selected-person card
  PersonPicker.tsx        Searchable bottom-sheet picker
  TraitMixer.tsx          Fictional trait customization panel
  StatBars.tsx            Animated fictional report bars
  DnaDivider.tsx          🧬 divider with DNA particles
  GeneratingOverlay.tsx   Generation loading animation
data/
  people.ts               MOCK public-figure dataset (swappable)
  traits.ts               Fictional trait catalogue + cartoon palette
lib/
  generator.ts            Deterministic seeded generation engine
  people.ts               People data-access layer
  exportCard.ts           Result-card SVG builder + PNG export
types/
  index.ts                Shared domain types
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

**Environment variables required: None.**

There is no `vercel.json` — none is needed. No API keys, no paid services, no database.

## How generation works

```
Person A traits + Person B traits + user overrides + seed
        ↓
  fictional trait combination   (lib/generator.ts)
        ↓
  cartoon baby renderer         (components/BabyAvatar.tsx)
```

- **Deterministic:** the same seed + same inputs always produce the same baby
  (`mulberry32` PRNG). Different seeds produce different babies.
- For each trait the engine rolls: inherit from A, inherit from B, blend, or a
  **chaos roll** (a fresh fictional option). User overrides always win.
- The result panel shows the **provenance** of each trait (from A / from B / blended /
  your pick / chaos roll).

### Swapping in a real public-figure database

Replace the array in `data/people.ts` and make the functions in `lib/people.ts` async.
Nothing else needs to change — every consumer goes through `lib/people.ts` and the
`Person` type.

### Adding an optional AI image provider later

`app/api/generate/route.ts` is a validated Route Handler that already returns the same
`GenerationResult` shape. Add your provider call there and read its key from
`process.env` **on the server only** — never expose it to the browser.

## Privacy

Everything runs in your browser. The selected people, traits and result are stored only in
`localStorage` on your own device. No accounts, no tracking, no personal data collected,
and no data is sent anywhere.

## Licence

MIT
