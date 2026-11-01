import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Vérifie l'authentification administrateur du dashboard SAMA PUB,
 * conformément au mécanisme existant dans /api/admin/devis.
 */
export function isAdminAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("x-sama-admin-auth");
  const authBearer = req.headers.get("authorization");
  const authCookie = req.cookies.get("sama_admin_auth")?.value;

  return Boolean(
    authHeader === "true" ||
      authCookie === "true" ||
      (authBearer && authBearer.startsWith("Bearer "))
  );
}

/**
 * Récupère l'identifiant normalisé de l'utilisateur connecté au dashboard
 * (pour le suivi des quotas journaliers par utilisateur).
 */
export function getAdminUserIdentifier(req: NextRequest): string {
  const raw =
    req.headers.get("x-sama-admin-user") ||
    req.cookies.get("sama_admin_user")?.value ||
    "admin";
  const cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9_.\-@ ]/g, "").slice(0, 64);
  return cleaned || "admin";
}

/**
 * Crée un client Supabase côté serveur (utilise SUPABASE_SERVICE_ROLE_KEY si défini,
 * sinon NEXT_PUBLIC_SUPABASE_ANON_KEY selon l'architecture existante du repo).
 */
export function getServerSupabaseClient() {
  const supabaseUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://rgdcehpynsfllenfidei.supabase.co"
  ).trim();

  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZGNlaHB5bnNmbGxlbmZpZGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNzY2MDQsImV4cCI6MjEwNzc1MjYwNH0.3GAS_TqKXS8Z0g5CUKZrB0ean3dE72ia1aLV-4OhCuw"
  ).trim();

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Détecte si une erreur Supabase correspond à une table non encore créée (migration SQL en attente).
 */
export function isMissingTableError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  const code = error.code || "";
  const msg = (error.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    msg.includes("video_generations") &&
      (msg.includes("does not exist") || msg.includes("schema cache"))
  );
}

