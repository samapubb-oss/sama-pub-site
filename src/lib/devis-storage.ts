import type { DevisData } from "@/types/devis";
import { supabase } from "@/lib/supabase";

const STORAGE_PREFIX = "sama_lead_devis_";
const DELETED_LEADS_STORAGE_KEY = "sama_deleted_lead_ids";
export const DELETED_LEAD_MARKER = "<!--SAMA_DELETED:true-->";

/**
 * Récupère les identifiants de devis supprimés mémorisés localement (sécurité anti-réapparition)
 */
export function getLocallyDeletedLeadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_LEADS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Mémorise localement un identifiant de devis supprimé
 */
export function markLeadDeletedLocally(leadId: string): void {
  if (typeof window === "undefined" || !leadId) return;
  try {
    const current = getLocallyDeletedLeadIds();
    current.add(leadId);
    localStorage.setItem(DELETED_LEADS_STORAGE_KEY, JSON.stringify(Array.from(current)));
  } catch {}
}

/**
 * Vérifie si une demande de devis a été supprimée (via marqueur base de données, statut ou cache local)
 */
export function isLeadDeleted(lead: {
  id?: string | null;
  status?: string | null;
  message?: string | null;
} | null | undefined): boolean {
  if (!lead) return true;
  if (lead.status === "deleted") return true;
  if (lead.message && lead.message.includes(DELETED_LEAD_MARKER)) return true;
  if (lead.id && typeof window !== "undefined") {
    if (getLocallyDeletedLeadIds().has(lead.id)) return true;
  }
  return false;
}

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
