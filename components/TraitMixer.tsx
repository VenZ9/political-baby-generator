"use client";

import { TRAIT_LABELS, TRAIT_OPTIONS, TRAIT_KEYS } from "@/data/traits";
import type { VisualTraits } from "@/types";

interface Props {
  overrides: Partial<VisualTraits>;
  onChange: (key: keyof VisualTraits, value: string | undefined) => void;
  onRandomize: () => void;
  onReset: () => void;
}

export default function TraitMixer({ overrides, onChange, onRandomize, onReset }: Props) {
  const activeCount = Object.values(overrides).filter((v) => v !== undefined).length;

  return (
    <section className="mixer" aria-labelledby="mixer-title">
      <header className="mixer__head">
        <div>
          <h2 id="mixer-title" className="section-title">
            🎨 Fictional Trait Mixer
          </h2>
          <p className="section-sub">
            Optional. Leave a trait on <strong>Auto</strong> and the generator rolls it from the two
            people. Everything here is a cartoon attribute — nothing is a real characteristic.
          </p>
        </div>
        <div className="mixer__head-actions">
          <button type="button" className="btn btn--ghost" onClick={onRandomize}>
            🎲 Randomize Traits
          </button>
          {activeCount > 0 && (
            <button type="button" className="btn btn--ghost" onClick={onReset}>
              Reset ({activeCount})
            </button>
          )}
        </div>
      </header>

      <div className="mixer__grid">
        {TRAIT_KEYS.map((key) => {
          const options = TRAIT_OPTIONS[key];
          const current = overrides[key];
          return (
            <fieldset key={key} className="trait-group">
              <legend className="trait-group__legend">{TRAIT_LABELS[key]}</legend>
              <div className="trait-group__options" role="group" aria-label={TRAIT_LABELS[key]}>
                <button
                  type="button"
                  className={`chip ${current === undefined ? "is-active" : ""}`}
                  onClick={() => onChange(key, undefined)}
                  aria-pressed={current === undefined}
                >
                  Auto
                </button>
                {options.map((opt) => {
                  const active = current === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`chip ${active ? "is-active" : ""}`}
                      onClick={() => onChange(key, opt.value)}
                      aria-pressed={active}
                    >
                      {opt.swatch && (
                        <span
                          className="chip__swatch"
                          style={{ background: opt.swatch }}
                          aria-hidden="true"
                        />
                      )}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>
    </section>
  );
}
