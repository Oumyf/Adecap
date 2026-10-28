import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./site.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "ADECAP Entertainment · Plus qu’un événement, un impact", template: "%s · ADECAP Entertainment" },
  description: "ADECAP Entertainment organise des compétitions et des événements sportifs et culturels à Dakar : IFL, ASL, AUFL, CFL, talents à suivre et actualités.",
  icons: { icon: "/images/symbole-adecap.png" },
  openGraph: { siteName: SITE.name, locale: "fr_SN", type: "website", images: ["/images/match.jpg"] },
};

export const viewport: Viewport = { themeColor: "#0B1F45", width: "device-width", initialScale: 1, viewportFit: "cover" };

// Applique le thème choisi avant l’affichage pour éviter un flash.
const themeScript = `try{var t=localStorage.getItem('adecap-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,800&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
