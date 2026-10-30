import type { DevisData, DevisGenerationRequest } from "@/types/devis";
import { parseWebsiteOrderDetails } from "@/lib/website-lead-parser";
import {
  resolveWebsiteCatalogSelection,
  sanitizeWebsiteQuoteText,
} from "@/lib/website-devis-prompt";

/**
 * Extraction du montant numérique du budget mensuel
 */
export function extractBudgetAmount(raw: string): number {
  if (!raw) return 200000;
  const clean = raw.toLowerCase().replace(/\s/g, "");

  if (clean.includes("100") && clean.includes("250")) return 150000;
  if (clean.includes("250") && clean.includes("500")) return 250000;
  if (clean.includes("500") && clean.includes("750")) return 500000;
  if (clean.includes("750") || clean.includes("1m") || (clean.includes("750") && clean.includes("1000"))) return 750000;
  if (clean.includes("plus") || clean.includes("+") || clean.includes("1000000")) return 1000000;

  const matches = raw.match(/\d[\d\s]*\d|\d+/g);
  if (matches && matches.length > 0) {
    const num = parseInt(matches[0].replace(/\s/g, ""), 10);
    if (!isNaN(num) && num >= 50000) return num;
  }

  return 200000;
}

/**
 * Analyse intelligente de la description du prospect pour contextualisation maximale
 */
export function analyzeClientDescription(
  rawDesc: string,
  clientName: string,
  serviceKey: string
) {
  const clean = (rawDesc || "").trim();
  const lower = clean.toLowerCase();

  // Détection du secteur ou produit clé
  let theme = "";
  if (lower.includes("chaussure") || lower.includes("soulier") || lower.includes("basket") || lower.includes("maroquinerie")) {
    theme = "Chaussures & Maroquinerie";
  } else if (lower.includes("vêtement") || lower.includes("vetement") || lower.includes("mode") || lower.includes("habit") || lower.includes("couture") || lower.includes("robe") || lower.includes("tissu")) {
    theme = "Prêt-à-Porter & Mode";
  } else if (lower.includes("bijou") || lower.includes("montre") || lower.includes("accessoire")) {
    theme = "Bijoux & Accessoires de Luxe";
  } else if (lower.includes("cosmétique") || lower.includes("cosmetique") || lower.includes("beauté") || lower.includes("beaute") || lower.includes("soin") || lower.includes("crème") || lower.includes("creme") || lower.includes("savon")) {
    theme = "Cosmétiques & Soins Beauté";
  } else if (lower.includes("btp") || lower.includes("construction") || lower.includes("bâtiment") || lower.includes("batiment") || lower.includes("chantier") || lower.includes("rénovation") || lower.includes("renovation")) {
    theme = "BTP, Construction & Rénovation";
  } else if (lower.includes("immobilier") || lower.includes("terrain") || lower.includes("villa") || lower.includes("appartement") || lower.includes("parcelle")) {
    theme = "Immobilier & Promotion Foncière";
  } else if (lower.includes("miel")) {
    theme = "Miel Naturel & Produits de la Ruche";
  } else if (lower.includes("alimentaire") || lower.includes("agro") || lower.includes("restaurant") || lower.includes("traiteur") || lower.includes("boisson") || lower.includes("repas") || lower.includes("fast food")) {
    theme = "Restauration & Agroalimentaire";
  } else if (lower.includes("formation") || lower.includes("cours") || lower.includes("école") || lower.includes("ecole") || lower.includes("étudiant") || lower.includes("etudiant") || lower.includes("certif")) {
    theme = "Formation & Éducation";
  } else if (lower.includes("e-commerce") || lower.includes("boutique") || lower.includes("vente en ligne") || lower.includes("commander") || lower.includes("magasin")) {
    theme = "E-Commerce & Vente de Produits";
  } else if (lower.includes("santé") || lower.includes("sante") || lower.includes("médical") || lower.includes("medical") || lower.includes("clinique")) {
    theme = "Santé & Soins Médicaux";
  }

  // Synthèse soignée du besoin exprimé
  let descriptionProjet = clean;
  if (clean.length > 250) {
    descriptionProjet = clean.slice(0, 247) + "...";
  } else if (clean.length < 5) {
    descriptionProjet = "Développement de la visibilité et acquisition de nouveaux clients qualifiés sur Meta.";
  }

  // Titre sur-mesure intégrant la description ou le thème
  let titreDevis = "Campagne Publicitaire Meta Ads — Visibilité & Ventes";
  if (theme) {
    if (serviceKey.includes("multi")) {
      titreDevis = `Campagne Multi-Plateformes — ${theme}`;
    } else if (serviceKey.includes("acquisition") || serviceKey.includes("prospect")) {
      titreDevis = `Tunnel d'Acquisition de Prospects — ${theme}`;
    } else if (serviceKey.includes("global")) {
      titreDevis = `Accompagnement 360° — ${theme}`;
    } else {
      titreDevis = `Campagne Meta Ads — Vente & Notoriété : ${theme}`;
    }
  } else if (clean.length >= 12 && !lower.includes("bonjour") && !lower.includes("test")) {
    const firstSentence = clean.split(/[.!?\n]/)[0].trim();
    if (firstSentence.length >= 10 && firstSentence.length <= 60) {
      titreDevis = `Campagne Meta Ads — ${firstSentence}`;
    }
  }

  // Introduction sur-mesure reprenant le besoin client
  const introContext = theme
    ? `votre projet dans le secteur « ${theme} »`
    : clean.length >= 15
    ? `votre projet (« ${descriptionProjet.length > 70 ? descriptionProjet.slice(0, 67) + "..." : descriptionProjet} »)`
    : "le développement de votre activité digitale";

  const introduction = `Bonjour ${clientName}, suite à votre demande sur notre site concernant ${introContext}, l'agence SAMA PUB à Dakar a élaboré cette proposition d'accompagnement sur-mesure afin d'accélérer vos résultats commerciaux.`;

  // Mission contextualisée pour le déploiement sur Meta
  const missionDesc = theme
    ? `L'agence SAMA PUB prend en charge le déploiement et le placement intelligent de l'intégralité de votre budget publicitaire sur la plateforme Meta (Facebook & Instagram). Nos experts configurent une stratégie d'acquisition chirurgicale spécifiquement optimisée pour promouvoir vos offres de ${theme}, cibler avec précision les acheteurs qualifiés à Dakar et au Sénégal, éliminer les dépenses inutiles et maximiser vos ventes.`
    : `L'agence SAMA PUB prend en charge le déploiement et le placement intelligent de l'intégralité de votre budget publicitaire sur la plateforme Meta (Facebook & Instagram). Nos experts configurent une stratégie d'acquisition sur-mesure adaptée aux spécificités de votre projet (« ${descriptionProjet.length > 90 ? descriptionProjet.slice(0, 87) + "..." : descriptionProjet} ») afin de cibler avec précision votre audience idéale au Sénégal et de maximiser vos résultats commerciaux.`;

  return {
    titreDevis,
    introduction,
    descriptionProjet,
    missionDesc,
  };
}

