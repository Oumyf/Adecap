# Déployer le site ADECAP sur o2switch

Ce guide met le site en ligne sur un hébergement **o2switch** (offre Cloud, cPanel), avec les médias sur **Cloudflare R2**. Le site garde la même base PostgreSQL et le même code que sur Render : seul l’hébergement change.

Ce qu’il faut avant de commencer :

- **Hébergement :** un abonnement o2switch Cloud, qui comprend 8 Lunes, c’est-à-dire 8 espaces isolés, un par client.
- **Adresse du site :** un nom de domaine ou un sous-domaine. Par exemple le domaine d’ADECAP, ou en attendant `adecap.<ton-domaine>`.
- **Médias :** un compte Cloudflare, gratuit jusqu’à 10 Go de médias.
- **Données existantes :** l’adresse externe de la base Render, pour transférer les données déjà en ligne.

## 1. Créer l’espace ADECAP sur o2switch

1. Dans l’espace client o2switch, créer une **Lune** dédiée à ADECAP, puis ouvrir son cPanel.
2. **Domaines :** ajouter le domaine ou le sous-domaine du site. Le certificat HTTPS est automatique, sous AutoSSL, en quelques minutes.

## 2. Créer la base PostgreSQL

1. Dans cPanel, ouvrir **Bases de données PostgreSQL**.
2. Créer une base, par exemple `adecap`, et un utilisateur avec un mot de passe fort.
3. Donner à l’utilisateur tous les droits sur la base.
4. Noter l’adresse de connexion. cPanel préfixe les noms par l’identifiant du compte :

```
postgresql://<compte>_adecap:<mot de passe>@localhost:5432/<compte>_adecap
```

Si le mot de passe contient des caractères spéciaux (`@`, `:`, `/`, `#`), les encoder dans l’adresse, ou choisir un mot de passe fait de lettres et de chiffres.

## 3. Créer l’application Node.js

1. Dans cPanel, ouvrir **Setup Node.js App**, puis **Create Application**.
2. Remplir les champs :
   - **Node.js version :** la plus récente proposée, 20.9 au minimum, 22 de préférence ;
   - **Application mode :** Production ;
   - **Application root :** `adecap-app` ;
   - **Application URL :** le domaine du site ;
   - **Application startup file :** `app.js`.
3. **Environment variables :** ajouter les variables du fichier `deploy/o2switch/env.example`, au minimum `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` et `SITE_URL`. Autre possibilité : déposer un fichier `.env` dans `adecap-app`, que `app.js` lit au démarrage.
4. Enregistrer avec **Create**.

Pour générer `SESSION_SECRET`, ouvrir cPanel > **Terminal** et taper `openssl rand -hex 32`.

## 4. Déposer le site

Le paquet prêt à déposer est fabriqué par GitHub à chaque mise à jour de la branche `main` (onglet **Actions**, workflow « Paquet o2switch »).

**Mise à jour automatique, recommandée.**

1. Dans cPanel, ouvrir **Comptes FTP** et créer un compte limité au dossier `adecap-app`.
2. Dans GitHub, ouvrir le dépôt, puis **Settings > Secrets and variables > Actions**, et créer ces secrets :

| Secret | Valeur |
| --- | --- |
| `O2SWITCH_FTP_SERVER` | serveur FTP indiqué par cPanel |
| `O2SWITCH_FTP_USERNAME` | compte FTP créé ci-dessus |
| `O2SWITCH_FTP_PASSWORD` | son mot de passe |
| `O2SWITCH_FTP_DIR` | `./` si le compte FTP s’ouvre directement sur `adecap-app` |

3. Relancer le workflow : **Actions > Paquet o2switch > Run workflow**.

Ensuite, chaque modification envoyée sur `main` met le site à jour toute seule. L’application redémarre automatiquement, car le fichier `tmp/restart.txt` change à chaque paquet.

**Première fois, à la main.** Télécharger l’artefact `adecap-o2switch` dans l’onglet Actions, puis l’envoyer et le décompresser dans `adecap-app` avec le **Gestionnaire de fichiers** de cPanel. Cliquer ensuite sur **Restart** dans Setup Node.js App.

Au démarrage, `app.js` applique les migrations, crée les données initiales si la base est vide (compétitions, talent, compte administrateur), puis lance le site.

## 5. Brancher le stockage des médias (Cloudflare R2)

1. Dans le tableau de bord Cloudflare, ouvrir **R2 Object Storage**. Cloudflare peut demander un moyen de paiement pour activer R2, même dans la limite gratuite.
2. **Create bucket :** créer un compartiment `adecap`, un par client.
3. **Accès public :** dans le compartiment, ouvrir **Settings > Public access**.
   - Le mieux : relier un sous-domaine, par exemple `medias.adecapentertainment.com`. Le domaine doit alors être géré chez Cloudflare.
   - À défaut : activer l’adresse `r2.dev`, prévue pour les essais.
4. **Clés d’accès :** dans R2, ouvrir **Manage R2 API Tokens > Create API Token**. Choisir les droits **Object Read & Write**, limités au compartiment `adecap`.
5. Ajouter les variables dans l’application, puis faire **Restart** :

| Variable | Valeur |
| --- | --- |
| `S3_ENDPOINT` | `https://<id du compte>.r2.cloudflarestorage.com` |
| `S3_BUCKET` | `adecap` |
| `S3_ACCESS_KEY_ID` | clé d’accès du jeton |
| `S3_SECRET_ACCESS_KEY` | clé secrète du jeton |
| `S3_PUBLIC_URL` | adresse publique choisie à l’étape 3, sans `/` final |
| `S3_REGION` | `auto` |

Les nouvelles images partent alors sur R2. Pour transférer celles qui sont déjà dans la base, lancer cette commande dans cPanel > **Terminal**, depuis le dossier `adecap-app` :

```bash
node --env-file=.env scripts/images-to-cloud.mjs
```

Si les variables sont saisies dans cPanel plutôt que dans un fichier `.env`, retirer `--env-file=.env` et commencer par la commande `source` affichée en haut de la page Setup Node.js App.

## 6. Transférer les données depuis Render

À faire une fois, avant d’annoncer la nouvelle adresse. Le transfert reprend les comptes, les contenus, les inscriptions et les images.

1. **Copier l’adresse de la base Render :** dans Render, ouvrir **adecap-db > Connect > External Database URL**.
2. **Exporter les données,** depuis un ordinateur où le dépôt est installé :

   ```bash
   DATABASE_URL="<adresse externe Render>" npm run db:export -- adecap-donnees.json
   ```

3. **Déposer le fichier :** envoyer `adecap-donnees.json` dans `adecap-app` avec le Gestionnaire de fichiers.
4. **Importer les données :** dans cPanel > Terminal, depuis `adecap-app`, lancer la commande ci-dessous. Elle remplace le contenu de la base o2switch.

   ```bash
   node --env-file=.env scripts/data-transfer.mjs import adecap-donnees.json
   ```

5. **Supprimer le fichier** `adecap-donnees.json` du serveur : il contient des données personnelles.
6. **Vérifier et basculer :** contrôler le site et l’administration, puis supprimer les services Render (`adecap-site`, `adecap-db`) quand tout est en ordre.

## Héberger d’autres clients

Pour chaque nouveau client, reprendre le même schéma :

- une Lune ;
- une base PostgreSQL ou MySQL selon le projet ;
- une application Node.js ou un site PHP ;
- un compartiment R2.

Rien n’est partagé entre les clients, et chaque site peut être confié à son propriétaire sans toucher aux autres.
