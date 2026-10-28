import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import type { Role } from "@/db/schema";

const COOKIE = "adecap_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET manquant ou trop court (32 caractères minimum).");
    return new TextEncoder().encode("dev-secret-dev-secret-dev-secret-dev-secret");
  }
  return new TextEncoder().encode(s);
}

export type SessionUser = { id: string; name: string; email: string; role: Role };

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const u = await db.query.users.findFirst({ where: eq(schema.users.id, payload.sub) });
    if (!u || !u.active) return null;
    return { id: u.id, name: u.name, email: u.email, role: u.role };
  } catch {
    return null;
  }
}

/** Exige une session ; redirige vers la connexion sinon. */
export async function requireUser(roles?: Role[]) {
  const u = await getUser();
  if (!u) redirect("/admin/connexion");
  if (roles && !roles.includes(u.role)) redirect("/admin?refus=1");
  return u;
}

export const can = {
  publish: (r: Role) => r === "ADMIN" || r === "EDITOR",
  manage: (r: Role) => r === "ADMIN" || r === "EDITOR",
  delete: (r: Role) => r === "ADMIN",
  users: (r: Role) => r === "ADMIN",
};

export const ROLE_LABEL: Record<Role, string> = { ADMIN: "Administrateur", EDITOR: "Éditeur", CONTRIBUTOR: "Contributeur" };

export async function log(user: SessionUser | null, action: string) {
  await db.insert(schema.activityLogs).values({ userId: user?.id, actor: user ? user.name : "Site public", action });
}
