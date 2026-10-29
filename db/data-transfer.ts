// Transfert des données d’une base à une autre (ex. Render → o2switch), via un fichier JSON.
//
//   Export (base source) : DATABASE_URL="<base source>" npx tsx db/data-transfer.ts export adecap-donnees.json
//   Import (base cible)  : DATABASE_URL="<base cible>"  npx tsx db/data-transfer.ts import adecap-donnees.json
//
// Sur o2switch, avec le paquet : node --env-file=.env scripts/data-transfer.mjs import adecap-donnees.json
// L’import REMPLACE le contenu de la base cible (comptes, contenus, inscriptions, images).
// Les deux bases doivent être à la même version du site (mêmes migrations).
import { readFileSync, writeFileSync } from "node:fs";
import pg from "pg";

const TABLES = [
  "users", "images", "talents", "articles", "competitions", "competition_alerts", "schools", "students",
  "contact_messages", "subscribers", "media_albums", "media_items", "activity_logs",
];

const [mode, file] = process.argv.slice(2);
const url = process.env.DATABASE_URL;
if (!url || !["export", "import"].includes(mode ?? "") || !file) {
  console.error("Usage : DATABASE_URL=… data-transfer export|import <fichier.json>");
  process.exit(1);
}
const ssl = process.env.DATABASE_SSL === "true" || /sslmode=require|\.render\.com/.test(url);
const client = new pg.Client({ connectionString: url, ssl: ssl ? { rejectUnauthorized: false } : false });

type Dump = { version: 1; exportedAt: string; tables: Record<string, Record<string, unknown>[]> };

async function exportData() {
  const dump: Dump = { version: 1, exportedAt: new Date().toISOString(), tables: {} };
  for (const t of TABLES) {
    const { rows } = await client.query(`select * from "${t}"`);
    dump.tables[t] = rows;
    console.log(`  ${t} : ${rows.length}`);
  }
  writeFileSync(file, JSON.stringify(dump, (_k, v) => (v && v.type === "Buffer" && Array.isArray(v.data) ? { __b64: Buffer.from(v.data).toString("base64") } : v)));
  console.log(`Export terminé : ${file}`);
}

async function importData() {
  const dump = JSON.parse(readFileSync(file, "utf8")) as Dump;
  if (dump.version !== 1) throw new Error("Format de fichier inconnu.");
  await client.query("begin");
  try {
    await client.query(`truncate ${TABLES.map((t) => `"${t}"`).join(", ")} cascade`);
    for (const t of TABLES) {
      const rows = dump.tables[t] ?? [];
      if (!rows.length) {
        console.log(`  ${t} : 0`);
        continue;
      }
      const { rows: cols } = await client.query<{ column_name: string; data_type: string }>(
        "select column_name, data_type from information_schema.columns where table_schema = 'public' and table_name = $1",
        [t],
      );
      const type = new Map(cols.map((c) => [c.column_name, c.data_type]));
      const names = Object.keys(rows[0]).filter((n) => type.has(n));
      const sqlText = `insert into "${t}" (${names.map((n) => `"${n}"`).join(", ")}) values (${names.map((_, i) => `$${i + 1}`).join(", ")})`;
      for (const r of rows) {
        await client.query(
          sqlText,
          names.map((n) => {
            const v = r[n];
            if (v && typeof v === "object" && "__b64" in (v as object)) return Buffer.from((v as { __b64: string }).__b64, "base64");
            if (type.get(n) === "jsonb" || type.get(n) === "json") return v == null ? null : JSON.stringify(v);
            return v;
          }),
        );
      }
      console.log(`  ${t} : ${rows.length}`);
    }
    await client.query("commit");
    console.log(`Import terminé (export du ${dump.exportedAt}).`);
  } catch (e) {
    await client.query("rollback");
    throw e;
  }
}

client
  .connect()
  .then(() => (mode === "export" ? exportData() : importData()))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
