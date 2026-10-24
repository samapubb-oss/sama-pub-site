/**
 * Utilitaires pour le formatage et la génération du PDF Devis SAMA PUB
 */

/**
 * Formate un montant en FCFA avec des espaces normaux (évite l'espace fine insécable U+202F de Intl qui casse dans react-pdf)
 */
export function formatFcfa(montant: number | undefined | null): string {
  if (typeof montant !== "number" || isNaN(montant)) return "0 FCFA";
  const numStr = Math.round(montant).toString();
  // Ajoute un espace normal tous les 3 chiffres
  const formatted = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} FCFA`;
}

/**
 * Nettoie une chaîne de caractères pour former un nom de fichier sain (sans caractères spéciaux ni accents)
 */
export function sanitizeFilename(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-zA-Z0-9_-]/g, "_") // Remplace les caractères non alphanumériques
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Génère le nom de fichier normé : Devis-SAMA-PUB-{NomEntrepriseOuClient}-{numero}.pdf
 */
export function getDevisFilename(clientOrCompany: string, devisNumber: string): string {
  const cleanName = sanitizeFilename(clientOrCompany || "Client");
  const cleanNum = sanitizeFilename(devisNumber || "DEV");
  return `Devis-SAMA-PUB-${cleanName}-${cleanNum}.pdf`;
}

/**
 * Formate une date en format français lisible
 */
export function formatDateFr(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    return now.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
