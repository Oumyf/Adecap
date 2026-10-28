import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as { pool?: Pool };

function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL n’est pas défini.");
  // Le réseau interne de Render n’exige pas SSL ; l’URL externe (*.render.com) oui.
  const ssl = process.env.DATABASE_SSL === "true" || /sslmode=require|\.render\.com/.test(url);
  return new Pool({ connectionString: url, max: 5, ssl: ssl ? { rejectUnauthorized: false } : false });
}

const pool = globalForDb.pool ?? makePool();
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
