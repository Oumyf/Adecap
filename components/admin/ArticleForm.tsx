"use client";

import { startTransition, useActionState } from "react";
import { saveArticle, type AdminState } from "@/app/actions/admin";
import { CATEGORIES } from "@/lib/format";

type A = { id: string; title: string; category: string; excerpt: string; body: string; status: string; publishedAt: string; author: string; coverUrl: string | null; talentId: string | null; slug: string };

export function ArticleForm({ a, talents, canPublish, defaultTalent }: { a?: A; talents: { id: string; name: string }[]; canPublish: boolean; defaultTalent?: string }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveArticle, {});
  const e = state.errors || {};
  const talentId = a?.talentId ?? defaultTalent ?? "";
  return (
    <form
      className="adm-form adm-card"
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      {a && <input type="hidden" name="id" value={a.id} />}
      <label>
        Titre
        <input name="title" defaultValue={a?.title} required maxLength={200} />
        {e.title && <span className="err">{e.title}</span>}
      </label>
      <div className="row3">
        <label>
          Catégorie
          <select name="category" defaultValue={a?.category ?? (talentId ? "Talents à suivre" : "Compétitions")}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Statut
          <select name="status" defaultValue={a?.status ?? (canPublish ? "PUBLISHED" : "DRAFT")} disabled={!canPublish}>
            <option value="DRAFT">Brouillon</option>
            {canPublish && (
              <>
                <option value="SCHEDULED">Programmé</option>
                <option value="PUBLISHED">Publié</option>
                <option value="ARCHIVED">Archivé</option>
              </>
            )}
          </select>
        </label>
        <label>
          Date de publication
          <input type="datetime-local" name="publishedAt" defaultValue={a?.publishedAt} />
          {e.publishedAt && <span className="err">{e.publishedAt}</span>}
        </label>
      </div>
      <label>
        Chapeau <small>Une ou deux phrases affichées sur les cartes et en tête d’article.</small>
        <input name="excerpt" defaultValue={a?.excerpt} maxLength={400} />
        {e.excerpt && <span className="err">{e.excerpt}</span>}
      </label>
      <label>
        Texte <small>Séparez les paragraphes par une ligne vide.</small>
        <textarea name="body" defaultValue={a?.body} rows={12} />
        {e.body && <span className="err">{e.body}</span>}
      </label>
      <div className="row2">
        <label>
          Talent à suivre associé <small>Pour un portrait : la fiche du joueur s’affiche dans l’article et dans la rubrique.</small>
          <select name="talentId" defaultValue={talentId}>
            <option value="">Aucun</option>
            {talents.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {e.talentId && <span className="err">{e.talentId}</span>}
        </label>
        <label>
          Auteur
          <input name="author" defaultValue={a?.author} placeholder="Ex. ADECAP Studio" />
        </label>
      </div>
      <fieldset>
        <legend>Image de couverture</legend>
        {a?.coverUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="adm-preview" src={a.coverUrl} alt="" />
            <label style={{ display: "flex", gap: ".5rem", alignItems: "center", fontWeight: 600 }}>
              <input type="checkbox" name="removeCover" /> Retirer l’image actuelle
            </label>
          </>
        )}
        <label>
          {a?.coverUrl ? "Remplacer par" : "Ajouter une image"} <small>JPG, PNG ou WebP, 5 Mo maximum. Format paysage conseillé.</small>
          <input type="file" name="cover" accept="image/jpeg,image/png,image/webp,image/gif" />
          {e.cover && <span className="err">{e.cover}</span>}
        </label>
      </fieldset>
      {state.message && <p className="adm-flash ko">{state.message}</p>}
      {Object.keys(e).length > 0 && <p className="adm-flash ko">Corrigez les champs signalés.</p>}
      <div className="bar">
        <button className="btn btn-ink" type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <a className="btn btn-line btn-sm" href="/admin/articles">
          Annuler
        </a>
        {a?.status === "PUBLISHED" && (
          <a className="btn btn-line btn-sm" href={`/actualites/${a.slug}`} target="_blank" rel="noreferrer">
            Voir sur le site
          </a>
        )}
      </div>
    </form>
  );
}
