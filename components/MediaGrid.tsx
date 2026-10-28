"use client";

import { useEffect, useState } from "react";

type Item = { id: string; kind: "image" | "video"; url: string; t: string; al: string };
const thumb = (m: Item) => (m.kind === "video" ? `https://i.ytimg.com/vi/${m.url}/hqdefault.jpg` : m.url);

export function MediaGrid({ items, albums }: { items: Item[]; albums: { title: string; description: string | null }[] }) {
  const [album, setAlbum] = useState("Tous");
  const [idx, setIdx] = useState<number | null>(null);
  const list = items.filter((m) => album === "Tous" || m.al === album);
  const desc = albums.find((a) => a.title === album)?.description;

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
        {["Tous", ...albums.map((a) => a.title)].map((a) => (
          <button key={a} className="fchip" type="button" aria-pressed={a === album} onClick={() => setAlbum(a)}>
            {a}
          </button>
        ))}
      </div>
      {desc && <p className="album-desc">{desc}</p>}
      <div className="media-grid">
        {list.map((m, i) => (
          <button key={m.id} className={`m${i === 0 && album === "Tous" ? " wide" : ""}`} type="button" onClick={() => setIdx(i)} aria-label={m.kind === "video" ? `Vidéo : ${m.t}` : m.t}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb(m)} alt="" loading="lazy" style={{ objectPosition: "50% 25%" }} />
            {m.kind === "video" && (
              <span className="play-ic" aria-hidden="true">
                <i>
                  <svg width="18" height="18" viewBox="0 0 10 10">
                    <path d="M3 1.5l5 3.5-5 3.5z" fill="#0B1F45" />
                  </svg>
                </i>
              </span>
            )}
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
            <div className="frame" style={cur.kind === "video" ? { aspectRatio: "16/9" } : { aspectRatio: "auto", background: "transparent" }}>
              {cur.kind === "video" ? (
                <iframe src={`https://www.youtube-nocookie.com/embed/${cur.url}?autoplay=1&rel=0`} title={cur.t} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cur.url} alt={cur.t} style={{ objectFit: "contain", maxHeight: "75vh", width: "100%" }} />
              )}
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
