import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

// Sert les images téléversées depuis l’administration (stockées en base pour survivre aux redéploiements).
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[a-z0-9]{10,40}$/.test(id)) return new Response("Introuvable", { status: 404 });
  const img = await db.query.images.findFirst({ where: eq(schema.images.id, id) });
  if (!img) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.mimeType,
      "Content-Length": String(img.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
