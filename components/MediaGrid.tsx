"use client";

import { useEffect, useState } from "react";

type Item = { t: string; al: string; img: string; wide?: boolean; tall?: boolean };

export function MediaGrid({ items }: { items: Item[] }) {
  const albums = ["Tous", ...new Set(items.map((m) => m.al))];
  const [album, setAlbum] = useState("Tous");
  const [idx, setIdx] = useState<number | null>(null);
  const list = items.filter((m) => album === "Tous" || m.al === album);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIdx(null);
      if (e.key === "ArrowRight") setIdx((i) => (i! + 1) % list.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i! - 1 + list.length) % list.length);
    };
    addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [idx, list.length]);

  const cur = idx !== null ? list[idx] : null;
  return (
    <div>
      <div className="filters" role="group" aria-label="Albums">
        {albums.map((a) => (
          <button key={a} className="fchip" type="button" aria-pressed={a === album} onClick={() => setAlbum(a)}>
            {a}
          </button>
        ))}
      </div>
      <div className="media-grid">
        {list.map((m, i) => (
          <button key={m.img} className={`m${m.wide ? " wide" : ""}`} type="button" onClick={() => setIdx(i)} aria-label={m.t}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.img} alt="" loading="lazy" style={m.tall ? { objectPosition: "50% 20%" } : undefined} />
            <span className="m-cap">
              <b>{m.t}</b>
              <span>{m.al}</span>
            </span>
          </button>
        ))}
      </div>
      {cur && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setIdx(null)}>
          <div className="modal lb" role="dialog" aria-modal="true" aria-label={cur.t}>
            <button className="x-btn" type="button" aria-label="Fermer" onClick={() => setIdx(null)} autoFocus>
              <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
            <div className="frame" style={cur.tall ? { aspectRatio: "auto", maxHeight: "75vh" } : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cur.img} alt={cur.t} style={cur.tall ? { objectFit: "contain", maxHeight: "75vh" } : undefined} />
            </div>
            <div className="lb-bar">
              <div>
                <b>{cur.t}</b>
                <div style={{ fontSize: ".72rem", color: "#B3BED6", marginTop: ".3rem", fontWeight: 600, letterSpacing: ".06em" }}>
                  {cur.al.toUpperCase()} · {idx! + 1} / {list.length}
                </div>
              </div>
              <div className="lb-nav">
                <button type="button" aria-label="Précédent" onClick={() => setIdx((idx! - 1 + list.length) % list.length)}>
                  ←
                </button>
                <button type="button" aria-label="Suivant" onClick={() => setIdx((idx! + 1) % list.length)}>
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
