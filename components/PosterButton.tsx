"use client";

import { useEffect, useRef, useState } from "react";

/** Ouvre une image (affiche) en plein écran, avec fermeture par Échap ou clic extérieur. */
export function PosterButton({ src, alt, className = "btn btn-line btn-sm", children }: { src: string; alt: string; className?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <>
      <button className={className} type="button" onClick={() => setOpen(true)}>
        {children}
      </button>
      {open && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal poster" role="dialog" aria-modal="true" aria-label={alt}>
            <button ref={closeRef} className="x-btn" type="button" aria-label="Fermer" onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} />
            <div className="lb-bar">
              <a className="btn btn-gold btn-sm" href={src} download>
                Télécharger l’affiche
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
