import crypto from "crypto";

/**
 * Durée de validité du jeton de confirmation : 30 minutes
 */
export const CONFIRMATION_EXPIRATION_MS = 30 * 60 * 1000;

/**
 * Nom du cookie de confirmation HttpOnly
 */
export const CONFIRMATION_COOKIE_NAME = "sama_devis_token";

/**
 * Clé secrète de signature côté serveur
 */
const getSecretKey = (): string => {
  return (
    process.env.CONFIRMATION_SECRET ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sama-pub-secure-confirmation-secret-2026-dakar"
  );
};

/**
 * Génère un identifiant de devis lisible (ex: WEB-9119)
 */
export function generateQuoteReference(): string {
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `WEB-${random4}`;
}

/**
 * Génère un jeton cryptographique aléatoire de 64 caractères hexadécimaux
 */
export function generateConfirmationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Signe un jeton pour un devis et une date d'expiration donnés
 */
export function signConfirmationToken(
  ref: string,
  token: string,
  expiresAt: number
): string {
  const secret = getSecretKey();
  const data = `${ref}:${token}:${expiresAt}`;
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Crée la valeur complète à stocker dans le cookie
 * Format : token.expiresAt.signature
 */
export function buildCookiePayload(
  ref: string,
  token: string,
  expiresAt: number
): string {
  const signature = signConfirmationToken(ref, token, expiresAt);
  return `${token}.${expiresAt}.${signature}`;
}

/**
 * Vérifie l'authenticité et la validité temporelle du cookie pour un devis
 */
export function verifyConfirmationCookie(
  ref: string,
  cookieValue: string | undefined | null
): { valid: boolean; token?: string; error?: string } {
  if (!cookieValue || typeof cookieValue !== "string") {
    return { valid: false, error: "Cookie de confirmation absent" };
  }

  const parts = cookieValue.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Format de cookie de confirmation invalide" };
  }

  const [token, expiresAtStr, receivedSignature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(expiresAt)) {
    return { valid: false, error: "Date d'expiration corrompue" };
  }

  // Vérification de la date d'expiration
  if (Date.now() > expiresAt) {
    return { valid: false, error: "Le jeton de confirmation a expiré" };
  }

  // Recalcul de la signature attendue
  const expectedSignature = signConfirmationToken(ref, token, expiresAt);

  try {
    const bufReceived = Buffer.from(receivedSignature, "hex");
    const bufExpected = Buffer.from(expectedSignature, "hex");

    if (
      bufReceived.length !== bufExpected.length ||
      !crypto.timingSafeEqual(bufReceived, bufExpected)
    ) {
      return { valid: false, error: "Signature de jeton non concordante" };
    }
  } catch {
    return { valid: false, error: "Échec de validation cryptographique" };
  }

  return { valid: true, token };
}
