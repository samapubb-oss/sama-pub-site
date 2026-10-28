import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  websiteFormulas,
  websiteTypes,
  websiteFeatures,
  projectDeadlines,
} from "@/data/websitePricingConfig";
import {
  generateQuoteReference,
  generateConfirmationToken,
  CONFIRMATION_EXPIRATION_MS,
  buildCookiePayload,
  CONFIRMATION_COOKIE_NAME,
} from "@/lib/website-quote-security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Route POST /api/devis-site-web
 * Valide et enregistre un devis de site internet en base de données,
 * génère le numéro de devis (ex: WEB-9119) et un jeton de confirmation sécurisé (30 min),
 * et dépose un cookie HttpOnly SameSite=Lax.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      fullName,
      companyName,
      whatsappNumber,
      email,
      deadline = "standard",
      projectDescription = "",
      selectedType = "vitrine",
      otherTypeDetail = "",
      selectedFormulaId = "vitrine",
      selectedFeatures = [],
    } = body;

    // 1. Validation stricte côté serveur
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Veuillez renseigner votre nom complet (au moins 2 caractères)." },
        { status: 400 }
      );
    }

    if (!whatsappNumber || typeof whatsappNumber !== "string") {
      return NextResponse.json(
        { success: false, error: "Le numéro WhatsApp est obligatoire." },
        { status: 400 }
      );
    }

    // Nettoyage et contrôle du numéro WhatsApp sénégalais (9 chiffres stricts)
    const digitsOnly = whatsappNumber.replace(/\D/g, "");
    let cleanDigits = digitsOnly;
    if (cleanDigits.startsWith("221") && cleanDigits.length === 12) {
      cleanDigits = cleanDigits.slice(3);
    } else if (cleanDigits.startsWith("00221") && cleanDigits.length === 14) {
      cleanDigits = cleanDigits.slice(5);
    }

    if (cleanDigits.length !== 9) {
      return NextResponse.json(
        {
          success: false,
          error: "Le numéro WhatsApp doit comporter exactement 9 chiffres (ex: 77 123 45 67).",
        },
        { status: 400 }
      );
    }

    const validPrefixes = ["70", "75", "76", "77", "78", "33"];
    const hasValidPrefix = validPrefixes.some((pref) => cleanDigits.startsWith(pref));
    if (!hasValidPrefix) {
      return NextResponse.json(
        {
          success: false,
          error: "Le numéro doit débuter par un indicatif sénégalais valide (77, 78, 76, 70, 75 ou 33).",
        },
        { status: 400 }
      );
    }

    // Validation email si fourni
    if (email && typeof email === "string" && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { success: false, error: "L'adresse e-mail renseignée n'est pas valide." },
          { status: 400 }
        );
      }
    }

    // 2. Détermination des libellés et tarifs configurés
    const formula =
      websiteFormulas.find((f) => f.id === selectedFormulaId) || websiteFormulas[1];
    const typeObj = websiteTypes.find((t) => t.id === selectedType);
    const deadlineObj = projectDeadlines.find((d) => d.id === deadline);

    const typeLabel =
      selectedType === "autre" && otherTypeDetail.trim()
        ? otherTypeDetail.trim()
        : typeObj?.title || selectedType;

    const formattedFeatures = Array.isArray(selectedFeatures)
      ? selectedFeatures
      : [];

    const featuresLabels = formattedFeatures
      .map((fId: string) => websiteFeatures.find((f) => f.id === fId)?.label)
      .filter(Boolean)
      .join(", ");

    // 3. Génération de la référence de devis et du jeton aléatoire
    const ref = generateQuoteReference();
    const token = generateConfirmationToken();
    const expiresAt = Date.now() + CONFIRMATION_EXPIRATION_MS;
    const cookiePayload = buildCookiePayload(ref, token, expiresAt);

    // 4. Construction des données structurées pour persistence
    const structuredData = {
      ref,
      token,
      expiresAt,
      leadEventSent: false,
      typeId: selectedType,
      typeLabel,
      formulaId: formula.id,
      formulaName: formula.name,
      priceFCFA: formula.priceFCFA,
      formattedPrice: formula.formattedPrice,
      features: formattedFeatures,
      deadlineId: deadline,
      deadlineLabel: deadlineObj?.label || "Standard (10 à 14 jours)",
      description: projectDescription.trim(),
    };

    const optionsSection = featuresLabels ? ` | Options: ${featuresLabels}` : "";
    const fullMessage = `${projectDescription.trim()}\n\n[Détails devis : Réf ${ref} | Type: ${typeLabel} | Formule: ${formula.name}${optionsSection} | Délai: ${deadlineObj?.label || "Standard"}]\n<!--WEBSITE_ORDER_DATA:${JSON.stringify(structuredData)}-->`;

    // 5. Enregistrement en base de données Supabase (leads_quotes)
    const { data: insertedData, error: dbError } = await supabase
      .from("leads_quotes")
      .insert({
        full_name: fullName.trim(),
        company_name: (companyName || "").trim() || "Particulier",
        whatsapp_number: `+221 ${cleanDigits}`,
        email: (email || "").trim() || null,
        service_requested: `Création de site internet (${formula.name})`,
        budget_range: formula.formattedPrice,
        message: fullMessage,
        contact_channel: "website_order",
        contact_value: `+221 ${cleanDigits}`,
        status: "new",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Erreur insertion devis site web Supabase:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Une erreur est survenue lors de l'enregistrement de votre devis. Veuillez réessayer.",
        },
        { status: 500 }
      );
    }

    // 6. Réponse avec dépôt du cookie sécurisé HttpOnly
    const response = NextResponse.json(
      {
        success: true,
        ref,
        token,
        leadId: insertedData?.id,
      },
      { status: 201 }
    );

    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set({
      name: CONFIRMATION_COOKIE_NAME,
      value: cookiePayload,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: Math.floor(CONFIRMATION_EXPIRATION_MS / 1000), // 1800s (30 minutes)
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Exception dans /api/devis-site-web:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur inattendue lors du traitement de votre demande.",
      },
      { status: 500 }
    );
  }
}
