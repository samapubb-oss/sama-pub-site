import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { DEVIS_SYSTEM_PROMPT } from "@/lib/devis-config";
import { WEBSITE_DEVIS_SYSTEM_PROMPT } from "@/lib/website-devis-prompt";
import { generateDynamicWebsiteDevis } from "@/lib/devis-generator";
import type { DevisData, DevisGenerationRequest } from "@/types/devis";

// Limitation simple de fréquence en mémoire (10 requêtes par minute)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ipOrId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ipOrId) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ipOrId, validTimestamps);
  return true;
}

// Extraction du montant numérique du budget mensuel
function extractBudgetAmount(raw: string): number {
  if (!raw) return 200000;
  const clean = raw.toLowerCase().replace(/\s/g, "");

  if (clean.includes("100") && clean.includes("250")) return 150000;
  if (clean.includes("250") && clean.includes("500")) return 250000;
  if (clean.includes("500") && clean.includes("750")) return 500000;
  if (clean.includes("750") || clean.includes("1m") || (clean.includes("750") && clean.includes("1000"))) return 750000;
  if (clean.includes("plus") || clean.includes("+") || clean.includes("1000000")) return 1000000;

  // Recherche de chiffres consécutifs
  const matches = raw.match(/\d[\d\s]*\d|\d+/g);
  if (matches && matches.length > 0) {
    const num = parseInt(matches[0].replace(/\s/g, ""), 10);
    if (!isNaN(num) && num >= 50000) return num;
  }

  return 200000;
}

// Extraction et nettoyage du JSON
function parseClaudeJson(rawContent: string): DevisData {
  let cleaned = rawContent.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned.trim());
}

