"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/** Recherche des actualités et des talents : met à jour l’URL (?q=) au fil de la saisie. */
export function SearchBar() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [pending, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => setValue(params.get("q") ?? ""), [params]);

  function push(v: string) {
    const p = new URLSearchParams(params.toString());
    if (v.trim()) p.set("q", v.trim());
    else p.delete("q");
    start(() => router.replace(`${path}${p.size ? "?" + p.toString() : ""}`, { scroll: false }));
  }

  return (
    <form
      className="search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        clearTimeout(timer.current);
        push(value);
      }}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11l3.5 3.5" />
      </svg>
      <input
        type="search"
        name="q"
        value={value}
        placeholder="Rechercher un article ou un talent : nom, poste, école…"
        aria-label="Rechercher un article ou un talent"
        aria-busy={pending}
        onChange={(e) => {
          setValue(e.target.value);
          clearTimeout(timer.current);
          const v = e.target.value;
          timer.current = setTimeout(() => push(v), 300);
        }}
      />
    </form>
  );
}
