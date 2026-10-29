// Point d’entrée de l’application sur o2switch
// (cPanel > Setup Node.js App > « Application startup file » : app.js).
//
// Au démarrage : lit le fichier .env s’il existe, applique les migrations de la base,
// crée les données initiales si la base est vide, puis lance le serveur Next.js.
// Pour redémarrer l’application : modifier le fichier tmp/restart.txt, ou bouton « Restart » dans cPanel.
const { execFileSync } = require("node:child_process");
const path = require("node:path");

process.chdir(__dirname);
process.env.NODE_ENV = "production";
try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {
  // pas de fichier .env : les variables viennent de cPanel
}

for (const script of ["scripts/migrate.mjs", "scripts/seed.mjs"]) {
  execFileSync(process.execPath, [path.join(__dirname, script)], { stdio: "inherit", env: process.env });
}

require("./server.js");
