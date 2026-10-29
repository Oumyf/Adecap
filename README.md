# ADECAP Entertainment · site officiel

Site institutionnel d’ADECAP Entertainment : compétitions 2023-2027, actualités et talents à suivre, inscriptions des établissements et des étudiants, formulaire de contact et back-office pour l’équipe.

- **Technologies :** Next.js 16 (App Router), React 19, TypeScript, PostgreSQL, Drizzle ORM.
- **Hébergement :** Render (fichier `render.yaml`) ou o2switch en cPanel, voir [DEPLOIEMENT-O2SWITCH.md](DEPLOIEMENT-O2SWITCH.md).
- **Médias :** dans la base de données par défaut, ou sur un stockage cloud compatible S3 (Cloudflare R2 conseillé) dès que les variables `S3_*` sont définies.

## Ce que fait le site

**Partie publique**
- **Accueil :** saison en cours avec l’avancement des compétitions, compétitions à venir, derniers champions, évolution de l’IFL, talent à suivre du moment et dernières actualités.
- **Compétitions :** à venir (avec alerte « Me prévenir »), palmarès, historique 2023-2027, page dédiée à l’IFL, et une fiche détaillée par édition.
- **Actualités :** barre de recherche en haut de page, qui trouve articles et talents par nom, poste ou école. Filtres par catégorie et mise en avant du talent à suivre, avec son affiche officielle.
- **Inscriptions en ligne :**
  - établissements : 4 étapes avec récapitulatif ;
  - élèves et étudiants : 3 étapes, avec autorisation parentale obligatoire avant 18 ans.
- **Autres pages :** contact, à propos, programmes, partenariats, médiathèque, mentions légales et confidentialité.
- **Confort :** thème clair et sombre, plan du site et robots.txt pour le référencement.

**Back-office (`/admin`)**
- Connexion sécurisée et trois rôles :
  - **Administrateur :** tout, y compris les comptes et les suppressions.
  - **Éditeur :** publie, et gère compétitions, talents et inscriptions.
  - **Contributeur :** rédige des brouillons.
- **Actualités :** brouillon, programmé (mise en ligne automatique à la date choisie), publié, archivé. Image de couverture téléversée.
- **Talents à suivre :**
  - fiche du joueur reprenant les textes de l’affiche ;
  - photo, vignette et affiche téléversées ;
  - le portrait est rédigé juste après la création de la fiche.
- **Compétitions :** mise à jour rapide du statut, de l’avancement et du vainqueur depuis la liste, ou fiche complète.
- **Inscriptions :** validation des établissements, liste des élèves et export CSV compatible Excel.
- **Demandes et abonnés :** demandes de contact (à traiter / traitée), abonnés à l’agenda, alertes de compétitions, et export CSV de chaque liste.
- **Médiathèque :** albums, envoi de 10 photos à la fois, vidéos YouTube par simple lien, légendes et image de couverture.
- **Journal d’activité :** trace chaque opération.

Les images téléversées vont sur le stockage cloud s’il est configuré, sinon dans la base de données ; dans les deux cas elles survivent aux redéploiements. `npm run db:images-to-cloud` transfère les images de la base vers le cloud ; `npm run db:export` / `db:import` transfèrent toutes les données d’une base à une autre.

## Lancer le site en local

Prérequis : Node.js 20 ou plus, et PostgreSQL.

```bash
npm install
cp .env.example .env          # puis renseigner DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:migrate            # crée les tables
npm run db:seed               # compétitions, talent Amadou Diop, articles et compte administrateur
npm run dev                   # http://localhost:3000, back-office sur /admin
```

Pour générer un `SESSION_SECRET` : `openssl rand -hex 32`.

## Mettre en ligne sur Render

1. Sur [render.com](https://render.com), choisir **New → Blueprint**, puis sélectionner ce dépôt GitHub.
2. Render lit `render.yaml` et crée deux éléments :
   - le service web `adecap-site` ;
   - la base PostgreSQL `adecap-db`.
3. Renseigner les variables demandées :
   - `ADMIN_EMAIL` et `ADMIN_PASSWORD` : premier compte administrateur, 10 caractères minimum ;
   - `SITE_URL` : par exemple `https://adecap-site.onrender.com`, puis le nom de domaine définitif.
4. Valider. Au démarrage, le site applique les migrations et les données initiales, puis se lance. Les relances suivantes ne réécrivent rien.
5. Se connecter sur `https://<adresse>/admin`.

**Offre gratuite de Render :**
- le service web se met en veille après 15 minutes sans visite, et le réveil prend environ une minute ;
- la base gratuite expire **30 jours** après sa création.

Pour un site en production, passer :
- le service web en `starter` ;
- la base en `basic-256mb`, avant l’expiration.

**Nom de domaine :** dans Render, ouvrir le service, puis **Settings → Custom Domains**. Ajouter par exemple `www.adecapentertainment.com`, puis mettre à jour `SITE_URL`.

## Organisation du code

```
app/(site)/        pages publiques
app/admin/         back-office (connexion, tableau de bord, gestion)
app/actions/       actions serveur (formulaires publics et administration)
components/        composants d’interface
db/schema.ts       schéma de la base
db/migrations/     migrations SQL (générées par `npm run db:generate` après modification du schéma)
db/seed.ts         données initiales
lib/               accès aux données, authentification, textes institutionnels (lib/site.ts)
public/images/     logo, photos ADECAP Studio, affiche et photos d’Amadou Diop
```

Les coordonnées, réseaux sociaux et programmes se modifient dans `lib/site.ts`.

## Contenus de l’équipe

L’équipe dépose photos et affiches dans le dossier Google Drive « ADECAP – Site » (sous-dossiers Compétitions, Talents à suivre, Médiathèque, Partenaires et logos), puis les ajoute au site depuis l’administration. Le site garde sa propre copie de chaque image.

## À compléter par ADECAP

- **Compétitions :** lieux et photos de chaque édition, et confirmation des données.
- **Talent Amadou Diop :** âge et club actuel.
- **Équipe dirigeante :** noms et portraits.
- **Mentions légales :** forme juridique, directeur de publication et immatriculation.
- **Réseaux sociaux :** confirmer les adresses dans `lib/site.ts`. Elles viennent des maquettes de la charte.
