import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de Bord Administrateur | SAMA PUB",
  description: "Espace d'administration et gestion des demandes de devis SAMA PUB Dakar.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#F8FAFC]">{children}</div>;
}
