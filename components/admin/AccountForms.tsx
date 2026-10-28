"use client";

import { startTransition, useActionState } from "react";
import { changePassword, createUserAction, type AdminState } from "@/app/actions/admin";

export function NewUserForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(createUserAction, {});
  const e = state.errors || {};
  return (
    <form className="adm-form" onSubmit={(ev) => { ev.preventDefault(); const fd = new FormData(ev.currentTarget); startTransition(() => action(fd)); }}>
      <div className="row2">
        <label>
          Nom complet
          <input name="name" required />
          {e.name && <span className="err">{e.name}</span>}
        </label>
        <label>
          E-mail
          <input name="email" type="email" required />
          {e.email && <span className="err">{e.email}</span>}
        </label>
      </div>
      <div className="row2">
        <label>
          Rôle
          <select name="role" defaultValue="EDITOR">
            <option value="EDITOR">Éditeur</option>
            <option value="CONTRIBUTOR">Contributeur</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </label>
        <label>
          Mot de passe provisoire <small>10 caractères minimum</small>
          <input name="password" type="text" autoComplete="new-password" required minLength={10} />
          {e.password && <span className="err">{e.password}</span>}
        </label>
      </div>
      {state.message && <p className={`adm-flash ${state.ok ? "ok" : "ko"}`}>{state.message}</p>}
      <div className="bar">
        <button className="btn btn-ink btn-sm" type="submit" disabled={pending}>
          Créer le compte
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(changePassword, {});
  const e = state.errors || {};
  return (
    <form className="adm-form" onSubmit={(ev) => { ev.preventDefault(); const fd = new FormData(ev.currentTarget); startTransition(() => action(fd)); }}>
      <div className="row2">
        <label>
          Mot de passe actuel
          <input name="current" type="password" autoComplete="current-password" required />
          {e.current && <span className="err">{e.current}</span>}
        </label>
        <label>
          Nouveau mot de passe <small>10 caractères minimum</small>
          <input name="next" type="password" autoComplete="new-password" required minLength={10} />
          {e.next && <span className="err">{e.next}</span>}
        </label>
      </div>
      {state.message && <p className={`adm-flash ${state.ok ? "ok" : "ko"}`}>{state.message}</p>}
      <div className="bar">
        <button className="btn btn-ink btn-sm" type="submit" disabled={pending}>
          Changer le mot de passe
        </button>
      </div>
    </form>
  );
}
