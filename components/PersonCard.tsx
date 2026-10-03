"use client";

import { monogramAvatar } from "@/lib/people";
import type { Person } from "@/types";

interface Props {
  person: Person;
  slot: "A" | "B";
  onClear?: () => void;
  onSwap?: () => void;
  compact?: boolean;
}

export default function PersonCard({ person, slot, onClear, onSwap, compact }: Props) {
  return (
    <article className={`person-card person-card--${slot.toLowerCase()} ${compact ? "is-compact" : ""}`}>
      <div className="person-card__glow" aria-hidden="true" />
      <header className="person-card__head">
        <span className="person-card__slot">Person {slot}</span>
        <div className="person-card__actions">
          {onSwap && (
            <button
              type="button"
              className="icon-btn"
              onClick={onSwap}
              aria-label={`Swap Person ${slot} with the other person`}
              title="Swap"
            >
              ⇄
            </button>
          )}
          {onClear && (
            <button
              type="button"
              className="icon-btn"
              onClick={onClear}
              aria-label={`Remove Person ${slot}`}
              title="Remove"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <div className="person-card__body">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="person-card__avatar"
          src={monogramAvatar(person, 128)}
          alt={`${person.name} avatar`}
          width={72}
          height={72}
        />
        <div className="person-card__meta">
          <h3 className="person-card__name">{person.name}</h3>
          <p className="person-card__role">{person.role}</p>
          <p className="person-card__region">{person.region}</p>
        </div>
      </div>

      <ul className="person-card__facts">
        {person.facts.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </article>
  );
}
