"use client";

import { useEffect, useMemo, useState } from "react";
import { monogramAvatar, searchPeople } from "@/lib/people";
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

  useEffect(() => {
    if (!open) setQuery("");
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

  const results = useMemo(() => searchPeople(query), [query]);

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
            placeholder="Search by name, role or region…"
            aria-label="Search public figures"
            autoFocus
          />
          {query && (
            <button type="button" className="icon-btn" onClick={() => setQuery("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        <div className="sheet__list">
          {results.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state__emoji" aria-hidden="true">🕵️</p>
              <p className="empty-state__title">No figures match “{query}”</p>
              <p className="empty-state__hint">Try a different name, role or region.</p>
              <button type="button" className="btn btn--ghost" onClick={() => setQuery("")}>
                Clear search
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
                  <img src={monogramAvatar(p, 96)} alt="" width={48} height={48} className="picker-row__avatar" />
                  <span className="picker-row__meta">
                    <span className="picker-row__name">{p.name}</span>
                    <span className="picker-row__sub">
                      {p.role} · {p.region}
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
