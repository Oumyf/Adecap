import Link from "next/link";
import { asc } from "drizzle-orm";
import { AlbumForm } from "@/components/admin/MediaForms";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { ytThumb } from "@/lib/format";

export const metadata = { title: "Médiathèque" };

export default async function AdminMedia() {
  await requireUser(["ADMIN", "EDITOR"]);
  const albums = await db.query.mediaAlbums.findMany({ orderBy: asc(schema.mediaAlbums.sortOrder), with: { items: { orderBy: asc(schema.mediaItems.sortOrder) } } });
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Médiathèque</h1>
          <p>Albums de photos et vidéos affichés sur la page Médiathèque du site.</p>
        </div>
        <a className="btn btn-line btn-sm" href="/mediatheque" target="_blank" rel="noreferrer">
          Voir sur le site
        </a>
      </div>
      <div className="adm-albums">
        {albums.map((a) => {
          const cover = a.items[0];
          return (
            <Link key={a.id} href={`/admin/mediatheque/${a.id}`} className="adm-album">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {cover ? <img src={cover.kind === "video" ? ytThumb(cover.url) : cover.url} alt="" /> : <span className="empty-cover">Album vide</span>}
              <div>
                <b>{a.title}</b>
                <small>
                  {a.items.length} média{a.items.length > 1 ? "s" : ""}
                </small>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="adm-card">
        <h2>Nouvel album</h2>
        <AlbumForm />
      </div>
    </>
  );
}
