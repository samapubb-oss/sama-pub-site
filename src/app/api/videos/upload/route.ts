import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  HiggsfieldClientError,
  sanitizeDiagnosticText,
  uploadInputImageToHiggsfield,
  validateUploadedImageBuffer,
} from "@/lib/higgsfield";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/videos/upload
 * Valide strictement une image (JPG, PNG, WebP <= 4 Mo + magic bytes)
 * et la téléverse côté serveur via l'endpoint d'upload pré-signé officiel Higgsfield.
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

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        {
          success: false,
          error: "Formulaire de téléversement invalide.",
        },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucun fichier image reçu.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const validatedContentType = validateUploadedImageBuffer(buffer, file.type);
    const publicUrl = await uploadInputImageToHiggsfield(
      buffer,
      validatedContentType
    );

    return NextResponse.json({
      success: true,
      publicUrl,
      contentType: validatedContentType,
      sizeBytes: buffer.byteLength,
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
      "Exception POST /api/videos/upload :",
      sanitizeDiagnosticText(err)
    );
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors du téléversement de l'image.",
      },
      { status: 500 }
    );
  }
}

