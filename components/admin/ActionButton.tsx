"use client";

import { useTransition } from "react";

/** Bouton qui déclenche une action serveur, avec confirmation optionnelle. */
export function ActionButton({ action, children, confirm: ask, className = "ib", disabled }: { action: () => Promise<void>; children: React.ReactNode; confirm?: string; className?: string; disabled?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={disabled || pending}
      onClick={() => {
        if (ask && !window.confirm(ask)) return;
        start(() => action());
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
