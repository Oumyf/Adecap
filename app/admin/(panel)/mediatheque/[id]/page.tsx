import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { deleteAlbum, deleteMedia, setAlbumCover, updateMediaCaption } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/ActionButton";
import { AddMediaForm, AlbumForm } from "@/components/admin/MediaForms";
import { can, requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { ytThumb } from "@/lib/format";

export const metadata = { title: "Album" };

export default async function AdminAlbum({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser(["ADMIN", "EDITOR"]);
  const { id } = await params;
  const album = await db.query.mediaAlbums.findFirst({ where: eq(schema.mediaAlbums.id, id), with: { items: { orderBy: asc(schema.mediaItems.sortOrder) } } });
  if (!album) notFound();
  return (
    <>
      <div className="adm-head">
        <div>
          <p>
            <Link href="/admin/mediatheque">← Médiathèque</Link>
          </p>
          <h1>{album.title}</h1>
        </div>
        {can.delete(u.role) && (
          <ActionButton className="ib danger" action={deleteAlbum.bind(null, album.id)} confirm={`Supprimer l’album « ${album.title} » et ses ${album.items.length} médias ?`}>
            Supprimer l’album
          </ActionButton>
        )}
      </div>
      <div className="adm-card">
        <h2>Ajouter des photos ou une vidéo</h2>
        <AddMediaForm albumId={album.id} />
      </div>
      <div className="adm-card">
        <h2>
          Contenu de l’album ({album.items.length}) <small className="muted" style={{ fontWeight: 500, fontSize: ".8rem" }}>la première image sert de couverture</small>
        </h2>
        <div className="adm-media">
          {album.items.map((m, i) => (
            <div key={m.id} className="adm-media-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.kind === "video" ? ytThumb(m.url) : m.url} alt="" />
              {m.kind === "video" && <span className="tag adm-vid">Vidéo</span>}
              <form action={updateMediaCaption} className="quick">
                <input type="hidden" name="id" value={m.id} />
                <input name="caption" defaultValue={m.caption} className="cfield" aria-label="Légende" style={{ flex: 1 }} />
                <button className="ib" type="submit">
                  OK
                </button>
              </form>
              <div className="acts" style={{ justifyContent: "flex-start" }}>
                {i > 0 && <ActionButton action={setAlbumCover.bind(null, m.id)}>Mettre en couverture</ActionButton>}
                <ActionButton className="ib danger" action={deleteMedia.bind(null, m.id)} confirm="Retirer ce média de l’album ?">
                  Retirer
                </ActionButton>
              </div>
            </div>
          ))}
          {!album.items.length && <p className="muted">Album vide : ajoutez des photos ci-dessus.</p>}
        </div>
      </div>
      <div className="adm-card">
        <h2>Paramètres de l’album</h2>
        <AlbumForm album={album} />
      </div>
    </>
  );
}
