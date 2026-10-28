"use client";

import { useActionState, useState } from "react";
import { createAlert, type FormState } from "@/app/actions/public";

const BELL = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 11V7a4 4 0 0 1 8 0v4l1.2 1.5H2.8zM6.5 14h3" />
  </svg>
);

/** « Me prévenir » : enregistre un e-mail ou un numéro WhatsApp pour une compétition. */
export function RemindButton({ competitionId, name }: { competitionId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(createAlert, { ok: false });

  if (state.ok)
    return (
      <span className="remind on" role="status">
        {BELL}Alerte activée
      </span>
    );
  if (!open)
    return (
      <button className="remind" type="button" onClick={() => setOpen(true)} aria-label={`Me prévenir pour ${name}`}>
        {BELL}Me prévenir
      </button>
    );
  return (
    <form className="remind-f" action={action}>
      <input type="hidden" name="competitionId" value={competitionId} />
      <label className="hp" htmlFor={`al-${competitionId}`}>
        E-mail ou WhatsApp
      </label>
      <input id={`al-${competitionId}`} name="contact" placeholder="E-mail ou WhatsApp" required autoFocus />
      <button type="submit" disabled={pending}>
        OK
      </button>
      {state.message && <small role="alert">{state.message}</small>}
    </form>
  );
}
