"use client";

import { useEffect, useState } from "react";
import type { FictionalStat } from "@/types";

interface Props {
  stats: FictionalStat[];
  /** Changing this re-triggers the animation (e.g. on regenerate). */
  runKey: number;
}

export default function StatBars({ stats, runKey }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const id = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(id);
  }, [runKey]);

  return (
    <div className="stats" role="list">
      {stats.map((s, i) => (
        <div className="stat" role="listitem" key={s.key}>
          <div className="stat__top">
            <span className="stat__label">
              <span aria-hidden="true">{s.emoji}</span> {s.label}
            </span>
            <span className="stat__value">{s.value}</span>
          </div>
          <div
            className="stat__track"
            role="progressbar"
            aria-valuenow={s.value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${s.label} (fictional entertainment stat)`}
          >
            <div
              className="stat__fill"
              style={{
                width: mounted ? `${s.value}%` : "0%",
                transitionDelay: `${i * 90}ms`,
              }}
            />
          </div>
          <p className="stat__blurb">{s.blurb}</p>
        </div>
      ))}
    </div>
  );
}