// Analyse intelligente de la description du prospect pour contextualisation maximale
function analyzeClientDescription(
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

// Recalcul strict de tous les totaux côté serveur selon la règle des 15%
function sanitizeAndRecalculateTotals(
  data: any,
  forcedMetaBudget?: number,
  fallbackDescription?: string
): DevisData {
  const metaBudget =
    forcedMetaBudget !== undefined && forcedMetaBudget > 0
      ? forcedMetaBudget
      : typeof data.budget_publicitaire_recommande === "number" && data.budget_publicitaire_recommande > 0
      ? data.budget_publicitaire_recommande
      : 200000;

  // RÈGLE MÉTIER STRICTE : La prestation de l'agence = EXACTEMENT 15% du budget Meta
  const totalHonoraires = Math.round(metaBudget * 0.15);
  const tranche1 = Math.round(totalHonoraires * 0.5);
  const tranche2 = totalHonoraires - tranche1;
  const totalGeneral = metaBudget + totalHonoraires;

  const clientName = String(data.client?.nom || "").trim() || "Client";

  // Récupération ou déduction du projet client
  const descriptionProjet =
    String(data.description_projet || "").trim() ||
    (fallbackDescription && fallbackDescription.trim().length >= 5
      ? fallbackDescription.trim()
      : "Développement des ventes et acquisition ciblée de clients qualifiés sur Meta.");

  const missionDesc =
    String(data.mission_description || "").trim() ||
    "L'agence SAMA PUB prend en charge le déploiement et le placement intelligent de l'intégralité de votre budget publicitaire sur la plateforme Meta (Facebook & Instagram). Nos experts configurent une stratégie d'acquisition sur-mesure afin de cibler avec précision vos clients idéaux au Sénégal, de rentabiliser chaque franc investi et d'optimiser continuellement les résultats (contacts qualifiés, visibilité et ventes).";

  return {
    fiable: typeof data.fiable === "boolean" ? data.fiable : true,
    alertes_internes: Array.isArray(data.alertes_internes)
      ? data.alertes_internes.map((a: any) => String(a))
      : [],
    client: {
      nom: clientName,
      entreprise: String(data.client?.entreprise || "").trim(),
      whatsapp: String(data.client?.whatsapp || "").trim(),
      email: String(data.client?.email || "").trim(),
    },
    service: String(data.service || "Media Buying (Campagnes Pubs)").trim(),
    titre_devis: String(data.titre_devis || "Campagne Publicitaire Meta Ads — Visibilité & Ventes").trim(),
    introduction:
      String(data.introduction || "").trim() ||
      `Bonjour ${clientName}, suite à votre demande sur notre site concernant votre projet (« ${descriptionProjet.length > 70 ? descriptionProjet.slice(0, 67) + "..." : descriptionProjet} »), l'agence SAMA PUB à Dakar vous présente cette proposition d'accompagnement sur-mesure.`,
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
    message_whatsapp: String(data.message_whatsapp || "").trim(),
    email_objet: String(data.email_objet || "").trim(),
    email_corps: String(data.email_corps || "").trim(),
  };
}

/**
 * Générateur dynamique basé directement sur les informations client soumises.
 */
function generateDynamicDevisFromLead(body: DevisGenerationRequest): DevisData {
  const alertes: string[] = [];
  let isFiable = true;

  // 1. Contrôle du champ entreprise
  let cleanedEntreprise = (body.entreprise || "").trim();
  if (cleanedEntreprise.includes("@") || cleanedEntreprise.toLowerCase().endsWith(".com")) {
    alertes.push(
      `Champ entreprise mal renseigné : contient une adresse e-mail ou un domaine (${cleanedEntreprise}). Le nom d'entreprise a été écarté du devis.`
    );
    cleanedEntreprise = "";
  }

  // 2. Contrôle et analyse approfondie de la description
  const cleanDescription = (body.description || "").trim();
  if (
    cleanDescription.length < 15 ||
    cleanDescription.toLowerCase().includes("salut") ||
    cleanDescription.toLowerCase() === body.nom_complet.toLowerCase()
  ) {
    alertes.push(
      `Description très courte ou vague (${JSON.stringify(cleanDescription)}). Un devis standard pour le service choisi a été préparé sans supposer de détails métier.`
    );
  }

  // 3. Déduction des montants : Budget Meta (100%) et Prestation Agence (15%)
  const metaBudget = extractBudgetAmount(body.budget_mensuel);
  const prestationAgence = Math.round(metaBudget * 0.15);
  const tranche1 = Math.round(prestationAgence * 0.5);

  const serviceKey = (body.service || "").toLowerCase();
  let serviceTitle = "Media Buying (Campagnes Pubs)";

  if (serviceKey.includes("multi")) {
    serviceTitle = "Publicité Multi-canaux";
  } else if (serviceKey.includes("acquisition") || serviceKey.includes("prospect")) {
    serviceTitle = "Acquisition de Prospects Qualifiés";
  } else if (serviceKey.includes("global") || serviceKey.includes("marketing")) {
    serviceTitle = "Marketing Digital Global";
  }

  const clientName = body.nom_complet || "Client";
  const formattedMeta = new Intl.NumberFormat("fr-FR").format(metaBudget).replace(/\u202F/g, " ");
  const formattedPrestation = new Intl.NumberFormat("fr-FR").format(prestationAgence).replace(/\u202F/g, " ");
  const formattedTranche1 = new Intl.NumberFormat("fr-FR").format(tranche1).replace(/\u202F/g, " ");

  // Analyse et contextualisation basée sur la description client
  const analysis = analyzeClientDescription(cleanDescription, clientName, serviceKey);

  const messageWhatsapp = `Bonjour ${clientName},\n\nL'agence SAMA PUB a préparé votre devis officiel pour votre projet (« ${analysis.titreDevis} »).\n\nLe document PDF officiel est joint à ce message.\n\nRestant à votre entière disposition pour échanger sur le lancement de votre campagne,\nL'équipe SAMA PUB Dakar`;

  const emailObjet = `SAMA PUB — Votre proposition de devis : ${analysis.titreDevis}`;
  const emailCorps = `Bonjour ${clientName},\n\nNous vous remercions pour votre intérêt envers SAMA PUB. Suite à l'étude de votre projet (« ${analysis.descriptionProjet} »), veuillez trouver ci-joint notre proposition commerciale détaillée.\n\nRestant à votre entière disposition,\nL'équipe SAMA PUB Dakar`;

  return sanitizeAndRecalculateTotals(
    {
      fiable: isFiable,
      alertes_internes: alertes,
      client: {
        nom: clientName,
        entreprise: cleanedEntreprise,
        whatsapp: body.whatsapp || "",
        email: body.email || "",
      },
      service: serviceTitle,
      titre_devis: analysis.titreDevis,
      introduction: analysis.introduction,
      description_projet: analysis.descriptionProjet,
      mission_description: analysis.missionDesc,
      lignes: [],
      notes: "",
      conditions_paiement: "",
      message_whatsapp: messageWhatsapp,
      email_objet: emailObjet,
      email_corps: emailCorps,
    },
    metaBudget,
    cleanDescription
  );
}

export async function POST(req: NextRequest) {
  try {
    // 1. Vérification d'authentification dashboard
    const authHeader = req.headers.get("x-sama-admin-auth");
    const authBearer = req.headers.get("authorization");
    const authCookie = req.cookies.get("sama_admin_auth")?.value;

    const isAuthenticated =
      authHeader === "true" ||
      authCookie === "true" ||
      (authBearer && authBearer.startsWith("Bearer "));

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Accès non autorisé. Veuillez vous connecter au tableau de bord." },
        { status: 401 }
      );
    }

    // 2. Limitation de fréquence
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "admin-client";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Limite de requêtes atteinte (10 générations maximum par minute). Veuillez patienter quelques instants." },
        { status: 429 }
      );
    }

    // 3. Validation des données reçues
    const body: DevisGenerationRequest = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Corps de requête invalide." },
        { status: 400 }
      );
    }

    if (!body.nom_complet || !body.whatsapp || !body.service) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (nom complet, whatsapp, service)." },
        { status: 400 }
      );
    }

    const description = (body.description || "").slice(0, 3000);
    const metaBudget = extractBudgetAmount(body.budget_mensuel);

    // Détection si la demande concerne un site web
    const srvLower = (body.service || "").toLowerCase();
    const isWebsiteOrder =
      body.type_devis === "website" ||
      srvLower.includes("site internet") ||
      srvLower.includes("création de site") ||
      srvLower.includes("creation de site") ||
      Boolean(body.formule_site);

    // 4. Clé API Anthropic (si présente, appel à Claude ; sinon, générateur dynamique)
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    let finalizedDevis: DevisData;

    if (apiKey) {
      try {
        const anthropic = new Anthropic({ apiKey });
        const rawModel = (process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5").trim();
        const model =
          rawModel === "claude-sonnet-5-5"
            ? "claude-3-5-sonnet-latest"
            : rawModel;

        const payloadForClaude = {
          id: body.id || (isWebsiteOrder ? "WEB-" : "DEV-") + Date.now(),
          nom_complet: body.nom_complet.slice(0, 100),
          entreprise: (body.entreprise || "").slice(0, 150),
          whatsapp: body.whatsapp.slice(0, 30),
          email: (body.email || "").slice(0, 100),
          service: body.service.slice(0, 50),
          budget_mensuel: (body.budget_mensuel || "").slice(0, 50),
          description: description,
          date_envoi: body.date_envoi || new Date().toISOString().slice(0, 10),
          heure_envoi: body.heure_envoi || "10:00",
          type_devis: isWebsiteOrder ? "website" : "ads",
          type_site: body.type_site || "",
          formule_site: body.formule_site || "",
          delai_site: body.delai_site || "",
        };

        const response = await anthropic.messages.create({
          model,
          max_tokens: 2500,
          system: isWebsiteOrder ? WEBSITE_DEVIS_SYSTEM_PROMPT : DEVIS_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: JSON.stringify(payloadForClaude, null, 2),
            },
          ],
        });

        const textBlock = response.content.find((block) => block.type === "text");
        if (textBlock && textBlock.type === "text") {
          const parsed = parseClaudeJson(textBlock.text);
          if (isWebsiteOrder) {
            // Recalcul strict des tranches pour les sites web (50% / 50%)
            const totalHon = typeof parsed.total_honoraires === "number" && parsed.total_honoraires > 0
              ? parsed.total_honoraires
              : typeof parsed.total_general === "number" && parsed.total_general > 0
              ? parsed.total_general
              : 300000;
            const tranche1 = Math.round(totalHon * 0.5);
            const tranche2 = totalHon - tranche1;

            finalizedDevis = {
              ...parsed,
              type_devis: "website",
              type_site: body.type_site || parsed.type_site || "Site vitrine",
              formule_site: body.formule_site || parsed.formule_site || "Site Vitrine",
              delai_site: body.delai_site || parsed.delai_site || "Standard (10 à 14 jours)",
              total_honoraires: totalHon,
              budget_publicitaire_recommande: 0,
              tranche_1_prestation: tranche1,
              tranche_2_prestation: tranche2,
              total_general: totalHon,
            };
          } else {
            finalizedDevis = sanitizeAndRecalculateTotals(parsed, metaBudget, description);
          }
        } else {
          finalizedDevis = isWebsiteOrder
            ? generateDynamicWebsiteDevis(body)
            : generateDynamicDevisFromLead(body);
        }
      } catch (anthropicErr) {
        console.warn("Appel API Anthropic en échec, bascule sur générateur dynamique :", anthropicErr);
        finalizedDevis = isWebsiteOrder
          ? generateDynamicWebsiteDevis(body)
          : generateDynamicDevisFromLead(body);
      }
    } else {
      finalizedDevis = isWebsiteOrder
        ? generateDynamicWebsiteDevis(body)
        : generateDynamicDevisFromLead(body);
    }

    // Métadonnées du devis
    const cleanId = (body.id || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const shortId = cleanId ? cleanId.slice(0, 8) : Date.now().toString().slice(-6);
    const currentYear = new Date().getFullYear();
    finalizedDevis.id_demande = body.id;
    finalizedDevis.numero_devis = isWebsiteOrder
      ? `WEB-${currentYear}-${shortId}`
      : `DEV-${currentYear}-${shortId}`;
    finalizedDevis.date_generation = new Date().toISOString();
    if (isWebsiteOrder) {
      finalizedDevis.type_devis = "website";
    }

    return NextResponse.json(finalizedDevis, { status: 200 });
  } catch (error: any) {
    console.error("Erreur route /api/generer-devis:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la génération du devis commercial." },
      { status: 500 }
    );
  }
}
