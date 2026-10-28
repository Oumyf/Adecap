"use client";

import { startTransition, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { sendContact, type FormState } from "@/app/actions/public";

const TYPES = ["Contact", "Partenariat", "Presse", "Bénévolat"];

export function ContactForm() {
  const params = useSearchParams();
  const initialType = TYPES.includes(params.get("objet") || "") ? params.get("objet")! : "Contact";
  const [state, action, pending] = useActionState<FormState, FormData>(sendContact, { ok: false });
  const [dismissed, setDismissed] = useState<string | undefined>();
  const e = state.errors || {};

  if (state.ok && state.message !== dismissed)
    return (
      <div className="form sent">
        <div className="ok-ic">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path d="M5 12l5 5 9-10" />
          </svg>
        </div>
        <h3 style={{ fontSize: "1.6rem" }}>Demande enregistrée</h3>
        <p className="muted" style={{ maxWidth: "44ch" }}>
          Votre message a été transmis à l’équipe ADECAP. Conservez votre référence pour tout échange.
        </p>
        <span className="ref">{state.message}</span>
        <button className="btn btn-line btn-sm" type="button" onClick={() => setDismissed(state.message)}>
          Nouvelle demande
        </button>
      </div>
    );

  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} noValidate key={dismissed}>
      <div className="field">
        <span className="lbl">Objet de la demande</span>
        <div className="types" role="radiogroup" aria-label="Objet de la demande">
          {TYPES.map((t) => (
            <label key={t}>
              <input type="radio" name="type" value={t} defaultChecked={t === initialType} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="row2">
        <Field id="c-name" label="Nom complet" error={e.name}>
          <input id="c-name" name="name" autoComplete="name" defaultValue="" />
        </Field>
        <Field id="c-org" label={<>Organisation <i>(facultatif)</i></>}>
          <input id="c-org" name="organization" autoComplete="organization" />
        </Field>
      </div>
      <div className="row2">
        <Field id="c-email" label="E-mail" error={e.email}>
          <input id="c-email" name="email" type="email" autoComplete="email" />
        </Field>
        <Field id="c-tel" label={<>Téléphone <i>(facultatif)</i></>}>
          <input id="c-tel" name="phone" type="tel" autoComplete="tel" />
        </Field>
      </div>
      <Field id="c-msg" label="Message" error={e.message}>
        <textarea id="c-msg" name="message" />
      </Field>
      <div className="hp" aria-hidden="true">
        <label htmlFor="c-web">Site web</label>
        <input id="c-web" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={`field${e.consent ? " bad" : ""}`}>
        <label className="check">
          <input type="checkbox" name="consent" />
          <span>J’accepte que mes données soient utilisées uniquement pour traiter ma demande, conformément à la politique de confidentialité.</span>
        </label>
        <span className="err">{e.consent}</span>
      </div>
      {state.message && !state.ok && <p className="form-msg" role="alert">{state.message}</p>}
      <div>
        <button className="btn btn-ink" type="submit" disabled={pending}>
          {pending ? "Envoi…" : "Envoyer la demande"}
        </button>
      </div>
    </form>
  );
}

export function Field({ id, label, error, children, hidden }: { id: string; label: React.ReactNode; error?: string; children: React.ReactNode; hidden?: boolean }) {
  return (
    <div className={`field${error ? " bad" : ""}`} hidden={hidden}>
      <label htmlFor={id}>{label}</label>
      {children}
      <span className="err" role={error ? "alert" : undefined}>
        {error}
      </span>
    </div>
  );
}
