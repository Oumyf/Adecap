import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsCard } from "@/components/content";
import { PosterButton } from "@/components/PosterButton";
import { ShareButtons } from "@/components/ShareButtons";
import { Attributes } from "@/components/ui";
import { fmtDate, paragraphs } from "@/lib/format";
import { getArticle, listNews } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await getArticle((await params).slug);
  if (!a) return {};
  return { title: a.title, description: a.excerpt, openGraph: { title: a.title, description: a.excerpt, type: "article", images: a.coverUrl ? [a.coverUrl] : undefined } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticle((await params).slug);
  if (!a) notFound();
  const t = a.talent;
  const related = (await listNews({ category: a.category, limit: 4 })).filter((x) => x.id !== a.id).slice(0, 3);

  return (
    <>
      <div className="band phead diag">
        <div className="wrap">
          <p className="crumbs">
            <Link href="/">Accueil</Link> / <Link href="/actualites">Actualités</Link> / {a.category}
          </p>
          <p className="eyebrow">
            {a.category} · {fmtDate(a.publishedAt)} · Par {a.author}
          </p>
          <h1 className="art-title">{a.title}</h1>
          <p className="lead">{a.excerpt}</p>
        </div>
      </div>
      <div className="sec">
        <div className={`wrap article${t ? " with-talent" : ""}`}>
          {t ? (
            <figure className="art-photo talent-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.photoUrl} alt={`${t.firstName} ${t.lastName}, ${t.position.toLowerCase()}`} />
              {t.posterUrl && (
                <PosterButton src={t.posterUrl} alt={`Affiche « Talent à suivre » : ${t.firstName} ${t.lastName}`} className="btn btn-gold btn-sm poster-btn">
                  Voir l’affiche officielle
                </PosterButton>
              )}
            </figure>
          ) : (
            a.coverUrl && (
              <figure className="art-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.coverUrl} alt="" />
              </figure>
            )
          )}
          <div className="prose">
            {paragraphs(a.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {t && (
              <>
                <div className="talent-box">
                  <span className="brush">
                    <span>Talent à suivre</span>
                  </span>
                  <Attributes items={t.attributes} />
                  <dl className="facts">
                    <div>
                      <dt>Poste</dt>
                      <dd>{t.position}</dd>
                    </div>
                    <div>
                      <dt>Formation</dt>
                      <dd>{t.school}</dd>
                    </div>
                    <div>
                      <dt>Compétition</dt>
                      <dd>{t.competition}</dd>
                    </div>
                    <div>
                      <dt>Objectif</dt>
                      <dd>{t.goal}</dd>
                    </div>
                  </dl>
                </div>
              </>
            )}
            {a.category === "Compétitions" && (
              <p>
                <Link className="btn btn-ink btn-sm" href="/competitions?onglet=historique">
                  Voir l’historique et le palmarès
                </Link>
              </p>
            )}
            <ShareButtons title={a.title} />
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="eyebrow">{a.category}</p>
                <h2>À lire aussi</h2>
                <span className="rule" />
              </div>
              <Link className="link-arrow" href="/actualites">
                Toutes les actualités →
              </Link>
            </div>
            <div className="grid3">
              {related.map((r) => (
                <NewsCard key={r.id} a={r} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
