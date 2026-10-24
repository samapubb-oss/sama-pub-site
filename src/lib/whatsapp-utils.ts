/**
 * Utilitaires d'envoi WhatsApp et de partage natif pour les devis
 */

/**
 * Nettoie un numéro de téléphone en ne conservant que les chiffres
 * Ex: "+221 78 521 53 92" -> "221785215392"
 */
export function cleanWhatsappNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");

  // Si l'utilisateur sénégalais a saisi 9 chiffres sans l'indicatif 221 (ex: 785215392)
  if (cleaned.length === 9 && (cleaned.startsWith("7") || cleaned.startsWith("33"))) {
    return `221${cleaned}`;
  }

  // Si indicatif 00221 saisi
  if (cleaned.startsWith("00221")) {
    return cleaned.replace(/^00/, "");
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
  mode: "native" | "desktop_fallback";
  success: boolean;
  message?: string;
}

/**
 * Envoie le devis sur WhatsApp avec gestion intelligente Mobile / Desktop
 */
export async function sendDevisViaWhatsApp(
  pdfBlob: Blob,
  filename: string,
  rawWhatsapp: string,
  messageText: string
): Promise<ShareResult> {
  const cleanPhone = cleanWhatsappNumber(rawWhatsapp);

  if (!cleanPhone || cleanPhone.length < 8) {
    throw new Error(
      "Le numéro WhatsApp du client semble invalide. Veuillez vérifier le numéro dans la fiche."
    );
  }

  const encodedText = encodeURIComponent(messageText || "Bonjour, voici votre devis SAMA PUB.");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  // 1. Détection du support de partage de fichier natif (principalement smartphones Android & iOS)
  const pdfFile = new File([pdfBlob], filename, { type: "application/pdf" });

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [pdfFile] })
  ) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: filename,
        text: messageText,
      });
      return {
        mode: "native",
        success: true,
      };
    } catch (err: any) {
      // Si l'utilisateur n'a pas simplement annulé la boîte de dialogue native
      if (err.name !== "AbortError") {
        console.warn("Échec partage natif, bascule sur la solution de repli :", err);
      } else {
        return { mode: "native", success: false, message: "Partage annulé." };
      }
    }
  }

  // 2. Solution de repli (Ordinateur de bureau ou navigateur sans canShare files) :
  // Téléchargement automatique du PDF + ouverture de WhatsApp Web dans un nouvel onglet
  triggerBlobDownload(pdfBlob, filename);
  window.open(waUrl, "_blank", "noopener,noreferrer");

  return {
    mode: "desktop_fallback",
    success: true,
    message: "Joins le PDF qui vient d'être téléchargé, puis envoie.",
  };
}