/**
 * Recalcul strict de tous les totaux côté serveur selon la règle des 15%
 */
export function sanitizeAndRecalculateTotals(
  data: Partial<DevisData>,
  metaBudget: number,
  rawDescription?: string,
  baseUrl?: string
): DevisData {
  const totalHonoraires = Math.round(metaBudget * 0.15);
  const tranche1 = Math.round(totalHonoraires * 0.5);
  const tranche2 = totalHonoraires - tranche1;
  const totalGeneral = metaBudget + totalHonoraires;

  const clientName = data.client?.nom || "Client";
  const serviceKey = String(data.service || "Media Buying").toLowerCase();
  const analysis = analyzeClientDescription(rawDescription || "", clientName, serviceKey);

  const cleanDescription = (rawDescription || "").trim();
  const descriptionProjet =
    data.description_projet ||
    analysis.descriptionProjet ||
    (cleanDescription.length > 0
      ? cleanDescription.slice(0, 250)
      : "Développement de la visibilité et acquisition de nouveaux clients qualifiés sur Meta.");

  const missionDesc =
    data.mission_description ||
    analysis.missionDesc ||
    "L'agence SAMA PUB prend en charge le déploiement et le placement intelligent de l'intégralité de votre budget publicitaire sur la plateforme Meta (Facebook & Instagram) afin de maximiser le retour sur investissement.";

  // Message WhatsApp : court, exécutif et orienté PDF (sans texte brut rébarbatif)
  const devisPdfUrl = data.id_demande && baseUrl
    ? `${baseUrl}/api/devis-pdf?id=${data.id_demande}`
    : "";

  const linkLine = devisPdfUrl
    ? `\n\n📄 Vous pouvez consulter et télécharger votre devis officiel (PDF) directement ici :\n${devisPdfUrl}`
    : "";

  const defaultMessageWhatsapp = `Bonjour ${clientName},\n\nL'agence SAMA PUB a préparé votre devis officiel pour votre projet (« ${data.titre_devis || analysis.titreDevis} »).${linkLine}\n\nLe document PDF haute fidélité est joint ci-dessous.\n\nRestant à votre entière disposition pour échanger sur le lancement de votre campagne,\nL'équipe SAMA PUB Dakar`;

  return {
    fiable: data.fiable !== false,
    alertes_internes: Array.isArray(data.alertes_internes) ? data.alertes_internes : [],
    client: {
      nom: clientName,
      entreprise: String(data.client?.entreprise || "").trim(),
      whatsapp: String(data.client?.whatsapp || "").trim(),
      email: String(data.client?.email || "").trim(),
    },
    service: String(data.service || "Media Buying (Campagnes Pubs)").trim(),
    titre_devis: String(data.titre_devis || analysis.titreDevis).trim(),
    introduction:
      String(data.introduction || "").trim() ||
      analysis.introduction,
    description_projet: descriptionProjet,
    mission_description: missionDesc,
    lignes: [],
    total_honoraires: totalHonoraires,
    budget_publicitaire_recommande: metaBudget,
    tranche_1_prestation: tranche1,
    tranche_2_prestation: tranche2,
    total_general: totalGeneral,
    notes:
      "Clause de liberté & Flexibilité : Vous pouvez arrêter la campagne à tout moment si vous n'êtes pas satisfait. L'intégralité du budget publicitaire Meta restant non dépensé vous sera immédiatement reversée sur votre compte.",
    validite: "15 jours à compter de la date d'émission",
    conditions_paiement:
      "Budget publicitaire Meta (100%) versé intégralement à l'agence pour être déposé sur la plateforme. Prestation de l'agence (15%) payable au choix en 2 tranches : 50% au lancement et 50% après 15 jours.",
    message_whatsapp: defaultMessageWhatsapp,
    email_objet: String(data.email_objet || `SAMA PUB — Votre proposition de devis : ${data.titre_devis || analysis.titreDevis}`).trim(),
    email_corps: String(data.email_corps || `Bonjour ${clientName},\n\nVeuillez trouver ci-joint notre proposition commerciale détaillée pour votre projet.\n\nRestant à votre disposition,\nL'équipe SAMA PUB`).trim(),
    id_demande: data.id_demande,
    numero_devis: data.numero_devis,
    date_generation: data.date_generation,
  };
}

