"use client";

import { startTransition, useActionState, useRef } from "react";
import { addMedia, saveAlbum, type AdminState } from "@/app/actions/admin";

const submit = (action: (fd: FormData) => void) => (ev: React.FormEvent<HTMLFormElement>) => {
  ev.preventDefault();
  const fd = new FormData(ev.currentTarget);
  startTransition(() => action(fd));
};

export function AlbumForm({ album }: { album?: { id: string; title: string; description: string | null; sortOrder: number } }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveAlbum, {});
  return (
    <form className="adm-form" onSubmit={submit(action)}>
      {album && <input type="hidden" name="id" value={album.id} />}
      <div className={album ? "row3" : "row2"}>
        <label>
          Titre de l’album
          <input name="title" defaultValue={album?.title} placeholder="Ex. IFL 2026 · Finale" />
          {state.errors?.title && <span className="err">{state.errors.title}</span>}
        </label>
        <label>
          Description <small>facultatif</small>
          <input name="description" defaultValue={album?.description ?? ""} />
        </label>
        {album && (
          <label>
            Ordre d’affichage
            <input name="sortOrder" type="number" defaultValue={album.sortOrder} />
          </label>
        )}
      </div>
      {state.message && <p className={`adm-flash ${state.ok ? "ok" : "ko"}`}>{state.message}</p>}
      <div className="bar">
        <button className="btn btn-ink btn-sm" type="submit" disabled={pending}>
          {album ? "Enregistrer l’album" : "Créer l’album"}
        </button>
      </div>
    </form>
  );
}

export function AddMediaForm({ albumId }: { albumId: string }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(addMedia, {});
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      className="adm-form"
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => {
          action(fd);
          ref.current?.reset();
        });
      }}
    >
      <input type="hidden" name="albumId" value={albumId} />
      <div className="row2">
        <label>
          Photos <small>jusqu’à 10 à la fois, 5 Mo maximum chacune (JPG, PNG, WebP)</small>
          <input type="file" name="photos" accept="image/jpeg,image/png,image/webp,image/gif" multiple />
        </label>
        <label>
          Ou une vidéo YouTube <small>collez le lien de la vidéo</small>
          <input name="video" placeholder="https://www.youtube.com/watch?v=…" />
        </label>
      </div>
      <label>
        Légende <small>facultatif ; sinon le nom du fichier est utilisé, modifiable ensuite</small>
        <input name="caption" maxLength={160} />
      </label>
      {state.message && <p className={`adm-flash ${state.ok ? "ok" : "ko"}`}>{state.message}</p>}
      <div className="bar">
        <button className="btn btn-gold btn-sm" type="submit" disabled={pending}>
          {pending ? "Envoi en cours…" : "Ajouter à l’album"}
        </button>
      </div>
    </form>
  );
}
