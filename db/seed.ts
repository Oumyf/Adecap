// Données initiales : compétitions 2023-2027, talent à suivre, articles et compte administrateur.
// Idempotent : n’écrase rien si les données existent déjà. Lancer avec : npm run db:seed
import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as s from "./schema";

const url = process.env.DATABASE_URL!;
const ssl = process.env.DATABASE_SSL === "true" || /sslmode=require|\.render\.com/.test(url);
const pool = new pg.Pool({ connectionString: url, ssl: ssl ? { rejectUnauthorized: false } : false });
const db = drizzle(pool, { schema: s });

const IFL26 = ["PERFORM", "ENO DAKAR", "ESUP", "EPT", "ISDB", "SAO Tchad", "UFR-UIDT", "LTCD", "UCAO", "ISI", "SJ-UNCHK", "ENO GUÉDIAWAYE", "SUP’INFO", "SUP de CO", "ESP", "FINAMA", "CEFAS", "ICAGI", "UNIPRO", "EHES", "EMIA", "ESMTIC", "TRAINMAR", "ISCOM", "ENSUP", "ESTG", "CEFER", "CFMPL"];

const COMPETITIONS: Array<Partial<typeof s.competitions.$inferInsert> & { slug: string; status: "PAST" | "ONGOING" | "UPCOMING" }> = [
  { slug: "ifl-2023", family: "IFL", name: "IFL", edition: "1ère édition", year: 2023, sortOrder: 1, status: "PAST", participants: 16, unit: "universités", winner: "ESP", about: "Première édition de l’IFL, avec 16 universités." },
  { slug: "tournoi-des-elites-2023", family: "Élites", name: "Tournoi des Élites", edition: "1ère édition", year: 2023, sortOrder: 2, status: "PAST", participants: 16, unit: "sélections de quartier", winner: "AJAX", about: "Première édition d’un tournoi réunissant des sélections de quartier, lancé en 2023.", teams: ["FC Mme Sougou", "Ngalakh Gui", "Ajax", "Young Boys", "Racing Club de Poste", "FC Rico", "Tapp Gui", "Jambars", "Thiayine Gui", "Sélection B.M.B", "FC Étoile", "Gunners", "Droit au But", "Dream Team", "Zing", "Sélection T.F.C"] },
  { slug: "ifl-2024", family: "IFL", name: "IFL", edition: "2e édition", year: 2024, sortOrder: 1, status: "PAST", participants: 24, unit: "universités annoncées", winner: "UCAO", about: "Deuxième édition de l’IFL, avec 24 universités annoncées." },
  { slug: "super-coupe-horizon-voyage-2024", family: "Super Coupe", name: "Super Coupe Horizon Voyage", edition: "Édition 2024", year: 2024, sortOrder: 2, status: "PAST", participants: 2, unit: "universités", winner: "UCAO", finalists: ["ESP", "UCAO"], discipline: "À compléter", about: "Une affiche entre deux universités, ESP et UCAO." },
  { slug: "ifl-2025", family: "IFL", name: "IFL", edition: "3e édition", year: 2025, sortOrder: 1, status: "PAST", participants: 24, unit: "universités annoncées", winner: "ENO DAKAR", about: "Troisième édition de l’IFL, avec 24 universités annoncées." },
  { slug: "finalissima-2025", family: "Super Coupe", name: "Finalissima", edition: "Édition 2025", year: 2025, sortOrder: 2, status: "PAST", participants: 2, unit: "universités", winner: "ENO DAKAR", finalists: ["ENO DAKAR", "UCAO"], discipline: "À compléter", about: "Une affiche entre deux universités, ENO DAKAR et UCAO." },
  { slug: "asl-tl221-2025", family: "ASL", name: "ASL TL221", edition: "1ère édition", year: 2025, sortOrder: 3, status: "PAST", participants: 8, unit: "équipes", winner: "REAL MADRID", about: "Compétition de 2025 réunissant 8 équipes, avec une identité propre au sein d’ADECAP.", teams: ["Manchester United", "FC Barcelone", "Chelsea", "Olympique de Marseille", "Real Madrid", "Arsenal", "Team Série A", "Paris"] },
  { slug: "ifl-2026", family: "IFL", name: "IFL", edition: "4e édition", year: 2026, sortOrder: 1, status: "PAST", participants: 28, unit: "universités", winner: null, about: "Quatrième édition de l’IFL, avec 28 universités.", teams: IFL26 },
  { slug: "ifl-2027", family: "IFL", name: "IFL", edition: "5e édition", year: 2027, sortOrder: 1, status: "ONGOING", phase: 0, unit: "universités", about: "La cinquième édition de l’IFL est en période de lancement." },
  { slug: "asl-2027", family: "ASL", name: "ASL", edition: "2e édition", year: 2027, sortOrder: 2, status: "ONGOING", phase: 0, unit: "équipes", about: "La deuxième édition de l’ASL est en période de lancement." },
  { slug: "tournoi-des-alumni-2027", family: "Alumni", name: "Tournoi des Alumni", edition: "Nouvelle compétition", year: 2027, month: "Janv.", sortOrder: 3, status: "UPCOMING", participants: 8, unit: "équipes", about: "Une nouvelle compétition, ouverte aux anciens." },
  { slug: "aufl-2027", family: "AUFL", name: "AUFL", edition: "1ère édition", year: 2027, month: "Mars", sortOrder: 4, status: "UPCOMING", participants: 12, unit: "universités", about: "Une nouvelle étape de développement, aux côtés de l’African University Football League." },
  { slug: "cfl-2027", family: "CFL", name: "CFL", edition: "1ère édition", year: 2027, month: "Avril", sortOrder: 5, status: "UPCOMING", participants: 16, unit: "entreprises", about: "Une ouverture d’ADECAP vers le monde de l’entreprise." },
];