/**
 * Générateur dynamique autonome basé sur les informations soumises par le lead
 */
export function generateDynamicDevisFromLead(
  body: DevisGenerationRequest | any,
  baseUrl?: string
): DevisData {
  const alertes: string[] = [];
  let isFiable = true;

  let cleanedEntreprise = (body.entreprise || body.company_name || "").trim();
  if (cleanedEntreprise.includes("@") || cleanedEntreprise.toLowerCase().endsWith(".com")) {
    alertes.push(
      `Champ entreprise mal renseigné : contient une adresse e-mail ou un domaine (${cleanedEntreprise}).`
    );
    cleanedEntreprise = "";
  }

  const cleanDescription = (body.description || body.message || "").trim();
  if (cleanDescription.length < 15 || cleanDescription.toLowerCase().includes("test")) {
    alertes.push(
      "Description du besoin très courte ou test potentiel. Vérifier la qualification."
    );
    isFiable = false;
  }

  const metaBudget = extractBudgetAmount(body.budget_mensuel || body.budget_range || "");
  const serviceKey = (body.service || body.service_requested || "media").toLowerCase();
  let serviceTitle = "Media Buying (Campagnes Pubs)";
  if (serviceKey.includes("multi")) serviceTitle = "Publicité Multi-canaux";
  else if (serviceKey.includes("acquisition") || serviceKey.includes("prospect")) serviceTitle = "Acquisition de Prospects";
  else if (serviceKey.includes("global")) serviceTitle = "Marketing Digital Global";

  const clientName = body.nom_complet || body.full_name || "Client";
  const cleanId = (body.id || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const shortId = cleanId ? cleanId.slice(0, 8) : Date.now().toString().slice(-6);
  const currentYear = new Date().getFullYear();

  const partial: Partial<DevisData> = {
    fiable: isFiable,
    alertes_internes: alertes,
    client: {
      nom: clientName,
      entreprise: cleanedEntreprise,
      whatsapp: body.whatsapp || body.whatsapp_number || body.contact_value || "",
      email: body.email || "",
    },
    service: serviceTitle,
    id_demande: body.id,
    numero_devis: `DEV-${currentYear}-${shortId}`,
    date_generation: new Date().toISOString(),
  };

  return sanitizeAndRecalculateTotals(partial, metaBudget, cleanDescription, baseUrl);
}

/**
 * Générateur dynamique autonome spécifique pour les demandes de création de site internet.
 * Garantit un devis 100% personnalisé et cohérent avec les descriptions et options du formulaire.
 */
export function generateDynamicWebsiteDevis(
  body: DevisGenerationRequest | any,
  baseUrl?: string
): DevisData {
  const alertes: string[] = [];
  const isFiable = true;

  // Si l'objet reçu provient directement de la base Supabase (contient lead.message brut), on le parse proprement
  const rawMessageField = String(body.message || body.description || "");
  const hasEmbeddedMetadata =
    Boolean(body.message) ||
    rawMessageField.includes("<!--WEBSITE_ORDER_DATA:") ||
    rawMessageField.includes("[Détails devis");

  const parsedLead = hasEmbeddedMetadata ? parseWebsiteOrderDetails(body) : null;

  let cleanedEntreprise = (body.entreprise || body.company_name || "").trim();
  if (
    cleanedEntreprise.includes("@") ||
    cleanedEntreprise.toLowerCase().endsWith(".com") ||
    cleanedEntreprise.toLowerCase() === "particulier"
  ) {
    cleanedEntreprise = "";
  }

  const clientName = body.nom_complet || body.full_name || "Client";
  const cleanDescription = (
    parsedLead ? parsedLead.cleanDescription : body.description || ""
  )
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\[Détails devis\s*:[^\]]*\]/gi, "")
    .trim();

  // Résolution exacte du Type de site et de la Formule définis dans le formulaire
  const catalog = resolveWebsiteCatalogSelection({
    typeId: parsedLead?.typeId,
    typeSite: body.type_site || parsedLead?.typeLabel,
    formulaId: parsedLead?.formulaId,
    formuleSite: body.formule_site || parsedLead?.formulaName,
    service: body.service || body.service_requested,
    rawMessage: rawMessageField,
    explicitOptions: Array.isArray(body.options_site) ? body.options_site : undefined,
  });

  const typeTitle = catalog.typeTitle;
  const formulaName = catalog.formulaName;
  const deadlineLabel =
    body.delai_site || parsedLead?.deadlineLabel || "2 à 4 semaines";

  let priceFCFA = catalog.priceFCFA;
  const rawBudget = (body.budget_mensuel || body.budget_range || "").toLowerCase();
  const budgetDigits = rawBudget.replace(/\D/g, "");
  if (budgetDigits && parseInt(budgetDigits, 10) >= 100000 && priceFCFA === 0) {
    priceFCFA = parseInt(budgetDigits, 10);
  }

  const tranche1 = priceFCFA > 0 ? Math.round(priceFCFA * 0.5) : 0;
  const tranche2 = priceFCFA > 0 ? priceFCFA - tranche1 : 0;

  // Liste exacte des options définies dans le formulaire pour cette formule (+ options explicites éventuelles)
  const allOptions = Array.from(
    new Set([...catalog.formulaOptions, ...catalog.explicitExtraOptions])
  );

  // Titre personnalisé selon le type de site choisi et l'entreprise ou la demande du client
  let titreDevis = `Création de ${typeTitle} (${formulaName})`;
  if (cleanedEntreprise) {
    titreDevis = `Création de ${typeTitle} — ${cleanedEntreprise}`;
  } else if (cleanDescription.length >= 10 && !cleanDescription.toLowerCase().includes("test")) {
    const firstPhrase = cleanDescription.split(/[.!?\n]/)[0].trim().slice(0, 48);
    if (firstPhrase.length >= 8) {
      titreDevis = `Création de ${typeTitle} — ${firstPhrase}`;
    }
  }

  const cleanId = (body.id || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const shortId = cleanId ? cleanId.slice(0, 8) : Date.now().toString().slice(-6);
  const currentYear = new Date().getFullYear();
  const numeroDevis = `WEB-${currentYear}-${shortId}`;

  const devisPdfUrl = body.id && baseUrl ? `${baseUrl}/api/devis-pdf?id=${body.id}&type=website` : "";
  const linkLine = devisPdfUrl ? `\n\n📄 Vous pouvez consulter et télécharger votre devis officiel (PDF) directement ici :\n${devisPdfUrl}` : "";

  const hasClientNeed =
    cleanDescription.length >= 8 &&
    !cleanDescription.toLowerCase().startsWith("création de site internet professionnel");

  const projectSummary = hasClientNeed
    ? cleanDescription.slice(0, 350)
    : `${typeTitle} : ${catalog.typeDescription}`;

  const introduction = hasClientNeed
    ? `Bonjour ${clientName}, suite à votre demande concernant votre projet (« ${cleanDescription.length > 90 ? cleanDescription.slice(0, 87) + "..." : cleanDescription} »), l'agence SAMA PUB à Dakar a le plaisir de vous présenter ce devis pour la réalisation de votre ${typeTitle} selon la formule ${formulaName}.`
    : `Bonjour ${clientName}, suite à votre demande pour la création de votre ${typeTitle} (formule ${formulaName}), l'agence SAMA PUB à Dakar a le plaisir de vous transmettre cette proposition commerciale conforme à vos choix.`;

  // Explication claire et personnalisée de ce qui sera réalisé dans le site, fidèle au type et à la formule choisis
  const missionDesc = sanitizeWebsiteQuoteText(
    hasClientNeed
      ? `Réalisation de votre ${typeTitle.toLowerCase()} pour répondre précisément à votre besoin (« ${cleanDescription.length > 160 ? cleanDescription.slice(0, 157) + "..." : cleanDescription} »). Conformément au type de site sélectionné (${catalog.typeDescription}) et à la formule ${formulaName} (${catalog.formulaDescription}), SAMA PUB assure la conception graphique et la mise en place exacte des éléments prévus ci-dessous.`
      : `Réalisation de votre ${typeTitle.toLowerCase()} : ${catalog.typeDescription} ${catalog.formulaDescription} SAMA PUB assure la conception graphique et le déploiement clé en main des éléments définis dans la formule ${formulaName}.`
  );

  const lines = [
    {
      designation: `${typeTitle} — Formule ${formulaName}`,
      description: `${catalog.typeDescription} Options comprises : ${allOptions.join(" · ")}.`,
      quantite: 1,
      prix_unitaire: priceFCFA,
      total: priceFCFA,
    },
  ];

  return {
    fiable: isFiable,
    alertes_internes: alertes,
    client: {
      nom: clientName,
      entreprise: cleanedEntreprise,
      whatsapp: body.whatsapp || body.whatsapp_number || body.contact_value || "",
      email: body.email || "",
    },
    service: `Création de site internet (${formulaName})`,
    titre_devis: titreDevis,
    introduction,
    description_projet: projectSummary,
    mission_description: missionDesc,
    lignes: lines,
    options_site: allOptions,
    total_honoraires: priceFCFA,
    budget_publicitaire_recommande: 0,
    tranche_1_prestation: tranche1,
    tranche_2_prestation: tranche2,
    total_general: priceFCFA,
    notes: "Éléments inclus (Offert) : Nom de domaine et hébergement pendant 1 an, Design Mobile-First responsive. Propriété intégrale du site et des accès administratifs cédée au client à la livraison.",
    validite: "15 jours à compter de la date d'émission",
    conditions_paiement: "Modalités de paiement : 50% d'acompte à la commande / validation du projet, et 50% restant à la livraison finale et mise en ligne.",
    message_whatsapp: `Bonjour ${clientName},\n\nL'agence SAMA PUB a préparé votre devis officiel pour votre projet (« ${titreDevis} »).${linkLine}\n\nLe document PDF haute fidélité est joint ci-dessous.\n\nRestant à votre disposition pour planifier le lancement des travaux,\nL'équipe SAMA PUB Dakar`,
    email_objet: `SAMA PUB — Votre devis de création de site internet : ${titreDevis}`,
    email_corps: `Bonjour ${clientName},\n\nNous vous remercions pour l'intérêt porté à l'agence SAMA PUB. Veuillez trouver ci-joint notre proposition détaillée pour votre projet de site internet.\n\nRestant à votre écoute,\nL'équipe SAMA PUB Dakar`,
    id_demande: body.id,
    numero_devis: numeroDevis,
    date_generation: new Date().toISOString(),
    type_devis: "website",
    type_site: typeTitle,
    formule_site: formulaName,
    delai_site: deadlineLabel,
  };
}
