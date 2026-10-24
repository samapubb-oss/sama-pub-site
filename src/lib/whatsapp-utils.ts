/**
 * Utilitaires d'envoi WhatsApp et de téléchargement pour les devis SAMA PUB
 */

/**
 * Nettoie et normalise un numéro de téléphone pour WhatsApp
 * Supporte les formats sénégalais (9 chiffres sans indicatif, avec 221, avec 00221, etc.)
 * et internationaux.
 * Ex: "+221 78 521 53 92" -> "221785215392"
 * Ex: "77 123 45 67" -> "221771234567"
 * Ex: "077 123 45 67" -> "221771234567"
 */
export function cleanWhatsappNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");

  // Si indicatif international saisi avec 00 (ex: 0022177...)
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.replace(/^00/, "");
  }

  // Si l'utilisateur a tapé +221 suivi d'un zéro inutile (ex: 221077...)
  if (cleaned.startsWith("2210") && cleaned.length === 13) {
    cleaned = `221${cleaned.slice(4)}`;
  }

  // Si numéro à 10 chiffres commençant par 0 (format local avec zéro initial : ex 077...)
  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    cleaned = `221${cleaned.slice(1)}`;
  }

  // Si numéro sénégalais à 9 chiffres sans indicatif (ex: 77 123 45 67 ou 33 821 00 00)
  if (cleaned.length === 9 && (cleaned.startsWith("7") || cleaned.startsWith("33"))) {
    return `221${cleaned}`;
  }

  return cleaned;
}

/**
 * Télécharge un fichier Blob dans le navigateur
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export interface ShareResult {
  mode: "direct_whatsapp";
  success: boolean;
  waUrl: string;
  cleanPhone: string;
  message?: string;
}

/**
 * Envoie le devis sur WhatsApp en redirigeant DIRECTEMENT vers la discussion du client
 *
 * 1. Télécharge automatiquement le PDF sur l'appareil (prêt à être joint en 1 clic)
 * 2. Redirige immédiatement vers la discussion WhatsApp du contact (wa.me/{phone}?text=...)
 *    avec le message pré-rempli sur mesure.
 */
export async function sendDevisViaWhatsApp(
  pdfBlob: Blob,
  filename: string,
  rawWhatsapp: string,
  messageText: string,
  clientName?: string
): Promise<ShareResult> {
  const cleanPhone = cleanWhatsappNumber(rawWhatsapp);

  if (!cleanPhone || cleanPhone.length < 8) {
    throw new Error(
      "Le numéro WhatsApp du client semble invalide ou manquant. Veuillez vérifier le numéro dans sa fiche."
    );
  }

  const encodedText = encodeURIComponent(messageText || "Bonjour, voici votre devis SAMA PUB.");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  // Détection smartphone / tablette vs ordinateur de bureau
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    // Sur smartphone :
    // 1. Déclencher le téléchargement du PDF
    triggerBlobDownload(pdfBlob, filename);

    // 2. Redirection directe vers la discussion WhatsApp du client
    // Un court délai garantit le bon lancement du téléchargement par le navigateur mobile
    setTimeout(() => {
      window.location.href = waUrl;
    }, 250);
  } else {
    // Sur ordinateur de bureau :
    // 1. Ouvrir WhatsApp Web / Desktop dans un nouvel onglet directement dans le flux du clic
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // 2. Déclencher le téléchargement du PDF
    triggerBlobDownload(pdfBlob, filename);
  }

  const targetName = clientName ? clientName : "le client";
  return {
    mode: "direct_whatsapp",
    success: true,
    waUrl,
    cleanPhone,
    message: `Devis PDF téléchargé sur votre appareil. Discussion WhatsApp ouverte avec ${targetName} (+${cleanPhone}) avec le lien direct vers le PDF. Joignez le PDF via le trombone 📎 et envoyez !`,
  };
}
