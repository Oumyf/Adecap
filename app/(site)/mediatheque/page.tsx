import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { MediaGrid } from "@/components/MediaGrid";
import { PageHead } from "@/components/ui";
import { db, schema } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Médiathèque", description: "Photos et vidéos ADECAP Studio des compétitions, des talents à suivre et des événements ADECAP." };

export default async function Mediatheque() {
  const albums = await db.query.mediaAlbums.findMany({ orderBy: asc(schema.mediaAlbums.sortOrder), with: { items: { orderBy: asc(schema.mediaItems.sortOrder) } } });
  const items = albums.flatMap((a) => a.items.map((m) => ({ id: m.id, kind: m.kind, url: m.url, t: m.caption, al: a.title })));
  return (
    <>
      <PageHead crumb="Médiathèque" title="Médiathèque" lead="Photos, vidéos et affiches d’ADECAP Studio, classées par album, et ressources pour la presse et les partenaires." />
      <div className="sec">
        <div className="wrap" style={{ display: "grid", gap: "4rem" }}>
          {items.length ? <MediaGrid items={items} albums={albums.filter((a) => a.items.length).map((a) => ({ title: a.title, description: a.description }))} /> : <div className="empty">La médiathèque sera bientôt alimentée.</div>}
          <div>
            <div className="sec-head">
              <div>
                <p className="eyebrow">Espace presse</p>
                <h2>Ressources</h2>
                <span className="rule" />
              </div>
            </div>
            <div className="docs">
              <div className="doc">
                <div className="doc-ic">JPG</div>
                <div>
                  <b>Logo officiel ADECAP Entertainment</b>
                  <span>Image · version couleur sur fond blanc</span>
                </div>
                <a className="btn btn-line btn-sm" href="/images/logo-adecap-officiel.jpg" download>
                  Télécharger
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
