"use client";

import { useState } from "react";
import { monogramAvatar, personAvatar } from "@/lib/people";
import type { Person } from "@/types";

interface Props {
  person: Person;
  slot: "A" | "B";
  onClear?: () => void;
  onSwap?: () => void;
  compact?: boolean;
}

export default function PersonCard({ person, slot, onClear, onSwap, compact }: Props) {
  // Graceful fallback: if the portrait file is missing, swap to the monogram.
  const [imgFailed, setImgFailed] = useState(false);
  const src = imgFailed ? monogramAvatar(person, 128) : personAvatar(person, 128);

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
          src={src}
          alt={`${person.name} portrait`}
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
        <div className="person-card__meta">
          <h3 className="person-card__name">{person.name}</h3>
          <p className="person-card__role">{person.role}</p>
          <p className="person-card__region">{person.country}</p>
        </div>
      </div>
    </article>
  );
}
