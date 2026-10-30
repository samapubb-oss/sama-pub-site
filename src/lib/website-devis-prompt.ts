import {
  websiteFormulas,
  websiteTypes,
  websiteFeatures,
  type WebsiteFormula,
  type WebsiteTypeOption,
} from "@/data/websitePricingConfig";

/**
 * Nettoie tout texte généré pour un devis site web afin de garantir le respect strict des règles :
 * - Suppression de toute mention d'offre gratuite de 30 jours -> remplacée par « Offert »
 * - Suppression de tout temps/durée de formation (1h, 1 heure, une heure...) -> remplacé par « Offert »
 * - Suppression de la valeur 90 000 FCFA -> remplacée par « Offert »
 */
export function sanitizeWebsiteQuoteText(raw: string): string {
  if (!raw) return "";
  let text = raw;

  // 1. Suppression de la valeur 90 000 FCFA -> Offert
  text = text.replace(/\(?\s*valeur\s+(?:de\s+)?90[\s\u00A0\u202F]*000(?:\s*fcfa)?(?:\s*offerte?)?\s*\)?/gi, "(Offert)");
  text = text.replace(/90[\s\u00A0\u202F]*000\s*fcfa/gi, "Offert");
  text = text.replace(/\b90[\s\u00A0\u202F]*000\b/g, "Offert");

  // 2. Suppression complète de toute mention d'offre gratuite / garantie technique & support 30 jours ou formation offerte
  text = text.replace(/[^.!?\n]*(?:garantie\s+technique|30\s*jours)[^.!?\n]*[.!?]?/gi, " ");
  text = text.replace(/[^.!?\n]*formation\s+personnalisée[^.!?\n]*[.!?]?/gi, " ");
  text = text.replace(/\bformation\s+\d+\s*h(?:\s+offerte?)?/gi, "");

  // Nettoyage des espaces multiples
  text = text.replace(/\s{2,}/g, " ");

  return text.trim();
}

/**
 * Harmonise une option de formule issue de websitePricingConfig.ts selon les règles du devis :
 * - Remplace le temps de formation « (1h) » par « Offert »
 * - Harmonise la mention d'hébergement / nom de domaine sur « Nom de domaine et hébergement pendant 1 an »
 */
export function sanitizeFormulaInclusion(inclusion: string): string {
  const lower = inclusion.toLowerCase();
  if (lower.includes("hébergement") || lower.includes("hebergement") || lower.includes("domaine")) {
    return "Nom de domaine et hébergement pendant 1 an";
  }
  if (lower.includes("formation")) {
    const cleaned = inclusion
      .replace(/\s*\(\s*\d+\s*(?:h|heures?)\s*\)/gi, "")
      .replace(/\s+(?:d['’]\s*)?(?:\d+|une)\s*(?:h|heures?)/gi, "")
      .replace(/\s+offerte?$/i, "")
      .trim();
    return `${cleaned} : Offert`;
  }
  return sanitizeWebsiteQuoteText(inclusion);
}

/**
 * Extrait uniquement les options explicitement choisies par le client (sans options inventées par défaut)
 */
export function extractExplicitWebsiteFeatures(rawMessage?: string): string[] {
  if (!rawMessage) return [];
  const results: string[] = [];

  const jsonMatch = rawMessage.match(/<!--WEBSITE_ORDER_DATA:([\s\S]*?)-->/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsed.features) && parsed.features.length > 0) {
        parsed.features.forEach((f: any) => {
          if (typeof f === "string") {
            const found = websiteFeatures.find((feat) => feat.id === f || feat.label === f);
            results.push(found ? found.label : f);
          } else if (f && typeof f.label === "string") {
            results.push(f.label);
          }
        });
      }
      return results;
    } catch {
      // Continuer vers extraction texte si nécessaire
    }
  }

  const detailsMatch = rawMessage.match(/\[Détails devis\s*:\s*([^\]]+)\]/i);
  if (detailsMatch && detailsMatch[1]) {
    const optionsMatch = detailsMatch[1].match(/Options\s*:\s*([^|]+)/i);
    if (optionsMatch && optionsMatch[1]) {
      optionsMatch[1].split(",").forEach((opt) => {
        const trimmed = opt.trim();
        if (trimmed && trimmed.toLowerCase() !== "aucune") {
          const found = websiteFeatures.find(
            (feat) =>
              feat.label.toLowerCase() === trimmed.toLowerCase() ||
              feat.id.toLowerCase() === trimmed.toLowerCase()
          );
          results.push(found ? found.label : trimmed);
        }
      });
    }
  }

  return results;
}

