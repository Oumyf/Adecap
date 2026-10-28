"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/db/schema";

export function AdminNav({ role, counts }: { role: Role; counts: { messages: number; schools: number } }) {
  const path = usePathname();
  const items = [
    { href: "/admin", label: "Tableau de bord" },
    { href: "/admin/articles", label: "Actualités" },
    ...(role !== "CONTRIBUTOR" ? [{ href: "/admin/talents", label: "Talents à suivre" }, { href: "/admin/competitions", label: "Compétitions" }] : []),
    ...(role !== "CONTRIBUTOR" ? [{ href: "/admin/inscriptions", label: "Inscriptions", n: counts.schools }] : []),
    { href: "/admin/demandes", label: "Demandes reçues", n: counts.messages },
    ...(role === "ADMIN" ? [{ href: "/admin/utilisateurs", label: "Utilisateurs" }] : []),
    { href: "/admin/journal", label: "Journal d’activité" },
  ];
  return (
    <nav className="adm-nav" aria-label="Administration">
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={(i.href === "/admin" ? path === "/admin" : path.startsWith(i.href)) ? "page" : undefined}>
          {i.label}
          {"n" in i && i.n ? <span className="n">{i.n}</span> : null}
        </Link>
      ))}
    </nav>
  );
}
