"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/site";

const SUN = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
  </svg>
);
const MOON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z" />
  </svg>
);

function effectiveTheme() {
  const t = document.documentElement.dataset.theme;
  if (t === "dark" || t === "light") return t;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [over, setOver] = useState(path === "/");
  const [dark, setDark] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => setDark(effectiveTheme() === "dark"), []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const onScroll = () => {
      const y = scrollY;
      setOver(path === "/" && y < 40);
      setShowTop(y > 600);
      const h = document.documentElement.scrollHeight - innerHeight;
      setProgress(h > 0 ? Math.min(1, y / h) : 0);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [path]);

  function toggleTheme() {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      setDark(next === "dark");
    };
    const d = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (d.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) d.startViewTransition(apply);
    else apply();
    try {
      localStorage.setItem("adecap-theme", next);
    } catch {}
  }

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <>
      <header className={`top${over ? " over" : ""}`}>
        <div className="wrap">
          <Link className="logo" href="/" aria-label="ADECAP Entertainment, accueil">
            <span className="mark" aria-hidden="true" />
            <span className="wm">
              <b>ADECAP</b>
              <small>ENTERTAINMENT</small>
            </span>
          </Link>
          <nav className={`nav${open ? " open" : ""}`} id="nav" aria-label="Navigation principale">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
            <Link href="/inscription" className="nav-cta" aria-current={isActive("/inscription") ? "page" : undefined}>
              S’inscrire
            </Link>
          </nav>
          <div className="tools">
            <button className="chipbtn theme-btn" type="button" onClick={toggleTheme} aria-label={dark ? "Passer au thème clair" : "Passer au thème sombre"} title={dark ? "Thème clair" : "Thème sombre"}>
              {dark === null ? null : dark ? SUN : MOON}
            </button>
            <button className="chipbtn burger" type="button" aria-expanded={open} aria-controls="nav" onClick={() => setOpen((o) => !o)}>
              Menu
            </button>
          </div>
        </div>
      </header>
      <button className={`totop${showTop ? " show" : ""}`} type="button" aria-label="Revenir en haut" onClick={() => scrollTo({ top: 0, behavior: "smooth" })}>
        <svg className="ring" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="24" stroke="rgba(255,255,255,.15)" />
          <circle cx="26" cy="26" r="24" stroke="#E5A600" strokeDasharray="150.8" strokeDashoffset={150.8 * (1 - progress)} strokeLinecap="round" />
        </svg>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M8 13V3M4 7l4-4 4 4" />
        </svg>
      </button>
    </>
  );
}