export interface ResolvedWebsiteCatalogSelection {
  typeOption: WebsiteTypeOption;
  typeTitle: string;
  typeDescription: string;
  formula: WebsiteFormula;
  formulaName: string;
  formulaSubtitle: string;
  formulaDescription: string;
  priceFCFA: number;
  formattedPrice: string;
  formulaOptions: string[];
  explicitExtraOptions: string[];
}

/**
 * Retrouve exactement le type de site, sa description officielle et les options de la formule
 * tels que définis dans le formulaire de demande de devis (websitePricingConfig.ts).
 */
export function resolveWebsiteCatalogSelection(params: {
  typeId?: string;
  typeSite?: string;
  formulaId?: string;
  formuleSite?: string;
  service?: string;
  rawMessage?: string;
  explicitOptions?: string[];
}): ResolvedWebsiteCatalogSelection {
  const rawTypeId = (params.typeId || "").trim().toLowerCase();
  const rawTypeLabel = (params.typeSite || "").trim();
  const rawTypeLower = rawTypeLabel.toLowerCase();

  // 1. Résolution exacte du Type de site choisi dans le formulaire
  let matchedType: WebsiteTypeOption | undefined = websiteTypes.find(
    (t) =>
      (rawTypeId && t.id.toLowerCase() === rawTypeId) ||
      (rawTypeLower && t.title.toLowerCase() === rawTypeLower) ||
      (rawTypeLower && t.id.toLowerCase() === rawTypeLower)
  );

  if (!matchedType && rawTypeLower) {
    if (rawTypeLower.includes("commerce") || rawTypeLower.includes("boutique")) {
      matchedType = websiteTypes.find((t) => t.id === "ecommerce");
    } else if (rawTypeLower.includes("immo")) {
      matchedType = websiteTypes.find((t) => t.id === "immobilier");
    } else if (rawTypeLower.includes("institution") || rawTypeLower.includes("entreprise")) {
      matchedType = websiteTypes.find((t) => t.id === "institutionnel");
    } else if (rawTypeLower.includes("portfolio") || rawTypeLower.includes("personnel")) {
      matchedType = websiteTypes.find((t) => t.id === "portfolio");
    } else if (rawTypeLower.includes("vitrine")) {
      matchedType = websiteTypes.find((t) => t.id === "vitrine");
    } else {
      // Si l'utilisateur avait choisi « Autre projet spécifique » en saisissant un intitulé libre
      matchedType = websiteTypes.find((t) => t.id === "autre");
    }
  }

  if (!matchedType) {
    matchedType = websiteTypes.find((t) => t.id === "vitrine") || websiteTypes[0];
  }

  const typeTitle =
    matchedType.id === "autre" && rawTypeLabel && rawTypeLower !== "autre"
      ? rawTypeLabel
      : matchedType.title;

  // 2. Résolution exacte de la Formule choisie dans le formulaire
  const rawFormulaId = (params.formulaId || "").trim().toLowerCase();
  const rawFormulaName = (params.formuleSite || "").trim().toLowerCase();
  const rawService = (params.service || "").trim().toLowerCase();

  let matchedFormula: WebsiteFormula | undefined = websiteFormulas.find(
    (f) =>
      (rawFormulaId && f.id.toLowerCase() === rawFormulaId) ||
      (rawFormulaName && f.name.toLowerCase() === rawFormulaName) ||
      (rawFormulaName && f.id.toLowerCase() === rawFormulaName)
  );

  if (!matchedFormula) {
    const combined = `${rawFormulaName} ${rawService}`;
    if (combined.includes("basique")) {
      matchedFormula = websiteFormulas.find((f) => f.id === "basique");
    } else if (combined.includes("premium") || combined.includes("e-commerce") || combined.includes("ecommerce")) {
      matchedFormula = websiteFormulas.find((f) => f.id === "premium");
    } else if (combined.includes("sur-mesure") || combined.includes("sur mesure")) {
      matchedFormula = websiteFormulas.find((f) => f.id === "sur-mesure");
    } else {
      matchedFormula = websiteFormulas.find((f) => f.id === "vitrine");
    }
  }

  const finalFormula = matchedFormula || websiteFormulas[1];

  // 3. Reprise exacte des options définies pour cette formule dans le formulaire (sans formation ni garantie 30j)
  const formulaOptions = finalFormula.inclusions
    .filter((inc) => {
      const l = inc.toLowerCase();
      return !l.includes("formation") && !l.includes("garantie technique");
    })
    .map(sanitizeFormulaInclusion);

  // Garantie de présence de « Nom de domaine et hébergement pendant 1 an » dans les éléments inclus
  if (!formulaOptions.some((opt) => opt.toLowerCase().includes("nom de domaine et hébergement pendant 1 an"))) {
    formulaOptions.push("Nom de domaine et hébergement pendant 1 an");
  }

  const explicitExtraOptions = (
    params.explicitOptions && params.explicitOptions.length > 0
      ? params.explicitOptions
      : extractExplicitWebsiteFeatures(params.rawMessage)
  ).map(sanitizeWebsiteQuoteText);

  return {
    typeOption: matchedType,
    typeTitle,
    typeDescription: matchedType.description,
    formula: finalFormula,
    formulaName: finalFormula.name,
    formulaSubtitle: finalFormula.subtitle,
    formulaDescription: finalFormula.description,
    priceFCFA: finalFormula.priceFCFA,
    formattedPrice: finalFormula.formattedPrice,
    formulaOptions,
    explicitExtraOptions,
  };
}