const ARTICLES: Array<{ slug: string; title: string; category: string; publishedAt: string; author: string; coverUrl?: string; excerpt: string; body: string }> = [
  { slug: "2023-2027-histoire-de-nos-competitions", title: "2023 – 2027 : l’histoire de nos compétitions", category: "Compétitions", publishedAt: "2026-10-26", author: "Direction", coverUrl: "/images/ceremonie.jpg", excerpt: "Cinq éditions de l’IFL, des quartiers aux entreprises : quatre années de compétitions et trois nouveautés en 2027.", body: "Née en 2023 avec la première édition de l’IFL et le Tournoi des Élites, l’offre de compétitions d’ADECAP s’est consolidée en 2024, diversifiée en 2025 avec la Finalissima et l’ASL TL221, puis élargie en 2026 à 28 universités.\n\nEn 2027, trois nouvelles compétitions rejoignent le calendrier : le Tournoi des Alumni en janvier, la première édition de l’AUFL en mars et la CFL, ouverte aux entreprises, en avril." },
  { slug: "adecap-partenariat-african-university-football-league", title: "ADECAP signe un partenariat avec l’African University Football League", category: "Partenariats", publishedAt: "2026-10-12", author: "Communication", excerpt: "Les universités accompagnées par ADECAP se rapprochent du circuit continental, avec une première édition de l’AUFL en mars 2027.", body: "ADECAP Entertainment a signé un accord-cadre avec l’African University Football League. Il prévoit un cahier d’organisation commun et un accès aux programmes de formation de la ligue.\n\nLa première édition de l’AUFL réunira 12 universités en mars 2027." },
  { slug: "ifl-5e-edition-periode-de-lancement", title: "IFL : la 5e édition entre en période de lancement", category: "Compétitions", publishedAt: "2026-10-05", author: "Pôle sport", coverUrl: "/images/match.jpg", excerpt: "Après 28 universités engagées en 2026, l’IFL prépare sa cinquième édition. L’ASL lance aussi sa deuxième édition.", body: "La cinquième édition de l’IFL entre en période de lancement. La quatrième édition avait réuni 28 universités, contre 16 lors de la première en 2023.\n\nL’ASL, dont la première édition a été remportée par Real Madrid en 2025, prépare également sa deuxième édition. Le calendrier sera publié dans la rubrique Compétitions." },
  { slug: "retour-en-images-tribunes-en-fete", title: "Retour en images : des tribunes en fête", category: "ADECAP Studio", publishedAt: "2026-09-21", author: "ADECAP Studio", coverUrl: "/images/tribunes.jpg", excerpt: "Supporters, ambiance et temps forts de nos compétitions, vus par ADECAP Studio.", body: "L’album complet est disponible dans la médiathèque." },
  { slug: "soiree-culturelle-appel-aux-artistes", title: "Soirée culturelle de fin de saison : appel aux artistes", category: "Culture", publishedAt: "2026-09-08", author: "Pôle culture", excerpt: "Musiciens, danseurs et humoristes de Guédiawaye et de Dakar sont invités à candidater.", body: "La soirée réunira sportifs, artistes et partenaires autour d’un programme scénique ouvert aux talents locaux. Candidatures via le formulaire de contact." },
  { slug: "appel-a-benevoles", title: "Appel à bénévoles pour nos prochaines compétitions", category: "Vie associative", publishedAt: "2026-08-18", author: "Direction", excerpt: "Accueil, logistique, billetterie : rejoignez l’équipe d’organisation.", body: "Inscriptions ouvertes via le formulaire de contact, rubrique Bénévolat." },
];

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const [{ n: nUsers }] = await db.select({ n: count() }).from(s.users);
  if (email && password && nUsers === 0) {
    await db.insert(s.users).values({ email, name: process.env.ADMIN_NAME || "Administrateur ADECAP", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) });
    console.log(`Compte administrateur créé : ${email}`);
  } else if (nUsers === 0) {
    console.warn("Aucun compte : définissez ADMIN_EMAIL et ADMIN_PASSWORD puis relancez le seed.");
  }

  const [{ n: nComp }] = await db.select({ n: count() }).from(s.competitions);
  if (nComp === 0) {
    await db.insert(s.competitions).values(COMPETITIONS.map((c) => ({ finalists: [], teams: [], ...c }) as typeof s.competitions.$inferInsert));
    console.log(`${COMPETITIONS.length} compétitions créées.`);
  }

  const [{ n: nTal }] = await db.select({ n: count() }).from(s.talents);
  if (nTal === 0) {
    const [t] = await db.insert(s.talents).values({
      slug: "amadou-diop", firstName: "Amadou", lastName: "Diop", number: 5, position: "Milieu de terrain", school: "ESP", competition: "IFL", goal: "Ligue 1",
      hook: "Un produit de l’ESP prêt à conquérir la Ligue 1.",
      attributes: [
        { icon: "run", title: "Milieu de terrain", text: "Vision · Technique · Engagement" },
        { icon: "cap", title: "Produit de l’ESP", text: "Une formation, un tremplin" },
        { icon: "target", title: "Objectif Ligue 1", text: "Le travail aujourd’hui, les grandes scènes demain." },
      ],
      photoUrl: "/images/amadou-diop-portrait.jpg", thumbUrl: "/images/amadou-diop-vignette.jpg", posterUrl: "/images/affiche-amadou-diop.jpg",
    }).returning();
    await db.insert(s.articles).values({
      slug: "talent-a-suivre-amadou-diop", title: "Talent à suivre : Amadou Diop, un produit de l’ESP prêt pour la Ligue 1", category: "Talents à suivre", status: "PUBLISHED",
      publishedAt: new Date("2026-10-27T16:20:00Z"), author: "ADECAP Studio", coverUrl: "/images/amadou-diop-vignette.jpg", talentId: t.id,
      excerpt: "Milieu de terrain formé à l’ESP, il allie vision, technique et engagement. Son objectif : la Ligue 1.",
      body: "Il porte le numéro 5 et occupe le cœur du jeu. Amadou Diop, milieu de terrain formé à l’ESP, s’impose comme l’un des profils à suivre de l’IFL : un joueur complet, apprécié pour sa vision, sa technique et son engagement.\n\nSon parcours à l’ESP, première championne de l’IFL en 2023, a été pour lui une formation et un tremplin. Son objectif est désormais clair : franchir le cap de la Ligue 1.\n\nAvec la rubrique Talents à suivre, ADECAP met en lumière les joueurs révélés par ses compétitions. Le talent n’attend pas.",
    });
    console.log("Talent à suivre créé : Amadou Diop.");
  }

  for (const a of ARTICLES) {
    const exists = await db.query.articles.findFirst({ where: eq(s.articles.slug, a.slug) });
    if (!exists) await db.insert(s.articles).values({ ...a, status: "PUBLISHED", publishedAt: new Date(a.publishedAt + "T10:00:00Z") });
  }
  console.log("Données initiales vérifiées.");
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => pool.end());
