"use client";

import { startTransition, useActionState } from "react";
import { saveTalent, type AdminState } from "@/app/actions/admin";
import type { TalentAttribute } from "@/db/schema";

type T = {
  id: string; firstName: string; lastName: string; number: number | null; position: string; school: string; competition: string; goal: string;
  hook: string; slogan: string; signature: string; attributes: TalentAttribute[]; photoUrl: string; thumbUrl: string | null; posterUrl: string | null;
};

const DEFAULT_ATTRS: TalentAttribute[] = [
  { icon: "run", title: "", text: "" },
  { icon: "cap", title: "", text: "" },
  { icon: "target", title: "", text: "" },
];

function Img({ name, label, hint, url, err }: { name: string; label: string; hint: string; url?: string | null; err?: string }) {
  return (
    <label>
      {label} <small>{hint}</small>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url && <img className="adm-preview" src={url} alt="" style={{ maxHeight: 160, objectFit: "cover" }} />}
      <input type="file" name={name} accept="image/jpeg,image/png,image/webp" />
      {err && <span className="err">{err}</span>}
    </label>
  );
}

export function TalentForm({ t }: { t?: T }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveTalent, {});
  const e = state.errors || {};
  const attrs = [0, 1, 2].map((i) => t?.attributes[i] ?? DEFAULT_ATTRS[i]);
  return (
    <form
      className="adm-form adm-card"
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      {t && <input type="hidden" name="id" value={t.id} />}
      <fieldset>
        <legend>Le joueur</legend>
        <div className="row3">
          <label>
            Prénom
            <input name="firstName" defaultValue={t?.firstName} />
            {e.firstName && <span className="err">{e.firstName}</span>}
          </label>
          <label>
            Nom
            <input name="lastName" defaultValue={t?.lastName} />
            {e.lastName && <span className="err">{e.lastName}</span>}
          </label>
          <label>
            Numéro <small>facultatif</small>
            <input name="number" type="number" min={0} max={99} defaultValue={t?.number ?? ""} />
          </label>
        </div>
        <div className="row2">
          <label>
            Poste
            <input name="position" defaultValue={t?.position} placeholder="Ex. Milieu de terrain" />
            {e.position && <span className="err">{e.position}</span>}
          </label>
          <label>
            Formation / établissement
            <input name="school" defaultValue={t?.school} placeholder="Ex. ESP" />
            {e.school && <span className="err">{e.school}</span>}
          </label>
        </div>
        <div className="row2">
          <label>
            Compétition
            <input name="competition" defaultValue={t?.competition ?? "IFL"} />
          </label>
          <label>
            Objectif
            <input name="goal" defaultValue={t?.goal} placeholder="Ex. Ligue 1" />
            {e.goal && <span className="err">{e.goal}</span>}
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Textes de l’affiche</legend>
        <label>
          Accroche
          <input name="hook" defaultValue={t?.hook} placeholder="Ex. Un produit de l’ESP prêt à conquérir la Ligue 1." />
          {e.hook && <span className="err">{e.hook}</span>}
        </label>
        {attrs.map((a, i) => (
          <div className="row3" key={i}>
            <label>
              Atout {i + 1} : pictogramme
              <select name={`a${i}icon`} defaultValue={a.icon}>
                <option value="run">Joueur</option>
                <option value="cap">Formation</option>
                <option value="target">Objectif</option>
              </select>
            </label>
            <label>
              Titre
              <input name={`a${i}title`} defaultValue={a.title} placeholder={["Milieu de terrain", "Produit de l’ESP", "Objectif Ligue 1"][i]} />
            </label>
            <label>
              Détail
              <input name={`a${i}text`} defaultValue={a.text} placeholder={["Vision · Technique · Engagement", "Une formation, un tremplin", "Le travail aujourd’hui, les grandes scènes demain."][i]} />
            </label>
          </div>
        ))}
        <div className="row2">
          <label>
            Slogan
            <input name="slogan" defaultValue={t?.slogan ?? "Le talent n’attend pas !"} />
          </label>
          <label>
            Signature de la compétition
            <input name="signature" defaultValue={t?.signature ?? "Formé aujourd’hui, connecté demain"} />
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Images</legend>
        <div className="row3">
          <Img name="photo" label="Photo du joueur" hint="Verticale, le joueur centré." url={t?.photoUrl} err={e.photo} />
          <Img name="thumb" label="Vignette" hint="Paysage, pour les cartes d’actualité." url={t?.thumbUrl} err={e.thumb} />
          <Img name="poster" label="Affiche officielle" hint="L’affiche complète, téléchargeable." url={t?.posterUrl} err={e.poster} />
        </div>
      </fieldset>
      {!t && (
        <label style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
          <input type="checkbox" name="withArticle" defaultChecked /> Rédiger son portrait juste après (recommandé : le talent apparaît sur le site une fois son portrait publié)
        </label>
      )}
      {Object.keys(e).length > 0 && <p className="adm-flash ko">Corrigez les champs signalés.</p>}
      <div className="bar">
        <button className="btn btn-ink" type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <a className="btn btn-line btn-sm" href="/admin/talents">
          Annuler
        </a>
      </div>
    </form>
  );
}
