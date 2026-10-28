// Applique les migrations SQL de db/migrations (exécuté au déploiement).
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL n’est pas défini."); process.exit(1); }
const ssl = process.env.DATABASE_SSL === "true" || /sslmode=require|\.render\.com/.test(url);
const pool = new pg.Pool({ connectionString: url, ssl: ssl ? { rejectUnauthorized: false } : false });
await migrate(drizzle(pool), { migrationsFolder: new URL("./migrations", import.meta.url).pathname });
console.log("Migrations appliquées.");
await pool.end();
