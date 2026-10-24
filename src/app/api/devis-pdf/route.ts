import { NextRequest, NextResponse } from "next/server";
import React from "react";
import path from "path";
import fs from "fs";
import { pdf } from "@react-pdf/renderer";
import { DevisPdfDocument } from "@/components/admin/DevisPdfDocument";
import { generateDynamicDevisFromLead } from "@/lib/devis-generator";
import { supabase } from "@/lib/supabase";
import type { DevisData } from "@/types/devis";

export const dynamic = "force-dynamic";

/**
 * Charge le logo officiel SAMA PUB au format Base64 pour un rendu immédiat et infaillible
 */
function getLogoDataUri(): string {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "logo-sp.png");
    if (fs.existsSync(logoPath)) {
      const buf = fs.readFileSync(logoPath);
      // Détection automatique du type d'image (JPEG JFIF vs PNG)
      const mime = buf[0] === 0x89 ? "image/png" : "image/jpeg";
      return `data:${mime};base64,${buf.toString("base64")}`;
    }
  } catch (err) {
    console.warn("Impossible de charger le logo localement :", err);
  }
  return "";
}

/**
 * Route GET /api/devis-pdf?id=[leadId]
 * Génère et sert directement le document PDF A4 haute fidélité SAMA PUB.
 * Accessible en direct par le client ou l'administrateur sans aucun problème de blob.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Identifiant de demande manquant (?id=...)." },
        { status: 400 }
      );
    }

    // 1. Récupération des informations de la demande depuis Supabase
    const { data: lead, error: dbError } = await supabase
      .from("leads_quotes")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError || !lead) {
      return NextResponse.json(
        { error: "Demande de devis introuvable ou inexistante." },
        { status: 404 }
      );
    }

    // 2. Génération de la structure de devis officielle
    const origin = req.nextUrl.origin;
    const devis: DevisData = generateDynamicDevisFromLead(lead, origin);

    // 3. Rendu du document PDF A4
    const logoDataUri = getLogoDataUri();
    const docInstance = React.createElement(DevisPdfDocument, {
      devis,
      logoUrl: logoDataUri,
    });

    const pdfInstance = pdf(docInstance as any);
    const blob = await pdfInstance.toBlob();
    const arrayBuf = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const clientSlug = (lead.company_name || lead.full_name || "client")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
    const filename = `Devis-SAMA-PUB-${devis.numero_devis || clientSlug}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err: any) {
    console.error("Erreur génération PDF dans /api/devis-pdf :", err);
    return NextResponse.json(
      { error: "Impossible de générer le document PDF." },
      { status: 500 }
    );
  }
}

/**
 * Route POST /api/devis-pdf
 * Permet de convertir directement un objet devis JSON complet en document PDF binaire
 */
export async function POST(req: NextRequest) {
  try {
    const devis: DevisData = await req.json();

    if (!devis || !devis.client) {
      return NextResponse.json(
        { error: "Données de devis invalides." },
        { status: 400 }
      );
    }

    const logoDataUri = getLogoDataUri();
    const docInstance = React.createElement(DevisPdfDocument, {
      devis,
      logoUrl: logoDataUri,
    });

    const pdfInstance = pdf(docInstance as any);
    const blob = await pdfInstance.toBlob();
    const arrayBuf = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const clientSlug = (devis.client.entreprise || devis.client.nom || "client")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
    const filename = `Devis-SAMA-PUB-${devis.numero_devis || clientSlug}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err: any) {
    console.error("Erreur POST /api/devis-pdf :", err);
    return NextResponse.json(
      { error: "Impossible de générer le document PDF." },
      { status: 500 }
    );
  }
}
