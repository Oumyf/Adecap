// Construit le paquet à déposer sur o2switch (cPanel, application Node.js).
// Résultat : dist/o2switch/ (dossier prêt à envoyer par FTP) et dist/adecap-o2switch.zip.
// Usage : npm run build:o2switch
import { execFileSync, execSync } from "node:child_process";
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist", "o2switch");
const run = (cmd, env = {}) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });

console.log("1/4 Build Next.js (mode autonome)…");
rmSync(join(root, ".next"), { recursive: true, force: true });
// La base n’est pas contactée pendant le build : une adresse factice suffit si aucune n’est définie.
run("npx next build", { NEXT_OUTPUT: "standalone", NEXT_TELEMETRY_DISABLED: "1", DATABASE_URL: process.env.DATABASE_URL || "postgresql://build:build@localhost:5432/build" });

console.log("2/4 Assemblage du paquet…");
rmSync(join(root, "dist"), { recursive: true, force: true });
mkdirSync(out, { recursive: true });
// dereference : les liens symboliques deviennent de vrais fichiers (le FTP ne les gère pas).
cpSync(join(root, ".next", "standalone"), out, { recursive: true, dereference: true });
cpSync(join(root, ".next", "static"), join(out, ".next", "static"), { recursive: true, dereference: true });
cpSync(join(root, "public"), join(out, "public"), { recursive: true });
rmSync(join(out, ".env"), { force: true }); // ne jamais livrer les secrets du poste de build

// Remplace chaque lien symbolique restant par une copie réelle de sa cible.
function unlink(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = lstatSync(p);
    if (st.isSymbolicLink()) {
      const target = realpathSync(p);
      rmSync(p, { force: true });
      cpSync(target, p, { recursive: true, dereference: true });
      unlink(dirname(p));
      return;
    }
    if (st.isDirectory()) unlink(p);
  }
}
unlink(out);

console.log("3/4 Scripts de base de données…");
const common = { bundle: true, platform: "node", format: "esm", target: "node20", external: ["pg-native"], logLevel: "warning",
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" } };
await build({ ...common, entryPoints: [join(root, "db", "migrate.mjs")], outfile: join(out, "scripts", "migrate.mjs") });
await build({ ...common, entryPoints: [join(root, "db", "seed.ts")], outfile: join(out, "scripts", "seed.mjs") });
await build({ ...common, entryPoints: [join(root, "db", "images-to-cloud.ts")], outfile: join(out, "scripts", "images-to-cloud.mjs") });
await build({ ...common, entryPoints: [join(root, "db", "data-transfer.ts")], outfile: join(out, "scripts", "data-transfer.mjs") });
cpSync(join(root, "db", "migrations"), join(out, "scripts", "migrations"), { recursive: true });

cpSync(join(root, "deploy", "o2switch", "app.js"), join(out, "app.js"));
cpSync(join(root, "deploy", "o2switch", "env.example"), join(out, "env.example"));
mkdirSync(join(out, "tmp"), { recursive: true });
// Passenger redémarre l’application quand ce fichier change : chaque paquet porte une date différente.
writeFileSync(join(out, "tmp", "restart.txt"), new Date().toISOString() + "\n");

console.log("4/4 Archive zip…");
if (existsSync("/usr/bin/zip") || existsSync("/bin/zip")) {
  execFileSync("zip", ["-qr", join(root, "dist", "adecap-o2switch.zip"), "."], { cwd: out });
  console.log("Paquet prêt : dist/o2switch/ et dist/adecap-o2switch.zip");
} else {
  console.log("Paquet prêt : dist/o2switch/ (zip non disponible sur cette machine)");
}
