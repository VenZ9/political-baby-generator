"use client";

import { useEffect, useMemo, useState } from "react";
import { getCountries, personAvatar, searchPeople } from "@/lib/people";
import type { Person } from "@/types";

interface Props {
  open: boolean;
  slot: "A" | "B";
  onClose: () => void;
  onSelect: (person: Person) => void;
  excludeId?: string;
}

export default function PersonPicker({ open, slot, onClose, onSelect, excludeId }: Props) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string>("");

  const countries = useMemo(() => getCountries(), []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setCountry("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const results = useMemo(
    () => searchPeople(query, { country: country || undefined }),
    [query, country],
  );

  if (!open) return null;

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Choose Person ${slot}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__grabber" aria-hidden="true" />
        <header className="sheet__head">
          <h2 className="sheet__title">Choose Person {slot}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close picker">
            ✕
          </button>
        </header>

        <div className="sheet__search">
          <span aria-hidden="true">🔍</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, role or country…"
            aria-label="Search public figures"
            autoFocus
          />
          {query && (
            <button type="button" className="icon-btn" onClick={() => setQuery("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        <div className="country-bar" role="group" aria-label="Filter by country">
          <button
            type="button"
            className={`country-chip ${country === "" ? "is-active" : ""}`}
            onClick={() => setCountry("")}
            aria-pressed={country === ""}
          >
            All
          </button>
          {countries.map((c) => (
            <button
              key={c}
              type="button"
              className={`country-chip ${country === c ? "is-active" : ""}`}
              onClick={() => setCountry(country === c ? "" : c)}
              aria-pressed={country === c}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="sheet__list">
          {results.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state__emoji" aria-hidden="true">🕵️</p>
              <p className="empty-state__title">
                No figures match {query ? `“${query}”` : "this filter"}
              </p>
              <p className="empty-state__hint">Try a different name, role or country.</p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setQuery("");
                  setCountry("");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            results.map((p) => {
              const disabled = p.id === excludeId;
              return (
                <button
                  key={p.id}
                  type="button"
                  className="picker-row"
                  disabled={disabled}
                  onClick={() => {
                    onSelect(p);
                    onClose();
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={personAvatar(p, 96)}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                    className="picker-row__avatar"
                  />
                  <span className="picker-row__meta">
                    <span className="picker-row__name">{p.name}</span>
                    <span className="picker-row__sub">
                      {p.role} · {p.country}
                    </span>
                  </span>
                  <span className="picker-row__cta">{disabled ? "In use" : "Select"}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
