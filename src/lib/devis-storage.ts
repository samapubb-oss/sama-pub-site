import type { DevisData } from "@/types/devis";
import { supabase } from "@/lib/supabase";

const STORAGE_PREFIX = "sama_lead_devis_";

/**
 * Récupère le devis persisté en cache local ou en mémoire pour une demande
 */
export function getSavedDevis(leadId: string): DevisData | null {
  if (typeof window === "undefined" || !leadId) return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${leadId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Erreur lecture devis en cache local :", e);
    return null;
  }
}

/**
 * Enregistre le devis généré en cache local (et tente une persistance Supabase non-bloquante)
 */
export async function saveDevis(leadId: string, devis: DevisData): Promise<void> {
  if (typeof window === "undefined" || !leadId) return;

  // 1. Sauvegarde locale immédiate (fonctionne toujours, 0 dépendance serveur)
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${leadId}`, JSON.stringify(devis));
  } catch (e) {
    console.warn("Erreur écriture devis en cache local :", e);
  }

  // 2. Tentative de synchronisation Supabase (si colonne quote_data présente)
  try {
    await (supabase
      .from("leads_quotes") as any)
      .update({
        quote_data: devis,
        status: "quote_sent",
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId);
  } catch {
    // Si la colonne n'existe pas encore dans Supabase, le cache local prend le relais de manière transparente
  }
}

/**
 * Supprime le devis (utilisé lors d'une régénération)
 */
export function removeSavedDevis(leadId: string): void {
  if (typeof window === "undefined" || !leadId) return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${leadId}`);
  } catch {}
}
