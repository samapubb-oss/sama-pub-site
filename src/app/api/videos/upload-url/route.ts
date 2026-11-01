import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  HiggsfieldClientError,
  createHiggsfieldPresignedUpload,
  sanitizeDiagnosticText,
} from "@/lib/higgsfield";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/videos/upload-url
 * Génère côté serveur une URL pré-signée temporaire Higgsfield (images JPG/PNG/WebP/GIF ou vidéos MP4)
 * sans jamais exposer les identifiants API Higgsfield au navigateur.
 * Permet d'importer jusqu'à 10 images et 5 vidéos MP4 sans être bloqué par la limite de 4.5 Mo de Vercel.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json(
        {
          success: false,
          error: "Accès non autorisé. Veuillez vous connecter au dashboard.",
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Paramètres de préparation de téléversement invalides.",
        },
        { status: 400 }
      );
    }

    const contentType = String(body.contentType || "").trim().toLowerCase();
    const sizeBytes = Number(body.sizeBytes || 0);

    const presigned = await createHiggsfieldPresignedUpload({
      contentType,
      sizeBytes,
    });

    return NextResponse.json({
      success: true,
      uploadUrl: presigned.uploadUrl,
      publicUrl: presigned.publicUrl,
      uploadHeaders: presigned.uploadHeaders,
      contentType: presigned.normalizedContentType,
    });
  } catch (err: unknown) {
    if (err instanceof HiggsfieldClientError) {
      return NextResponse.json(
        {
          success: false,
          code: err.code,
          error: err.message,
        },
        { status: err.statusCode }
      );
    }

    console.error(
      "Exception POST /api/videos/upload-url :",
      sanitizeDiagnosticText(err)
    );
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la préparation du téléversement média.",
      },
      { status: 500 }
    );
  }
}