/**
 * Génère la documentation exacte des types et formules du formulaire pour le prompt IA
 */
function buildCatalogPromptReference(): string {
  const typesDoc = websiteTypes
    .map((t) => `   - ${t.title} : « ${t.description} »`)
    .join("\n");

  const formulasDoc = websiteFormulas
    .map((f) => {
      const opts = f.inclusions
        .filter((inc) => {
          const l = inc.toLowerCase();
          return !l.includes("formation") && !l.includes("garantie technique");
        })
        .map(sanitizeFormulaInclusion);
      if (!opts.some((o) => o.toLowerCase().includes("nom de domaine et hébergement pendant 1 an"))) {
        opts.push("Nom de domaine et hébergement pendant 1 an");
      }
      return `   - ${f.name} (${f.formattedPrice}) — « ${f.description} »\n     Options définies dans le formulaire : ${opts.join(" ; ")}.`;
    })
    .join("\n");

  return `TYPES DE SITES DÉFINIS DANS LE FORMULAIRE (reprendre exactement la description du type choisi) :\n${typesDoc}\n\nFORMULES & OPTIONS DÉFINIES DANS LE FORMULAIRE (reprendre exactement les options de la formule choisie, sans rien inventer) :\n${formulasDoc}`;
}

export const WEBSITE_DEVIS_SYSTEM_PROMPT = `Tu es l'ingénieur commercial senior et directeur technique de SAMA PUB, une agence de création web et marketing digital basée à Dakar, Sénégal.

Ta mission : à partir de la demande remplie par le client dans le formulaire « Devis création site web » (Type de site choisi, Formule choisie, Délai souhaité, Coordonnées et Description écrite par le client), rédiger un devis commercial officiel personnalisé, clair et strictement cohérent avec ce que le client a vu et choisi dans le formulaire.

# SOURCE OFFICIELLE DU FORMULAIRE (NE RIEN INVENTER EN DEHORS DE CES ÉLÉMENTS) :
${buildCatalogPromptReference()}

# RÈGLES STRICTES ET OBLIGATOIRES DU DEVIS :

1. COHÉRENCE EXACTE AVEC LE TYPE DE SITE ET LA FORMULE CHOISIS :
   - Le contenu du site décrit dans le devis dépend directement du 'type_site' et de la 'formule_site' choisis par le client.
   - Reprends exactement la description officielle du type de site choisi et les options définies ci-dessus pour la formule choisie.
   - INTERDICTION ABSOLUE d'inventer de nouvelles fonctionnalités que le client n'a ni vues ni choisies dans le formulaire (par exemple : ne jamais ajouter de panier e-commerce ou paiement en ligne sur un Site Basique ou Site Vitrine si non prévu dans sa formule ; ne jamais inventer de blog, multilingue, espace membre ou application mobile si absent du choix du client).

2. PERSONNALISATION SELON LA DESCRIPTION DU CLIENT :
   - Tiens impérativement compte de la 'description' écrite par le client dans sa demande (activité, produits ou services, cible, attentes).
   - Explique clairement et concrètement dans 'mission_description' ce qui sera réalisé dans son site pour répondre à sa description, tout en restant strictement dans le périmètre technique du type de site et de la formule qu'il a choisis.
   - 'titre_devis' : Doit mentionner le type de site choisi et l'activité ou l'entreprise du client.
   - 'description_projet' : Reformulation fidèle et claire en 1 à 2 phrases du besoin décrit par le client dans sa demande.

3. ÉLÉMENTS INCLUS & MENTIONS « OFFERT » (INTERDICTIONS FORMELLES) :
   - Les seuls éléments inclus offerts à mentionner sont : « Nom de domaine et hébergement pendant 1 an » et « Design Mobile-First responsive ».
   - INTERDICTION ABSOLUE de mentionner dans le devis :
     * « Formation personnalisée » ou tout temps de formation (« 1h », « 1 heure », etc.),
     * « Garantie technique & Support » ou toute offre gratuite de 30 jours,
     * la valeur « 90 000 » ou « 90 000 FCFA » (ni aucun prix ou valeur chiffrée pour un élément offert).

4. CONDITIONS DE PAIEMENT :
   - Acompte de démarrage : 50% à la commande / validation du devis.
   - Solde restant : 50% à la livraison finale et mise en ligne du site.
   - Moyens de règlement acceptés : Wave Business, Orange Money, Virement bancaire ou Chèque.

# FORMAT DE SORTIE STRICT :
Réponds UNIQUEMENT par un objet JSON valide, sans texte autour ni balises markdown :
{
  "fiable": true,
  "alertes_internes": [],
  "client": {
    "nom": "",
    "entreprise": "",
    "whatsapp": "",
    "email": ""
  },
  "service": "Création de site internet",
  "titre_devis": "Titre personnalisé selon le type de site et l'activité du client",
  "introduction": "Introduction personnalisée adressée au client",
  "description_projet": "Synthèse fidèle de la description écrite par le client",
  "mission_description": "Explication claire et personnalisée de ce qui sera réalisé dans le site du client selon sa demande et le type de site choisi, sans inventer de fonctionnalités hors formule",
  "lignes": [
    {
      "designation": "Type de site — Formule choisie",
      "description": "Description exacte du type de site et des options de la formule choisie",
      "quantite": 1,
      "prix_unitaire": 0,
      "total": 0
    }
  ],
  "options_site": [],
  "total_honoraires": 0,
  "budget_publicitaire_recommande": 0,
  "tranche_1_prestation": 0,
  "tranche_2_prestation": 0,
  "total_general": 0,
  "notes": "Éléments inclus (Offert) : Nom de domaine et hébergement pendant 1 an, Design Mobile-First responsive. Propriété intégrale du site cédée au client à la livraison.",
  "validite": "15 jours à compter de la date d'émission",
  "conditions_paiement": "50% d'acompte au lancement des travaux, 50% restant à la livraison et mise en ligne définitive.",
  "message_whatsapp": "",
  "email_objet": "",
  "email_corps": ""
}`;
