import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/data/siteConfig";
import { MetaPixel } from "@/components/MetaPixel";

export const viewport: Viewport = {
  themeColor: "#0B192C",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "SAMA PUB | Agence de Publicité & Marketing Digital à Dakar",
    template: "%s | SAMA PUB",
  },
  description:
    "Plus de visibilité, plus de clients. Agence d'élite en Media Buying, gestion de campagnes Meta, TikTok et Google Ads, création de contenus et acquisition de clients au Sénégal et en Afrique francophone.",
  keywords: [
    "SAMA PUB",
    "Agence publicité Dakar",
    "Marketing digital Sénégal",
    "Media Buying Dakar",
    "Campagne Meta Ads Sénégal",
    "Publicité Facebook Instagram Dakar",
    "Création de contenus publicitaires",
    "Acquisition de clients Sénégal",
    "TikTok Ads Afrique",
  ],
  authors: [{ name: "SAMA PUB" }],
  creator: "SAMA PUB",
  publisher: "SAMA PUB",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: "SAMA PUB | Plus de visibilité, plus de clients",
    description:
      "Transformez vos investissements publicitaires en clients fidèles. Stratégie, créativité et performance à Dakar.",
    url: siteConfig.url,
    siteName: "SAMA PUB",
    locale: "fr_SN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SAMA PUB | Agence de Publicité & Marketing Digital",
    description: "Plus de visibilité, plus de clients. Media Buying et acquisition de prospects qualifiés.",
  },
  icons: {
    icon: "/images/logo-sp.png",
    apple: "/images/logo-sp.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col font-sans bg-white text-slate-800 antialiased selection:bg-sama-orange selection:text-white">
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
