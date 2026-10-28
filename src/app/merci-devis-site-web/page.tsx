import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { parseWebsiteOrderDetails } from "@/lib/website-lead-parser";
import {
  CONFIRMATION_COOKIE_NAME,
  verifyConfirmationCookie,
} from "@/lib/website-quote-security";
import { MerciDevisClient } from "./MerciDevisClient";

export const dynamic = "force-dynamic";

/**
 * Métadonnées SEO strictes : noindex, nofollow
 * Exclue des résultats de moteurs de recherche et du sitemap.
 */
export const metadata: Metadata = {
  title: "Votre devis de site internet est prêt | SAMA PUB",
  description:
    "Confirmation de votre simulation de devis de création de site internet avec l'agence SAMA PUB à Dakar.",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function MerciDevisSiteWebPage({ searchParams }: PageProps) {
  const refParam = searchParams?.ref;
  const ref = typeof refParam === "string" ? refParam.trim() : "";

  // 1. Validation de présence et de structure du numéro de devis
  if (!ref || !ref.startsWith("WEB-")) {
    redirect("/creation-site-internet", RedirectType.replace);
  }

  // 2. Récupération et vérification cryptographique du jeton dans le cookie HttpOnly
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get(CONFIRMATION_COOKIE_NAME)?.value;

  const verification = verifyConfirmationCookie(ref, tokenCookie);
  if (!verification.valid) {
    redirect("/creation-site-internet", RedirectType.replace);
  }

  // 3. Recherche du devis en base de données Supabase (leads_quotes)
  const { data: leads, error: dbError } = await supabase
    .from("leads_quotes")
    .select("*")
    .ilike("message", `%${ref}%`)
    .order("created_at", { ascending: false })
    .limit(1);

  if (dbError || !leads || leads.length === 0) {
    redirect("/creation-site-internet", RedirectType.replace);
  }

  const targetLead = leads[0];
  const parsed = parseWebsiteOrderDetails(targetLead);

  // 4. Contrôle d'intégrité strict : la référence en base doit correspondre à ref
  if (!parsed.ref || parsed.ref !== ref) {
    redirect("/creation-site-internet", RedirectType.replace);
  }

  // 5. Vérification si l'événement Meta Pixel a déjà été marqué comme envoyé en base
  let leadEventSent = false;
  const rawMsg = targetLead.message || "";
  const jsonMatch = rawMsg.match(/<!--WEBSITE_ORDER_DATA:([\s\S]*?)-->/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const p = JSON.parse(jsonMatch[1]);
      if (p.leadEventSent === true) {
        leadEventSent = true;
      }
    } catch {
      // Ignorer
    }
  }

  return (
    <MerciDevisClient
      refNum={ref}
      lead={{
        fullName: targetLead.full_name,
        companyName: targetLead.company_name || "Particulier",
        whatsappNumber: targetLead.whatsapp_number || "",
        email: targetLead.email || "",
      }}
      parsed={parsed}
      initialLeadEventSent={leadEventSent}
    />
  );
}
