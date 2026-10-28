"use client";

import { startTransition, useActionState } from "react";
import { saveCompetition, type AdminState } from "@/app/actions/admin";
import type { Competition } from "@/db/schema";
import { COMP_STATUS, PHASES } from "@/lib/format";

export function CompetitionForm({ c }: { c?: Competition }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveCompetition, {});
  const e = state.errors || {};
  return (
    <form
      className="adm-form adm-card"
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="row3">
        <label>
          Nom
          <input name="name" defaultValue={c?.name} placeholder="Ex. IFL" />
          {e.name && <span className="err">{e.name}</span>}
        </label>
        <label>
          Famille <small>regroupe les éditions (IFL, ASL…)</small>
          <input name="family" defaultValue={c?.family} placeholder="Ex. IFL" />
          {e.family && <span className="err">{e.family}</span>}
        </label>
        <label>
          Édition
          <input name="edition" defaultValue={c?.edition} placeholder="Ex. 5e édition" />
          {e.edition && <span className="err">{e.edition}</span>}
        </label>
      </div>
      <div className="row3">
        <label>
          Année
          <input name="year" type="number" defaultValue={c?.year ?? new Date().getFullYear()} />
          {e.year && <span className="err">{e.year}</span>}
        </label>
        <label>
          Mois <small>pour les compétitions à venir</small>
          <input name="month" defaultValue={c?.month ?? ""} placeholder="Ex. Mars" />
        </label>
        <label>
          Ordre dans l’année
          <input name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} />
        </label>
      </div>
      <div className="row3">
        <label>
          Statut
          <select name="status" defaultValue={c?.status ?? "UPCOMING"}>
            {Object.entries(COMP_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          Avancement <small>si en cours</small>
          <select name="phase" defaultValue={c?.phase ?? 0}>
            {PHASES.map((p, i) => (
              <option key={p} value={i}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label>
          Vainqueur
          <input name="winner" defaultValue={c?.winner ?? ""} placeholder="À déterminer" />
        </label>
      </div>
      <div className="row3">
        <label>
          Nombre de participants
          <input name="participants" type="number" defaultValue={c?.participants ?? ""} />
        </label>
        <label>
          Unité
          <input name="unit" defaultValue={c?.unit ?? "équipes"} placeholder="universités, équipes…" />
        </label>
        <label>
          Discipline
          <input name="discipline" defaultValue={c?.discipline ?? "Football"} />
        </label>
      </div>
      <label>
        Lieu
        <input name="venue" defaultValue={c?.venue ?? ""} placeholder="À compléter" />
      </label>
      <label>
        Description
        <textarea name="about" defaultValue={c?.about} rows={3} style={{ minHeight: 90 }} />
        {e.about && <span className="err">{e.about}</span>}
      </label>
      <div className="row2">
        <label>
          Finalistes <small>pour une finale : deux noms, un par ligne</small>
          <textarea name="finalists" defaultValue={c?.finalists.join("\n")} rows={2} style={{ minHeight: 70 }} />
        </label>
        <label>
          Participants <small>un nom par ligne</small>
          <textarea name="teams" defaultValue={c?.teams.join("\n")} rows={8} />
        </label>
      </div>
      {Object.keys(e).length > 0 && <p className="adm-flash ko">Corrigez les champs signalés.</p>}
      <div className="bar">
        <button className="btn btn-ink" type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <a className="btn btn-line btn-sm" href="/admin/competitions">
          Annuler
        </a>
      </div>
    </form>
  );
}
