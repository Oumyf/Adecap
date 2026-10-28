// Informations institutionnelles et contenus éditoriaux stables du site.
// À ajuster ici si les coordonnées ou les textes changent.

export const SITE = {
  name: "ADECAP Entertainment",
  short: "ADECAP",
  tagline: "Plus qu’un événement, un impact.",
  url: process.env.SITE_URL || "https://www.adecapentertainment.com",
  email: "contact@adecapentertainment.com",
  phone: "+221 77 592 29 52",
  address: "Guédiawaye, Dakar, Sénégal",
  socials: [
    { label: "Facebook", handle: "@adecapentertainment", href: "https://www.facebook.com/adecapentertainment" },
    { label: "Instagram", handle: "@adecapentertainment", href: "https://www.instagram.com/adecapentertainment" },
    { label: "X", handle: "@adecapent", href: "https://x.com/adecapent" },
    { label: "Snapchat", handle: "@adecapent", href: "https://www.snapchat.com/add/adecapent" },
  ],
};

export const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/competitions", label: "Compétitions" },
  { href: "/a-propos", label: "À propos" },
  { href: "/programmes", label: "Programmes" },
  { href: "/partenariats", label: "Partenariats" },
  { href: "/actualites", label: "Actualités" },
  { href: "/mediatheque", label: "Médiathèque" },
  { href: "/contact", label: "Contact" },
];

export const PROGRAMS = [
  { slug: "tournois", t: "Tournois et compétitions", c: "Sport", ben: "Quartiers, universités, entreprises", zone: "Dakar, Guédiawaye, Pikine", st: "En cours", img: "/images/match.jpg", ex: "Organisation complète de compétitions de football : IFL, Tournoi des Élites, Super Coupes et ASL.", acts: ["Planification et homologation", "Arbitrage et sécurité", "Retransmission et billetterie"], res: "Cinq éditions de l’IFL depuis 2023." },
  { slug: "aufl", t: "Football universitaire · AUFL", c: "Sport", ben: "12 universités", zone: "National", st: "En préparation", ex: "Première édition de l’AUFL en mars 2027, aux côtés de l’African University Football League.", acts: ["Sélection des universités", "Phase nationale", "Ouverture continentale"], res: "12 universités prévues pour la première édition." },
  { slug: "culture", t: "Scènes et soirées culturelles", c: "Culture", ben: "Artistes émergents", zone: "Dakar", st: "Candidatures ouvertes", ex: "Concerts, soirées de gala et spectacles qui accompagnent nos événements sportifs.", acts: ["Programmation artistique", "Production technique", "Promotion"], res: "Une soirée de clôture par saison." },
  { slug: "talents", t: "Talents à suivre", c: "Jeunesse", ben: "Joueurs des compétitions ADECAP", zone: "Banlieue de Dakar", st: "En cours", img: "/images/amadou-diop-vignette.jpg", ex: "Repérer, accompagner et mettre en lumière les joueurs révélés par nos compétitions.", acts: ["Portraits et affiches", "Suivi individuel", "Mise en relation avec les clubs"], res: "Premier portrait publié en octobre 2026." },
  { slug: "studio", t: "ADECAP Studio", c: "Médias", ben: "Partenaires et athlètes", zone: "Tous nos événements", st: "Permanent", img: "/images/tribunes.jpg", ex: "Photo, vidéo et contenus sociaux pour chaque événement et ses partenaires.", acts: ["Couverture photo et vidéo", "Résumés et interviews", "Contenus réseaux sociaux"], res: "Couverture systématique de nos événements." },
  { slug: "marques", t: "Activation de marques", c: "Partenariats", ben: "Sponsors et institutions", zone: "National", st: "En préparation", ex: "Des dispositifs de visibilité et d’engagement auprès d’un public jeune.", acts: ["Plans de visibilité terrain", "Contenus co-produits", "Bilan d’impact"], res: "Offre partenaires 2027 en cours de finalisation." },
  { slug: "entreprises", t: "Compétitions d’entreprises · CFL", c: "Partenariats", ben: "16 entreprises", zone: "Dakar", st: "En préparation", ex: "La CFL ouvre les compétitions ADECAP au monde de l’entreprise en avril 2027.", acts: ["Inscription des entreprises", "Calendrier de la compétition", "Événement de clôture"], res: "16 entreprises prévues." },
];

export const MEDIA = [
  { t: "L’intensité du terrain", al: "Compétitions", img: "/images/match.jpg", wide: true },
  { t: "Les tribunes en fête", al: "Compétitions", img: "/images/tribunes.jpg" },
  { t: "Des moments qui comptent", al: "Partenariats", img: "/images/ceremonie.jpg" },
  { t: "Talent à suivre : Amadou Diop", al: "Talents à suivre", img: "/images/affiche-amadou-diop.jpg", tall: true },
  { t: "Amadou Diop, milieu de terrain", al: "Talents à suivre", img: "/images/amadou-diop-portrait.jpg" },
];

export const TEAM = ["Direction générale", "Communication", "Pôle sport", "Pôle culture", "Pôle jeunesse", "ADECAP Studio"];

export const REGIONS = ["Dakar", "Diourbel", "Fatick", "Kaffrine", "Kaolack", "Kédougou", "Kolda", "Louga", "Matam", "Saint-Louis", "Sédhiou", "Tambacounda", "Thiès", "Ziguinchor"];
