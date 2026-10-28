"use client";

import { useState } from "react";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => (typeof location !== "undefined" ? location.href : "");
  const open = (u: string) => window.open(u, "_blank", "noopener,noreferrer");
  return (
    <div className="share">
      <span className="muted" style={{ fontSize: ".84rem", alignSelf: "center", marginRight: ".4rem" }}>
        Partager
      </span>
      <button className="ib" type="button" onClick={() => navigator.clipboard?.writeText(url()).then(() => setCopied(true))}>
        {copied ? "Lien copié" : "Copier le lien"}
      </button>
      <button className="ib" type="button" onClick={() => open(`https://wa.me/?text=${encodeURIComponent(title + " " + url())}`)}>
        WhatsApp
      </button>
      <button className="ib" type="button" onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`)}>
        Facebook
      </button>
      <button className="ib" type="button" onClick={() => open(`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url())}`)}>
        X
      </button>
    </div>
  );
}
