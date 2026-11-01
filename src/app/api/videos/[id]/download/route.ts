import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient, isAdminAuthorized } from "@/lib/admin-auth";
import { sanitizeDiagnosticText } from "@/lib/higgsfield";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/videos/[id]/download
 * Téléchargement local fiable du fichier .mp4 généré (contourne les restrictions CORS navigateur
 * sur l'attribut `download` cross-origin) avant son expiration à 7 jours.
 */
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json(
        {
          success: false,
          error: "Accès non autorisé.",
        },
        { status: 401 }
      );
    }

    const id = (context.params?.id || "").trim();
    if (!id || id.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Identifiant de vidéo invalide.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServerSupabaseClient();
    const { data: row, error } = await supabaseAdmin
      .from("video_generations")
      .select("id, video_url, expires_at, status")
      .eq("id", id)
      .maybeSingle();

    if (error || !row || !row.video_url) {
      return NextResponse.json(
        {
          success: false,
          error: "Fichier vidéo introuvable ou pas encore prêt.",
        },
        { status: 404 }
      );
    }

    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Le lien de cette vidéo a expiré (la rétention Higgsfield de 7 jours est dépassée).",
        },
        { status: 410 }
      );
    }

    const parsedUrl = new URL(row.video_url);
    if (parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        {
          success: false,
          error: "URL distante non sécurisée.",
        },
        { status: 400 }
      );
    }

    const upstreamRes = await fetch(parsedUrl.toString(), {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      const expired =
        upstreamRes.status === 404 ||
        upstreamRes.status === 403 ||
        upstreamRes.status === 410;
      return NextResponse.json(
        {
          success: false,
          error: expired
            ? "Le fichier vidéo n'est plus disponible chez Higgsfield (lien expiré)."
            : "Impossible de télécharger la vidéo depuis le CDN Higgsfield.",
        },
        { status: expired ? 410 : 502 }
      );
    }

    const filename = `sama-pub-kling4-${id.slice(0, 8)}.mp4`;
    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstreamRes.headers.get("content-type") || "video/mp4"
    );
    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Cache-Control", "private, no-store");

    return new NextResponse(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    console.error(
      "Exception GET /api/videos/[id]/download :",
      sanitizeDiagnosticText(err)
    );
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors du téléchargement de la vidéo.",
      },
      { status: 500 }
    );
  }
}

