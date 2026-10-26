import {
  websiteFormulas,
  websiteTypes,
  websiteFeatures,
  projectDeadlines,
  WebsiteFormula,
} from "@/data/websitePricingConfig";
import type { LeadQuote } from "@/components/admin/LeadsTable";

export interface ParsedWebsiteOrder {
  ref?: string;
  typeId: string;
  typeLabel: string;
  formulaId: string;
  formulaName: string;
  priceFCFA: number;
  formattedPrice: string;
  selectedFeatures: Array<{
    id: string;
    label: string;
  }>;
  deadlineId: string;
  deadlineLabel: string;
  cleanDescription: string;
  isWebsiteOrder: boolean;
}

/**
 * Détermine avec certitude si une demande concerne la création de site internet
 */
export function isWebsiteLead(lead: Partial<LeadQuote>): boolean {
  if (!lead) return false;
  if (lead.contact_channel === "website_order") return true;
  const srv = (lead.service_requested || "").toLowerCase();
  if (srv.includes("site") || srv.includes("internet") || srv.includes("web")) return true;
  const msg = (lead.message || "").toLowerCase();
  if (msg.includes("[détails devis :") || msg.includes("website_order_data")) return true;
  return false;
}

/**
 * Parse intelligemment et de manière 100% robuste toutes les informations
 * des 5 étapes du formulaire de création de site web.
 */
