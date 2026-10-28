import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  CONFIRMATION_COOKIE_NAME,
  verifyConfirmationCookie,
} from "@/lib/website-quote-security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Route POST /api/devis-site-web/mark-lead-sent
 * Marque l'événement Meta Pixel "Lead" comme ayant déjà été déclenché
 * pour ce devis afin d'empêcher rigoureusement tout double déclenchement
 * en cas de rafraîchissement, bouton retour ou réouverture.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieValue = req.cookies.get(CONFIRMATION_COOKIE_NAME)?.value;
    const body = await req.json().catch(() => ({}));
    const { ref } = body;

    if (!ref || typeof ref !== "string") {
      return NextResponse.json(
        { success: false, error: "Numéro de devis manquant." },
        { status: 400 }
      );
    }

    // 1. Vérification stricte du jeton de confirmation
    const verification = verifyConfirmationCookie(ref, cookieValue);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: "Jeton non valide ou expiré." },
        { status: 403 }
      );
    }

    // 2. Recherche du devis en base de données
    const { data: leads, error: fetchError } = await supabase
      .from("leads_quotes")
      .select("id, message")
      .ilike("message", `%${ref}%`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError || !leads || leads.length === 0) {
      return NextResponse.json(
        { success: false, error: "Devis introuvable." },
        { status: 404 }
      );
    }

    const targetLead = leads[0];
    const rawMessage = targetLead.message || "";

    // 3. Mise à jour de l'indicateur leadEventSent dans les données structurées
    if (rawMessage.includes("<!--WEBSITE_ORDER_DATA:")) {
      const updatedMessage = rawMessage.replace(
        /<!--WEBSITE_ORDER_DATA:([\s\S]*?)-->/,
        (match, jsonStr) => {
          try {
            const parsed = JSON.parse(jsonStr);
            parsed.leadEventSent = true;
            parsed.leadEventSentAt = new Date().toISOString();
            return `<!--WEBSITE_ORDER_DATA:${JSON.stringify(parsed)}-->`;
          } catch {
            return match;
          }
        }
      );

      await supabase
        .from("leads_quotes")
        .update({ message: updatedMessage })
        .eq("id", targetLead.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur dans /api/devis-site-web/mark-lead-sent:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
