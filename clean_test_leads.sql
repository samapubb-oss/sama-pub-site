-- ==============================================================================
-- SAMA PUB — RÉINITIALISATION DES DONNÉES DE TEST SUPABASE
-- ==============================================================================
-- Ce script supprime instantanément toutes les demandes de devis de test
-- pour remettre les compteurs du tableau de bord à 0 avant la mise en ligne.
-- ==============================================================================

-- 1. Vider intégralement la table leads_quotes
TRUNCATE TABLE public.leads_quotes;

-- 2. (Optionnel) Permettre à l'avenir la suppression directe depuis l'admin
DROP POLICY IF EXISTS "Suppression autorisee des devis" ON public.leads_quotes;
CREATE POLICY "Suppression autorisee des devis"
  ON public.leads_quotes
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 3. Vérification du résultat (doit retourner 0)
SELECT COUNT(*) AS total_devis_restants FROM public.leads_quotes;