export function parseWebsiteOrderDetails(lead: Partial<LeadQuote>): ParsedWebsiteOrder {
  const rawMsg = lead.message || "";
  let cleanDescription = rawMsg;
  let ref: string | undefined;
  let typeId = "vitrine";
  let typeLabel = "Site vitrine";
  let formulaId = "vitrine";
  let formulaName = "Site Vitrine";
  let priceFCFA = 300000;
  let formattedPrice = "300 000 FCFA";
  let deadlineId = "standard";
  let deadlineLabel = "Standard (10 à 14 jours)";
  const featureList: Array<{ id: string; label: string }> = [];

  // 1. Essai d'extraction depuis balise JSON structurée <!--WEBSITE_ORDER_DATA:...-->
  const jsonMatch = rawMsg.match(/<!--WEBSITE_ORDER_DATA:([\s\S]*?)-->/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      ref = parsed.ref;
      if (parsed.typeLabel) typeLabel = parsed.typeLabel;
      if (parsed.typeId) typeId = parsed.typeId;
      if (parsed.formulaName) formulaName = parsed.formulaName;
      if (parsed.formulaId) formulaId = parsed.formulaId;
      if (typeof parsed.priceFCFA === "number") priceFCFA = parsed.priceFCFA;
      if (parsed.formattedPrice) formattedPrice = parsed.formattedPrice;
      if (parsed.deadlineLabel) deadlineLabel = parsed.deadlineLabel;
      if (parsed.deadlineId) deadlineId = parsed.deadlineId;
      if (Array.isArray(parsed.features)) {
        parsed.features.forEach((f: any) => {
          if (typeof f === "string") {
            const found = websiteFeatures.find((feat) => feat.id === f);
            featureList.push({ id: f, label: found ? found.label : f });
          } else if (f && f.label) {
            featureList.push({ id: f.id || f.label, label: f.label });
          }
        });
      }
      cleanDescription = rawMsg.replace(/<!--WEBSITE_ORDER_DATA:[\s\S]*?-->/g, "").trim();
    } catch {
      // Ignorer
    }
  }

  // 2. Si pas de JSON structuré, extraction depuis le format texte classique :
  // "[Détails devis : Réf WEB-XXXX | Type: ... | Formule: ... | Options: ... | Délai: ...]"
  if (featureList.length === 0) {
    const detailsBlockMatch = rawMsg.match(/\[Détails devis\s*:\s*([^\]]+)\]/i);
    if (detailsBlockMatch && detailsBlockMatch[1]) {
      const block = detailsBlockMatch[1];
      cleanDescription = rawMsg.replace(/\[Détails devis\s*:\s*[^\]]+\]/gi, "").trim();

      // Réf
      const refMatch = block.match(/Réf\s+([^|]+)/i);
      if (refMatch) ref = refMatch[1].trim();

      // Type
      const typeMatch = block.match(/Type\s*:\s*([^|]+)/i);
      if (typeMatch) {
        typeLabel = typeMatch[1].trim();
        const matchedType = websiteTypes.find(
          (t) => t.title.toLowerCase() === typeLabel.toLowerCase() || t.id.toLowerCase() === typeLabel.toLowerCase()
        );
        if (matchedType) typeId = matchedType.id;
      }

      // Formule
      const formulaMatch = block.match(/Formule\s*:\s*([^|]+)/i);
      if (formulaMatch) {
        formulaName = formulaMatch[1].trim();
      }

      // Options
      const optionsMatch = block.match(/Options\s*:\s*([^|]+)/i);
      if (optionsMatch) {
        const rawOptions = optionsMatch[1].split(",");
        rawOptions.forEach((opt) => {
          const trimmed = opt.trim();
          if (trimmed && trimmed !== "Aucune") {
            const found = websiteFeatures.find(
              (f) => f.label.toLowerCase() === trimmed.toLowerCase() || f.id.toLowerCase() === trimmed.toLowerCase()
            );
            featureList.push({
              id: found ? found.id : trimmed.toLowerCase().replace(/\s+/g, "-"),
              label: found ? found.label : trimmed,
            });
          }
        });
      }

      // Délai
      const delayMatch = block.match(/Délai\s*:\s*([^|]+)/i);
      if (delayMatch) {
        deadlineLabel = delayMatch[1].trim();
        const matchedDelay = projectDeadlines.find(
          (d) => d.label.toLowerCase().includes(deadlineLabel.toLowerCase()) || d.id === deadlineLabel.toLowerCase()
        );
        if (matchedDelay) deadlineId = matchedDelay.id;
      }
    }
  }

  // 3. Réconciliation avec le champ service_requested et la formule officielle
  const srv = lead.service_requested || "";
  if (!formulaName || formulaName === "Site Vitrine") {
    if (srv.toLowerCase().includes("basique")) {
      formulaName = "Site Basique";
      formulaId = "basique";
    } else if (srv.toLowerCase().includes("premium") || srv.toLowerCase().includes("commerce")) {
      formulaName = "Site Premium E-commerce";
      formulaId = "premium";
    } else if (srv.toLowerCase().includes("sur-mesure") || srv.toLowerCase().includes("sur mesure")) {
      formulaName = "Site Sur-Mesure";
      formulaId = "sur-mesure";
    }
  }

  // Recalage des prix d'après la formule officielle
  const formulaObj = websiteFormulas.find(
    (f) => f.name.toLowerCase() === formulaName.toLowerCase() || f.id.toLowerCase() === formulaId.toLowerCase()
  );
  if (formulaObj) {
    formulaId = formulaObj.id;
    formulaName = formulaObj.name;
    priceFCFA = formulaObj.priceFCFA;
    formattedPrice = formulaObj.formattedPrice;
  } else if (lead.budget_range) {
    formattedPrice = lead.budget_range;
    const digits = lead.budget_range.replace(/\D/g, "");
    if (digits) priceFCFA = parseInt(digits, 10);
  }

  // Si aucune option trouvée, mettre par défaut les options essentielles
  if (featureList.length === 0) {
    featureList.push(
      { id: "bouton-whatsapp", label: "Bouton WhatsApp direct" },
      { id: "formulaire-contact", label: "Formulaire de contact rapide" }
    );
  }

  return {
    ref,
    typeId,
    typeLabel,
    formulaId,
    formulaName,
    priceFCFA,
    formattedPrice,
    selectedFeatures: featureList,
    deadlineId,
    deadlineLabel,
    cleanDescription: cleanDescription || "Création de site internet professionnel pour développer la visibilité et l'activité commerciale.",
    isWebsiteOrder: isWebsiteLead(lead),
  };
}
