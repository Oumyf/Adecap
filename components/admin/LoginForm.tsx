"use client";

import { startTransition, useActionState } from "react";
import { login, type AdminState } from "@/app/actions/admin";

export function LoginForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(login, {});
  return (
    <form className="adm-form" onSubmit={(ev) => { ev.preventDefault(); const fd = new FormData(ev.currentTarget); startTransition(() => action(fd)); }}>
      <label>
        E-mail
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Mot de passe
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.message && (
        <p className="adm-flash ko" role="alert">
          {state.message}
        </p>
      )}
      <button className="btn btn-ink" type="submit" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
