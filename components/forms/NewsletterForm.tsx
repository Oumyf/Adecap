"use client";

import { useActionState } from "react";
import { subscribe, type FormState } from "@/app/actions/public";

export function NewsletterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, { ok: false });
  return (
    <form className="news-l" action={action}>
      <label className="hp" htmlFor="nl-e">
        E-mail
      </label>
      <input id="nl-e" name="email" type="email" required placeholder="Recevoir l’agenda par e-mail" aria-describedby="nl-msg" />
      <button type="submit" disabled={pending}>
        {pending ? "…" : "S’inscrire"}
      </button>
      {state.message && (
        <p id="nl-msg" role="status" className="nl-msg">
          {state.message}
        </p>
      )}
    </form>
  );
}
