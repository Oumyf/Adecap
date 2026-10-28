import Link from "next/link";

export default function NotFound() {
  return (
    <main className="nf">
      <div className="band phead diag" style={{ minHeight: "100vh", display: "grid", alignItems: "center" }}>
        <div className="wrap">
          <p className="eyebrow">Erreur 404</p>
          <h1>Page introuvable</h1>
          <p className="lead">Cette page n’existe pas ou a été déplacée.</p>
          <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap" }}>
            <Link className="btn btn-gold" href="/">
              Retour à l’accueil
            </Link>
            <Link className="btn btn-line" href="/competitions">
              Voir les compétitions
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
