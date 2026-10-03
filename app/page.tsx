"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BabyAvatar from "@/components/BabyAvatar";
import DnaDivider from "@/components/DnaDivider";
import GeneratingOverlay from "@/components/GeneratingOverlay";
import PersonCard from "@/components/PersonCard";
import PersonPicker from "@/components/PersonPicker";
import StatBars from "@/components/StatBars";
import TraitMixer from "@/components/TraitMixer";
import { getAllPeople } from "@/lib/people";
import {
  generate,
  provenanceLabel,
  randomSeed,
  resolveTone,
} from "@/lib/generator";
import { buildCardSvg, downloadBlob, slugify, svgToPngBlob } from "@/lib/exportCard";
import { TRAIT_LABELS, TRAIT_KEYS, TRAIT_OPTIONS } from "@/data/traits";
import type { GenerationResult, Person, VisualTraits } from "@/types";

const STORAGE_KEY = "pbg:last-generation:v1";

export default function HomePage() {
  const people = useMemo(() => getAllPeople(), []);

  const [personA, setPersonA] = useState<Person | null>(null);
  const [personB, setPersonB] = useState<Person | null>(null);
  const [overrides, setOverrides] = useState<Partial<VisualTraits>>({});
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pickerSlot, setPickerSlot] = useState<"A" | "B" | null>(null);
  const [busyExport, setBusyExport] = useState(false);

  const resultRef = useRef<HTMLDivElement | null>(null);
  const babySvgRef = useRef<HTMLDivElement | null>(null);

  /* ---------- restore last generation (local only, no accounts) ---------- */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        aId: string;
        bId: string;
        overrides: Partial<VisualTraits>;
        result: GenerationResult;
      };
      const a = people.find((p) => p.id === saved.aId);
      const b = people.find((p) => p.id === saved.bId);
      if (a && b && saved.result) {
        setPersonA(a);
        setPersonB(b);
        setOverrides(saved.overrides ?? {});
        setResult(saved.result);
      }
    } catch {
      /* corrupt storage — start fresh, never crash */
    }
  }, [people]);

  useEffect(() => {
    if (!result || !personA || !personB) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ aId: personA.id, bId: personB.id, overrides, result }),
      );
    } catch {
      /* storage full / disabled — non-fatal */
    }
  }, [result, personA, personB, overrides]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const ready = Boolean(personA && personB);

  /* ---------------------------- actions ---------------------------- */

  const runGeneration = useCallback(
    (seed?: number) => {
      if (!personA || !personB) {
        setError("Pick two people first — the generator needs both.");
        return;
      }
      setError(null);
      setGenerating(true);
      const useSeed = seed ?? randomSeed();
      // Short, deliberate animation; the work itself is instant.
      window.setTimeout(() => {
        try {
          const res = generate({ personA, personB, overrides, seed: useSeed });
          setResult(res);
          window.setTimeout(
            () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
            80,
          );
        } catch {
          setError("Something went wrong generating the baby. Please try again.");
        } finally {
          setGenerating(false);
        }
      }, 900);
    },
    [personA, personB, overrides],
  );

  const handleRandomize = useCallback(() => {
    const next: Partial<VisualTraits> = {};
    for (const key of TRAIT_KEYS) {
      const opts = TRAIT_OPTIONS[key];
      const pickOpt = opts[Math.floor(Math.random() * opts.length)];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (next as any)[key] = pickOpt.value;
    }
    setOverrides(next);
    setToast("🎲 Random fictional traits applied");
  }, []);

  const handleTraitChange = useCallback((key: keyof VisualTraits, value: string | undefined) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (value === undefined) delete next[key];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      else (next as any)[key] = value;
      return next;
    });
  }, []);

  const handleDownload = useCallback(async () => {
    if (!result || !personA || !personB) return;
    setBusyExport(true);
    try {
      const svgEl = babySvgRef.current?.querySelector("svg");
      if (!svgEl) throw new Error("The baby avatar is not ready yet.");
      const markup = new XMLSerializer().serializeToString(svgEl);
      const card = buildCardSvg(result, personA, personB, markup);
      const blob = await svgToPngBlob(card, 1);
      downloadBlob(blob, `political-baby-${slugify(result.babyName)}.png`);
      setToast("📥 Result card downloaded");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed. Please try again.");
    } finally {
      setBusyExport(false);
    }
  }, [result, personA, personB]);

  const handleShare = useCallback(async () => {
    if (!result || !personA || !personB) return;
    const text = `My fictional Political Baby: ${result.babyName} — ${personA.name} + ${personB.name}. Fictional parody — not a biological prediction.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Political Baby Generator — Totally Scientific™", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setToast("🔗 Summary copied to clipboard");
    } catch (e) {
      // User cancelled the share sheet — not an error worth surfacing.
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError("Sharing is not available in this browser. Use Download instead.");
    }
  }, [result, personA, personB]);

  const tone = result ? resolveTone(result.seed) : null;

  /* ------------------------------ view ------------------------------ */

  return (
    <main className="page">
      <header className="hero">
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__inner">
          <p className="hero__eyebrow">🧪 Parody Entertainment</p>
          <h1 className="hero__title">
            POLITICAL BABY <span className="hero__title-accent">GENERATOR</span>
          </h1>
          <p className="hero__sub">Totally Scientific™ (Definitely Not Scientific)</p>
          <p className="hero__disclaimer">
            <strong>Fictional parody — not a biological prediction.</strong> This is a cartoon
            generator for fun. It does not predict, model or represent what any real child would
            look like, and it never infers ethnicity, health, intelligence, personality or any
            other real characteristic.
          </p>
        </div>
      </header>

      {/* ------------------------- STEP 1 & 2 ------------------------- */}
      <section className="panel" aria-labelledby="select-title">
        <h2 id="select-title" className="section-title">
          🧑‍🤝‍🧑 Pick Two Public Figures
        </h2>
        <p className="section-sub">
          Choose any two from the sample roster. These are fictional archetype characters — no real
          people are depicted.
        </p>

        <div className="pair">
          {personA ? (
            <PersonCard
              person={personA}
              slot="A"
              onClear={() => {
                setPersonA(null);
                setResult(null);
              }}
              onSwap={() => {
                setPersonA(personB);
                setPersonB(personA);
              }}
            />
          ) : (
            <button type="button" className="slot slot--empty" onClick={() => setPickerSlot("A")}>
              <span className="slot__plus" aria-hidden="true">＋</span>
              <span className="slot__label">Select Person A</span>
              <span className="slot__hint">Tap to browse the roster</span>
            </button>
          )}

          <DnaDivider active={ready} />

          {personB ? (
            <PersonCard
              person={personB}
              slot="B"
              onClear={() => {
                setPersonB(null);
                setResult(null);
              }}
              onSwap={() => {
                setPersonA(personB);
                setPersonB(personA);
              }}
            />
          ) : (
            <button type="button" className="slot slot--empty" onClick={() => setPickerSlot("B")}>
              <span className="slot__plus" aria-hidden="true">＋</span>
              <span className="slot__label">Select Person B</span>
              <span className="slot__hint">Tap to browse the roster</span>
            </button>
          )}
        </div>

        {!ready && (
          <p className="inline-hint">
            {personA || personB
              ? "One more to go — pick the second person to unlock generation."
              : "Pick two people to unlock the generator."}
          </p>
        )}
      </section>

      {/* --------------------------- STEP 4 --------------------------- */}
      <section className="panel">
        <TraitMixer
          overrides={overrides}
          onChange={handleTraitChange}
          onRandomize={handleRandomize}
          onReset={() => setOverrides({})}
        />
      </section>

      {/* --------------------------- STEP 5 --------------------------- */}
      <section className="generate">
        <button
          type="button"
          className="btn btn--primary btn--generate"
          disabled={!ready || generating}
          onClick={() => runGeneration()}
          aria-describedby="gen-disclaimer"
        >
          {generating ? "Generating…" : "GENERATE 👶"}
        </button>
        <p id="gen-disclaimer" className="generate__disclaimer">
          Fictional parody — not a biological prediction.
        </p>
        {error && (
          <p className="alert" role="alert">
            ⚠️ {error}
          </p>
        )}
      </section>

      {/* --------------------------- STEP 7-10 --------------------------- */}
      <div ref={resultRef}>
        {result && personA && personB && tone ? (
          <section className="panel result" aria-labelledby="result-title">
            <h2 id="result-title" className="section-title">
              👶 Your Fictional Baby
            </h2>

            <div className="result__grid">
              <div className="result__avatar">
                <div ref={babySvgRef} className="result__avatar-inner">
                  <BabyAvatar traits={result.traits} seed={result.seed} tone={tone} size={320} />
                </div>
                <p className="result__name">{result.babyName}</p>
                <p className="result__headline">“{result.headline}”</p>
                <p className="result__seed">Seed #{result.seed}</p>
              </div>

              <div className="result__side">
                <h3 className="result__subhead">🧬 Fictional Trait Breakdown</h3>
                <ul className="traits-list">
                  {TRAIT_KEYS.map((key) => (
                    <li key={key} className="traits-list__row">
                      <span className="traits-list__key">{TRAIT_LABELS[key]}</span>
                      <span className="traits-list__val">
                        {String(result.traits[key]).replace(/([a-z])([A-Z])/g, "$1 $2")}
                      </span>
                      <span className={`tag tag--${result.provenance[key]}`}>
                        {provenanceLabel(result.provenance[key])}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <h3 className="result__subhead result__subhead--stats">
              📊 Fictional Report{" "}
              <span className="result__subhead-note">
                (entertainment stats — not real characteristics)
              </span>
            </h3>
            <StatBars stats={result.stats} runKey={result.seed} />

            <div className="result__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => runGeneration()}
                disabled={generating}
              >
                🔄 Regenerate
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleDownload}
                disabled={busyExport}
              >
                {busyExport ? "Preparing…" : "📥 Download"}
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleShare}>
                🔗 Share
              </button>
            </div>

            <p className="result__footnote">
              Fictional parody — not a biological prediction. Generated locally in your browser; no
              data leaves this device.
            </p>
          </section>
        ) : (
          <section className="panel empty-state empty-state--panel">
            <p className="empty-state__emoji" aria-hidden="true">👶</p>
            <p className="empty-state__title">No fictional baby yet</p>
            <p className="empty-state__hint">
              Pick two people, optionally tweak the traits, then hit{" "}
              <strong>GENERATE 👶</strong>.
            </p>
          </section>
        )}
      </div>

      <footer className="foot">
        <p>
          <strong>Political Baby Generator — Totally Scientific™</strong>
        </p>
        <p>Fictional parody — not a biological prediction.</p>
        <p className="foot__fine">
          All avatars are stylized cartoons generated locally from broad visual traits. This app
          does not infer ethnicity, race, health, intelligence, personality, sexuality or any
          medical or genetic characteristic, and it is not a genetic, medical or facial-prediction
          tool.
        </p>
      </footer>

      <PersonPicker
        open={pickerSlot !== null}
        slot={pickerSlot ?? "A"}
        onClose={() => setPickerSlot(null)}
        excludeId={pickerSlot === "A" ? personB?.id : personA?.id}
        onSelect={(p) => {
          if (pickerSlot === "A") setPersonA(p);
          else setPersonB(p);
          setResult(null);
        }}
      />

      <GeneratingOverlay active={generating} />

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </main>
  );
}
